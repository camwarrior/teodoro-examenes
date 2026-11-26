#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
clima_dmc.py — Llena clima.json con la temperatura mínima y máxima MEDIDAS de cada día.

Fuente: servicio getEmaResumenDiario de la Dirección Meteorológica de Chile (DMC), que trae las
extremas de hoy, ayer y anteayer de una estación automática. Solo se guardan días ya terminados
(nunca el día en curso). Estación principal: Tobalaba (330019), la más cercana a Ñuñoa.
Respaldo: Quinta Normal (330020), si Tobalaba no tiene el día o lo tiene incompleto.

Lo corre .github/workflows/clima.yml dos veces al día. Necesita los secretos DMC_USUARIO y
DMC_TOKEN. Nunca imprime el token. Si algo falla, lo deja anotado en clima.json
("ultimo_intento") para que se vea en el sitio, y no inventa valores.

Uso local de prueba (sin red):  python3 scripts/clima_dmc.py --desde-archivo respuesta.json
"""
import argparse, json, os, sys, time, urllib.parse, urllib.request, urllib.error
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIMA = os.path.join(RAIZ, "clima.json")
URL = "https://climatologia.meteochile.gob.cl/application/servicios/getEmaResumenDiario/{cod}?usuario={u}&token={t}"
ESTACIONES = ["330019", "330020"]
DESDE = "2026-11-20"          # no guardar días anteriores al registro
COMPLETO = 0.8               # un día cuenta si tiene al menos 80 % de las mediciones del día más completo
SCL = ZoneInfo("America/Santiago")


def limpio(s):
    t = os.environ.get("DMC_TOKEN", "")
    s = str(s)
    return s.replace(t, "<token>") if t else s


def descargar(cod):
    u, t = os.environ.get("DMC_USUARIO", ""), os.environ.get("DMC_TOKEN", "")
    if not u or not t:
        raise RuntimeError("Faltan los secretos DMC_USUARIO y/o DMC_TOKEN en GitHub.")
    url = URL.format(cod=cod, u=urllib.parse.quote(u), t=urllib.parse.quote(t))
    ultimo = None
    for intento in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "teodoro-examenes/clima"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.loads(r.read().decode("utf-8"))
        except (urllib.error.URLError, json.JSONDecodeError, TimeoutError) as e:
            ultimo = e
            time.sleep(5 * (intento + 1))
    raise RuntimeError("No pude descargar la estación %s: %s" % (cod, limpio(ultimo)))


def extremas(resp, cod):
    """Devuelve {iso: {min, max, min_hora, max_hora, datos}} de la estación, o {} si no hay."""
    est = (resp or {}).get("estaciones")
    if isinstance(est, list):  # por si la DMC devuelve una lista en vez de un objeto
        est = {str(e.get("estacion", {}).get("codigoNacional") or e.get("codigoNacional")): e for e in est}
    if not isinstance(est, dict) or cod not in est:
        claves = list((resp or {}).keys())
        raise RuntimeError("La respuesta de la estación %s no trae 'estaciones/%s' (claves: %s)." % (cod, cod, claves))
    datos = ((est[cod].get("datosResumenEma") or {}).get("datos") or {})
    te = datos.get("temperaturaExtremas") or {}
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
    return out


def plausible(d):
    return -15 <= d["min"] <= 40 and -10 <= d["max"] <= 46 and d["min"] <= d["max"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--desde-archivo", help="usar una respuesta guardada (pruebas, una por estación: cod=archivo)", nargs="*")
    ap.add_argument("--hoy", help="fecha de hoy en Santiago (pruebas)")
    a = ap.parse_args()

    clima = json.load(open(CLIMA, encoding="utf-8"))
    hoy = a.hoy or datetime.now(SCL).strftime("%Y-%m-%d")
    ahora = datetime.now(SCL).isoformat(timespec="minutes")
    notas, nuevos, errores = [], [], []

    archivos = dict(x.split("=", 1) for x in (a.desde_archivo or []))
    por_est = {}
    for cod in ESTACIONES:
        try:
            resp = json.load(open(archivos[cod])) if cod in archivos else (descargar(cod) if not archivos else None)
            if resp is None:
                continue
            por_est[cod] = extremas(resp, cod)
        except Exception as e:  # se anota y se sigue con la otra estación
            errores.append(limpio(e))

    # días cerrados que traen las respuestas
    dias = sorted({d for ex in por_est.values() for d in ex if DESDE <= d < hoy})
    for dia in dias:
        actual = clima["dias"].get(dia)
        if actual and actual.get("estacion") == ESTACIONES[0]:
            continue  # ya está con la estación principal
        for cod in ESTACIONES:
            ex = por_est.get(cod, {})
            d = ex.get(dia)
            if not d:
                continue
            mx = max((x.get("datos") or 0) for x in ex.values()) or 0
            if mx and (d.get("datos") or 0) < COMPLETO * mx:
                notas.append("%s: %s tiene el día incompleto (%s de %s mediciones)" % (dia, cod, d.get("datos"), mx))
                continue
            if not plausible(d):
                errores.append("%s: valores fuera de lo posible en %s (%s / %s); no se guardan" % (dia, cod, d["min"], d["max"]))
                continue
            if actual and actual.get("estacion") == cod:
                break
            clima["dias"][dia] = dict(d, estacion=cod)
            nuevos.append("%s (%s): mín %s, máx %s" % (dia, cod, d["min"], d["max"]))
            break

    clima["dias"] = dict(sorted(clima["dias"].items()))
    faltan = []
    if clima["dias"]:
        d0 = datetime.strptime(min(clima["dias"]), "%Y-%m-%d")
        while d0.strftime("%Y-%m-%d") < hoy:
            if d0.strftime("%Y-%m-%d") not in clima["dias"]:
                faltan.append(d0.strftime("%Y-%m-%d"))
            d0 += timedelta(days=1)
    clima["ultimo_intento"] = {
        "cuando": ahora,
        "ok": not errores and bool(por_est),
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
    # Si no se pudo leer ninguna estación, el workflow queda en rojo y GitHub avisa por correo.
    return 0 if por_est else 1


if __name__ == "__main__":
    sys.exit(main())
