/*
 * agua-vista.js — Pestaña temporal "Agua y clima" del expediente de Teodoro.
 * Registro diario del agua que toma (agua.json, lo escribe /api/agua con PIN) y la temperatura
 * mínima y máxima medida del día (clima.json, lo llena .github/workflows/clima.yml desde la DMC).
 * No usa datos.js: los exámenes y este registro están separados a propósito.
 * Para ocultar la pestaña sin borrar nada: "activo": false en agua.json.
 */
(function () {
  'use strict';
  var MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var AZUL = '#1E4F8F', TERRA = '#B5562E';
  var S = { agua: null, clima: null, rama: null, apiError: null, cargado: false, rango: '30', editId: null, aviso: null, abiertoForm: false };
  var charts = [];

  /* ---------- Utilidades ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function num(v, dec) {
    if (v == null || !isFinite(v)) return '';
    var s = (dec != null) ? Number(v).toFixed(dec) : String(Math.round(v * 10) / 10);
    var p = s.split('.');
    if (Math.abs(v) >= 1000) p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return p.length > 1 ? p[0] + ',' + p[1] : p[0];
  }
  function dt(iso) { var p = iso.split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function utc(iso) { var x = dt(iso); return Date.UTC(x.y, x.m - 1, x.d); }
  function isoDe(t) { return new Date(t).toISOString().slice(0, 10); }
  function sumarDias(iso, n) { return isoDe(utc(iso) + n * 864e5); }
  function fLarga(iso) { var x = dt(iso); return x.d + ' ' + MES[x.m - 1] + ' ' + x.y; }
  function fCorta(iso) { var x = dt(iso); return DIA[new Date(utc(iso)).getUTCDay()] + ' ' + x.d + ' ' + MES[x.m - 1]; }
  function diasEntre(a, b) { return Math.round((utc(b) - utc(a)) / 864e5); }
  /* Misma regla que el servidor: fecha en Santiago de la hora actual menos 5 horas. */
  function jornada() {
    var d = new Date(Date.now() - 5 * 3600e3);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  }
  function suma(l) { return (l || []).reduce(function (s, a) { return s + a.ml; }, 0); }
  function r1(x) { return Math.round(x * 10) / 10; }
  function consumo(r) { return r.quedo == null ? null : r1(r.servi + suma(r.agregados) - r.quedo); }
  function dias(r) { return r.fecha ? diasEntre(r.desde, r.fecha) : null; }
  function leerNum(v) { v = String(v == null ? '' : v).replace(',', '.').trim(); if (v === '') return null; var n = Number(v); return isFinite(n) ? n : NaN; }
  function guardarPin(p) { try { if (p) localStorage.setItem('teo_pin_agua', p); else localStorage.removeItem('teo_pin_agua'); } catch (e) {} }
  function pinGuardado() { try { return localStorage.getItem('teo_pin_agua') || ''; } catch (e) { return ''; } }

  function registros() { return (S.agua && S.agua.registros) || []; }
  function cerrados() { return registros().filter(function (r) { return r.quedo != null; }); }
  function abierto() { return registros().filter(function (r) { return r.quedo == null; })[0] || null; }
  function completos() { return cerrados().filter(function (r) { return dias(r) === 1; }); }
  function temp(iso) { return (S.clima && S.clima.dias && S.clima.dias[iso]) || null; }
  function pesoEn(iso) {
    var p = null;
    cerrados().forEach(function (r) { if (r.peso_teo && r.fecha <= iso) p = r.peso_teo; });
    return p;
  }
  function hayPeso() { return cerrados().some(function (r) { return r.peso_teo; }); }
  function promedio(lista) { if (!lista.length) return null; return lista.reduce(function (s, r) { return s + consumo(r); }, 0) / lista.length; }
  function ultimosCompletos(n, hasta) {
    var c = completos().filter(function (r) { return !hasta || r.fecha < hasta; });
    return c.slice(Math.max(0, c.length - n));
  }
  /* Registros cerrados dentro del rango elegido (7, 30 días o todo). */
  function enRango() {
    var c = cerrados();
    if (S.rango === 'todo' || !c.length) return c;
    var fin = c[c.length - 1].fecha, ini = sumarDias(fin, -(+S.rango) + 1);
    return c.filter(function (r) { return r.fecha >= ini; });
  }
  /* Día con el que quedará el registro abierto: hoy si hoy aún no se cierra; si no, mañana. */
  function cierreDe(ab) {
    var hoy = jornada(), cerradoHoy = cerrados().some(function (r) { return r.fecha === hoy; });
    var f = cerradoHoy ? sumarDias(hoy, 1) : hoy;
    return f < ab.desde ? ab.desde : f;
  }
  function etiquetaDias(r) {
    var d = dias(r);
    if (d === 0) return 'día parcial';
    if (d > 1) return d + ' días';
    return '';
  }

  /* ---------- Datos ---------- */
  function cargar() {
    return fetch('/api/agua', { cache: 'no-store' })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || ('Error ' + r.status)); return j; }); })
      .then(function (j) { S.agua = j.agua; S.clima = j.clima; S.rama = j.rama; S.apiError = null; })
      .catch(function (e) {
        S.apiError = e.message || 'No se pudo conectar.';
        return Promise.all([
          fetch('agua.json?t=' + Date.now()).then(function (r) { return r.json(); }),
          fetch('clima.json?t=' + Date.now()).then(function (r) { return r.json(); }).catch(function () { return null; })
        ]).then(function (x) { S.agua = x[0]; S.clima = x[1]; });
      })
      .then(function () { S.cargado = true; aplicarActivo(); });
  }
  function aplicarActivo() {
    var on = !S.agua || S.agua.activo !== false;
    document.querySelectorAll('[data-r="agua"], .grp-agua').forEach(function (el) { el.style.display = on ? '' : 'none'; });
  }

  function enviar(op, btn) {
    var pinEl = document.getElementById('ag-pin');
    var pin = (pinEl && pinEl.value) || pinGuardado();
    if (!pin) { S.aviso = { tipo: 'error', txt: 'Escribe el PIN para guardar.' }; render(); var pe = document.getElementById('ag-pin'); if (pe) pe.focus(); return; }
    var recordar = document.getElementById('ag-recordar');
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
    op.pin = pin;
    return fetch('/api/agua', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(op) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
      .then(function (x) {
        if (!x.ok) {
          if (x.status === 401) { guardarPin(''); S.abiertoForm = true; }
          S.aviso = { tipo: 'error', txt: x.j.error || 'No se pudo guardar.' };
        } else {
          if (!recordar || recordar.checked) guardarPin(pin);
          S.agua = x.j.agua; S.editId = null; S.abiertoForm = false; S.limpiar = true;
          S.aviso = { tipo: 'ok', txt: 'Guardado. ' + resumenMensaje(op) };
        }
        render();
      })
      .catch(function () { S.aviso = { tipo: 'error', txt: 'Sin conexión. No se guardó nada; intenta de nuevo.' }; render(); });
  }
  function resumenMensaje(op) {
    if (op.op === 'cerrar') {
      var c = cerrados(), r = c[c.length - 1];
      return r ? 'Consumo del ' + fLarga(r.fecha) + ': ' + num(consumo(r)) + ' ml.' : '';
    }
    if (op.op === 'agregar') return 'Se sumaron ' + num(leerNum(op.ml)) + ' ml.';
    if (op.op === 'iniciar') return 'Registro iniciado.';
    if (op.op === 'eliminar') return 'Registro eliminado.';
    return 'Registro corregido.';
  }

  /* ---------- Vista ---------- */
  function html() {
    var ab = abierto(), hoy = jornada(), c = cerrados();
    var h = '<p class="eyebrow">Registro temporal' + (S.agua && S.agua.inicio ? ', desde el ' + fLarga(S.agua.inicio) : '') + '</p>'
      + '<h1 class="h1">Agua y clima</h1>'
      + '<p class="lead" style="margin-top:8px">Cuánta agua toma Teodoro cada día y la temperatura mínima y máxima medida ese día en Santiago oriente.</p>';

    if (S.aviso) h += '<div class="ag-aviso ' + S.aviso.tipo + '" role="status">' + esc(S.aviso.txt) + '</div>';

    /* Formulario */
    var pinOk = !!pinGuardado();
    h += '<section class="card ag-form" aria-label="Registrar medición">';
    if (!S.abiertoForm && !pinOk) {
      h += '<div class="ag-fhead"><div><b>Registrar medición</b><span class="small">Solo para quien tiene el PIN.</span></div><button class="btn" type="button" data-ag="abrir-form">Registrar</button></div>';
    } else if (S.apiError) {
      h += '<div class="ag-fhead"><div><b>Registrar medición</b><span class="small">Por ahora no se puede guardar: ' + esc(S.apiError) + '</span></div></div>';
    } else if (ab && c.some(function (r) { return r.fecha === hoy; })) {
      h += '<div class="ag-fhead"><div><b>El ' + esc(fCorta(hoy)) + ' ya está cerrado</b><span class="small">Serviste ' + num(ab.servi + suma(ab.agregados)) + '. El próximo cierre es mañana, cuando acuestes a Teo. Para cambiar algo, toca la fila en la tabla.</span></div></div>'
        + pinHtml(pinOk)
        + '<details class="ag-mas"><summary>Agregué agua</summary><p class="small" style="margin:6px 0 8px">Pon el plato en la balanza, tara, echa el agua y anota lo que marca.</p>'
        + '<div class="ag-grid">' + campo('ag-agregado', 'Agregué', 'ml agregados') + '</div>'
        + '<div class="ag-acc"><button class="btn" type="button" data-ag="agregar">Guardar agregado</button></div></details>';
    } else if (ab) {
      var tot = ab.servi + suma(ab.agregados), dd = diasEntre(ab.desde, hoy);
      h += '<div class="ag-fhead"><div><b>Cerrar el día ' + esc(fCorta(hoy)) + '</b><span class="small">Abierto desde el ' + esc(fCorta(ab.desde)) + '. Serviste ' + num(ab.servi) + (ab.agregados.length ? ' y agregaste ' + num(suma(ab.agregados)) + ' (total ' + num(tot) + ')' : '') + '.</span></div></div>'
        + (dd > 1 ? '<p class="ag-warn">Este registro está abierto hace ' + dd + ' días. Si lo cierras ahora, el consumo cubrirá ' + dd + ' días y se mostrará como promedio diario.</p>' : '')
        + '<div class="ag-grid">'
        + campo('ag-quedo', 'Quedó', 'Plato con el agua que quedó')
        + campo('ag-servi', 'Serví para mañana', 'Plato con agua nueva (opcional)')
        + '</div>'
        + '<p class="ag-calc" id="ag-calc" aria-live="polite"></p>'
        + '<details class="ag-mas"><summary>Nota o peso de Teo</summary><div class="ag-grid">'
        + '<label class="ag-f"><span>Nota (opcional)</span><input id="ag-nota" type="text" maxlength="300" placeholder="Ej.: volcó un poco, comió comida húmeda"></label>'
        + '<label class="ag-f"><span>Peso de Teo en kg (opcional)</span><input id="ag-peso" type="text" inputmode="decimal" placeholder="Ej.: 4,1"></label>'
        + '</div></details>'
        + pinHtml(pinOk)
        + '<div class="ag-acc"><button class="btn prim" type="button" data-ag="cerrar">Guardar cierre</button></div>'
        + '<details class="ag-mas"><summary>Agregué agua durante el día</summary><p class="small" style="margin:6px 0 8px">Pon el plato en la balanza, tara, echa el agua y anota lo que marca.</p>'
        + '<div class="ag-grid">' + campo('ag-agregado', 'Agregué', 'ml agregados') + '</div>'
        + '<div class="ag-acc"><button class="btn" type="button" data-ag="agregar">Guardar agregado</button></div></details>';
    } else {
      h += '<div class="ag-fhead"><div><b>Iniciar el registro</b><span class="small">No hay un día abierto. Pesa el plato con el agua recién servida.</span></div></div>'
        + '<div class="ag-grid">' + campo('ag-inicio', 'Serví', 'Plato con agua') + '</div>'
        + pinHtml(pinOk)
        + '<div class="ag-acc"><button class="btn prim" type="button" data-ag="iniciar">Iniciar</button></div>';
    }
    h += '</section>';

    /* Resumen */
    var p7 = promedio(ultimosCompletos(7)), p30 = promedio(ultimosCompletos(30)), ul = c[c.length - 1], pz = ul ? pesoEn(ul.fecha) : null;
    h += '<div class="ag-tiles">'
      + tile('Promedio 7 días', p7, p7 != null && pz ? num(p7 / pz, 0) + ' ml/kg' : ultimosCompletos(7).length + ' días completos')
      + tile('Promedio 30 días', p30, p30 != null && pz ? num(p30 / pz, 0) + ' ml/kg' : ultimosCompletos(30).length + ' días completos')
      + tile('Último registro', ul ? consumo(ul) / Math.max(1, dias(ul)) : null, ul ? fLarga(ul.fecha) + (etiquetaDias(ul) ? ', ' + etiquetaDias(ul) : '') : 'Aún sin cierres')
      + '</div>';

    /* Rango y exportar */
    h += '<div class="ag-bar"><div class="seg" role="group" aria-label="Período">'
      + [['7', '7 días'], ['30', '30 días'], ['todo', 'Todo']].map(function (p) { return '<button type="button" data-ag-rango="' + p[0] + '" class="' + (S.rango === p[0] ? 'on' : '') + '" aria-pressed="' + (S.rango === p[0]) + '">' + p[1] + '</button>'; }).join('')
      + '</div><button class="btn" type="button" data-ag="pdf"' + (c.length ? '' : ' disabled') + '><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v8M4.8 7.5L8 10.7l3.2-3.2M3 13.5h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Exportar PDF</button></div>';

    /* Gráficos */
    var R = enRango();
    if (R.length) {
      h += '<div class="charts ag-charts">'
        + '<section class="card ch wide"><div class="top"><div><h3>Agua consumida</h3><span class="small">ml por día. Los días parciales y los que juntan varios días van en tono claro.</span></div></div><div class="cv"><canvas id="ag-c1" role="img" aria-label="Gráfico del agua consumida por día"></canvas></div></section>'
        + '<section class="card ch wide"><div class="top"><div><h3>Temperatura del día</h3><span class="small">Barra de la mínima a la máxima, en °C.</span></div></div>' + (R.some(function (r) { return temp(r.fecha); }) ? '<div class="cv ag-cv2"><canvas id="ag-c2" role="img" aria-label="Gráfico de temperatura mínima y máxima por día"></canvas></div>' : '') + climaEstado() + '</section>'
        + '</div>';
    } else {
      h += '<div class="card ag-vacio">Todavía no hay días cerrados. El primer registro aparece aquí después de la medición de la noche.' + climaEstado() + '</div>';
    }

    /* Tabla */
    var pesoCol = hayPeso();
    h += '<div class="sec"><h2>Registro día por día</h2><div class="card ag-tw"><table class="ag-t"><thead><tr><th>Día</th><th class="ag-raw">Serví</th><th class="ag-raw">Agregué</th><th class="ag-raw">Quedó</th><th>Consumo</th>' + (pesoCol ? '<th>ml/kg</th>' : '') + '<th>Mín</th><th>Máx</th><th class="ag-nt">Nota</th></tr></thead><tbody>';
    if (ab) {
      h += '<tr class="ag-open' + (S.editId === ab.id ? ' on' : '') + '" data-ag-edit="' + esc(ab.id) + '"><td><b>En curso</b><span>se cerrará como el ' + esc(fCorta(cierreDe(ab))) + '</span></td><td class="ag-raw">' + num(ab.servi) + '</td><td class="ag-raw">' + (ab.agregados.length ? num(suma(ab.agregados)) : '') + '</td><td class="ag-raw"></td><td>' + '<span>serviste ' + num(ab.servi + suma(ab.agregados)) + '</span></td>' + (pesoCol ? '<td></td>' : '') + '<td></td><td></td><td class="ag-nt">' + esc(ab.nota) + '</td></tr>';
    }
    R.slice().reverse().forEach(function (r) {
      var t = temp(r.fecha), d = dias(r), cons = consumo(r), pz2 = pesoEn(r.fecha), et = etiquetaDias(r);
      var nt = esc(r.nota) + (r.peso_teo ? (r.nota ? ' ' : '') + 'Peso ' + num(r.peso_teo) + ' kg.' : '');
      h += '<tr data-ag-edit="' + esc(r.id) + '"' + (S.editId === r.id ? ' class="on"' : '') + '><td><b>' + esc(fCorta(r.fecha)) + '</b>' + (et ? '<span>' + et + '</span>' : '') + (nt ? '<span class="ag-nm">' + nt + '</span>' : '') + '</td>'
        + '<td class="ag-raw">' + num(r.servi) + '</td><td class="ag-raw">' + (r.agregados.length ? num(suma(r.agregados)) : '') + '</td><td class="ag-raw">' + num(r.quedo) + '</td>'
        + '<td><b>' + num(cons) + '</b>' + (d > 1 ? '<span>' + num(cons / d, 0) + '/día</span>' : '') + '</td>'
        + (pesoCol ? '<td>' + (pz2 && d === 1 ? num(cons / pz2, 0) : '') + '</td>' : '')
        + '<td>' + (t ? num(t.min, 1) + '°' : '') + '</td><td>' + (t ? num(t.max, 1) + '°' : '') + '</td>'
        + '<td class="ag-nt">' + nt + '</td></tr>';
    });
    if (!R.length && !ab) h += '<tr><td colspan="9" class="small">Sin registros.</td></tr>';
    h += '</tbody></table></div>';
    var ed = S.editId && registros().filter(function (r) { return r.id === S.editId; })[0];
    if (ed) h += editHtml(ed);
    h += '<p class="small" style="margin-top:8px">Con PIN, toca una fila para corregirla. Los promedios usan solo días completos (de una medición nocturna a la siguiente).</p></div>';

    h += '<div class="card explain sec"><h2>Cómo se mide</h2><p>' + esc((S.agua && S.agua.metodo) || '') + '</p>'
      + '<p>La temperatura es la mínima y la máxima medidas ese día por la estación oficial de la Dirección Meteorológica de Chile en Tobalaba (Santiago oriente), a unos 6 km de la casa. No es pronóstico ni la temperatura dentro de la casa. Se carga sola cada mañana con el día anterior.</p></div>';
    h += '<p class="disc">Registro hecho en casa, como apoyo para el veterinario tratante. No reemplaza su criterio.</p>';
    return h;
  }
  function campo(id, label, ph) { return '<label class="ag-f"><span>' + esc(label) + '</span><input id="' + id + '" type="text" inputmode="decimal" autocomplete="off" placeholder="' + esc(ph) + '"></label>'; }
  function pinHtml(ok) {
    return ok ? '<p class="small ag-pinok">PIN guardado en este dispositivo. <button type="button" class="ag-lnk" data-ag="olvidar-pin">Olvidar</button></p>'
      : '<div class="ag-grid"><label class="ag-f"><span>PIN</span><input id="ag-pin" type="password" inputmode="numeric" autocomplete="off"></label><label class="ag-chk"><input id="ag-recordar" type="checkbox" checked> Recordar en este dispositivo</label></div>';
  }
  function tile(t, v, sub) { return '<div class="card mt"><small>' + esc(t) + '</small><b>' + (v != null ? num(v, 0) + ' <i>ml</i>' : '—') + '</b><small>' + esc(sub) + '</small></div>'; }
  function climaEstado() {
    var C = S.clima, u = C && C.ultimo_intento;
    if (!C || !u) return '<p class="nota">La temperatura empieza a cargarse sola cuando esté activa la clave de la Dirección Meteorológica.</p>';
    var t = 'Fuente: DMC, estación Tobalaba. Última revisión: ' + esc(u.cuando.replace('T', ' ').slice(0, 16)) + '.';
    if (!u.ok && u.avisos && u.avisos.length) t += ' <span class="ag-warn-in">Aviso: ' + esc(u.avisos[0]) + '</span>';
    else if (u.faltan && u.faltan.length) t += ' Sin dato: ' + esc(u.faltan.map(fLarga).join(', ')) + '.';
    return '<p class="nota">' + t + '</p>';
  }
  function editHtml(r) {
    var tit = '<b>Corregir ' + (r.fecha ? 'el ' + esc(fCorta(r.fecha)) : 'el registro en curso') + '</b>';
    if (!pinGuardado() && !S.abiertoForm) return '<div class="card ag-editc" id="ag-editc">' + tit + '<p class="small">Para corregir, toca primero "Registrar" e ingresa el PIN.</p></div>';
    return '<div class="card ag-editc" id="ag-editc">' + tit + '<div class="ag-grid">'
      + '<label class="ag-f"><span>Serví</span><input id="ed-servi" type="text" inputmode="decimal" value="' + num(r.servi) + '"></label>'
      + '<label class="ag-f"><span>Agregué (total)</span><input id="ed-agr" type="text" inputmode="decimal" value="' + (r.agregados.length ? num(suma(r.agregados)) : '0') + '"></label>'
      + (r.quedo != null ? '<label class="ag-f"><span>Quedó</span><input id="ed-quedo" type="text" inputmode="decimal" value="' + num(r.quedo) + '"></label>' : '')
      + '<label class="ag-f"><span>Peso de Teo kg</span><input id="ed-peso" type="text" inputmode="decimal" value="' + (r.peso_teo ? num(r.peso_teo) : '') + '"></label>'
      + '<label class="ag-f ag-w"><span>Nota</span><input id="ed-nota" type="text" maxlength="300" value="' + esc(r.nota) + '"></label>'
      + '</div>' + (pinGuardado() ? '' : pinHtml(false))
      + '<div class="ag-acc"><button class="btn prim" type="button" data-ag="corregir" data-id="' + esc(r.id) + '">Guardar corrección</button><button class="btn" type="button" data-ag="cancelar">Cancelar</button><button class="btn ag-del" type="button" data-ag="eliminar" data-id="' + esc(r.id) + '">Eliminar</button></div></div>';
  }

  /* Cálculo en vivo y aviso si el consumo se sale de lo habitual. */
  function calcVivo() {
    var el = document.getElementById('ag-calc'), ab = abierto(); if (!el || !ab) return null;
    var q = leerNum(document.getElementById('ag-quedo').value), tot = r1(ab.servi + suma(ab.agregados));
    if (q == null) { el.innerHTML = 'Consumo = ' + num(tot) + ' − quedó.'; el.className = 'ag-calc'; return null; }
    if (isNaN(q)) { el.textContent = 'Escribe solo números.'; el.className = 'ag-calc err'; return null; }
    var c = r1(tot - q), hoy = jornada(), d = diasEntre(ab.desde, hoy);
    if (c < 0) { el.textContent = 'Quedó más de lo que había (' + num(tot) + '). Revisa la balanza.'; el.className = 'ag-calc err'; return null; }
    var t = num(tot) + ' − ' + num(q) + ' = <b>' + num(c) + ' ml</b>' + (d === 0 ? ' (día parcial)' : d > 1 ? ' en ' + d + ' días (' + num(c / d, 0) + ' por día)' : '') + '.';
    var ref = promedio(ultimosCompletos(7, hoy)), raro = false;
    if (d === 1 && ref && ultimosCompletos(7, hoy).length >= 3 && (c > ref * 1.6 || c < ref * 0.5)) {
      t += ' <span class="ag-warn-in">Es bastante distinto a tu promedio de 7 días (' + num(ref, 0) + ' ml). Revisa la balanza antes de guardar.</span>';
      raro = true;
    }
    el.innerHTML = t; el.className = 'ag-calc';
    return { c: c, raro: raro };
  }

  /* ---------- Gráficos ---------- */
  function serieDias(R) {
    if (!R.length) return [];
    var ini = R[0].fecha, fin = R[R.length - 1].fecha, out = [], por = {};
    R.forEach(function (r) { por[r.fecha] = r; });
    for (var d = ini; d <= fin; d = sumarDias(d, 1)) out.push({ fecha: d, r: por[d] || null, t: temp(d) });
    return out;
  }
  function graficos(c1, c2, opts) {
    opts = opts || {};
    var D = serieDias(enRango()), labels = D.map(function (x) { var p = dt(x.fecha); return p.d + ' ' + MES[p.m - 1]; });
    var vals = D.map(function (x) { if (!x.r) return null; var d = dias(x.r); return consumo(x.r) / Math.max(1, d); });
    var claro = D.map(function (x) { return x.r && dias(x.r) !== 1; });
    var tick = { color: '#596067', font: { size: opts.pdf ? 22 : 11 }, maxRotation: 0, autoSkipPadding: 8 };
    var tip = { backgroundColor: '#16191B', padding: 10, displayColors: false };
    var base = { responsive: !opts.pdf, maintainAspectRatio: false, animation: false, devicePixelRatio: opts.pdf ? 1 : undefined, layout: { padding: { top: 6, right: 8 } },
      plugins: { legend: { display: false }, tooltip: tip }, interaction: { mode: 'index', intersect: false } };
    var a = new Chart(c1, { type: 'bar', data: { labels: labels, datasets: [{ data: vals, backgroundColor: claro.map(function (x) { return x ? 'rgba(30,79,143,.35)' : AZUL; }), borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: 'bottom', maxBarThickness: opts.pdf ? 40 : 24, categoryPercentage: .8, barPercentage: .9 }] },
      options: Object.assign({}, base, {
        scales: { x: { grid: { display: false }, border: { color: '#D5D8D2' }, ticks: tick },
          y: { beginAtZero: true, grid: { color: '#ECEEEA' }, border: { display: false }, ticks: Object.assign({}, tick, { maxTicksLimit: 5, callback: function (v) { return num(v); } }), title: { display: true, text: 'ml', color: '#596067', font: tick.font } } },
        plugins: Object.assign({}, base.plugins, { tooltip: Object.assign({}, tip, { callbacks: {
          title: function (it) { return fLarga(D[it[0].dataIndex].fecha); },
          label: function (it) { var x = D[it.dataIndex]; if (!x.r) return 'Sin registro'; var d = dias(x.r); return num(consumo(x.r)) + ' ml' + (d === 0 ? ' (día parcial)' : d > 1 ? ' en ' + d + ' días, ' + num(consumo(x.r) / d, 0) + ' por día' : ''); } } }) })
      }) });
    var b = new Chart(c2, { type: 'bar', data: { labels: labels, datasets: [{ data: D.map(function (x) { return x.t ? [x.t.min, x.t.max] : null; }), backgroundColor: TERRA, borderRadius: 4, borderSkipped: false, maxBarThickness: opts.pdf ? 40 : 24, categoryPercentage: .8, barPercentage: .9 }] },
      options: Object.assign({}, base, {
        scales: { x: { grid: { display: false }, border: { color: '#D5D8D2' }, ticks: tick },
          y: { grid: { color: '#ECEEEA' }, border: { display: false }, ticks: Object.assign({}, tick, { maxTicksLimit: 5, callback: function (v) { return num(v) + '°'; } }) } },
        plugins: Object.assign({}, base.plugins, { tooltip: Object.assign({}, tip, { callbacks: {
          title: function (it) { return fLarga(D[it[0].dataIndex].fecha); },
          label: function (it) { var t = D[it.dataIndex].t; return t ? 'Mínima ' + num(t.min, 1) + '°, máxima ' + num(t.max, 1) + '°' : 'Sin dato'; } } }) })
      }) });
    return [a, b];
  }
  function dibujar() {
    charts.forEach(function (c) { c.destroy(); }); charts = [];
    var c1 = document.getElementById('ag-c1'), c2 = document.getElementById('ag-c2');
    if (!c1 || !window.Chart) return;
    if (!c2) { c2 = document.createElement('canvas'); } /* sin temperaturas: se dibuja fuera de la página y se descarta */
    charts = graficos(c1, c2);
  }

  function render() {
    var v = document.getElementById('v-agua'); if (!v) return;
    if (!S.cargado) { v.innerHTML = '<p class="eyebrow">Registro temporal</p><h1 class="h1">Agua y clima</h1><p class="lead" style="margin-top:8px">Cargando…</p>'; return; }
    /* Conserva lo escrito si la página se redibuja por un aviso (PIN faltante, error, etc.).
       Solo se limpia después de un guardado exitoso. */
    var previos = {};
    if (!S.limpiar) v.querySelectorAll('input[id]').forEach(function (el) { previos[el.id] = el.type === 'checkbox' ? el.checked : el.value; });
    S.limpiar = false;
    v.innerHTML = html();
    Object.keys(previos).forEach(function (id) { var el = document.getElementById(id); if (!el) return; if (el.type === 'checkbox') el.checked = previos[id]; else el.value = previos[id]; });
    dibujar();
    var q = document.getElementById('ag-quedo'); if (q) { q.addEventListener('input', calcVivo); calcVivo(); }
  }

  /* ---------- PDF ---------- */
  function loadJsPDF() { return new Promise(function (res, rej) { if (window.jspdf) { res(); return; } var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function chartPng(W, H) {
    var box = document.createElement('div'); box.style.cssText = 'position:fixed;left:-99999px;top:0;width:' + W + 'px';
    var a = document.createElement('canvas'), b = document.createElement('canvas');
    [a, b].forEach(function (c) { c.width = W; c.height = H; c.style.width = W + 'px'; c.style.height = H + 'px'; box.appendChild(c); });
    document.body.appendChild(box);
    var bg = { id: 'fondo', beforeDraw: function (ch) { var x = ch.ctx; x.save(); x.fillStyle = '#fff'; x.fillRect(0, 0, ch.width, ch.height); x.restore(); } };
    Chart.register(bg);
    var cs = graficos(a, b, { pdf: true });
    var out = cs.map(function (c) { return c.toBase64Image('image/png'); });
    cs.forEach(function (c) { c.destroy(); }); Chart.unregister(bg); box.remove();
    return out;
  }
  function pdfTxt(s) { return String(s == null ? '' : s).replace(/[−–—]/g, '-').replace(/[“”]/g, '"').replace(/…/g, '...'); }
  function exportarPDF(btn) {
    btn.disabled = true;
    loadJsPDF().then(function () {
      var R = enRango(), J = window.jspdf.jsPDF, doc = new J({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      var M = 14, W = 210 - 2 * M, y = M;
      function linea(t, size, bold, color) { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(color || '#16191B'); var ls = doc.splitTextToSize(pdfTxt(t), W); doc.text(ls, M, y); y += ls.length * size * 0.42 + 1.5; }
      var desde = R[0].fecha, hasta = R[R.length - 1].fecha;
      linea('Teodoro - Registro de agua y temperatura', 16, true);
      linea('Chihuahua, macho. Período: ' + fLarga(desde) + ' al ' + fLarga(hasta) + '. Generado el ' + fLarga(jornada()) + '.', 10, false, '#596067');
      y += 1;
      var comp = R.filter(function (r) { return dias(r) === 1; });
      var vals = comp.map(consumo), pz = pesoEn(hasta);
      var res = comp.length ? 'Días completos: ' + comp.length + '. Promedio ' + num(promedio(comp), 0) + ' ml/día' + (pz ? ' (' + num(promedio(comp) / pz, 0) + ' ml/kg/día con peso ' + num(pz) + ' kg)' : '') + '. Mínimo ' + num(Math.min.apply(null, vals)) + ' ml, máximo ' + num(Math.max.apply(null, vals)) + ' ml.' : 'Aún no hay días completos en este período.';
      linea(res, 11, true);
      linea('Método: ' + ((S.agua && S.agua.metodo) || ''), 9, false, '#2C3136');
      linea('Temperatura: mínima y máxima medidas cada día por la estación de la Dirección Meteorológica de Chile en Tobalaba (Santiago oriente, a unos 6 km de la casa). No es pronóstico ni la temperatura dentro de la casa.', 9, false, '#2C3136');
      y += 2;
      var imgs = chartPng(1600, 520), ih = W * 520 / 1600;
      linea('Agua consumida (ml por día; tono claro = día parcial o varios días)', 10, true);
      doc.addImage(imgs[0], 'PNG', M, y, W, ih); y += ih + 8;
      linea('Temperatura del día (barra de la mínima a la máxima, °C)', 10, true);
      doc.addImage(imgs[1], 'PNG', M, y, W, ih); y += ih + 6;

      var pesoCol = R.some(function (r) { return r.peso_teo; });
      var cols = [['Día', 24], ['Serví', 15], ['Agregué', 17], ['Quedó', 15], ['Consumo', 19]].concat(pesoCol ? [['ml/kg', 13]] : []).concat([['Mín °C', 14], ['Máx °C', 14], ['Nota', 0]]);
      var usado = cols.reduce(function (s, c) { return s + c[1]; }, 0); cols[cols.length - 1][1] = W - usado;
      function cabecera() {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor('#596067');
        var x = M; cols.forEach(function (c) { doc.text(pdfTxt(c[0]), x + 1, y); x += c[1]; });
        y += 2; doc.setDrawColor('#E1E3DE'); doc.line(M, y, M + W, y); y += 4;
      }
      if (y > 250) { doc.addPage(); y = M; }
      cabecera();
      R.slice().reverse().forEach(function (r) {
        var t = temp(r.fecha), d = dias(r), cons = consumo(r), pz2 = pesoEn(r.fecha), et = etiquetaDias(r);
        var celdas = [fCorta(r.fecha) + (et ? ' (' + et + ')' : ''), num(r.servi), r.agregados.length ? num(suma(r.agregados)) : '', num(r.quedo), num(cons) + (d > 1 ? ' (' + num(cons / d, 0) + '/día)' : '')]
          .concat(pesoCol ? [pz2 && d === 1 ? num(cons / pz2, 0) : ''] : [])
          .concat([t ? num(t.min, 1) : '', t ? num(t.max, 1) : '', (r.nota || '') + (r.peso_teo ? ' Peso ' + num(r.peso_teo) + ' kg.' : '')]);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor('#16191B');
        var partes = celdas.map(function (txt, i) { return doc.splitTextToSize(pdfTxt(txt), cols[i][1] - 2); });
        var alto = Math.max.apply(null, partes.map(function (p) { return p.length; })) * 3.6 + 1.6;
        if (y + alto > 285) { doc.addPage(); y = M + 4; cabecera(); }
        var x = M; partes.forEach(function (p, i) { doc.text(p, x + 1, y); x += cols[i][1]; });
        y += alto - 2; doc.setDrawColor('#ECEEEA'); doc.line(M, y, M + W, y); y += 3.6;
      });
      y += 2;
      if (y > 280) { doc.addPage(); y = M; }
      linea('Registro hecho en casa por el tutor, como apoyo para el veterinario tratante. Expediente: teo.camiloworks.com', 8, false, '#596067');
      doc.save('Teodoro_agua_y_temperatura_' + desde + '_a_' + hasta + '.pdf');
    }).catch(function (e) { console.error(e); S.aviso = { tipo: 'error', txt: 'No se pudo generar el PDF. Revisa tu conexión e intenta de nuevo.' }; render(); })
      .then(function () { btn.disabled = false; });
  }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', function (e) {
    var v = document.getElementById('v-agua'); if (!v || !v.contains(e.target)) return;
    var rg = e.target.closest('[data-ag-rango]');
    if (rg) { S.rango = rg.getAttribute('data-ag-rango'); render(); return; }
    var b = e.target.closest('[data-ag]');
    if (!b) {
      var fila = e.target.closest('[data-ag-edit]');
      if (fila && (pinGuardado() || S.abiertoForm)) {
        var id = fila.getAttribute('data-ag-edit'); S.editId = S.editId === id ? null : id; S.aviso = null; render();
        var ec = document.getElementById('ag-editc'); if (ec) ec.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    var a = b.getAttribute('data-ag'), val = function (id) { var el = document.getElementById(id); return el ? el.value : undefined; };
    S.aviso = null;
    if (a === 'abrir-form') { S.abiertoForm = true; render(); return; }
    if (a === 'olvidar-pin') { guardarPin(''); S.abiertoForm = true; render(); return; }
    if (a === 'cancelar') { S.editId = null; render(); return; }
    if (a === 'pdf') { exportarPDF(b); return; }
    if (a === 'iniciar') { enviar({ op: 'iniciar', servi: val('ag-inicio') }, b); return; }
    if (a === 'agregar') { enviar({ op: 'agregar', id: abierto().id, ml: val('ag-agregado') }, b); return; }
    if (a === 'cerrar') {
      var r = calcVivo();
      if (!r) { S.aviso = { tipo: 'error', txt: 'Revisa el número de "Quedó".' }; render(); return; }
      if (r.raro && b.getAttribute('data-confirmado') !== '1') { b.setAttribute('data-confirmado', '1'); b.textContent = 'Guardar igual'; return; }
      enviar({ op: 'cerrar', id: abierto().id, quedo: val('ag-quedo'), servi_siguiente: val('ag-servi') || null, nota: val('ag-nota'), peso_teo: val('ag-peso') || null }, b);
      return;
    }
    if (a === 'corregir') {
      var op = { op: 'corregir', id: b.getAttribute('data-id'), servi: val('ed-servi'), agregado_total: val('ed-agr'), nota: val('ed-nota'), peso_teo: val('ed-peso') };
      if (document.getElementById('ed-quedo')) op.quedo = val('ed-quedo');
      enviar(op, b); return;
    }
    if (a === 'eliminar') {
      if (b.getAttribute('data-confirmado') !== '1') { b.setAttribute('data-confirmado', '1'); b.textContent = 'Toca otra vez para eliminar'; return; }
      enviar({ op: 'eliminar', id: b.getAttribute('data-id') }, b); return;
    }
  });

  window.AguaVista = {
    mostrar: function () { render(); carga.then(render); },
    destruir: function () { charts.forEach(function (c) { c.destroy(); }); charts = []; }
  };
  /* Carga temprana: sirve también para saber si la pestaña está activa. */
  var carga = cargar();
})();
