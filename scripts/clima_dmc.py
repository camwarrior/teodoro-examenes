#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
clima_dmc.py — Llena clima.json con la temperatura mínima y máxima MEDIDAS de cada día.

Solo la estación Tobalaba (330019) de la Dirección Meteorológica de Chile (DMC), la oficial más
cercana a la casa. Dos servicios de la DMC, de la misma estación:
  1. getEmaResumenDiario: extremas de hoy, ayer y anteayer (datos minuto a minuto).
  2. getTemperaturaHistoricaDiaria: extremas diarias del año; se usa para rellenar días que el
     resumen no trajo completos (por ejemplo, si el proceso no corrió un par de días).
Solo se guardan días ya terminados (nunca el día en curso). Si la estación no tiene un día, queda
sin dato: no se reemplaza por otra estación.

Lo corre .github/workflows/clima.yml dos veces al día. Necesita los secretos DMC_USUARIO y
DMC_TOKEN. Nunca imprime el token. Si algo falla, lo deja anotado en clima.json
("ultimo_intento") para que se vea en el sitio, y no inventa valores.

Uso local de prueba (sin red):  python3 scripts/clima_dmc.py --resumen r.json --historico h.json --hoy 2026-11-27
"""
import argparse, json, os, sys, time, urllib.parse, urllib.request, urllib.error
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIMA = os.path.join(RAIZ, "clima.json")
BASE = "https://climatologia.meteochile.gob.cl/application/servicios/"
URL_RESUMEN = BASE + "getEmaResumenDiario/{cod}?usuario={u}&token={t}"
URL_HISTORICO = BASE + "getTemperaturaHistoricaDiaria/{cod}/{ano}?usuario={u}&token={t}"
ESTACION = "330019"
MIN_HORAS = 18             # el histórico trae ~24 registros por día; con menos de 18 el día no se usa
DESDE = "2026-11-20"          # no guardar días anteriores al registro
COMPLETO = 0.8               # un día cuenta si tiene al menos 80 % de las mediciones del día más completo
SCL = ZoneInfo("America/Santiago")


def limpio(s):
    t = os.environ.get("DMC_TOKEN", "")
    s = str(s)
    return s.replace(t, "<token>") if t else s


def descargar(plantilla, **kw):
    u, t = os.environ.get("DMC_USUARIO", ""), os.environ.get("DMC_TOKEN", "")
    if not u or not t:
        raise RuntimeError("Faltan los secretos DMC_USUARIO y/o DMC_TOKEN en GitHub.")
    url = plantilla.format(u=urllib.parse.quote(u), t=urllib.parse.quote(t), **kw)
    ultimo = None
    for intento in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "teodoro-examenes/clima"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.loads(r.read().decode("utf-8"))
        except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as e:
            ultimo = e
            time.sleep(5 * (intento + 1))
    raise RuntimeError("No pude descargar de la DMC: %s" % limpio(ultimo))


def buscar(obj, clave):
    """Primer objeto que contiene la clave, buscando en profundidad."""
    if isinstance(obj, dict):
        if clave in obj:
            return obj[clave]
        for v in obj.values():
            r = buscar(v, clave)
            if r is not None:
                return r
    elif isinstance(obj, list):
        for v in obj:
            r = buscar(v, clave)
            if r is not None:
                return r
    return None


def estructura(obj, nivel=0):
    """Solo los nombres de las claves (sin valores), para diagnosticar cambios de formato."""
    if nivel > 3:
        return "…"
    if isinstance(obj, dict):
        return {k: estructura(v, nivel + 1) for k, v in obj.items() if isinstance(v, (dict, list))} or list(obj.keys())
    if isinstance(obj, list):
        return [estructura(obj[0], nivel + 1)] if obj else []
    return None


def extremas(resp, cod):
    """Devuelve {iso: {min, max, min_hora, max_hora, datos}} de la estación.

    La DMC entrega dos formatos: con todas las estaciones ("estaciones" -> código -> datosResumenEma
    -> datos -> temperaturaExtremas) o con una sola ("datosEstacion" + "datos"). Se busca la clave
    temperaturaExtremas y se confirma que la respuesta sea de la estación pedida."""
    est = (resp or {}).get("estaciones")
    if isinstance(est, dict) and cod in est:
        resp = est[cod]
    codigo = buscar((resp or {}).get("datosEstacion") or {}, "codigoNacional")
    if codigo is not None and str(codigo) != cod:
        raise RuntimeError("Pedí la estación %s y la DMC respondió la %s." % (cod, codigo))
    te = buscar(resp, "temperaturaExtremas")
    if not isinstance(te, dict):
        raise RuntimeError("La respuesta de la estación %s no trae temperaturaExtremas. Estructura: %s"
                           % (cod, json.dumps(estructura(resp), ensure_ascii=False)[:900]))
    out = {}
    for k, v in te.items():
        try:
            iso = datetime.strptime(k, "%d-%m-%Y").strftime("%Y-%m-%d")
        except ValueError:
            continue
        mx, mn = (v or {}).get("maxima") or {}, (v or {}).get("minima") or {}
        if mx.get("valor") is None or mn.get("valor") is None:
            continue
        out[iso] = {"min": float(mn["valor"]), "max": float(mx["valor"]),
                    "min_hora": mn.get("momento"), "max_hora": mx.get("momento"),
                    "datos": v.get("datos")}
    if not out:
        raise RuntimeError("La estación %s trae temperaturaExtremas pero sin días legibles (claves: %s)."
                           % (cod, list(te.keys())[:5]))
    return out


def historico(resp, cod):
    """{iso: {...}} desde getTemperaturaHistoricaDiaria: datos -> mes -> día -> maxima/minima."""
    codigo = buscar((resp or {}).get("datosEstacion") or {}, "codigoNacional")
    if codigo is not None and str(codigo) != cod:
        raise RuntimeError("Pedí el histórico de %s y la DMC respondió la %s." % (cod, codigo))
    ano = int((resp or {}).get("ano") or 0)
    out = {}
    for m, dias in ((resp or {}).get("datos") or {}).items():
        for d, v in (dias or {}).items():
            try:
                iso = "%04d-%02d-%02d" % (ano, int(m), int(d))
            except ValueError:
                continue
            if not isinstance(v, dict) or v.get("maxima") is None or v.get("minima") is None:
                continue
            out[iso] = {"min": round(float(v["minima"]), 1), "max": round(float(v["maxima"]), 1),
                        "min_hora": v.get("fechaMin"), "max_hora": v.get("fechaMax"),
                        "datos": v.get("numDatos")}
    return out


def plausible(d):
    return -15 <= d["min"] <= 40 and -10 <= d["max"] <= 46 and d["min"] <= d["max"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--resumen", help="respuesta guardada de getEmaResumenDiario (pruebas, sin red)")
    ap.add_argument("--historico", help="respuesta guardada de getTemperaturaHistoricaDiaria (pruebas)")
    ap.add_argument("--hoy", help="fecha de hoy en Santiago (pruebas)")
    a = ap.parse_args()
    sin_red = bool(a.resumen or a.historico)

    clima = json.load(open(CLIMA, encoding="utf-8"))
    clima["estaciones"] = {ESTACION: "Eulogio Sánchez, Tobalaba Ad. (Santiago oriente)"}
    clima["principal"] = ESTACION
    hoy = a.hoy or datetime.now(SCL).strftime("%Y-%m-%d")
    ahora = datetime.now(SCL).isoformat(timespec="minutes")
    notas, nuevos, errores, leido = [], [], [], False

    def guardar(dia, d, fuente):
        if not plausible(d):
            errores.append("%s: valores fuera de lo posible (%s / %s); no se guardan" % (dia, d["min"], d["max"]))
            return
        clima["dias"][dia] = dict(d, estacion=ESTACION, fuente=fuente)
        nuevos.append("%s: mín %s, máx %s (%s)" % (dia, d["min"], d["max"], fuente))

    # 1) Resumen diario (minuto a minuto): hoy, ayer y anteayer.
    try:
        resp = json.load(open(a.resumen)) if a.resumen else (None if sin_red else descargar(URL_RESUMEN, cod=ESTACION))
        if resp is not None:
            ex = extremas(resp, ESTACION)
            leido = True
            mx = max((x.get("datos") or 0) for x in ex.values()) or 0
            for dia in sorted(ex):
                if not (DESDE <= dia < hoy) or dia in clima["dias"]:
                    continue
                d = ex[dia]
                if mx and (d.get("datos") or 0) < COMPLETO * mx:
                    notas.append("%s: el resumen trae el día incompleto (%s de %s mediciones); se busca en el histórico" % (dia, d.get("datos"), mx))
                    continue
                guardar(dia, d, "resumen diario")
    except Exception as e:
        errores.append(limpio(e))

    # 2) Histórico diario: rellena los días cerrados que sigan faltando desde DESDE.
    faltan = []
    d0 = datetime.strptime(DESDE, "%Y-%m-%d")
    while d0.strftime("%Y-%m-%d") < hoy:
        if d0.strftime("%Y-%m-%d") not in clima["dias"]:
            faltan.append(d0.strftime("%Y-%m-%d"))
        d0 += timedelta(days=1)
    if faltan:
        hist = {}
        for ano in sorted({f[:4] for f in faltan}):
            try:
                resp = json.load(open(a.historico)) if a.historico else (None if sin_red else descargar(URL_HISTORICO, cod=ESTACION, ano=ano))
                if resp is not None:
                    hist.update(historico(resp, ESTACION))
                    leido = True
            except Exception as e:
                errores.append(limpio(e))
        for dia in faltan:
            d = hist.get(dia)
            if not d:
                continue
            if (d.get("datos") or 0) < MIN_HORAS:
                notas.append("%s: el histórico también está incompleto (%s registros)" % (dia, d.get("datos")))
                continue
            guardar(dia, d, "histórico diario")
        faltan = [f for f in faltan if f not in clima["dias"]]

    clima["dias"] = dict(sorted(clima["dias"].items()))
    clima["ultimo_intento"] = {
        "cuando": ahora,
        "ok": not errores and leido,
        "nuevos": nuevos,
        "avisos": list(dict.fromkeys(notas + errores)),
        "faltan": faltan[-30:],
    }
    with open(CLIMA, "w", encoding="utf-8") as f:
        json.dump(clima, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("Nuevos:", nuevos or "ninguno")
    for x in dict.fromkeys(notas + errores):
        print("Aviso:", x)
    # Si no se pudo leer nada de la DMC, el workflow queda en rojo y GitHub avisa por correo.
    return 0 if leido else 1


if __name__ == "__main__":
    sys.exit(main())
