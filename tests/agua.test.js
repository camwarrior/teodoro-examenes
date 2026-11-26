'use strict';
/* Pruebas de la lógica del registro de agua. Uso: node tests/agua.test.js */
var assert = require('assert');
var L = require('../api/_agua-logica.js');

function at(iso) { return new Date(iso); }
var base = { activo: true, registros: [] };
var ok = 0;
function t(nombre, fn) { fn(); ok++; console.log('✔ ' + nombre); }
function falla(fn, re) { assert.throws(fn, function (e) { return re.test(e.message); }); }

t('jornada: 22:00 y 00:30 cuentan para el mismo día; 06:00 ya es el siguiente', function () {
  assert.strictEqual(L.jornada(at('2026-11-26T22:00:00-03:00')), '2026-11-26');
  assert.strictEqual(L.jornada(at('2026-11-27T00:30:00-03:00')), '2026-11-26');
  assert.strictEqual(L.jornada(at('2026-11-27T06:00:00-03:00')), '2026-11-27');
  assert.strictEqual(L.jornada(at('2026-07-10T23:00:00-04:00')), '2026-07-10'); /* invierno UTC-4 */
});

var d1, d2, d3;
t('iniciar abre un registro', function () {
  d1 = L.aplicar(base, { op: 'iniciar', servi: '386', nota: 'primer día' }, at('2026-11-26T17:10:00-03:00')).datos;
  assert.strictEqual(d1.registros.length, 1);
  assert.strictEqual(d1.registros[0].servi, 386);
  assert.strictEqual(d1.registros[0].desde, '2026-11-26');
  assert.strictEqual(d1.registros[0].quedo, null);
  assert.strictEqual(base.registros.length, 0, 'no modifica el original');
});

t('no se puede iniciar con uno abierto', function () {
  falla(function () { L.aplicar(d1, { op: 'iniciar', servi: 300 }); }, /Ya hay un registro abierto/);
});

t('agregar suma al abierto', function () {
  d2 = L.aplicar(d1, { op: 'agregar', id: '2026-11-26-1', ml: '50,5' }, at('2026-11-26T19:00:00-03:00')).datos;
  assert.strictEqual(L.suma(d2.registros[0].agregados), 50.5);
});

t('cerrar calcula consumo = serví + agregué - quedó y abre el siguiente', function () {
  var res = L.aplicar(d2, { op: 'cerrar', id: '2026-11-26-1', quedo: 300, servi_siguiente: 390 }, at('2026-11-26T22:05:00-03:00'));
  d3 = res.datos;
  var r = d3.registros[0];
  assert.strictEqual(r.fecha, '2026-11-26');
  assert.strictEqual(L.consumo(r), 136.5); /* 386 + 50,5 - 300 */
  assert.strictEqual(L.diasEntre(r.desde, r.fecha), 0, 'primer día: parcial');
  assert.strictEqual(d3.registros[1].servi, 390);
  assert.strictEqual(d3.registros[1].desde, '2026-11-26');
  assert.ok(/consumo 136.5 ml/.test(res.mensaje));
});

t('día normal: abierto el 26 a las 22:00, cerrado el 27 a las 22:00 => fecha 27, 1 día', function () {
  var d4 = L.aplicar(d3, { op: 'cerrar', id: '2026-11-26-2', quedo: 205 }, at('2026-11-27T22:00:00-03:00')).datos;
  var r = d4.registros[1];
  assert.strictEqual(r.fecha, '2026-11-27');
  assert.strictEqual(L.diasEntre(r.desde, r.fecha), 1);
  assert.strictEqual(L.consumo(r), 185);
});

t('doble toque: cerrar dos veces el mismo id falla', function () {
  falla(function () { L.aplicar(d3, { op: 'cerrar', id: '2026-11-26-1', quedo: 100 }); }, /ya se cerró/);
});

t('no se puede cerrar dos veces la misma noche', function () {
  falla(function () { L.aplicar(d3, { op: 'cerrar', id: '2026-11-26-2', quedo: 300 }, at('2026-11-26T22:10:00-03:00')); }, /ya está cerrado/);
});

t('quedó mayor que lo servido falla', function () {
  falla(function () { L.aplicar(d1, { op: 'cerrar', id: '2026-11-26-1', quedo: 400 }); }, /mayor que lo que había/);
});

t('números inválidos fallan', function () {
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: '' }); }, /Falta un número/);
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: '-3' }); }, /mayor que 0/);
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: '12,34' }); }, /un decimal/);
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: 9000 }); }, /demasiado grande/);
  falla(function () { L.aplicar(base, { op: 'iniciar', servi: 'abc' }); }, /Falta un número/);
});

t('corregir revalida', function () {
  var c = L.aplicar(d3, { op: 'corregir', id: '2026-11-26-1', quedo: 310, agregado_total: 0 }).datos;
  assert.strictEqual(L.consumo(c.registros[0]), 76);
  falla(function () { L.aplicar(d3, { op: 'corregir', id: '2026-11-26-1', quedo: 500 }); }, /mayor que lo que había/);
  falla(function () { L.aplicar(d3, { op: 'corregir', id: '2026-11-26-2', quedo: 100 }); }, /está abierto/);
});

t('eliminar quita solo ese registro', function () {
  var e = L.aplicar(d3, { op: 'eliminar', id: '2026-11-26-2' }).datos;
  assert.strictEqual(e.registros.length, 1);
  falla(function () { L.aplicar(d3, { op: 'eliminar', id: 'x' }); }, /No encontré/);
});

t('peso de Teo validado', function () {
  var p = L.aplicar(d2, { op: 'cerrar', id: '2026-11-26-1', quedo: 300, peso_teo: '4,1' }).datos;
  assert.strictEqual(p.registros[0].peso_teo, 4.1);
  falla(function () { L.aplicar(d2, { op: 'cerrar', id: '2026-11-26-1', quedo: 300, peso_teo: 40 }); }, /peso de Teo/);
});

console.log('\n' + ok + ' pruebas OK');
