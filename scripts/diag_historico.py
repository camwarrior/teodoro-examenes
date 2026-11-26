#!/usr/bin/env python3
"""TEMPORAL: baja la temperatura diaria histórica de Tobalaba (nov 2026) para comparar con otras
plataformas. Se borra después de la comparación. No imprime el token."""
import json, os, urllib.parse, urllib.request
u, t = os.environ["DMC_USUARIO"], os.environ["DMC_TOKEN"]
url = ("https://climatologia.meteochile.gob.cl/application/servicios/getTemperaturaHistoricaDiaria/330019/2026?usuario=%s&token=%s"
       % (urllib.parse.quote(u), urllib.parse.quote(t)))
try:
    r = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "teodoro"}), timeout=60).read())
    datos = r.get("datos") or {}
    mes = datos.get("11") or datos.get(11) or {}
    out = {"claves_raiz": list(r.keys()), "claves_datos": list(datos.keys())[:14], "noviembre": mes}
except Exception as e:
    out = {"error": str(e).replace(t, "<token>")}
os.makedirs("diag", exist_ok=True)
json.dump(out, open("diag/tobalaba_nov2026.json", "w"), ensure_ascii=False, indent=1)
print("ok")
