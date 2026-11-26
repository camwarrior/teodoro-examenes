'use strict';
/*
 * Lógica del registro diario de agua (agua.json). La usa api/agua.js; no es un endpoint
 * (Vercel no publica archivos de /api que empiezan con "_").
 *
 * Cada registro es un período entre dos mediciones (normalmente de 22:00 a 22:00):
 *   desde      jornada en que se sirvió el agua (YYYY-MM-DD)
 *   fecha      jornada en que se cerró (null mientras está abierto). Es la fecha que se muestra.
 *   servi      peso del plato con agua al servir (ml = g)
 *   agregados  [{ml, momento}] agua agregada durante el período (pesada con tara)
 *   quedo      peso del plato con el agua restante al cerrar
 * consumo = servi + suma(agregados) - quedo
 * dias = fecha - desde: 0 = día parcial, 1 = normal, >1 = abarca varios días.
 *
 * "Jornada": fecha en Santiago de la hora actual menos 5 horas, para que una medición hecha
 * pasada la medianoche (00:30) cuente para el día anterior.
 */

var CORTE_HORAS = 5;
var MAX_ML = 5000;

function jornada(ahora) {
  var d = new Date((ahora || new Date()).getTime() - CORTE_HORAS * 3600e3);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function diasEntre(a, b) {
  var pa = a.split('-').map(Number), pb = b.split('-').map(Number);
  return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 864e5);
}

function suma(lista) { return (lista || []).reduce(function (s, a) { return s + a.ml; }, 0); }
function r1(x) { return Math.round(x * 10) / 10; }

function consumo(r) {
  if (r.quedo == null) return null;
  return r1(r.servi + suma(r.agregados) - r.quedo);
}

function Err(msg, status) { var e = new Error(msg); e.status = status || 400; return e; }

/* Número de la balanza: finito, >= 0 (o > 0), máximo 1 decimal, hasta MAX_ML. */
function ml(v, nombre, positivo) {
  if (typeof v === 'string') v = v.replace(',', '.').trim();
  var n = Number(v);
  if (v === '' || v == null || !isFinite(n)) throw Err('Falta un número válido en "' + nombre + '".');
  if (n < 0 || (positivo && n === 0)) throw Err('"' + nombre + '" debe ser mayor que 0.');
  if (n > MAX_ML) throw Err('"' + nombre + '" es demasiado grande (' + n + '). Revisa la balanza.');
  if (Math.abs(r1(n) - n) > 1e-9) throw Err('"' + nombre + '" admite como máximo un decimal.');
  return r1(n);
}

function peso(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'string') v = v.replace(',', '.').trim();
  var n = Number(v);
  if (!isFinite(n) || n < 0.5 || n > 15) throw Err('El peso de Teo debe estar entre 0,5 y 15 kg.');
  return Math.round(n * 100) / 100;
}

function texto(v) {
  if (v == null) return '';
  var s = String(v).replace(/\s+/g, ' ').trim();
  if (s.length > 300) throw Err('La nota es muy larga (máximo 300 caracteres).');
  return s;
}

function abierto(datos) {
  var ab = datos.registros.filter(function (r) { return r.quedo == null; });
  if (ab.length > 1) throw Err('Hay más de un registro abierto en agua.json; hay que revisarlo a mano.', 500);
  return ab[0] || null;
}

function porId(datos, id) {
  for (var i = 0; i < datos.registros.length; i++) if (datos.registros[i].id === id) return datos.registros[i];
  throw Err('No encontré ese registro (puede que la página esté desactualizada). Recarga e intenta de nuevo.', 409);
}

function nuevoId(datos, desde) {
  var n = 1, ids = {};
  datos.registros.forEach(function (r) { ids[r.id] = 1; });
  while (ids[desde + '-' + n]) n++;
  return desde + '-' + n;
}

function revisar(r) {
  if (!(r.servi > 0)) throw Err('"Serví" debe ser mayor que 0.');
  if (r.quedo != null) {
    var total = r1(r.servi + suma(r.agregados));
    if (r.quedo > total) throw Err('"Quedó" (' + r.quedo + ') es mayor que lo que había en el plato (' + total + '). Revisa los números.');
    if (r.fecha < r.desde) throw Err('La fecha de cierre no puede ser anterior a la de inicio.');
  }
}

function ordenar(datos) {
  datos.registros.sort(function (a, b) {
    return a.desde < b.desde ? -1 : a.desde > b.desde ? 1 : (a.creado < b.creado ? -1 : a.creado > b.creado ? 1 : 0);
  });
}

/*
 * Aplica una operación sobre una copia de los datos. Devuelve {datos, mensaje}.
 * Operaciones:
 *   iniciar  {servi, nota?}                              abre un registro si no hay uno abierto
 *   cerrar   {id, quedo, servi_siguiente?, nota?, peso_teo?}  cierra el abierto y, si viene, abre el siguiente
 *   agregar  {id, ml}                                     agua agregada al registro abierto
 *   corregir {id, servi?, agregado_total?, quedo?, nota?, peso_teo?}
 *   eliminar {id}
 */
function aplicar(datosOrig, op, ahora) {
  var datos = JSON.parse(JSON.stringify(datosOrig));
  if (!datos || !Array.isArray(datos.registros)) throw Err('agua.json no tiene la lista "registros".', 500);
  var hoy = jornada(ahora), momento = (ahora || new Date()).toISOString(), msg;
  var ab = abierto(datos);

  if (op.op === 'iniciar') {
    if (ab) throw Err('Ya hay un registro abierto desde el ' + ab.desde + '. Ciérralo primero.', 409);
    var r = { id: nuevoId(datos, hoy), desde: hoy, fecha: null, servi: ml(op.servi, 'Serví', true), agregados: [], quedo: null, nota: texto(op.nota), peso_teo: null, creado: momento };
    revisar(r); datos.registros.push(r);
    msg = 'Agua: inicio ' + hoy + ' (sirvió ' + r.servi + ')';

  } else if (op.op === 'cerrar') {
    if (!ab) throw Err('No hay un registro abierto para cerrar.', 409);
    if (op.id !== ab.id) throw Err('Ese registro ya se cerró (¿doble toque?). Recarga la página.', 409);
    var ya = datos.registros.filter(function (r) { return r.fecha === hoy; })[0];
    if (ya) throw Err('El día ' + hoy + ' ya está cerrado. Si quieres cambiar algo, toca esa fila en la tabla para corregirla.', 409);
    ab.quedo = ml(op.quedo, 'Quedó', false);
    ab.fecha = hoy;
    if (op.nota != null && texto(op.nota)) ab.nota = [ab.nota, texto(op.nota)].filter(Boolean).join(' ');
    var pt = peso(op.peso_teo); if (pt != null) ab.peso_teo = pt;
    ab.cerrado = momento;
    revisar(ab);
    msg = 'Agua: cierre ' + hoy + ', consumo ' + consumo(ab) + ' ml';
    if (op.servi_siguiente != null && op.servi_siguiente !== '') {
      var sig = { id: nuevoId(datos, hoy), desde: hoy, fecha: null, servi: ml(op.servi_siguiente, 'Serví para mañana', true), agregados: [], quedo: null, nota: '', peso_teo: null, creado: momento };
      revisar(sig); datos.registros.push(sig);
      msg += '; sirvió ' + sig.servi;
    }

  } else if (op.op === 'agregar') {
    if (!ab) throw Err('No hay un registro abierto al cual agregar agua.', 409);
    if (op.id !== ab.id) throw Err('El registro cambió. Recarga la página.', 409);
    var m = ml(op.ml, 'Agregué', true);
    ab.agregados.push({ ml: m, momento: momento });
    msg = 'Agua: agregó ' + m + ' ml (' + ab.desde + ')';

  } else if (op.op === 'corregir') {
    var c = porId(datos, op.id);
    if ('servi' in op) c.servi = ml(op.servi, 'Serví', true);
    if ('agregado_total' in op) {
      var t = ml(op.agregado_total === '' ? 0 : op.agregado_total, 'Agregué', false);
      if (r1(suma(c.agregados)) !== t) c.agregados = t > 0 ? [{ ml: t, momento: momento, corregido: true }] : [];
    }
    if ('quedo' in op) {
      if (c.quedo == null) throw Err('Ese registro está abierto: usa "Cerrar el día".', 409);
      c.quedo = ml(op.quedo, 'Quedó', false);
    }
    if ('nota' in op) c.nota = texto(op.nota);
    if ('peso_teo' in op) c.peso_teo = peso(op.peso_teo);
    c.editado = momento;
    revisar(c);
    msg = 'Agua: corrección del registro ' + (c.fecha || c.desde);

  } else if (op.op === 'eliminar') {
    var e = porId(datos, op.id);
    datos.registros = datos.registros.filter(function (r) { return r !== e; });
    msg = 'Agua: elimina el registro ' + (e.fecha || e.desde + ' (abierto)');

  } else {
    throw Err('Operación desconocida.');
  }
  ordenar(datos);
  abierto(datos);
  return { datos: datos, mensaje: msg };
}

module.exports = { aplicar: aplicar, jornada: jornada, consumo: consumo, diasEntre: diasEntre, suma: suma };
