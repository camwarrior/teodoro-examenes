'use strict';
/*
 * /api/agua — lee y guarda el registro diario de agua de Teodoro.
 *
 *   GET   devuelve {agua, clima, rama} leídos directo del repo (sin esperar el redeploy).
 *   POST  {pin, op, ...} aplica una operación (ver _agua-logica.js) y hace commit de agua.json.
 *
 * Variables de entorno en Vercel (nunca en el repo):
 *   GITHUB_TOKEN_AGUA  token fine-grained solo para camwarrior/teodoro-examenes, Contents: read/write
 *   PIN_AGUA           PIN para escribir
 * Rama: en producción escribe en main; en una vista previa, en la rama de esa vista previa
 * (así las pruebas no tocan los datos reales).
 */
var crypto = require('crypto');
var L = require('./_agua-logica.js');

var OWNER = 'camwarrior', REPO = 'teodoro-examenes', API = 'https://api.github.com';

function rama() {
  if (process.env.VERCEL_ENV === 'production') return 'main';
  return process.env.VERCEL_GIT_COMMIT_REF || null;
}

function gh(path, opts) {
  opts = opts || {};
  return fetch(API + path, {
    method: opts.method || 'GET',
    headers: {
      'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN_AGUA,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'teo-registro-agua'
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
}

async function leer(archivo, ref) {
  var r = await gh('/repos/' + OWNER + '/' + REPO + '/contents/' + archivo + '?ref=' + encodeURIComponent(ref));
  if (r.status === 404) return { json: null, sha: null };
  if (!r.ok) throw Object.assign(new Error('GitHub respondió ' + r.status + ' al leer ' + archivo + '.'), { status: 502 });
  var j = await r.json();
  return { json: JSON.parse(Buffer.from(j.content, 'base64').toString('utf8')), sha: j.sha };
}

async function escribir(archivo, ref, json, sha, mensaje) {
  var contenido = JSON.stringify(json, null, 2) + '\n';
  var r = await gh('/repos/' + OWNER + '/' + REPO + '/contents/' + archivo, {
    method: 'PUT',
    body: { message: mensaje, content: Buffer.from(contenido, 'utf8').toString('base64'), sha: sha, branch: ref }
  });
  if (r.status === 409 || r.status === 422) return false; /* alguien escribió entre medio: reintentar */
  if (!r.ok) {
    var det = ''; try { det = (await r.json()).message || ''; } catch (e) {}
    var txt = 'GitHub respondió ' + r.status + ' al guardar' + (det ? ' ("' + det + '")' : '') + '.';
    if (r.status === 403 || r.status === 404) txt += ' Revisa que el token GITHUB_TOKEN_AGUA tenga acceso a teodoro-examenes con permiso Contents: Read and write.';
    if (r.status === 401) txt += ' El token no es válido o expiró: crea uno nuevo y actualízalo en Vercel.';
    throw Object.assign(new Error(txt), { status: 502 });
  }
  return true;
}

function pinOk(pin) {
  var real = process.env.PIN_AGUA || '';
  if (!real) return false;
  var a = crypto.createHash('sha256').update(String(pin || '')).digest();
  var b = crypto.createHash('sha256').update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

function espera(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function enviar(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

module.exports = async function (req, res) {
  try {
    var ref = rama();
    if (!ref) return enviar(res, 500, { error: 'No sé en qué rama guardar (falta VERCEL_GIT_COMMIT_REF).' });
    if (!process.env.GITHUB_TOKEN_AGUA) return enviar(res, 500, { error: 'Falta configurar GITHUB_TOKEN_AGUA en Vercel.' });

    if (req.method === 'GET') {
      var a = await leer('agua.json', ref), c = await leer('clima.json', ref);
      return enviar(res, 200, { agua: a.json, clima: c.json, rama: ref });
    }
    if (req.method !== 'POST') return enviar(res, 405, { error: 'Método no permitido.' });

    var body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
    if (!body || typeof body !== 'object') return enviar(res, 400, { error: 'Solicitud inválida.' });
    if (!process.env.PIN_AGUA) return enviar(res, 500, { error: 'Falta configurar PIN_AGUA en Vercel.' });
    if (!pinOk(body.pin)) { await espera(1500); return enviar(res, 401, { error: 'PIN incorrecto.' }); }

    var op = Object.assign({}, body); delete op.pin;
    for (var intento = 0; intento < 3; intento++) {
      var actual = await leer('agua.json', ref);
      if (!actual.json) return enviar(res, 500, { error: 'No encontré agua.json en la rama ' + ref + '.' });
      var out = L.aplicar(actual.json, op, new Date());
      if (await escribir('agua.json', ref, out.datos, actual.sha, out.mensaje)) {
        return enviar(res, 200, { ok: true, agua: out.datos, mensaje: out.mensaje, rama: ref });
      }
      await espera(400);
    }
    return enviar(res, 409, { error: 'No pude guardar por un conflicto. Intenta de nuevo.' });
  } catch (e) {
    return enviar(res, e.status || 500, { error: e.message || 'Error inesperado.' });
  }
};
