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
     histórico de index.html:
        - salto improbable respecto al último valor (posible decimal/dígito mal leído),
        - cambio de UNIDAD respecto a lo esperado (p. ej. ng/dL vs ng/mL),
        - cambio de RANGO de referencia del laboratorio (p. ej. T4 3,8 -> 3,5),
        - parámetros esperados que faltan.
  5. Imprime una TABLA DE CONFIRMACIÓN por indicador (para contrastar contra el PDF) y un
     borrador de ítem de ITEMS (categoría/codes/fecha marcados "REVISAR").

Lo que NO hace (criterio humano + de Claude, con aprobación de Camilo):
  - NO edita index.html, NO agrega puntos a las series, NO redacta textos clínicos.
  - NO hace commit ni push. NO decide codes/categoría/título finales (solo propone).
  - NO reemplaza los otros canales de verificación: la lectura VISUAL independiente de la
    imagen por parte de Claude, la reconciliación entre canales, la tabla de confirmación
    para Camilo, y el round-trip posterior al escribir index.html.

Uso (lo corre Claude tras clonar el repo):
  python3 procesar_examen.py --archivos ./archivos --out ./archivos --index-html ./index.html <archivos...>

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
# Los que tienen id None no se grafican (solo nota): calcio, glucosa, etc.
SERIES = [
    # (regex del parámetro normalizado, id_serie, unidad_esperada, ref_low, ref_high)
    (r"creatinina",                         "cCreat", "mg/dl", 0.6, 2.0),
    (r"nus|nitrogeno ureico",               "cNUS",   "mg/dl", 8, 29),
    (r"^fosforo|(?<![a-z])fosforo",         "cFosf",  "mg/dl", 2.9, 5.3),
    (r"alt|alanino amino",                  "cALT",   "ui/l", 18, 86),
    (r"fosfatasa alcalina",                 "cFA",    "ui/l", 12, 121),
    (r"ast|aspartato amino",                "cAST",   "ui/l", 12, 42),
    (r"colesterol",                         "cCol",   "mg/dl", 133, 367),
    (r"t4 total",                           "cT4",    "ug/dl", 1.3, 3.5),
    (r"^tsh|(?<![a-z])tsh",                 "cTSH",   "ng/ml", 0.01, 0.6),
    (r"sodio",                              "cNa",    "meq/l", 140, 150),
    (r"potasio",                            "cK",     "meq/l", 3.5, 5.5),
    (r"cloro",                              "cCl",    "meq/l", 107, 113),
    (r"sdma",                               "cSDMA",  "ug/dl", 1, 14),
    (r"pli|lipasa pancreatica",             "cPLI",   "ug/l", 10, 200),
    (r"calcio",                             None,     "mg/dl", 9, 11.5),
    (r"glucosa",                            None,     "mg/dl", 70, 120),
]


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
            # ---- formato B: header de sección (línea corta, sin dígitos de valor) ----
            for secpat, secid in [(r"t4 total", "cT4"), (r"(?<![a-z])tsh(?![a-z])", "cTSH")]:
                if re.search(secpat, nl) and "resultado" not in nl and not re.search(r"\d+\s*(ug|ng|mg|ui|meq)", nl):
                    current = secid
            mB = re.match(r"resultado[:\s]+([<>]?\d+[.,]?\d*)\s*([a-z/µu%]+)?(?:\s+([\d.,]+)\s*-\s*([\d.,]+))?", nl)
            if mB and current:
                out.append({"param": current, "sid": current, "value": num(mB.group(1)),
                            "unit": (mB.group(2) or "").strip("."), "low": num(mB.group(3)),
                            "high": num(mB.group(4)), "page": pi, "raw": l})
                current = None
                continue
            # ---- formato A: misma línea con rango 'low - high' ----
            mA = re.match(r"(.+?)\s+[¬*•]?\s*([<>]?\d+[.,]?\d*)\s+([a-z/µu%]+)\s+([\d.,]+)\s*-\s*([\d.,]+)", nl)
            if mA:
                label = mA.group(1)
                sid = None
                for pat, s_id, *_ in SERIES:
                    if re.search(pat, label):
                        sid = s_id; break
                # incluir aunque sid sea None solo si el label matchea calcio/glucosa u otro conocido
                known = any(re.search(pat, label) for pat, *_ in SERIES)
                if known:
                    out.append({"param": label.strip(), "sid": sid, "value": num(mA.group(2)),
                                "unit": mA.group(3).strip("."), "low": num(mA.group(4)),
                                "high": num(mA.group(5)), "page": pi, "raw": l})
    return out


def parse_history(index_html_path):
    """Último valor de cada serie mk('cX',[labels],[data],...) en index.html."""
    hist = {}
    if not index_html_path or not os.path.exists(index_html_path):
        return hist
    s = open(index_html_path, encoding="utf-8").read()
    for m in re.finditer(r"mk\('(\w+)',\[[^\]]*\],\[([^\]]*)\]", s):
        cid = m.group(1)
        vals = [v for v in m.group(2).split(",") if v.strip() not in ("", "null")]
        if vals:
            try: hist[cid] = float(vals[-1])
            except: pass
    return hist


def expected_for(sid):
    for pat, s_id, unit, low, high in SERIES:
        if s_id == sid:
            return unit, low, high
    return None, None, None


def run_checks(parsed, hist):
    """Devuelve lista de (nivel, mensaje). nivel: '🔴' detener / '🟡' revisar / 'ℹ️' info."""
    flags = []
    seen_ids = set()
    for row in parsed:
        sid = row["sid"]; val = row["value"]
        if sid: seen_ids.add(sid)
        exp_unit, exp_low, exp_high = expected_for(sid) if sid else (None, None, None)
        # unidad
        if sid and exp_unit and row["unit"]:
            if norm(row["unit"]) != exp_unit:
                flags.append(("🟡", f"{row['param']}: unidad '{row['unit']}' ≠ esperada '{exp_unit}' "
                                    f"(¿cambio de unidad del laboratorio? verificar comparabilidad)"))
        # rango de referencia
        if sid and exp_low is not None and row["low"] is not None and row["high"] is not None:
            if abs(row["low"]-exp_low) > 1e-9 or abs(row["high"]-exp_high) > 1e-9:
                flags.append(("🟡", f"{row['param']}: rango del informe {row['low']}–{row['high']} "
                                    f"≠ rango conocido {exp_low}–{exp_high} (¿el laboratorio cambió el rango?)"))
        # salto improbable vs histórico
        if sid and val is not None and sid in hist and hist[sid] not in (0, None):
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
    got_bioq = any(r["sid"] in ("cCreat","cALT","cCol") for r in parsed)
    if got_bioq:
        for pat, sid, *_ in SERIES:
            if sid and sid in hist and sid not in seen_ids and sid in ("cCreat","cNUS","cFosf","cALT","cFA","cAST","cCol"):
                flags.append(("ℹ️", f"{sid}: estaba en el histórico y no se detectó en este examen "
                                    f"(quizá no se midió, o no se parseó — verificar)."))
    return flags


def main():
    ap = argparse.ArgumentParser(description="Procesa exámenes nuevos de Teodoro (parte mecánica + verificación).")
    ap.add_argument("files", nargs="+")
    ap.add_argument("--archivos", default="./archivos")
    ap.add_argument("--out", default=None)
    ap.add_argument("--index-html", default="./index.html", help="index.html para leer el histórico de series.")
    ap.add_argument("--dpi", type=int, default=200)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    out_dir = args.out or args.archivos
    if not args.dry_run: os.makedirs(out_dir, exist_ok=True)
    hist = parse_history(args.index_html)
    idx = next_index(args.archivos)
    print(f"Próximo índice disponible en {args.archivos}: {idx}")
    print(f"Histórico leído de {args.index_html}: {len(hist)} series\n")

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
                    print(f"  {r['param'][:32]:32} {str(r['value']):>8} {r['unit'][:7]:>7} {rng:>14} {r['page']:>4}  {est}")

            # ---- CHEQUEOS AUTOMÁTICOS ----
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
  6) ROUND-TRIP: tras escribir index.html, re-extraer cada valor nuevo del archivo final y
     compararlo con el valor confirmado (atrapa valores puestos en la fila/fecha equivocada).
""")


if __name__ == "__main__":
    main()
