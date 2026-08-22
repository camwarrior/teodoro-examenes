#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
procesar_examen.py — Herramienta auxiliar del dashboard médico de Teodoro.

Qué hace (la parte MECÁNICA y repetible de agregar exámenes nuevos):
  1. Detecta si cada archivo es un ZIP con extensión .pdf (escáner de iPhone)
     o un PDF real (%PDF), o un JPG.
  2. Extrae el texto para leer valores (unzip+txt si es ZIP; pdftotext -layout si es PDF).
  3. Genera las imágenes WebP q88 (máx 1400 px, sin agrandar) con el nombre correcto
     archivos/{idx:02d}_{pagina:02d}.webp, calculando el siguiente índice a partir de
     lo que ya existe en la carpeta /archivos/.
  4. Imprime un RESUMEN PARA REVISIÓN: fecha detectada, texto/valores extraídos, y un
     borrador del ítem de ITEMS (con categoría tentativa marcada "REVISAR").

Qué NO hace (a propósito — esto es criterio humano + de Claude, con aprobación de Camilo):
  - NO edita index.html, NO agrega puntos a las series, NO redacta textos clínicos.
  - NO hace commit ni push.
  - NO decide la categorización/codes/título finales: solo propone un borrador.

Uso típico (lo corre Claude en su entorno tras clonar el repo):
  python3 procesar_examen.py --archivos ./archivos --out ./archivos <archivo1> [archivo2 ...]

  --archivos  carpeta /archivos/ existente (para calcular el próximo índice). Por defecto ./archivos
  --out       dónde escribir los .webp nuevos. Por defecto = --archivos
  --dpi       resolución de rasterizado para PDFs reales (por defecto 200)
  --dry-run   no escribe imágenes; solo muestra el plan y los valores

Después del script, el flujo humano sigue igual: Claude arma el preview completo
(valores + categorización + cambios de series/textos + ítems) y ESPERA la aprobación
explícita de Camilo antes de cualquier commit. La verificación doble de valores y el
visto bueno NUNCA se saltan.
"""

import argparse, io, json, os, re, subprocess, sys, tempfile, zipfile

MAX_PX = 1400
WEBP_QUALITY = 88
WEBP_METHOD = 6

# Palabras de recomendación: si un examen aparece SOLO cerca de estas, no cuenta como medido.
RECO = ["recomien", "sugier", "idealmente", "pendiente", "aconseja",
        "complementar", "a futuro", "proximo control", "deberia", "debera"]

# Mapa de categorías (icono/color) — igual que en el dashboard.
CAT = {
    "sangre":  ("Sangre / Bioquímica",              "🩸", "#f87171"),
    "orina":   ("Orina",                            "💧", "#fbbf24"),
    "uro":     ("Urocultivo",                       "🧫", "#fcd34d"),
    "renal":   ("Informe renal",                    "🫘", "#2dd4bf"),
    "eco":     ("Informe ecográfico",               "📡", "#60a5fa"),
    "rx":      ("Informe radiográfico",             "🩻", "#fb923c"),
    "cardio":  ("Estudio cardiológico",             "❤️", "#a78bfa"),
    "resumen": ("Resumen de exámenes",              "📋", "#9aa0aa"),
}

MESES = {1:"ene",2:"feb",3:"mar",4:"abr",5:"may",6:"jun",
         7:"jul",8:"ago",9:"sep",10:"oct",11:"nov",12:"dic"}


def magic(path):
    with open(path, "rb") as f:
        head = f.read(8)
    if head[:4] == b"PK\x03\x04":
        return "zip"
    if head[:5] == b"%PDF-":
        return "pdf"
    if head[:3] == b"\xff\xd8\xff":
        return "jpg"
    return "desconocido"


def next_index(archivos_dir):
    mx = 0
    if os.path.isdir(archivos_dir):
        for n in os.listdir(archivos_dir):
            m = re.match(r"^(\d+)_\d+\.webp$", n)
            if m:
                mx = max(mx, int(m.group(1)))
    return mx + 1


def norm(s):
    s = s.lower()
    for a, b in [("á","a"),("é","e"),("í","i"),("ó","o"),("ú","u"),("ñ","n")]:
        s = s.replace(a, b)
    return s


def extract_text(path, kind, workdir):
    """Devuelve el texto plano del examen para leer valores."""
    if kind == "zip":
        d = os.path.join(workdir, "unz")
        os.makedirs(d, exist_ok=True)
        subprocess.run(["unzip", "-o", "-q", path, "-d", d], check=False)
        txt = []
        for n in sorted(os.listdir(d), key=lambda x: (len(x), x)):
            if n.lower().endswith(".txt"):
                with open(os.path.join(d, n), encoding="utf-8", errors="ignore") as f:
                    txt.append(f.read())
        return "\n".join(txt)
    elif kind == "pdf":
        try:
            out = subprocess.run(["pdftotext", "-layout", path, "-"],
                                 capture_output=True, text=True, check=False)
            return out.stdout
        except Exception as e:
            return f"(no se pudo extraer texto: {e})"
    return ""


def images_from_zip(path, workdir):
    """Lista de objetos PIL.Image desde los JPEG internos del ZIP, en orden."""
    from PIL import Image
    imgs = []
    with zipfile.ZipFile(path) as z:
        names = [n for n in z.namelist() if n.lower().endswith((".jpeg", ".jpg", ".png"))]
        names.sort(key=lambda x: (len(x), x))
        for n in names:
            imgs.append(Image.open(io.BytesIO(z.read(n))).convert("RGB"))
    return imgs


def images_from_pdf(path, workdir, dpi):
    """Lista de PIL.Image rasterizando cada página del PDF real."""
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
        if w >= h:
            nw, nh = MAX_PX, round(h * MAX_PX / w)
        else:
            nh, nw = MAX_PX, round(w * MAX_PX / h)
        im = im.resize((nw, nh), Image.LANCZOS)
    im.save(out_path, "WEBP", quality=WEBP_QUALITY, method=WEBP_METHOD)
    return im.size, os.path.getsize(out_path)


def guess_date(text):
    """Intenta detectar la fecha del examen. Devuelve (dateLabel, crudo) o (None, None)."""
    pats = [
        r"FECHA RECEPCION[:\s]*(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
        r"Fecha de estudio[:\s]*(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
        r"Fecha[:\s]*(\d{1,2})[/-](\d{1,2})[/-](\d{4})",
    ]
    for p in pats:
        m = re.search(p, text, re.I)
        if m:
            d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if 1 <= mo <= 12:
                return f"{d} {MESES.get(mo,'?')} {y}", m.group(0)
    return None, None


def guess_category(fname, text):
    """Categoría TENTATIVA por contenido. Siempre marcar para revisión."""
    t = norm(fname + " " + text)
    if "informe renal" in t:
        return "renal"
    if any(k in t for k in ["radiograf", "informe radiografico"]):
        return "rx"
    if any(k in t for k in ["ecocardiograma", "ecocardiografia", "electrocardiograma",
                            "cardiologic", "cardiac"]):
        return "cardio"
    if any(k in t for k in ["ecografia", "ecografico", "ultrasonografico", "ultrasonograf"]):
        return "eco"
    if "urocultivo" in t and not any(k in t for k in ["hemograma", "bioquimico", "perfil"]):
        return "uro"
    if any(k in t for k in ["urianalisis", "orina"]) and not any(
            k in t for k in ["hemograma", "bioquimico", "perfil bioqu"]):
        return "orina"
    if any(k in t for k in ["hemograma", "bioquimico", "perfil", "sdma", "pli",
                            "t4", "tsh", "electrolito", "fructosamina", "tli"]):
        return "sangre"
    return "REVISAR"


def detect_codes(text):
    """Detección tentativa de exámenes medidos (regla resultados-no-recomendaciones).
    SOLO orientativo: Claude y Camilo confirman los codes finales."""
    t = norm(text)
    found = []
    checks = [
        ("Hemograma", ["hemograma", "hematocrito", "leucocitos"]),
        ("Perfil Bioquímico", ["perfil bioquimico", "bioquimico c/f", "creatinina"]),
        ("Perfil Lipídico", ["perfil lipidico", "trigliceridos", "hdl", "ldl"]),
        ("SDMA", ["sdma"]),
        ("Electrolitos", ["sodio", "potasio", "cloro"]),
        ("PLI", ["pli", "lipasa pancreatica"]),
        ("TSH", ["tsh"]),
        ("T4 Total", ["t4 total", "t4 total canina"]),
        ("TLI Canino", ["tli"]),
        ("Fructosamina", ["fructosamina"]),
        ("Urianálisis", ["urianalisis", "orina completa"]),
        ("Urocultivo", ["urocultivo"]),
    ]
    for label, kws in checks:
        for kw in kws:
            idx = t.find(kw)
            if idx != -1:
                ventana = t[max(0, idx-70):idx]
                if not any(r in ventana for r in RECO):
                    found.append(label)
                    break
    # quitar duplicados conservando orden
    seen = set(); ordered = []
    for c in found:
        if c not in seen:
            seen.add(c); ordered.append(c)
    return ordered


def main():
    ap = argparse.ArgumentParser(description="Procesa exámenes nuevos de Teodoro (parte mecánica).")
    ap.add_argument("files", nargs="+", help="Archivos de examen a procesar (en orden).")
    ap.add_argument("--archivos", default="./archivos", help="Carpeta /archivos/ existente.")
    ap.add_argument("--out", default=None, help="Dónde escribir los .webp (por defecto = --archivos).")
    ap.add_argument("--dpi", type=int, default=200, help="DPI de rasterizado para PDFs reales.")
    ap.add_argument("--dry-run", action="store_true", help="No escribe imágenes; solo muestra el plan.")
    args = ap.parse_args()

    out_dir = args.out or args.archivos
    if not args.dry_run:
        os.makedirs(out_dir, exist_ok=True)

    idx = next_index(args.archivos)
    print(f"Próximo índice disponible en {args.archivos}: {idx}\n")

    resumen = []
    for path in args.files:
        if not os.path.exists(path):
            print(f"⚠  No existe: {path}"); continue
        kind = magic(path)
        base = os.path.basename(path)
        print("=" * 70)
        print(f"ARCHIVO: {base}")
        print(f"  tipo detectado: {kind}   → índice asignado: {idx:02d}")

        with tempfile.TemporaryDirectory() as wd:
            text = extract_text(path, kind, wd)
            dlabel, draw = guess_date(text)
            cat = guess_category(base, text)
            codes = detect_codes(text) if cat in ("sangre", "orina", "uro") else []

            # imágenes
            if kind == "zip":
                imgs = images_from_zip(path, wd)
            elif kind == "pdf":
                imgs = images_from_pdf(path, wd, args.dpi)
            elif kind == "jpg":
                imgs = image_from_jpg(path)
            else:
                imgs = []

            img_names = []
            for pg, im in enumerate(imgs, start=1):
                name = f"{idx:02d}_{pg:02d}.webp"
                img_names.append(f"archivos/{name}")
                if args.dry_run:
                    print(f"    [dry-run] generaría {name}")
                else:
                    size, bytes_ = save_webp(im, os.path.join(out_dir, name))
                    print(f"    ✔ {name}  {size[0]}x{size[1]}  {bytes_//1024} KB")

            print(f"\n  FECHA detectada: {dlabel or '❓ NO DETECTADA — revisar'}"
                  f"   ({draw or 's/d'})")
            print(f"  CATEGORÍA tentativa: {cat}  ← REVISAR")
            if codes:
                print(f"  CODES tentativos: {' · '.join(codes)}  ← REVISAR (regla resultados-no-recomendaciones)")
            print(f"  PÁGINAS: {len(imgs)}")

            # borrador de ítem ITEMS
            catlabel, icon, color = CAT.get(cat, ("REVISAR", "❓", "#9aa0aa"))
            item = {
                "id": idx, "cat": cat, "catLabel": catlabel, "icon": icon, "color": color,
                "dateLabel": dlabel or "REVISAR",
                "codes": " · ".join(codes) if codes else "Descripción y conclusiones",
                "pages": len(imgs), "embedded": True, "images": img_names,
            }
            print("\n  BORRADOR de ítem ITEMS (revisar catLabel/codes/dateLabel/título):")
            print("   " + json.dumps(item, ensure_ascii=False))

            print("\n  ---- TEXTO EXTRAÍDO (para verificar valores DOS veces) ----")
            snippet = text.strip()
            print("  " + (snippet[:2500].replace("\n", "\n  ") if snippet else "(sin texto)"))
            if len(snippet) > 2500:
                print("  … [texto truncado; hay más]")

            resumen.append((base, idx, kind, cat, dlabel, len(imgs)))
        idx += 1

    print("\n" + "=" * 70)
    print("RESUMEN")
    for base, i, k, c, d, p in resumen:
        print(f"  {i:02d}  {c:8}  {d or 'FECHA?':12}  {p} pág  ({k})  {base}")
    print("\nSIGUIENTE PASO (NO automático): Claude arma el preview completo con estos")
    print("valores + categorización + cambios de series/textos + ítems, y ESPERA la")
    print("aprobación explícita de Camilo antes de cualquier commit/push.")


if __name__ == "__main__":
    main()
