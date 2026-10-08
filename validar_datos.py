#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validar_datos.py — Chequeos automáticos de datos.js antes de cada commit.

Revisa que datos.js sea JSON válido y coherente consigo mismo, con las imágenes de /archivos/ y
con index.html. No reemplaza la verificación de dos canales ni la aprobación de Camilo: solo
atrapa errores mecánicos (un punto en la serie o fecha equivocada, un archivo inexistente, un
enlace con la versión vieja que dejaría a los especialistas viendo datos en caché).

Uso:
  python3 validar_datos.py                      # chequeos generales
  python3 validar_datos.py --nuevos nuevos.json # además, round-trip de los valores confirmados

nuevos.json es la lista de valores que Camilo aprobó, por ejemplo:
  [{"serie": "alt", "fecha": "2026-10-02", "valor": 252, "archivo": 45},
   {"serie": "glucosa", "fecha": "2026-10-02", "valor": 61, "archivo": 45, "tubo": "sin fluoruro"}]
Cada uno debe existir exactamente una vez en datos.js, en esa serie, fecha y archivo.

Sale con código 1 si hay errores (❌). Los avisos (ℹ️) no bloquean, pero hay que leerlos.
"""
import argparse, json, os, re, sys

MESN = {"ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6, "jul": 7, "ago": 8,
        "sep": 9, "oct": 10, "nov": 11, "dic": 12}
ESTADOS = {"ok", "watch", "alert"}
TUBOS = {"con fluoruro", "sin fluoruro"}


def cargar(path):
    s = open(path, encoding="utf-8").read()
    m = re.search(r"^window\.DATOS =", s, re.M)
    if not m:
        raise SystemExit("❌ datos.js no tiene la línea 'window.DATOS ='")
    body = s[m.end():].strip()
    if not body.endswith(";"):
        raise SystemExit("❌ datos.js debe terminar en ';'")
    return json.loads(body[:-1])


def iso_de_label(label):
    p = label.split()
    if len(p) == 3 and p[1] in MESN:
        return f"{int(p[2]):04d}-{MESN[p[1]]:02d}-{int(p[0]):02d}"
    return None


def textos(cont):
    """Todos los textos explicativos (para buscar números sin respaldo)."""
    out = []
    def walk(x, ruta):
        if isinstance(x, dict):
            for k, v in x.items(): walk(v, ruta + "." + k)
        elif isinstance(x, list):
            for i, v in enumerate(x): walk(v, f"{ruta}[{i}]")
        elif isinstance(x, str):
            out.append((ruta, x))
    walk(cont, "contenido")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--datos", default="datos.js")
    ap.add_argument("--index", default="index.html")
    ap.add_argument("--archivos", default="archivos")
    ap.add_argument("--nuevos", default=None)
    a = ap.parse_args()

    err, info = [], []
    D = cargar(a.datos)

    # ---- archivos ----
    ids = {}
    for it in D["archivos"]:
        if it["id"] in ids: err.append(f"archivo {it['id']} repetido")
        ids[it["id"]] = it
        if len(it["images"]) != it["pages"]:
            err.append(f"archivo {it['id']}: pages={it['pages']} pero {len(it['images'])} imágenes")
        for im in it["images"]:
            if not os.path.exists(os.path.join(os.path.dirname(a.archivos) or ".", im)):
                err.append(f"archivo {it['id']}: no existe {im}")
    orden = [iso_de_label(it["dateLabel"]) for it in D["archivos"]]
    fechas_ok = [x for x in orden if x]
    if fechas_ok != sorted(fechas_ok, reverse=True):
        err.append("archivos: no están ordenados del más reciente al más antiguo")

    # ---- series ----
    n = 0
    for k, se in D["series"].items():
        for campo in ("nombre", "unidad", "rango", "organo", "puntos"):
            if campo not in se: err.append(f"serie {k}: falta '{campo}'")
        if len(se.get("rango", [])) != 2: err.append(f"serie {k}: rango debe tener 2 valores")
        f_prev = ""
        for i, p in enumerate(se["puntos"]):
            n += 1
            if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(p.get("fecha", ""))): err.append(f"{k}[{i}]: fecha inválida {p.get('fecha')}")
            if not isinstance(p.get("valor"), (int, float)): err.append(f"{k}[{i}]: valor no numérico")
            arch = p.get("archivo")
            if arch not in ids:
                err.append(f"{k}[{i}]: archivo {arch} no existe en 'archivos'")
            else:
                fa = iso_de_label(ids[arch]["dateLabel"])
                if fa and fa != p["fecha"]:
                    err.append(f"{k}[{i}]: fecha {p['fecha']} distinta a la del archivo {arch} ({fa})")
            if p.get("fecha", "") < f_prev: err.append(f"{k}[{i}]: fuera de orden cronológico")
            f_prev = p.get("fecha", "")
            if k == "glucosa" and p.get("tubo") not in TUBOS:
                err.append(f"glucosa[{i}]: falta 'tubo' (con fluoruro / sin fluoruro)")

    # ---- contenido ----
    C = D.get("contenido", {})
    org_ids = [o["id"] for o in C.get("organos", [])]
    if len(set(org_ids)) != len(org_ids): err.append("contenido.organos: ids repetidos")
    en_organo = set()
    for o in C.get("organos", []):
        if o.get("estado") not in ESTADOS: err.append(f"órgano {o['id']}: estado inválido {o.get('estado')}")
        if o.get("principal") not in D["series"]: err.append(f"órgano {o['id']}: serie principal {o.get('principal')} no existe")
        for k in o.get("series", []):
            if k not in D["series"]: err.append(f"órgano {o['id']}: serie {k} no existe")
            elif D["series"][k]["organo"] != o["id"]: err.append(f"serie {k}: organo='{D['series'][k]['organo']}' pero aparece en {o['id']}")
            en_organo.add(k)
        for b in o.get("bloques", []):
            if b not in C.get("bloques", {}): err.append(f"órgano {o['id']}: bloque {b} no existe")
    for k in D["series"]:
        if k not in en_organo: err.append(f"serie {k} no aparece en ningún órgano")
    def chk_arch(lista, ruta):
        for x in lista:
            if x not in ids: err.append(f"{ruta}: archivo {x} no existe")
    for x in C.get("bloques", {}).get("iris", []) + C.get("bloques", {}).get("urocultivos", []):
        chk_arch([x["archivo"]], "bloques")
    # estudios con varios archivos (eco + ECG + informe; informe + imágenes): todos deben ser de la misma fecha
    for ruta, lista in (("bloques.ecocardiografias", C.get("bloques", {}).get("ecocardiografias", [])),
                        ("imagenes.estudios", C.get("imagenes", {}).get("estudios", []))):
        for x in lista:
            if not x.get("archivos"): err.append(f"{ruta} {x.get('fecha')}: falta la lista 'archivos'"); continue
            chk_arch(x["archivos"], ruta)
            for a_ in x["archivos"]:
                if a_ in ids and ids[a_]["dateLabel"] != x["fecha"]:
                    err.append(f"{ruta} {x['fecha']}: archivo {a_} es del {ids[a_]['dateLabel']}")

    # ---- versión (caché) ----
    ultima = max(fechas_ok) if fechas_ok else None
    if D.get("version") != ultima:
        err.append(f"version '{D.get('version')}' debe ser la fecha del examen más reciente ({ultima})")
    if os.path.exists(a.index):
        html = open(a.index, encoding="utf-8").read()
        m = re.search(r'src="datos\.js\?v=([^"]+)"', html)
        if not m: err.append("index.html no carga datos.js?v=...")
        elif m.group(1) != D.get("version"):
            err.append(f"index.html carga datos.js?v={m.group(1)} pero version es {D.get('version')}: actualizar el enlace")

    # ---- números decimales en los textos sin respaldo en los datos ----
    conocidos = set()
    for se in D["series"].values():
        for p in se["puntos"]:
            for c in ("valor", "pad", "pam"):
                if c in p: conocidos.add(round(float(p[c]), 4))
        for r in se["rango"]:
            if r is not None: conocidos.add(round(float(r), 4))
    B = C.get("bloques", {})
    if "ggt" in B: conocidos.add(round(float(B["ggt"]["valor"]), 4))
    for x in B.get("ecocardio_metricas", []):
        mm = re.match(r"[\d.]+", x["v"])
        if mm: conocidos.add(round(float(mm.group(0)), 4))
    if "proteina_orina" in B:
        mm = re.match(r"[\d.]+", B["proteina_orina"]["valor"])
        if mm: conocidos.add(round(float(mm.group(0)), 4))
    for ruta, t in textos(C):
        if ruta.startswith("contenido.imagenes"):
            continue  # medidas de ecografía (cm, mm, cc): vienen de informes, no de series
        for m in re.finditer(r"(?<![\d.])(\d+[.,]\d+)(?![\d])(?!\s*(?:cm|mm|cc|%|lpm))", re.sub(r"<[^>]+>", " ", t)):
            v = round(float(m.group(1).replace(",", ".")), 4)
            if v not in conocidos:
                info.append(f"{ruta}: '{m.group(1)}' no está en ninguna serie (¿medida de imagen, nota o errata?)")

    # ---- round-trip de valores nuevos ----
    if a.nuevos:
        for x in json.load(open(a.nuevos, encoding="utf-8")):
            pts = D["series"].get(x["serie"], {}).get("puntos", [])
            hit = [p for p in pts if p["fecha"] == x["fecha"] and p["archivo"] == x["archivo"]
                   and abs(p["valor"] - x["valor"]) < 1e-9 and p.get("tubo") == x.get("tubo")]
            if len(hit) != 1:
                err.append(f"round-trip: {x} aparece {len(hit)} veces en datos.js (debe ser 1)")
        if not any(e.startswith("round-trip") for e in err):
            info.insert(0, f"round-trip OK: los {len(json.load(open(a.nuevos, encoding='utf-8')))} valores nuevos están en su serie, fecha y archivo")

    print(f"datos.js: {len(D['series'])} series, {n} puntos, {len(D['archivos'])} archivos, versión {D.get('version')}")
    for e in err: print("❌", e)
    for i in info: print("ℹ️ ", i)
    print("RESULTADO:", "OK" if not err else f"{len(err)} error(es)")
    sys.exit(1 if err else 0)


if __name__ == "__main__":
    main()
