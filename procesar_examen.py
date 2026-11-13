#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
procesar_examen.py — Herramienta auxiliar del dashboard médico de Teodoro.

Hace la parte MECÁNICA y repetible de agregar exámenes nuevos, con VERIFICACIÓN REFORZADA:
  1. Detecta ZIP-con-extensión-.pdf (escáner iPhone) vs PDF real (%PDF) vs JPG.
  2. Extrae el texto para leer valores (unzip+txt si es ZIP; pdftotext -layout si es PDF).
  3. Genera las imágenes WebP q88 (máx 1400 px, sin agrandar) con el nombre/índice correcto
     archivos/{idx:02d}_{pagina:02d}.webp (calcula el próximo índice desde /archivos/).
  4. PARSEA los valores (parámetro, valor, unidad, rango, página) y corre CHEQUEOS contra el
     histórico de datos.js (fuente única de datos del dashboard):
        - salto improbable respecto al último valor (posible decimal/dígito mal leído),
        - cambio de UNIDAD respecto a lo esperado (p. ej. ng/dL vs ng/mL),
        - cambio de RANGO de referencia del laboratorio (p. ej. T4 3,8 -> 3,5),
        - parámetros esperados que faltan.
  5. Imprime una TABLA DE CONFIRMACIÓN por indicador (para contrastar contra el PDF), un
     borrador del ítem de "archivos" (categoría/codes/fecha marcados "REVISAR") y un borrador
     de los puntos nuevos para cada serie de datos.js.

Lo que NO hace (criterio humano + de Claude, con aprobación de Camilo):
  - NO edita datos.js ni index.html, NO agrega puntos a las series, NO redacta textos clínicos.
  - NO hace commit ni push. NO decide codes/categoría/título finales (solo propone).
  - NO reemplaza los otros canales de verificación: la lectura VISUAL independiente de la
    imagen por parte de Claude, la reconciliación entre canales, la tabla de confirmación
    para Camilo, y el round-trip posterior al escribir datos.js (validar_datos.py --nuevos).

Uso (lo corre Claude tras clonar el repo):
  python3 procesar_examen.py --archivos ./archivos --out ./archivos --datos ./datos.js <archivos...>

Filosofía: la seguridad viene de CANALES INDEPENDIENTES QUE FALLAN DISTINTO. Este script es
UN canal (texto + chequeos automáticos). Para que un error pase inadvertido tendría que
burlar también la lectura visual de Claude, la revisión de Camilo y el round-trip.
"""

import argparse, io, json, os, re, subprocess, sys, tempfile, zipfile

MAX_PX = 1400
WEBP_QUALITY = 88
WEBP_METHOD = 6
JUMP_FACTOR = 3.0  # se marca si el valor nuevo es >3x o <1/3 del último histórico

RECO = ["recomien", "sugier", "idealmente", "pendiente", "aconseja",
        "complementar", "a futuro", "proximo control", "deberia", "debera"]

CAT = {
    "sangre":  ("Sangre / Bioquímica",  "🩸", "#f87171"),
    "orina":   ("Orina",                "💧", "#fbbf24"),
    "uro":     ("Urocultivo",           "🧫", "#fcd34d"),
    "renal":   ("Informe renal",        "🫘", "#2dd4bf"),
    "eco":     ("Informe ecográfico",   "📡", "#60a5fa"),
    "rx":      ("Informe radiográfico", "🩻", "#fb923c"),
    "cardio":  ("Estudio cardiológico", "❤️", "#a78bfa"),
    "resumen": ("Resumen de exámenes",  "📋", "#9aa0aa"),
}
MESES = {1:"ene",2:"feb",3:"mar",4:"abr",5:"may",6:"jun",
         7:"jul",8:"ago",9:"sep",10:"oct",11:"nov",12:"dic"}

# Mapa parámetro -> (id de serie mk, unidad esperada, rango esperado (low,high) o None).
# Sirve para (a) mapear el valor a su serie histórica y (b) detectar cambios de unidad/rango.
# El id es la clave de la serie en datos.js. Los que tienen id None no se grafican (solo nota).
SERIES = [
    # (regex del parámetro normalizado, id_serie, unidad_esperada, ref_low, ref_high)
    # Primero los que NO deben caer en una serie de sangre aunque compartan palabras
    # (match_entry devuelve la primera coincidencia). Antes se mapeaban mal: "creatinina en
    # orina" iba a cCreat y HDL/LDL/VLDL colesterol iban a cCol.
    (r"relacion prot",                      "upc", "", 0.1, 0.5),  # "Relación Proteína/Creatinina" (Gammavet); en VetLab la fila no trae unidad y no la toma el formato A
    (r"creatinina en orina",                "creatinina_orina", "mg/dl", 40, 600),  # graficada desde nov 2026
    (r"^(hdl|ldl|vldl) colesterol|^colesterol (hdl|ldl|vldl)", None, "mg/dl", None, None),
    (r"^creatinina",                        "creatinina", "mg/dl", 0.6, 2.0),
    (r"nus|nitrogeno ureico",               "nus",   "mg/dl", 8, 29),
    (r"^fosforo|(?<![a-z])fosforo",         "fosforo",  "mg/dl", 2.9, 5.3),
    (r"(?<![a-z])alt(?![a-z])|alanino amino", "alt", "ui/l", 18, 86),
    (r"fosfatasa alcalina",                 "fa",    "ui/l", 12, 121),
    (r"(?<![a-z])ast(?![a-z])|aspartato amino", "ast", "ui/l", 12, 42),
    (r"^colesterol",                        "colesterol",   "mg/dl", 133, 367),
    (r"t4 total",                           "t4",    "ug/dl", 1.3, 3.5),
    (r"^tsh|(?<![a-z])tsh",                 "tsh",   "ng/ml", 0.01, 0.6),
    (r"sodio",                              "sodio",    "meq/l", 140, 150),
    (r"potasio",                            "potasio",     "meq/l", 3.5, 5.5),
    (r"cloro",                              "cloro",    "meq/l", 107, 113),
    (r"sdma",                               "sdma",  "ug/dl", 1, 14),
    (r"pli|lipasa pancreatica",             "pli",   "ug/l", 10, 200),
    (r"^hematocrito",                       "hematocrito",  "%", 40, 60),
    (r"^hemoglobina",                       "hemoglobina",    "g/dl", 13, 20),
    (r"^(recuento )?leucocitos",            "leucocitos", "/ul", 6000, 17000),  # VetLab: "RECUENTO LEUCOCITOS" (nov 2026)
    (r"calcio",                             "calcio", "mg/dl", 9, 11.5),
    (r"glucosa",                            "glucosa", "mg/dl", 70, 120),
    # Resto del perfil bioquímico VetLab (no graficados, solo nota). Antes faltaban aquí y la
    # tabla de confirmación los omitía en silencio (bug detectado con el archivo 45, oct 2026).
    (r"proteinas? (totales )?en orina",     "proteina_orina", "mg/dl", 0, 10),  # graficada desde nov 2026; Gammavet: "Proteína en Orina"
    (r"microalbuminuria",                   None,     "mg/dl", 0, 20),  # solo nota (no graficada)
    (r"^proteinas totales",                 None,     "g/dl", 5.4, 7.5),
    (r"albumina",                           None,     "g/dl", 2.8, 4.0),
    (r"globulinas",                         None,     "g/dl", 2.7, 4.4),
    (r"(?<![a-z])ggt(?![a-z])|gamma glutamil", None,  "ui/l", 2, 10),
    (r"(?<![a-z])urea(?![a-z])",            None,     "mg/dl", 16, 58),
    (r"bilirrubina total",                  None,     "mg/dl", 0.1, 0.3),
]


def match_entry(label):
    """Entrada de SERIES que corresponde a un label normalizado, o None si no está mapeado."""
    for entry in SERIES:
        if re.search(entry[0], label):
            return entry
    return None


def magic(path):
    with open(path, "rb") as f:
        head = f.read(8)
    if head[:4] == b"PK\x03\x04": return "zip"
    if head[:5] == b"%PDF-":      return "pdf"
    if head[:3] == b"\xff\xd8\xff": return "jpg"
    return "desconocido"


def next_index(archivos_dir):
    mx = 0
    if os.path.isdir(archivos_dir):
        for n in os.listdir(archivos_dir):
            m = re.match(r"^(\d+)_\d+\.webp$", n)
            if m: mx = max(mx, int(m.group(1)))
    return mx + 1


def norm(s):
    s = s.lower()
    for a, b in [("á","a"),("é","e"),("í","i"),("ó","o"),("ú","u"),("ñ","n"),("µ","u")]:
        s = s.replace(a, b)
    return s


def extract_text(path, kind, workdir):
    """Texto plano, con salto de página \f entre páginas (para rastrear en qué página va cada valor)."""
    if kind == "zip":
        d = os.path.join(workdir, "unz"); os.makedirs(d, exist_ok=True)
        subprocess.run(["unzip", "-o", "-q", path, "-d", d], check=False)
        parts = []
        for n in sorted(os.listdir(d), key=lambda x: (len(x), x)):
            if n.lower().endswith(".txt"):
                with open(os.path.join(d, n), encoding="utf-8", errors="ignore") as f:
                    parts.append(f.read())
        return "\f".join(parts)
    elif kind == "pdf":
        out = subprocess.run(["pdftotext", "-layout", path, "-"],
                             capture_output=True, text=True, check=False)
        return out.stdout
    return ""


def images_from_zip(path):
    from PIL import Image
    imgs = []
    with zipfile.ZipFile(path) as z:
        names = [n for n in z.namelist() if n.lower().endswith((".jpeg", ".jpg", ".png"))]
        names.sort(key=lambda x: (len(x), x))
        for n in names:
            imgs.append(Image.open(io.BytesIO(z.read(n))).convert("RGB"))
    return imgs


def images_from_pdf(path, workdir, dpi):
    from PIL import Image
    out = os.path.join(workdir, "pg")
    subprocess.run(["pdftoppm", "-r", str(dpi), "-png", path, out], check=False)
    files = sorted([f for f in os.listdir(workdir) if f.startswith("pg") and f.endswith(".png")],
                   key=lambda x: (len(x), x))
    return [Image.open(os.path.join(workdir, f)).convert("RGB") for f in files]


def image_from_jpg(path):
    from PIL import Image
    return [Image.open(path).convert("RGB")]


def save_webp(im, out_path):
    from PIL import Image
    w, h = im.size
    if max(w, h) > MAX_PX:
        if w >= h: nw, nh = MAX_PX, round(h * MAX_PX / w)
        else:      nh, nw = MAX_PX, round(w * MAX_PX / h)
        im = im.resize((nw, nh), Image.LANCZOS)
    im.save(out_path, "WEBP", quality=WEBP_QUALITY, method=WEBP_METHOD)
    return im.size, os.path.getsize(out_path)


def guess_date(text):
    for p in [r"FECHA RECEPCION[:\s]*(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
              r"Recepci[oó]n Muestra\s*:\s*(\d{1,2})[/-](\d{1,2})[/-](\d{4})",  # Gammavet
              r"Fecha de estudio[:\s]*(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
              r"Fecha[:\s]*(\d{1,2})[/-](\d{1,2})[/-](\d{4})"]:
        m = re.search(p, text, re.I)
        if m:
            d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if 1 <= mo <= 12:
                return f"{d} {MESES.get(mo,'?')} {y}", m.group(0)
    return None, None


def guess_category(fname, text):
    t = norm(fname + " " + text)
    if "informe renal" in t: return "renal"
    if "radiograf" in t: return "rx"
    if any(k in t for k in ["ecocardiograma","ecocardiografia","electrocardiograma","cardiologic","cardiac"]): return "cardio"
    if any(k in t for k in ["ecografia","ecografico","ultrasonografico","ultrasonograf"]): return "eco"
    if "urocultivo" in t and not any(k in t for k in ["hemograma","bioquimico","perfil"]): return "uro"
    if any(k in t for k in ["urianalisis","orina"]) and not any(k in t for k in ["hemograma","bioquimico","perfil bioqu"]): return "orina"
    if any(k in t for k in ["hemograma","bioquimico","perfil","sdma","pli","t4","tsh","electrolito","fructosamina","tli"]): return "sangre"
    return "REVISAR"


def detect_codes(text):
    t = norm(text); found = []
    checks = [("Hemograma",["hemograma","hematocrito","leucocitos"]),
              ("Perfil Bioquímico",["perfil bioquimico","bioquimico c/f","creatinina"]),
              ("Perfil Lipídico",["perfil lipidico","trigliceridos","hdl","ldl"]),
              ("SDMA",["sdma"]),("Electrolitos",["sodio","potasio","cloro"]),
              ("PLI",["pli","lipasa pancreatica"]),("TSH",["tsh"]),
              ("T4 Total",["t4 total"]),("TLI Canino",["tli"]),
              ("Fructosamina",["fructosamina"]),("Urianálisis",["urianalisis","orina completa"]),
              ("Urocultivo",["urocultivo"])]
    for label, kws in checks:
        for kw in kws:
            i = t.find(kw)
            if i != -1 and not any(r in t[max(0,i-70):i] for r in RECO):
                found.append(label); break
    seen=set(); out=[]
    for c in found:
        if c not in seen: seen.add(c); out.append(c)
    return out


def num(s):
    """Convierte '2,77'/'2.77'/'>1.5' a float; None si no puede."""
    if s is None: return None
    s = s.replace(">","").replace("<","").replace(",",".").strip()
    try: return float(s)
    except: return None


def parse_values(text):
    """
    Devuelve lista de dicts: {param, sid, value, unit, low, high, page, raw}.
    Cubre dos formatos VetLab:
      A) misma línea:  'PARAM [¬/*] valor unidad low - high METODO'
      B) sección + RESULTADO:  header 'T4 TOTAL'/'TSH' y luego 'RESULTADO: valor unidad [low - high]'
    """
    out = []
    pages = text.split("\f")
    for pi, page in enumerate(pages, start=1):
        current = None  # sección activa para formato B
        for line in page.splitlines():
            l = line.strip()
            if not l: continue
            nl = norm(l)
            # ---- formato B: header de sección (sin valor+unidad en la misma línea) ----
            # (regex, nombre mostrado, id de serie o None si es solo nota)
            for secpat, secname, secid in [
                    (r"t4 total", "T4 total", "t4"),
                    (r"(?<![a-z])tsh(?![a-z])", "TSH", "tsh"),
                    (r"sdma", "SDMA", "sdma"),
                    (r"(?<![a-z])pli(?![a-z])|lipasa pancreatica", "PLI", "pli"),
                    (r"tli canino", "TLI canino", None),
                    (r"fructosamina", "Fructosamina", None),
                    (r"^glucosa", "Glucosa", "glucosa")]:
                if re.search(secpat, nl) and "resultado" not in nl and not re.search(r"\d+\s*(ug|ng|mg|ui|meq)", nl):
                    current = (secname, secid, tubo_de(nl))
            # La marca de fuera de rango (✱, extraída como ¬ o *) puede ir entre "Resultado" y el
            # valor: sin aceptarla, SDMA/PLI alterados quedaban sin mapear (archivo 46, nov 2026).
            mB = re.match(r"resultado[:\s]+[¬*•✱]?\s*([<>]?\d+[.,]?\d*)\s*([a-z/µu%]+)?(?:\s+([\d.,]+)\s*-\s*([\d.,]+))?", nl)
            if mB and current:
                secname, secid, tubo = current
                out.append({"param": secname, "sid": secid, "mapped": True, "tubo": tubo, "value": num(mB.group(1)),
                            "unit": (mB.group(2) or "").strip("."), "low": num(mB.group(3)),
                            "high": num(mB.group(4)), "page": pi, "raw": l})
                current = None
                continue
            # ---- formato A: misma línea con rango 'low - high' ----
            # Unidades: además de las simples (mg/dl, /ul, %), acepta "seg." y "x10^6/µl", que antes
            # hacían saltar la fila completa (eritrocitos, TP y TTPK del archivo 46, nov 2026).
            mA = re.match(r"(.+?)\s+[¬*•✱]?\s*([<>]?\d+[.,]?\d*)\s+(x10\^\d+/[a-zµu]+|[a-z/µu%]+\.?)\s+([\d.,]+)\s*-\s*([\d.,]+)", nl)
            if mA:
                label = mA.group(1).strip()
                entry = match_entry(label)
                # Se incluyen TODAS las filas con formato 'valor unidad low - high', estén o no
                # mapeadas: así ningún parámetro desaparece en silencio de la tabla. Las no
                # mapeadas quedan marcadas y generan un aviso ℹ️ en los chequeos.
                out.append({"param": label, "sid": entry[1] if entry else None, "tubo": tubo_de(label),
                            "mapped": entry is not None, "value": num(mA.group(2)),
                            "unit": mA.group(3).strip("."), "low": num(mA.group(4)),
                            "high": num(mA.group(5)), "page": pi, "raw": l})
    return out


# ---------------------------------------------------------------------------------------------
# Formato Gammavet (orina desde el 12 nov 2026). El nombre del laboratorio va solo en el logo
# (imagen), así que se reconoce por el diseño del informe: encabezado "Recepción Muestra" /
# "Fecha de Validación", una fila "EXAMEN ... RESULTADO ... UNIDAD" y filas
#   'Nombre : [▲/▼] resultado   (unidad)   low - high'   con coma decimal.
# ---------------------------------------------------------------------------------------------
TITULOS_GAMMAVET = [("analisis funcional de orina", "Análisis Funcional de Orina"),
                    ("urianalisis", "Urianálisis"), ("urocultivo", "Urocultivo")]


def es_gammavet(text):
    t = norm(text)
    return ("recepcion muestra" in t and "fecha de validacion" in t
            and re.search(r"examen\s+resultado", t) is not None)


def parse_gammavet(text):
    """Devuelve (titulo, filas numéricas, filas cualitativas, pie).
    Numéricas: mismo formato que parse_values (+ 'flag' ▲/▼ y 'lab'). Cualitativas: (param, resultado, unidad, pág)."""
    num_rows, cual_rows, pie, titulo = [], [], [], None
    for pi, page in enumerate(text.split("\f"), start=1):
        lines = page.splitlines()
        reglas = [i for i, l in enumerate(lines) if l.strip().startswith("_____")]
        if len(reglas) >= 2 and titulo is None:
            for l in lines[reglas[1] + 1:]:
                if l.strip() and not l.strip().startswith("_____"):
                    titulo = l.strip(); break
        en_tabla = False
        for line in lines:
            l = line.strip()
            if not l: continue
            nl = norm(l)
            if re.match(r"examen\s+resultado", nl): en_tabla = True; continue
            if nl.startswith(("metodo analitico", "tipo de muestra", "examen procesado")):
                en_tabla = False; pie.append(l); continue
            if not en_tabla or l.startswith(("(", "*", "_")) or nl.startswith("el resultado de este examen"): continue
            m = re.match(r"^([^:]+?)\s*:\s+(.+?)(?:\s{2,}\(([^)]*)\))?(?:\s{2,}(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?))?\s*$", l) \
                or re.match(r"^([^:]+?)\s{3,}(\S.*?)(?:\s{2,}\(([^)]*)\))?(?:\s{2,}(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?))?\s*$", l)
            if not m:
                if not re.search(r"\s{3,}", l): continue  # subtítulo de sección (ANALISIS FISICO, etc.)
                cual_rows.append((l, "NO PARSEADO — leer en la imagen", "", pi)); continue
            label, res, unit, low, high = [(g or "").strip() for g in m.groups()]
            mv = re.match(r"^([▲▼])?\s*([<>]?\d+(?:[.,]\d+)?)$", res)
            if mv:
                nlabel = norm(label).strip("* ")
                entry = match_entry(nlabel)
                num_rows.append({"param": label, "sid": entry[1] if entry else None, "tubo": None,
                                 "mapped": entry is not None, "value": num(mv.group(2)), "unit": unit,
                                 "low": num(low) if low else None, "high": num(high) if high else None,
                                 "page": pi, "raw": l, "flag": mv.group(1) or "", "lab": "Gammavet"})
            else:
                cual_rows.append((label, res, unit, pi))
    return titulo, num_rows, cual_rows, pie


def codes_gammavet(titulo):
    t = norm(titulo or "")
    for kw, label in TITULOS_GAMMAVET:
        if kw in t: return [label]
    return [(titulo or "REVISAR").title() + "  ← título no reconocido, REVISAR"]


def tubo_de(texto):
    """Para la glucosa: 'con fluoruro' / 'sin fluoruro' según el encabezado o la fila."""
    t = norm(texto)
    if "sin fluoruro" in t or " s/f" in t: return "sin fluoruro"
    if "con fluoruro" in t or " c/f" in t: return "con fluoruro"
    return None


def cargar_datos(datos_path):
    """Lee datos.js: la línea 'window.DATOS =' seguida de JSON estricto terminado en ';'."""
    s = open(datos_path, encoding="utf-8").read()
    m = re.search(r"^window\.DATOS =", s, re.M)
    body = s[m.end():].strip()
    assert body.endswith(";"), "datos.js debe terminar en ';'"
    return json.loads(body[:-1])


def parse_history(datos_path):
    """Último valor de cada serie de datos.js. En glucosa solo cuentan las muestras con fluoruro
    (las sin fluoruro salen artificialmente bajas y no sirven para detectar saltos)."""
    hist = {}
    if not datos_path or not os.path.exists(datos_path):
        return hist
    for key, se in cargar_datos(datos_path)["series"].items():
        pts = [p for p in se["puntos"] if key != "glucosa" or p.get("tubo") == "con fluoruro"]
        if pts:
            hist[key] = float(pts[-1]["valor"])
    return hist


def parse_history_lab(datos_path):
    """Último punto de cada serie por laboratorio: {(serie, lab): (valor, [low, high])}.
    El laboratorio de un punto es su campo 'lab' o, si no tiene, el 'lab' de la serie; el rango,
    su campo 'rango' o el de la serie. Sirve para comparar cada valor contra su mismo laboratorio."""
    out = {}
    if not datos_path or not os.path.exists(datos_path):
        return out
    for key, se in cargar_datos(datos_path)["series"].items():
        for p in se["puntos"]:
            if key == "glucosa" and p.get("tubo") != "con fluoruro": continue
            lab = p.get("lab") or se.get("lab")
            out[(key, lab)] = (float(p["valor"]), p.get("rango") or se.get("rango"))
    return out


def run_checks_lab(parsed, hist, hist_lab, lab):
    """Chequeos para un informe de un laboratorio con nombre (hoy Gammavet): cada valor se compara
    contra el último punto DEL MISMO laboratorio; contra el de otro laboratorio solo se informa el
    salto (no son directamente comparables), pero un salto >=3x igual detiene para confirmar."""
    flags = []
    unmapped = [r["param"] for r in parsed if not r.get("mapped", True)]
    if unmapped:
        flags.append(("ℹ️", f"{len(unmapped)} parámetro(s) sin serie conocida (van en la tabla y se confirman igual): {', '.join(unmapped)}"))
    for row in parsed:
        sid, val = row["sid"], row["value"]
        if val is None:
            flags.append(("🟡", f"{row['param']}: no se pudo leer un número claro en '{row['raw'][:60]}'. Revisar.")); continue
        if not sid: continue
        exp_unit, vl_low, vl_high = expected_for(sid)
        if exp_unit and row["unit"] and norm(row["unit"]) != exp_unit:
            flags.append(("🟡", f"{row['param']}: unidad '{row['unit']}' ≠ esperada '{exp_unit}' (verificar comparabilidad)"))
        if row["low"] is None or row["high"] is None:
            flags.append(("🟡", f"{row['param']}: el informe no trae rango de referencia legible. Confirmar en la imagen."))
        prev = hist_lab.get((sid, lab))
        if prev:
            last, rng = prev
            if rng and row["low"] is not None and (rng[0] != row["low"] or rng[1] != row["high"]):
                flags.append(("🟡", f"{row['param']}: rango del informe {row['low']}–{row['high']} ≠ rango anterior de {lab} {rng[0]}–{rng[1]} (¿el laboratorio cambió el rango?)"))
            if last and (val / last >= JUMP_FACTOR or val / last <= 1 / JUMP_FACTOR):
                flags.append(("🔴", f"{row['param']}: salto grande {last} → {val} (x{val/last:.1f}) dentro de {lab}. Posible error de lectura. CONFIRMAR contra la imagen."))
        else:
            flags.append(("🟡", f"{row['param']}: PRIMER valor de {lab} en la serie '{sid}'. Rango del informe {row['low']}–{row['high']} "
                                f"(serie: {vl_low}–{vl_high}); se guarda con 'lab' y 'rango' en el punto. Sin histórico comparable del mismo laboratorio."))
            if sid in hist and hist[sid]:
                ratio = val / hist[sid]
                if ratio >= JUMP_FACTOR or ratio <= 1 / JUMP_FACTOR:
                    flags.append(("🔴", f"{row['param']}: salto grande {hist[sid]} (laboratorio anterior) → {val} ({lab}) (x{ratio:.1f}). "
                                        f"Distinto laboratorio y método: puede ser real o del método. CONFIRMAR contra la imagen y con Camilo."))
                else:
                    flags.append(("ℹ️", f"{row['param']}: último valor del laboratorio anterior {hist[sid]} → {val} en {lab} (x{ratio:.1f}); no comparables directamente."))
    flags += chequeo_upc(parsed)
    return flags


def chequeo_upc(parsed):
    """Canal aritmético: si el informe trae proteína, creatinina y UPC, proteína ÷ creatinina debe dar
    el UPC publicado (al redondeo del informe). Un dígito mal leído en cualquiera de los tres lo rompe."""
    v = {r["sid"]: r["value"] for r in parsed if r["sid"] in ("proteina_orina", "creatinina_orina", "upc") and r["value"] is not None}
    if len(v) < 3 or not v["creatinina_orina"]:
        return [("🟡", "UPC: no se pudo hacer el chequeo proteína ÷ creatinina (falta alguno de los tres valores). Verificar a mano.")] \
            if any(k in v for k in ("proteina_orina", "creatinina_orina", "upc")) else []
    calc = v["proteina_orina"] / v["creatinina_orina"]
    if abs(calc - v["upc"]) <= 0.0051:
        return [("ℹ️", f"UPC: chequeo aritmético OK ({v['proteina_orina']} ÷ {v['creatinina_orina']} = {calc:.3f} ≈ {v['upc']} publicado).")]
    return [("🔴", f"UPC: proteína ÷ creatinina = {calc:.3f}, pero el informe publica {v['upc']}. Algún valor está mal leído. CONFIRMAR contra la imagen.")]


def expected_for(sid):
    for pat, s_id, unit, low, high in SERIES:
        if s_id == sid:
            return unit, low, high
    return None, None, None


def run_checks(parsed, hist):
    """Devuelve lista de (nivel, mensaje). nivel: '🔴' detener / '🟡' revisar / 'ℹ️' info."""
    flags = []
    seen_ids = set()
    unmapped = [r["param"] for r in parsed if not r.get("mapped", True)]
    if unmapped:
        flags.append(("ℹ️", f"{len(unmapped)} parámetro(s) sin serie ni rango conocido (igual van en la tabla "
                            f"y se confirman como el resto): {', '.join(unmapped)}"))
    for row in parsed:
        sid = row["sid"]; val = row["value"]
        if sid: seen_ids.add(sid)
        # Unidad y rango esperados: por serie (formato B) o por el label (formato A, incluye
        # parámetros de solo nota como calcio, glucosa, proteínas, etc.).
        if sid:
            exp_unit, exp_low, exp_high = expected_for(sid)
        else:
            entry = match_entry(row["param"]) if row.get("mapped") else None
            exp_unit, exp_low, exp_high = (entry[2], entry[3], entry[4]) if entry else (None, None, None)
        # unidad
        if exp_unit and row["unit"]:
            if norm(row["unit"]) != exp_unit:
                flags.append(("🟡", f"{row['param']}: unidad '{row['unit']}' ≠ esperada '{exp_unit}' "
                                    f"(¿cambio de unidad del laboratorio? verificar comparabilidad)"))
        # rango de referencia
        if exp_low is not None and row["low"] is not None and row["high"] is not None:
            if abs(row["low"]-exp_low) > 1e-9 or abs(row["high"]-exp_high) > 1e-9:
                flags.append(("🟡", f"{row['param']}: rango del informe {row['low']}–{row['high']} "
                                    f"≠ rango conocido {exp_low}–{exp_high} (¿el laboratorio cambió el rango?)"))
        # salto improbable vs histórico (la glucosa sin fluoruro no es comparable)
        if sid == "glucosa" and row.get("tubo") != "con fluoruro":
            flags.append(("ℹ️", f"{row['param']}: muestra {row.get('tubo') or 'sin tipo de tubo detectado'}; "
                                f"va a la serie glucosa marcada así y no se compara con el histórico."))
        elif sid and val is not None and sid in hist and hist[sid] not in (0, None):
            last = hist[sid]
            if last != 0:
                ratio = val/last if last else None
                if ratio and (ratio >= JUMP_FACTOR or ratio <= 1/JUMP_FACTOR):
                    flags.append(("🔴", f"{row['param']}: salto grande {last} → {val} "
                                        f"(x{ratio:.1f}). Posible error de lectura (decimal/dígito). "
                                        f"CONFIRMAR contra la imagen."))
        # valor no numérico
        if val is None:
            flags.append(("🟡", f"{row['param']}: no se pudo leer un número claro en '{row['raw'][:60]}'. Revisar."))
    # esperados que faltan (solo si se detectó un bioquímico y faltan clásicos)
    got_bioq = any(r["sid"] in ("creatinina","alt","colesterol") for r in parsed)
    if got_bioq:
        for pat, sid, *_ in SERIES:
            if sid and sid in hist and sid not in seen_ids and sid in ("creatinina","nus","fosforo","alt","fa","ast","colesterol"):
                flags.append(("ℹ️", f"{sid}: estaba en el histórico y no se detectó en este examen "
                                    f"(quizá no se midió, o no se parseó — verificar)."))
    return flags


def main():
    ap = argparse.ArgumentParser(description="Procesa exámenes nuevos de Teodoro (parte mecánica + verificación).")
    ap.add_argument("files", nargs="+")
    ap.add_argument("--archivos", default="./archivos")
    ap.add_argument("--out", default=None)
    ap.add_argument("--datos", default="./datos.js", help="datos.js para leer el histórico de series.")
    ap.add_argument("--dpi", type=int, default=200)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    out_dir = args.out or args.archivos
    if not args.dry_run: os.makedirs(out_dir, exist_ok=True)
    hist = parse_history(args.datos)
    hist_lab = parse_history_lab(args.datos)
    idx = next_index(args.archivos)
    print(f"Próximo índice disponible en {args.archivos}: {idx}")
    print(f"Histórico leído de {args.datos}: {len(hist)} series\n")

    resumen = []
    for path in args.files:
        if not os.path.exists(path):
            print(f"⚠  No existe: {path}"); continue
        kind = magic(path); base = os.path.basename(path)
        print("=" * 74)
        print(f"ARCHIVO: {base}\n  tipo: {kind}   → índice: {idx:02d}")
        with tempfile.TemporaryDirectory() as wd:
            text = extract_text(path, kind, wd)
            dlabel, draw = guess_date(text)
            cat = guess_category(base, text)
            codes = detect_codes(text) if cat in ("sangre","orina","uro") else []
            parsed = parse_values(text) if cat in ("sangre","orina","uro") else []
            lab, cual, pie = None, [], []
            if cat in ("sangre","orina","uro") and es_gammavet(text):
                lab = "Gammavet"
                titulo, parsed, cual, pie = parse_gammavet(text)
                codes = codes_gammavet(titulo)
                print("  FORMATO: Gammavet (reconocido por el diseño; el nombre del laboratorio va solo en el logo: CONFIRMAR en la imagen)")

            if kind == "zip":   imgs = images_from_zip(path)
            elif kind == "pdf": imgs = images_from_pdf(path, wd, args.dpi)
            elif kind == "jpg": imgs = image_from_jpg(path)
            else:               imgs = []

            img_names = []
            for pg, im in enumerate(imgs, start=1):
                name = f"{idx:02d}_{pg:02d}.webp"; img_names.append(f"archivos/{name}")
                if args.dry_run:
                    print(f"    [dry-run] generaría {name}")
                else:
                    size, by = save_webp(im, os.path.join(out_dir, name))
                    print(f"    ✔ {name}  {size[0]}x{size[1]}  {by//1024} KB")

            print(f"\n  FECHA detectada: {dlabel or '❓ NO DETECTADA — revisar'}  ({draw or 's/d'})")
            print(f"  CATEGORÍA tentativa: {cat}  ← REVISAR")
            if codes: print(f"  CODES tentativos: {' · '.join(codes)}  ← REVISAR")
            print(f"  PÁGINAS: {len(imgs)}")

            catlabel, icon, color = CAT.get(cat, ("REVISAR","❓","#9aa0aa"))
            item = {"id": idx, "cat": cat, "catLabel": catlabel, "icon": icon, "color": color,
                    "dateLabel": dlabel or "REVISAR",
                    "codes": " · ".join(codes) if codes else "Descripción y conclusiones",
                    "pages": len(imgs), "embedded": True, "images": img_names}
            print("\n  BORRADOR ITEMS (revisar catLabel/codes/dateLabel/título):")
            print("   " + json.dumps(item, ensure_ascii=False))

            # ---- TABLA DE CONFIRMACIÓN ----
            if parsed:
                print("\n  ── TABLA DE CONFIRMACIÓN (contrastar CADA fila contra el PDF) ──")
                print(f"  {'PARÁMETRO':32} {'VALOR':>8} {'UNIDAD':>7} {'RANGO':>14} {'PÁG':>4}  ESTADO")
                for r in parsed:
                    est = "?"
                    if r["value"] is not None and r["low"] is not None and r["high"] is not None:
                        if r["value"] < r["low"]: est = "↓ bajo"
                        elif r["value"] > r["high"]: est = "↑ alto"
                        else: est = "✓ en rango"
                    rng = f"{r['low']}-{r['high']}" if r["low"] is not None else "s/d"
                    tipo = r["sid"] if r["sid"] else ("nota" if r.get("mapped") else "NO MAPEADO")
                    marca = f" marca del lab: {r['flag']}" if r.get("flag") else ""
                    print(f"  {r['param'][:32]:32} {str(r['value']):>8} {r['unit'][:7]:>7} {rng:>14} {r['page']:>4}  {est:11} [{tipo}]{marca}")
                print(f"  ({len(parsed)} filas parseadas — contrastar que el número coincida con las filas del PDF)")
            if cual:
                print("\n  ── RESULTADOS CUALITATIVOS (no van a series; contrastar contra la imagen) ──")
                for lab_, res_, uni_, pg_ in cual:
                    print(f"  {lab_[:34]:34} {res_[:30]:30} {uni_[:10]:10} pág {pg_}")
                print(f"  ({len(cual)} filas cualitativas)")
            for l_ in pie:
                print(f"  PIE DEL INFORME: {l_}")

            # ---- BORRADOR DE PUNTOS PARA datos.js ----
            iso = None
            if dlabel:
                dd, mm, yy = dlabel.split()
                inv = {v: k for k, v in MESES.items()}
                iso = f"{int(yy):04d}-{inv[mm]:02d}-{int(dd):02d}"
            borr = [r for r in parsed if r["sid"] and r["value"] is not None]
            if borr:
                print("\n  BORRADOR de puntos para datos.js (SOLO tras verificar y con aprobación de Camilo):")
                for r in borr:
                    pt = {"fecha": iso or "REVISAR", "valor": r["value"], "archivo": idx}
                    if r["sid"] == "glucosa": pt["tubo"] = r.get("tubo") or "REVISAR"
                    if r.get("lab"):  # otro laboratorio: el punto lleva su laboratorio y el rango de su informe
                        pt["lab"] = r["lab"]; pt["rango"] = [r["low"], r["high"]]
                    print(f"   {r['sid']:12} " + json.dumps(pt, ensure_ascii=False))

            # ---- CHEQUEOS AUTOMÁTICOS ----
            if lab:
                flags = run_checks_lab(parsed, hist, hist_lab, lab) if parsed else []
            else:
                flags = run_checks(parsed, hist) if parsed else []
            print("\n  ── CHEQUEOS AUTOMÁTICOS (canal texto vs histórico) ──")
            if not flags:
                print("  ✔ Sin alertas automáticas. (Igual: verificar visualmente y con Camilo.)")
            else:
                for lvl, msg in flags:
                    print(f"  {lvl} {msg}")

            print("\n  ── TEXTO EXTRAÍDO (para la lectura visual independiente / doble check) ──")
            snip = text.strip()
            print("  " + (snip[:1800].replace("\n","\n  ") if snip else "(sin texto)"))
            if len(snip) > 1800: print("  … [truncado]")

            resumen.append((base, idx, kind, cat, dlabel, len(imgs), len(flags)))
        idx += 1

    print("\n" + "=" * 74)
    print("RESUMEN")
    for base, i, k, c, d, p, nf in resumen:
        alerta = f"{nf} alerta(s)" if nf else "sin alertas"
        print(f"  {i:02d}  {c:8}  {d or 'FECHA?':12}  {p} pág  ({k})  {alerta}")
    print("""
PROTOCOLO DE VERIFICACIÓN (NO automático — no se salta nunca):
  1) Este script = CANAL 1 (texto) + chequeos automáticos, arriba.
  2) Claude lee las IMÁGENES del examen (CANAL 2, visión) y transcribe los valores SIN
     mirar el canal 1; luego RECONCILIA ambos canales valor por valor.
  3) Si un valor no coincide entre canales, o hay una alerta 🔴/🟡, el flujo SE DETIENE y
     se le marca a Camilo; no se elige un valor por cuenta propia.
  4) Cero invención: un número solo se usa si está en el texto Y en la imagen. Lo ilegible
     se marca "NO LEGIBLE — confirmar".
  5) Preview completo → aprobación explícita de Camilo → recién ahí commit/push.
  6) ROUND-TRIP: tras escribir datos.js, correr validar_datos.py --nuevos con los valores
     confirmados (atrapa valores puestos en la serie/fecha equivocada).
""")


if __name__ == "__main__":
    main()
