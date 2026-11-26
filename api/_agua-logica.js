'use strict';
/*
 * Lógica del registro diario de agua (agua.json). La usa api/agua.js; no es un endpoint
 * (Vercel no publica archivos de /api que empiezan con "_").
 *
 * Rutina: el agua se sirve en la mañana (o en la madrugada si Teo se levanta) y se retira en la
 * noche al acostarlo. No queda agua durante la noche. Cada registro es UN día:
 *   fecha      día del registro: fecha en Santiago al servir el agua (YYYY-MM-DD)
 *   servi      peso del plato con agua al servir (ml = g)
 *   agregados  [{ml, momento}] agua agregada durante el día (pesada con tara)
 *   quedo      peso del plato con el agua restante al acostarlo (null mientras está abierto)
 *   hasta      "jornada" del cierre (ver abajo); sirve para detectar si se olvidó cerrar
 *   parcial    true si el día no es representativo (p. ej. el primero, servido a media tarde)
 * consumo = servi + suma(agregados) - quedo
 * dias = hasta - fecha + 1: 1 = normal; >1 = se olvidó cerrar y abarca varios días.
 *
 * "Jornada" del cierre: fecha en Santiago de la hora actual menos 5 horas, para que cerrar pasada
 * la medianoche (Teo se acostó tarde) cuente para el mismo día.
 */

var CORTE_HORAS = 5;
var MAX_ML = 5000;

function fechaSantiago(d) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
function hoy(ahora) { return fechaSantiago(ahora || new Date()); }
function jornada(ahora) { return fechaSantiago(new Date((ahora || new Date()).getTime() - CORTE_HORAS * 3600e3)); }

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
function dias(r) {
  if (!r.hasta) return null;
  return Math.max(1, diasEntre(r.fecha, r.hasta) + 1);
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

function revisar(datos, r) {
  if (!(r.servi > 0)) throw Err('"Serví" debe ser mayor que 0.');
  if (r.quedo != null) {
    var total = r1(r.servi + suma(r.agregados));
    if (r.quedo > total) throw Err('"Quedó" (' + r.quedo + ') es mayor que lo que había en el plato (' + total + '). Revisa los números.');
  }
  var dup = datos.registros.filter(function (x) { return x.fecha === r.fecha; });
  if (dup.length > 1) throw Err('Ya existe un registro para el ' + r.fecha + '.', 409);
}

function ordenar(datos) {
  datos.registros.sort(function (a, b) { return a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0; });
}

/*
 * Aplica una operación sobre una copia de los datos. Devuelve {datos, mensaje}.
 *   iniciar  {servi, nota?}                     sirve el agua del día (mañana o madrugada)
 *   cerrar   {id, quedo, nota?, peso_teo?}       pesa lo que quedó al acostar a Teo
 *   agregar  {id, ml}                            agua agregada durante el día
 *   corregir {id, servi?, agregado_total?, quedo?, nota?, peso_teo?, parcial?}
 *   eliminar {id}
 */
function aplicar(datosOrig, op, ahora) {
  var datos = JSON.parse(JSON.stringify(datosOrig));
  if (!datos || !Array.isArray(datos.registros)) throw Err('agua.json no tiene la lista "registros".', 500);
  var momento = (ahora || new Date()).toISOString(), msg;
  var ab = abierto(datos);

  if (op.op === 'iniciar') {
    var dia = hoy(ahora);
    if (ab) throw Err('El día ' + ab.fecha + ' sigue abierto. Ciérralo primero (pesa lo que quedó).', 409);
    if (datos.registros.some(function (x) { return x.fecha === dia; })) throw Err('El ' + dia + ' ya tiene registro. Si quieres cambiarlo, toca su fila en la tabla.', 409);
    var r = { id: dia, fecha: dia, servi: ml(op.servi, 'Serví', true), agregados: [], quedo: null, hasta: null, parcial: false, nota: texto(op.nota), peso_teo: null, creado: momento };
    datos.registros.push(r); revisar(datos, r);
    msg = 'Agua: sirvió ' + r.servi + ' (' + dia + ')';

  } else if (op.op === 'cerrar') {
    if (!ab) throw Err('No hay un día abierto para cerrar.', 409);
    if (op.id !== ab.id) throw Err('Ese día ya se cerró (¿doble toque?). Recarga la página.', 409);
    ab.quedo = ml(op.quedo, 'Quedó', false);
    var j = jornada(ahora);
    ab.hasta = j < ab.fecha ? ab.fecha : j;
    if (op.nota != null && texto(op.nota)) ab.nota = [ab.nota, texto(op.nota)].filter(Boolean).join(' ');
    var pt = peso(op.peso_teo); if (pt != null) ab.peso_teo = pt;
    ab.cerrado = momento;
    revisar(datos, ab);
    msg = 'Agua: cierre ' + ab.fecha + ', consumo ' + consumo(ab) + ' ml' + (dias(ab) > 1 ? ' en ' + dias(ab) + ' días' : '');

  } else if (op.op === 'agregar') {
    if (!ab) throw Err('No hay un día abierto al cual agregar agua.', 409);
    if (op.id !== ab.id) throw Err('El registro cambió. Recarga la página.', 409);
    var m = ml(op.ml, 'Agregué', true);
    ab.agregados.push({ ml: m, momento: momento });
    msg = 'Agua: agregó ' + m + ' ml (' + ab.fecha + ')';

  } else if (op.op === 'corregir') {
    var c = porId(datos, op.id);
    if ('servi' in op) c.servi = ml(op.servi, 'Serví', true);
    if ('agregado_total' in op) {
      var t = ml(op.agregado_total === '' ? 0 : op.agregado_total, 'Agregué', false);
      if (r1(suma(c.agregados)) !== t) c.agregados = t > 0 ? [{ ml: t, momento: momento, corregido: true }] : [];
    }
    if ('quedo' in op) {
      if (c.quedo == null) throw Err('Ese día está abierto: usa "Cerrar el día".', 409);
      c.quedo = ml(op.quedo, 'Quedó', false);
    }
    if ('nota' in op) c.nota = texto(op.nota);
    if ('peso_teo' in op) c.peso_teo = peso(op.peso_teo);
    if ('parcial' in op) c.parcial = op.parcial === true || op.parcial === 'true';
    c.editado = momento;
    revisar(datos, c);
    msg = 'Agua: corrección del ' + c.fecha;

  } else if (op.op === 'eliminar') {
    var e = porId(datos, op.id);
    datos.registros = datos.registros.filter(function (r) { return r !== e; });
    msg = 'Agua: elimina el registro del ' + e.fecha;

  } else {
    throw Err('Operación desconocida.');
  }
  ordenar(datos);
  abierto(datos);
  return { datos: datos, mensaje: msg };
}

module.exports = { aplicar: aplicar, jornada: jornada, hoy: hoy, consumo: consumo, dias: dias, diasEntre: diasEntre, suma: suma };
