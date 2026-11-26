'use strict';
/* Pruebas de la lógica del registro de agua. Uso: node tests/agua.test.js */
var assert = require('assert');
var L = require('../api/_agua-logica.js');

function at(iso) { return new Date(iso); }
var base = { activo: true, registros: [] };
var ok = 0;
function t(nombre, fn) { fn(); ok++; console.log('✔ ' + nombre); }
function falla(fn, re) { assert.throws(fn, function (e) { return re.test(e.message); }); }

t('jornada de cierre: 23:00 y 00:30 cuentan para el mismo día; hoy() es la fecha real', function () {
  assert.strictEqual(L.jornada(at('2026-11-26T23:00:00-03:00')), '2026-11-26');
  assert.strictEqual(L.jornada(at('2026-11-27T00:30:00-03:00')), '2026-11-26');
  assert.strictEqual(L.hoy(at('2026-11-27T04:30:00-03:00')), '2026-11-27');
  assert.strictEqual(L.jornada(at('2026-07-10T23:00:00-04:00')), '2026-07-10'); /* invierno UTC-4 */
});

var d1, d2, d3;
t('iniciar en la mañana abre el día', function () {
  d1 = L.aplicar(base, { op: 'iniciar', servi: '386' }, at('2026-11-27T08:10:00-03:00')).datos;
  var r = d1.registros[0];
  assert.strictEqual(r.fecha, '2026-11-27'); assert.strictEqual(r.servi, 386); assert.strictEqual(r.quedo, null);
  assert.strictEqual(base.registros.length, 0, 'no modifica el original');
});

t('no se puede iniciar con un día abierto', function () {
  falla(function () { L.aplicar(d1, { op: 'iniciar', servi: 300 }, at('2026-11-27T09:00:00-03:00')); }, /sigue abierto/);
});

t('agregar suma al abierto', function () {
  d2 = L.aplicar(d1, { op: 'agregar', id: '2026-11-27', ml: '50,5' }, at('2026-11-27T15:00:00-03:00')).datos;
  assert.strictEqual(L.suma(d2.registros[0].agregados), 50.5);
});

t('cerrar al acostarlo: consumo = serví + agregué - quedó, 1 día', function () {
  var res = L.aplicar(d2, { op: 'cerrar', id: '2026-11-27', quedo: 236 }, at('2026-11-27T22:40:00-03:00'));
  d3 = res.datos; var r = d3.registros[0];
  assert.strictEqual(L.consumo(r), 200.5); assert.strictEqual(L.dias(r), 1); assert.strictEqual(r.hasta, '2026-11-27');
  assert.ok(/consumo 200.5 ml/.test(res.mensaje));
});

t('cerrar pasada la medianoche sigue siendo 1 día', function () {
  var r = L.aplicar(d1, { op: 'cerrar', id: '2026-11-27', quedo: 200 }, at('2026-11-28T00:45:00-03:00')).datos.registros[0];
  assert.strictEqual(L.dias(r), 1);
});

t('si se olvida cerrar y cierra la noche siguiente: 2 días', function () {
  var r = L.aplicar(d1, { op: 'cerrar', id: '2026-11-27', quedo: 50 }, at('2026-11-28T22:30:00-03:00')).datos.registros[0];
  assert.strictEqual(L.dias(r), 2); assert.strictEqual(r.fecha, '2026-11-27');
});

t('después de cerrar, no se puede iniciar otra vez el mismo día; al día siguiente sí (incluso de madrugada)', function () {
  falla(function () { L.aplicar(d3, { op: 'iniciar', servi: 300 }, at('2026-11-27T23:00:00-03:00')); }, /ya tiene registro/);
  var n = L.aplicar(d3, { op: 'iniciar', servi: 390 }, at('2026-11-28T04:30:00-03:00')).datos;
  assert.strictEqual(n.registros[1].fecha, '2026-11-28');
});

t('doble toque: cerrar dos veces falla', function () {
  falla(function () { L.aplicar(d3, { op: 'cerrar', id: '2026-11-27', quedo: 100 }); }, /No hay un día abierto/);
});

t('quedó mayor que lo servido falla', function () {
  falla(function () { L.aplicar(d1, { op: 'cerrar', id: '2026-11-27', quedo: 400 }, at('2026-11-27T22:00:00-03:00')); }, /mayor que lo que había/);
});

t('números inválidos fallan', function () {
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: '' }); }, /Falta un número/);
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: '-3' }); }, /mayor que 0/);
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: '12,34' }); }, /un decimal/);
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: 9000 }); }, /demasiado grande/);
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: 'abc' }); }, /Falta un número/);
});

t('corregir revalida y marca parcial', function () {
  var c = L.aplicar(d3, { op: 'corregir', id: '2026-11-27', quedo: 300, agregado_total: 0, parcial: true }).datos;
  assert.strictEqual(L.consumo(c.registros[0]), 86); assert.strictEqual(c.registros[0].parcial, true);
  falla(function () { L.aplicar(d3, { op: 'corregir', id: '2026-11-27', quedo: 500 }); }, /mayor que lo que había/);
  falla(function () { L.aplicar(d1, { op: 'corregir', id: '2026-11-27', quedo: 100 }); }, /está abierto/);
});

t('eliminar quita solo ese registro', function () {
  assert.strictEqual(L.aplicar(d3, { op: 'eliminar', id: '2026-11-27' }).datos.registros.length, 0);
  falla(function () { L.aplicar(d3, { op: 'eliminar', id: 'x' }); }, /No encontré/);
});

t('peso de Teo validado', function () {
  var p = L.aplicar(d2, { op: 'cerrar', id: '2026-11-27', quedo: 300, peso_teo: '4,1' }, at('2026-11-27T22:00:00-03:00')).datos;
  assert.strictEqual(p.registros[0].peso_teo, 4.1);
  falla(function () { L.aplicar(d2, { op: 'cerrar', id: '2026-11-27', quedo: 300, peso_teo: 40 }); }, /peso de Teo/);
});

console.log('\n' + ok + ' pruebas OK');
