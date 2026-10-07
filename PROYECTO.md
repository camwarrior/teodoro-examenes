# Proyecto: Dashboard médico de Teodoro

**Paciente:** Teodoro Guerrero, Chihuahua macho, nacido **22 ago 2020**. Diagnósticos: ERC IRIS 1-2, ACVIM B1 (valvulopatía mitral leve), pancreatitis crónica. Tutor: Camilo Guerrero. Clínica: Nueva Madrid / laboratorio VetLab. Equipo tratante: veterinaria de cabecera (Loreto), nefrólogo (Dr. Eduardo Guzmán) y, desde ago 2026, endocrinología (interconsulta derivada por el nefrólogo por la T4 al alza). **Tratamiento hepático vigente:** Hepatocan Forte, indicado por endocrinología por 1 mes tras el control de ago 2026; el examen de oct 2026 (archivo 45) fue el control posterior a ese mes.

**Repo:** github.com/camwarrior/teodoro-examenes (rama `main`). **Deploy:** Vercel (`teodoro-examenes.vercel.app` redirige a **teo.camiloworks.com**), framework preset **Other**, root `./`, sitio estático HTML + Chart.js vía CDN, sin build. Responsivo mobile-first (iPhone). **Archivos fuente:** 45 exámenes (lab, ecografías abdominales y cervical/tiroidea, ecocardiogramas, ECG, radiografías), ago 2022 – oct 2026, más una carpeta `/archivos/` con 184 imágenes WebP que alimentan la pestaña de archivos.

## Estructura del dashboard (index.html)

**9 pestañas.** Las pestañas 1–8 tienen: tarjetas de métricas, gráficos de tendencia con líneas de referencia, y una sección explicativa final ("¿Qué significa cada indicador?" + conclusión con código de color 🟢 / 🟡 a vigilar / 🔴 conversar con veterinaria). La pestaña 9 es el visor de archivos.

1. **Renal** — SDMA, creatinina, NUS, fósforo + diagnósticos IRIS con presión arterial.
2. **Sangre** — PLI, leucocitos, hematocrito, hemoglobina.
3. **Hígado** — ALT, FA, AST, colesterol (+ GGT en tarjeta).
4. **Tiroides/Electrolitos** — T4 total, TSH, sodio, potasio, cloro.
5. **Orina** — UPC + urocultivos con antibiogramas.
6. **Cardiología** — métricas ecocardiográficas, PAS, ecocardiografías/ECG.
7. **Imágenes** — ecografías + radiografía con conclusiones.
8. **Evolución** — línea de tiempo clínica (2022–2026) + resumen general.
9. **Archivos** — lista de los 45 exámenes con visor de imágenes y descarga PDF. Ver sección dedicada más abajo.

**Encabezado:** avatar circular con la ilustración de Teodoro (imagen incrustada en base64, sin dependencias externas). La edad se muestra junto a la fecha de nacimiento — p. ej. "Nacido 22 ago 2020 (6A0M)" — y se **calcula dinámicamente vía JS** a partir del 22 ago 2020 en cada carga. El favicon sigue siendo la huella 🐾 (opcional cambiarlo).

### Navegación entre pestañas (clic + swipe móvil)

- **Clic/tap:** cada botón llama a `sw(i)`. La función muestra el panel `i` (`.panel.active` con `display:block`, el resto `display:none`), marca el botón activo, **centra la pestaña activa en la barra** (`centerTab`) y hace `scrollTo(0,0)`. Solo se ve un panel a la vez.
- **Swipe horizontal (solo móvil):** se puede deslizar el dedo en cualquier parte del panel actual para pasar a la pestaña siguiente (izquierda) o anterior (derecha), sin tener que tocar el botón. Izquierda = avanza, derecha = retrocede; sin "rebote" en los extremos (no hace nada en la primera/última).
- **Animación de deslizamiento:** al cambiar por swipe, el panel entrante entra deslizándose desde el lado correcto (`@keyframes slInR` / `slInL`, `translateX ±22px` + `opacity 0→1`, **0.24s**, easing `cubic-bezier(.22,.61,.36,1)`). Usa solo `transform`/`opacity` (aceleradas por GPU, sin recálculo de layout) y **no re-renderiza los gráficos**. Respeta `prefers-reduced-motion` (si el sistema reduce animaciones, no anima). El tap sobre una pestaña cambia sin la animación de slide (solo el swipe la dispara).
- **Auto-scroll de la barra:** como son 9 pestañas y no caben en pantalla, `centerTab(i)` desplaza la barra (`#tabs`) para centrar la pestaña activa en cada cambio, sea por tap o por swipe.

**Protecciones del gesto (claves para no romper nada):**
- **Lightbox:** mientras el visor de Archivos (`#lb`) está abierto, el swipe global se desactiva (`lbOpen()`), para no interferir con su propia navegación de páginas y el pellizco-zoom.
- **Zonas excluidas:** se ignora el gesto si nace dentro de `<header>` (la zona "Teodoro Guerrero"), de la barra de pestañas (`.tabs`) o de los chips de filtro (`.af-filters`) — estos últimos tienen scroll horizontal propio. Función `ignoreZone(el)`.
- **Gesto claramente horizontal:** exige `|Δx| ≥ 60px`, `|Δx| > 1.5·|Δy|` y duración `< 700 ms`. Así el scroll vertical normal al leer nunca cambia de pestaña.
- **Solo móvil:** la animación está condicionada a `isMobile()` (`matchMedia('(max-width:768px)')`); en escritorio el comportamiento queda igual que antes. El swipe en sí solo existe en táctil.
- **Sin scroll horizontal accidental:** `body` lleva `overflow-x:hidden` para que el `translateX` de la animación no genere una barra horizontal.

## Series de datos (verificadas contra los PDF fuente, todas las fechas)

- **SDMA** (ref 1–14): Nov23=6, May24=33→40, Jul24=20, Ago24=25, Dic24=24, Jun25=14, Sep25=11, Ene26=14. *(No se midió en ago ni oct 2026.)*
- **Creatinina** (0.6–2.0): Nov23=0.8, Ene24=0.6, Feb24=0.8, May24=4.0→2.2, Jul24=2.0, Ago24=1.6, Dic24=1.5, Jun25=1.3, Sep25=1.0, Ene26=1.4, Ago26=1.4, **Oct26=1.5** (en rango)
- **NUS** (8–29): May24=122→22.8 (14 y 24 may; pico 122), resto en rango, Ene26=20.5, Ago26=26.9 (dentro de rango, cerca del límite), Oct26=24.4
- **Fósforo** (2.9–5.3): picos 10.3/10.5 (Ene-Feb24), normal desde May24, Ene26=3.3, Ago26=2.8 (levemente bajo el límite inferior), **Oct26=2.9 (justo en el límite inferior; el lab lo marca con ✱)**
- **PLI** (10–200): Nov23=48, May24=221.7/213.1, Jun24=270.3, Jul24=229, Ago24=273.6, Dic24=192.4, Jun25=311, Sep25=182.9, Ene26=197.4. *(No se midió en ago ni oct 2026.)*
- **Leucocitos** (6k–17k): rango normal, mínimo 4460 (Jul24), Ene26=10380. *(Sin hemograma en ago ni oct 2026.)*
- **Hematocrito** (40–60): pico 62 (Feb24), Ene26=45.1. *(Sin hemograma en ago ni oct 2026.)*
- **Hemoglobina** (13–20): Ene26=15.2. *(Sin hemograma en ago ni oct 2026.)*
- **ALT** (18–86): Nov23=438.9, Ene24=216.1, Feb24=116.9, May24=54/542, Jul24=128, Ago24=298.6, Dic24=236.5, Jun25=175.7, Sep25=302, Ene26=311, Ago26=388, **Oct26=252 — primer descenso en más de un año (control tras 1 mes de Hepatocan Forte), aunque sigue ~3× sobre el límite**
- **FA** (12–121): pico 669 (Jul24), Sep25=594, Ene26=213, Ago26=273, **Oct26=183** (baja, sigue alta)
- **AST** (12–42): Ene26=66, Ago26=61.7, **Oct26=46.5** (baja, sigue levemente alta)
- **Colesterol** (133–367): en rango, Ene26=323, Ago26=252, Oct26=262
- **UPC** (0.1–0.5): May24=1.55→1.10, Jun24=0.63, Jul24=0.45, Ago24=0.42, Dic24=0.30, Jun25=0.58, Ago25=0.19, Ene26=0.12. *(No se midió orina en ago ni oct 2026.)*
- **PAS** (<140): Ago22=113, May24=143, Jul24=144, Sep24=136, Ene25=139, Jun25=141, Feb26=130

**Valores no graficados (solo nota):**
- **Calcio** (9–11.5 mg/dL): Ene26=8.4 ↓, Ago26=8.8 ↓, **Oct26=9.3 (vuelve a rango)**. No tiene gráfico propio; se registra como nota (decisión de Camilo).
- **Glucosa** (70–120 mg/dL): Ago26=65 ↓ (tubo **con** fluoruro), Oct26=61 ↓ (tubo **sin** fluoruro). Ojo: el método/tubo cambió entre ambos controles; sin fluoruro la glucosa puede bajar en el tubo, así que no son estrictamente comparables. No graficada; solo nota.
- **Otros del bioquímico ago 2026, todos en rango:** proteínas 6.4, albúmina 3.0, globulinas 3.4, bilirrubina total 0.11, GGT 5.2, urea 57.5.
- **Otros del bioquímico oct 2026:** proteínas 6.6, albúmina 3.7, globulinas 2.9, GGT 4.9, urea 52.2 (en rango); bilirrubina total 0.3 (justo en el límite superior 0.1–0.3, marcada ✱ por el lab).

### Tiroides y electrolitos

**Últimos exámenes tiroideos:** archivo 42 (30 may 2026, T4/TSH/electrolitos) y archivos **43 (5 ago 2026, T4/TSH dentro del bioquímico)** y **44 (7 ago 2026, eco cervical de tiroides)**, estos dos pedidos por la endocrinóloga tras la interconsulta.

- **T4 total** (µg/dL): Ene24=2.98, Jun25=3.18, Ene26=3.69, May26=3.97, **Ago26=2.77**. Venía en **alza sostenida** (2.98→3.97) y en agosto **bajó a 2.77, de vuelta dentro de rango**. Un solo control no confirma una reversión definitiva, pero corta la tendencia que se venía observando. **Ojo con el rango:** el laboratorio bajó el límite superior de **3,8** (informes 2024–2025) a **3,5** (informes 2026, "pacientes sin terapia"). Bajo el criterio nuevo, Ene26 (3.69) y May26 (3.97) figuraban altos; Ago26 (2.77) está en rango con cualquiera de los dos criterios. La línea de referencia del gráfico es 3,5.
- **TSH** (ng/mL): Ene24=0.22, Jun25=0.3, Ene26=0.3, May26=0.18, **Ago26=0.23** — siempre normal. El límite superior cambió 0,5→0,6 y la unidad aparece como "ng/dL" en informes viejos y "ng/mL" en los nuevos (probable errata del laboratorio; valores comparables).
- **Eco cervical de tiroides (7 ago 2026, archivo 44 — Dra. Lina Pardo):** primer estudio tiroideo de imagen. Lóbulo derecho 12.0 × 3.6 × 3.6 mm (vol 0.081 cc); lóbulo izquierdo 13.6 × 2.7 × 4.0 mm (vol 0.076 cc); **volumen tiroideo total 0.157 cc** (referencia 1–7 kg: 0.05–0.15 cc → volumen conservado según el informe). Hallazgo: **leve hiperecogenicidad y márgenes algo menos definidos en el lóbulo derecho**, sin lesiones focales ni aumento significativo de tamaño → cambios inespecíficos / tiroiditis leve. Recomienda control ecográfico según criterio clínico. En el dashboard va como **nota en la pestaña Tiroides** + hito en la línea de tiempo + archivo (decisión de Camilo: no se creó tarjeta aparte en la pestaña Imágenes).
- **Sodio** (140–150): Nov23=145.5, May24=143.5/147.1, Jun24=144.4, Ago24=148.2, Dic24=150.2, Jun25=148.8, Ene26=151.1, May26=150.7. *(El bioquímico de ago 2026 no incluyó electrolitos Na/K/Cl.)*
- **Potasio** (3.5–5.5): Nov23=4.9, May24=3.8/5.3, Jun24=4.8, Ago24=4.8, Dic24=5.2, Jun25=5.4, Ene26=5.8, May26=5.6. *(Sin electrolitos en ago 2026.)*
- **Cloro** (107–113): Nov23=108.9, May24=115.4/115.9, Jun24=118, Ago24=116.8, Dic24=115.4, Jun25=113.9, Ene26=115.5, May26=114.0 — **crónicamente en el límite alto desde may 2024**. *(Sin electrolitos en ago 2026.)*

### Diagnósticos e imágenes

- **Diagnósticos IRIS:** May24 AKI II → Jul24-Ene25 CKD etapa 2 → Jun25 CKD etapa 1 → Feb26 IRIS 1-2
- **Urocultivos:** negativos May/Jun/Jul24; E. coli >100k UFC/mL en Ago/Sep/Nov25 (sensibilidad reducida a Amoxi-Clav y Cefadroxilo en Nov)
- **Eco:** masa renal + esplenomegalia (May24) → ERC crónica con nefrolitos/pielectasia + hepatopatía vacuolar + barro biliar (Jun25, Ene26). Rx May26 sin cambios. **Eco cervical/tiroidea Ago26:** tiroides de volumen conservado con tiroiditis leve/cambios inespecíficos (ver arriba).
- **Ecocardiograma Feb26 (ACVIM B1):** LA/Ao 1.49, LVIDd 19.6 mm, LVIDs 12.3 mm, EF(Teich) 70.2%, FS 37.1%, E/A 1.47, PAS 130 mmHg. Sin progresión.

## Conclusiones clave

- 🟢 **Riñones:** recuperación notable de crisis aguda a ERC estable temprana; creatinina en rango (1.5 en oct 2026), sin proteinuria, normotenso. **Corazón:** B1 sin progresión, sin medicación. **Sangre:** sin anemia. **Tiroides:** la T4 volvió a rango en ago 2026 (2.77) con TSH normal.
- 🟡 **A vigilar:** SDMA de vuelta en el límite (14); PLI persistentemente activa; cálculos renales y barro biliar. **Tiroides:** la T4 había venido subiendo pero en ago 2026 bajó a 2.77 (en rango); TSH normal descarta hipotiroidismo; el eco cervical mostró tiroides de tamaño conservado con leve hiperecogenicidad del lóbulo derecho (tiroiditis leve) → seguir control según indique la endocrinóloga. **Nunca se ha medido T4 libre** (solo se recomienda cuando la T4 total sale alta). **Electrolitos:** Na/K/Cl en el límite alto (últimos datos de may 2026), compatible con deshidratación leve. **Fósforo** en el límite inferior (2.8 en ago, 2.9 en oct 2026). **Calcio** volvió a rango en oct 2026 (9.3); **glucosa** levemente baja (61, muestra sin fluoruro).
- 🔴 **Conversar con veterinaria:** hígado — la ALT venía en ascenso (311 → 388) y en oct 2026 **bajó a 252**, con FA (183) y AST (46.5) también a la baja, en el control tras 1 mes de Hepatocan Forte; aun así sigue ~3× sobre el límite y la eco muestra cambios hepáticos grasos (se mantiene en 🔴 por decisión de Camilo); ITU recurrente por E. coli con sensibilidad antibiótica decreciente.

**Sobre tiroides (contexto para el equipo tratante):** no hay hipotiroidismo (sería T4 baja + TSH alta; Teodoro tiene lo contrario). El hipertiroidismo verdadero es muy raro en perros y poco probable sin signos clínicos. La deshidratación leve encaja con el patrón de electrolitos. El eco de ago 2026 no mostró nódulos ni aumento de tamaño relevante. Todo esto es contexto, no recomendación clínica.

---

## Pestaña Archivos (visor de exámenes)

Permite ver cada uno de los 45 exámenes dentro del dashboard, sin descargar, y descargar un PDF por examen. Carga diferida total: ninguna imagen se baja hasta que se abre el examen.

### Formato real de los archivos fuente — DOS TIPOS

**IMPORTANTE:** no todos los `.pdf` son iguales. Hay que revisar los *magic bytes* de cada archivo nuevo antes de procesarlo (`head -c8 archivo | od -An -tx1` o `file archivo`).

1. **ZIP con extensión `.pdf`** (los 40 archivos originales, del 1 al 42 salvo los `.jpg`): firma `PK\x03\x04`, creados por una app de escaneo de iPhone. Cada uno contiene imágenes JPEG por página (`1.jpeg`, …) a **952×1260 px**, texto OCR por página (`1.txt`, …, no se usa) y `manifest.json`. Para **leer valores**: `unzip -o -q` y luego `cat *.txt > _all.txt` (NO usar `pdftotext`/`pdfinfo`, fallan en silencio). Para **imágenes**: extraer los JPEG internos.
2. **PDF real** (`%PDF-`): a partir de los archivos **43 y 44** (agosto 2026) y **45** (octubre 2026), VetLab y la ecografista entregan PDFs de verdad. Aquí `pdftotext -layout` y `pdfinfo` **sí funcionan** para leer valores. Para **imágenes** no hay JPEG internos: hay que **rasterizar** las páginas con `pdftoppm -r 200 -png` y luego convertir a WebP.

Los 2 archivos `.jpg` (radiografías 39 y 40) son imágenes JPEG reales.

Los ZIP abren bien en Windows/Edge y Google Drive por tolerancia de esos visores, pero **no en Safari iOS de forma fiable** — por eso la descarga del dashboard genera un PDF real, no entrega el ZIP.

### Procesamiento de imágenes

- **Desde ZIP:** se extraen los JPEG internos (ordenados por `(len(nombre), nombre)`).
- **Desde PDF real:** se rasteriza cada página con `pdftoppm -r 200 -png`.
- En ambos casos se redimensiona a **máx. 1400 px** en el lado mayor con LANCZOS, **solo si supera ese tamaño** (nunca se agranda — agrandar no añade información). Los archivos 43/44/45 (carta a 200 DPI ≈ 1700×2200) quedaron en **1082×1400**.
- Se guardan como **WebP calidad 88, method=6**.
- Total actual: **184 imágenes** (179 originales + 4 de 43/44 + 1 de 45). WebP q88 resultó 20% más liviano que el JPEG q78 inicial y con mejor calidad; WebP es más eficiente que JPEG, no es un intercambio calidad/peso.
- Compatibilidad WebP: universal en móviles y navegadores modernos (Chrome Android, Safari iOS 14+, Firefox, Edge).
- **Ubicación y nombres:** carpeta `/archivos/` en la raíz del repo, patrón `{idx:02d}_{pagina:02d}.webp` (ej. `archivos/43_02.webp` = archivo 43, página 2). `idx` = número de prefijo del archivo fuente; página 1-indexada.

### Categorización (basada en CONTENIDO, no en el nombre)

El nombre del archivo no es confiable (acentos, siglas incompletas). La categoría se decide leyendo el contenido, con texto normalizado (minúsculas, sin acentos, `_`→espacio). Categorías, icono y color:

- **sangre** 🩸 `#f87171` — tiene hemograma / perfil bioquímico / SDMA / PLI / fructosamina / TLI / TSH / T4 / electrolitos.
- **orina** 💧 `#fbbf24` — solo urianálisis/urocultivo. Si es únicamente urocultivo: título "Urocultivo", icono 🧫 `#fcd34d`.
- **renal** 🫘 `#2dd4bf` — nombre contiene "informe renal".
- **eco** 📡 `#60a5fa` — ecografía / informe ecográfico (abdominal o cervical/tiroideo).
- **rx** 🩻 `#fb923c` — radiografía / informe radiográfico.
- **cardio** ❤️ `#a78bfa` — ECG / ecocardiograma / evaluación cardiológica / "cardiac".
- **resumen** 📋 `#9aa0aa` — tablas resumen (archivo 19).

> Bug histórico corregido: la detección sin normalizar acentos mandaba "Ecográfico"/"Radiográfico" a la categoría sangre por defecto. Siempre normalizar acentos.

### Detección de exámenes — REGLA CRÍTICA: resultados reales, no recomendaciones

Solo los archivos **sangre** y **orina** listan exámenes; los informes (renal, eco, rx, cardio, resumen) llevan una descripción en frase, no lista de exámenes.

Un examen se lista **solo si tiene resultado medido**, no si el documento lo menciona como recomendación o pendiente. Antes de contar una coincidencia, se revisa una ventana de ~70 caracteres previa; si contiene palabras de recomendación (`recomien`, `sugier`, `idealmente`, `pendiente`, `aconseja`, `complementar`, `a futuro`, `proximo control`, `deberia`, `debera`), no cuenta.

Casos verificados que ilustran la regla:
- **T4 Libre nunca se midió** (ni en #42, #35 ni #43): aparece solo en la frase boilerplate "se recomienda medir T4 Libre" que el laboratorio agrega cuando la T4 Total sale elevada. NO se lista.
- **Informes renales (#11, 17, 20, 22, 28):** son interpretativos, sin resultados propios. Solo mencionan el panel como recomendación. NO se les lista exámenes; descripción = "Informe renal de seguimiento".
- **Urocultivo:** se lista solo si dice "urocultivo c/antibiograma" o "urocultivo en proceso". Si dice "urocultivo no solicitado" (ej. #10), NO se lista.
- **Glucosa y colesterol:** van dentro del perfil bioquímico, no se listan sueltos.
- **Perfil lipídico:** solo existe de verdad en #35 (tiene el encabezado + triglicéridos + HDL/LDL). En el resto, "colesterol" es parte del bioquímico.
- **Archivo 43:** trae Perfil Bioquímico (incluye glucosa, colesterol, calcio, fósforo, enzimas hepáticas, renales, urea) + T4 Total + TSH. **No** trae hemograma, ni SDMA, ni electrolitos Na/K/Cl → codes = "Perfil Bioquímico · TSH · T4 Total".
- **Archivo 45:** solo Perfil Bioquímico (sin T4/TSH, sin hemograma, sin SDMA/PLI, sin electrolitos) → codes = "Perfil Bioquímico".

Siglas resueltas: **PLI** = Lipasa Pancreática Inmunoreactiva · **TLI** = TLI canino (inmunorreactividad tipo tripsina, examen digestivo, NO es T4 libre) · **UPC** = relación proteína/creatinina urinaria.

### Convenciones de nombres mostrados

- **Nombres de examen en Title Case** (cada palabra con mayúscula): Hemograma, Perfil Bioquímico, Perfil Lipídico, Electrolitos, T4 Total, T4 Libre, TLI Canino, Fructosamina, Urianálisis, Urocultivo, Parvovirus.
- **Siglas en mayúscula:** SDMA, PLI, TSH, UPC. PLI va solo (sin paréntesis explicativo). UPC = "UPC (Proteína/Creatinina Urinaria)".
- **Descripciones en frase (informes), solo mayúscula inicial:** "Informe renal de seguimiento", "Descripción y conclusiones", "Estudio de imágenes", "Lectura radiográfica", "Eco-Doppler cardíaco", "Trazado y lectura", "Evaluación clínica", "Informe del estudio", "Urocultivo con antibiograma", "Tablas resumen · May–Ago 2024".
- **Eco cervical/tiroidea:** título "Informe ecográfico cervical (tiroides)", descripción "Descripción y conclusiones" (archivo 44).
- **Radiografías 2 vistas (identificadas por la imagen):** #39 = "Vista lateral", #40 = "Vista ventrodorsal (VD)".

### El visor (lightbox) y la descarga

- Lista ordenada del **más reciente al más antiguo**, agrupada por año, con filtros por categoría (chips). Al tocar un examen abre el visor a pantalla completa.
- **Navegación páginas:** flechas ‹ ›, teclado (←/→/Esc) en web, swipe horizontal en móvil. Precarga la página siguiente.
- **Zoom:** rueda del mouse en web (1×–5× progresivo), pellizco de dos dedos en móvil. Arrastre para mover cuando hay zoom. **Doble toque restaura a tamaño original.**
- **Descarga PDF (botón ↓ en el header del visor):** genera un PDF real con todas las páginas en A4, usando jsPDF cargado desde CDN **solo al pedir la descarga**. Nombre del archivo = `{catLabel}_{fecha}.pdf`. El PDF conserva la calidad visual del visor; lo único que no incluye es el texto OCR (irrelevante).
- **Relación con el swipe de pestañas:** mientras el visor está abierto, el swipe entre pestañas queda desactivado (`lbOpen()`), de modo que el swipe horizontal solo cambia de página dentro del examen y nunca de pestaña por detrás.

### Mapa validado de los 45 archivos (verdad de referencia)

| # | Fecha | Categoría | Título | Contenido / descripción |
|---|---|---|---|---|
| 1 | 31 ago 2022 | cardio | Electrocardiograma (ECG) | Trazado y lectura |
| 2 | 31 ago 2022 | cardio | Evaluación cardiológica | Evaluación clínica |
| 3 | 8 nov 2023 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · Parvovirus |
| 4 | 2 ene 2024 | eco | Ecografía abdominal | Estudio de imágenes |
| 5 | 3 ene 2024 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · TLI Canino · TSH · T4 Total |
| 6 | 7 feb 2024 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico |
| 7 | 14 may 2024 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI |
| 8 | 18 may 2024 | orina | Orina | Urianálisis · Urocultivo |
| 9 | 18 may 2024 | eco | Ecografía abdominal | Estudio de imágenes |
| 10 | 24 may 2024 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · Urianálisis |
| 11 | 27 may 2024 | renal | Informe renal | Informe renal de seguimiento |
| 12 | 3 jun 2024 | sangre | Sangre / Bioquímica | Electrolitos · PLI · TLI Canino · Fructosamina · Urianálisis · Urocultivo |
| 13 | 3 jun 2024 | rx | Radiografías laterales | Imágenes radiográficas |
| 14 | 10 jul 2024 | eco | Informe ecográfico abdominal | Descripción y conclusiones |
| 15 | 11 jul 2024 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · SDMA · PLI · TLI Canino |
| 16 | 11 jul 2024 | orina | Orina | Urianálisis · Urocultivo |
| 17 | 19 jul 2024 | renal | Informe renal | Informe renal de seguimiento |
| 18 | 30 ago 2024 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · TLI Canino · Urianálisis · Urocultivo |
| 19 | May–Ago 2024 | resumen | Resumen de exámenes | Tablas resumen · May–Ago 2024 |
| 20 | 9 sep 2024 | renal | Informe renal | Informe renal de seguimiento |
| 21 | 28 dic 2024 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · TLI Canino · Urianálisis · Urocultivo |
| 22 | 7 ene 2025 | renal | Informe renal | Informe renal de seguimiento |
| 23 | 5 jun 2025 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · TSH · T4 Total · Urianálisis · Urocultivo |
| 24 | 5 jun 2025 | eco | Informe ecográfico abdominal | Descripción y conclusiones |
| 25 | 5 jun 2025 | eco | Ecografía abdominal | Estudio de imágenes |
| 26 | 15 may 2025 | cardio | Electrocardiograma (ECG) | Trazado y lectura |
| 27 | 15 may 2025 | cardio | Ecocardiografía | Eco-Doppler cardíaco |
| 28 | 19 jun 2025 | renal | Informe renal | Informe renal de seguimiento |
| 29 | 29 ago 2025 | orina | Orina | Urianálisis · Urocultivo |
| 30 | 1 sep 2025 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · SDMA · PLI |
| 31 | 15 sep 2025 | orina (urocultivo) | Urocultivo | Urocultivo con antibiograma |
| 32 | 12 nov 2025 | orina (urocultivo) | Urocultivo | Urocultivo con antibiograma |
| 33 | 28 ene 2026 | eco | Informe ecográfico abdominal | Descripción y conclusiones |
| 34 | 28 ene 2026 | eco | Ecografía abdominal | Estudio de imágenes |
| 35 | 29 ene 2026 | sangre | Sangre / Bioquímica | Hemograma · Perfil Bioquímico · Perfil Lipídico · SDMA · Electrolitos · PLI · TSH · T4 Total · Urianálisis · Urocultivo |
| 36 | 11 feb 2026 | cardio | Ecocardiografía | Eco-Doppler cardíaco |
| 37 | 11 feb 2026 | cardio | Informe cardiológico | Informe del estudio |
| 38 | 11 feb 2026 | cardio | Electrocardiograma (ECG) | Trazado y lectura |
| 39 | 22 may 2026 | rx | Radiografía abdominal | Vista lateral |
| 40 | 22 may 2026 | rx | Radiografía abdominal | Vista ventrodorsal (VD) |
| 41 | 22 may 2026 | rx | Informe radiográfico | Lectura radiográfica |
| 42 | 30 may 2026 | sangre | Sangre / Bioquímica | Electrolitos · TSH · T4 Total |
| 43 | 5 ago 2026 | sangre | Sangre / Bioquímica | Perfil Bioquímico · TSH · T4 Total |
| 44 | 7 ago 2026 | eco | Informe ecográfico cervical (tiroides) | Descripción y conclusiones |
| 45 | 2 oct 2026 | sangre | Sangre / Bioquímica | Perfil Bioquímico |

### Implementación en el código (referencia técnica)

- Datos de archivos: array `ITEMS` en JS (dentro de un IIFE), cada ítem `{id, cat, catLabel, icon, color, dateLabel, codes, pages, embedded:true, images:[...]}` con rutas `archivos/XX_XX.webp`. Es JSON válido (claves con comillas dobles) → se puede validar con `json.loads` sobre el array. Orden: más reciente arriba (por eso 45 va antes que 44, y 44 antes que 43).
- Funciones globales expuestas para los `onclick`: `afOpenLb(idx)`, `afCloseLb()`, `afPage(d)`, `afDownload()`, `afSetFilter(f)`. Internas: `rFilters`, `rList`, `showPage`, `resetZoom`, `applyT`, `loadJsPDF`, `imgData`.
- IDs HTML: `af-filters`, `af-list`, `lb`, `lbico`, `lbtitle`, `lbsub`, `lbstg`, `lbimg`, `lbpv`, `lbnx`, `lbcnt`, `lbhnt`, `lbdl`, `lbx`. El visor (`#lb`) es `position:fixed` con `inset:0` y respeta `safe-area-inset` (notch iPhone). `.lbstg` usa `touch-action:none` para controlar los gestos por JS.
- jsPDF: `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`, se inyecta solo al primer uso.

### Navegación por gestos — referencia técnica (swipe entre pestañas)

- **Estado:** `var curTab` (índice de la pestaña activa, inicia en 0). `sw(i, animate)` lo actualiza en cada cambio.
- **`sw(i, animate)`:** calcula `dir` (1 avanza / -1 retrocede / 0 igual), fija `curTab`, alterna `.tab.active` y `.panel.active`, y **solo si** `dir!==0 && animate && isMobile()` aplica al panel entrante la clase `sl-r` (dir>0) o `sl-l` (dir<0) — con un reflow (`void act.offsetWidth`) entre quitar y poner la clase para reiniciar la animación. Luego llama a `centerTab(i)` y `scrollTo(0,0)`. Los `onclick="sw(i)"` de los botones no pasan `animate`, así que el tap no dispara el slide (solo el swipe lo hace, con `sw(curTab±1, true)`).
- **`isMobile()`:** `window.matchMedia('(max-width:768px)').matches`.
- **`centerTab(i)`:** desplaza `#tabs` (`scrollTo({left, behavior:'smooth'})`, con fallback `scrollLeft`) para centrar la pestaña activa.
- **Handler de swipe (IIFE sobre `.wrap`):** `touchstart` (passive) guarda `SX/SY/ST` solo si `!lbOpen() && touches.length===1 && !ignoreZone(target)`. `touchend` (passive) calcula `dx/dy/dt` y dispara si `|dx|≥60 && |dx|>1.5·|dy| && dt≤700`: `dx<0 && curTab<n-1 → sw(curTab+1,true)`; `dx>0 && curTab>0 → sw(curTab-1,true)`.
- **`lbOpen()`:** `#lb` tiene la clase `open`. **`ignoreZone(el)`:** recorre hacia arriba hasta `.wrap` y devuelve true si encuentra `tagName==='HEADER'`, `.tabs` o `.af-filters`.
- **CSS:** `@keyframes slInR{from{opacity:0;transform:translateX(22px)}...}` y `slInL` (espejo, -22px); `.panel.sl-r/.sl-l{animation:… .24s cubic-bezier(.22,.61,.36,1)}`; `@media(prefers-reduced-motion:reduce){…animation:none}`; `body{…;overflow-x:hidden}`.

---

## Auditoría de datos

Se reverificó **cada punto graficado** contra los PDF fuente, indicador por indicador. Resultado: **todas las series correctas**. Hallazgos históricos:

- **Corregido (auditoría jun 2026):** faltaba la creatinina de Ene26 (1.4 mg/dL, archivo 35); se agregó al gráfico y se actualizó la tarjeta.
- **Verificado (correcto pese a apariencia):** el PAS "Jun25=141" parecía error porque el archivo se llama `28_19_6_2024`, pero su fecha interna es **19/26-06-2025** y menciona eventos de mayo 2025. El valor y la etiqueta están bien; **el nombre del archivo es el equivocado** (pendiente renombrar a 2025).
- **Errata de origen (no afecta el dashboard):** el informe cardíaco en inglés (archivo 37) trae mal la fecha de nacimiento (16/11/2011) y el género ("Desconocido"). Son errores del PDF del laboratorio.
- **Ago 2026 (archivos 43/44):** los 17 valores del bioquímico + T4 + TSH se extrajeron con `pdftotext -layout` y se contrastaron dos veces contra el render de la imagen. La edad que muestra el PDF del lab (5A9M0D) no coincide con la fecha de nacimiento real (22 ago 2020, que daría 5A11M) — es un error del registro del laboratorio, no afecta al dashboard (la edad se calcula desde la fecha real).
- **Corregido (oct 2026):** al gráfico de NUS le faltaba el segundo punto de mayo 2024 (**24 may 2024 = 22.8 mg/dL**, archivo #10, confirmado en texto e imagen). Las demás series de mayo 2024 sí tenían ambos puntos (14 may #7 y 24 may #10). Se detectó al validar el script corregido contra todo el histórico: los otros 169 valores asignados a series coincidieron con el dashboard. Se agregó el punto.
- **Oct 2026 (archivo 45):** primera actualización con el protocolo de doble canal completo. Canal 1 (texto) y canal 2 (lectura visual independiente a 200 DPI) coincidieron en **15/15** valores, unidades, rangos y marcas ✱; round-trip sobre el index.html final OK. **Errata de origen:** el encabezado dice paciente "TEODMO" y edad "00A0M0D" (en el #43 decía TEODORO / 5A9M0D); **Camilo confirmó que la muestra es de Teodoro**. No afecta al dashboard.

## Notas de mantenimiento

- **Datos de indicadores editables** en llamadas `mk(id, labels, data, color, ref)` al final de index.html; textos en secciones `class="explain"`; tarjetas en bloques `class="mc"`.
- **Pestañas:** los botones usan `onclick="sw(i)"` (la firma real es `sw(i, animate)`; el tap omite `animate`) y deben ir en el mismo orden que los `div.panel` (índices 0–8, hoy 9 pestañas). La pestaña Archivos es la 8 (índice), botón `sw(8)`. Tras insertar/quitar pestañas hay que renumerar; el swipe sigue funcionando solo (usa `curTab` y `document.querySelectorAll('.panel').length`).
- **Avatar:** imagen incrustada como data URI base64 en el `div.avatar` del header. Favicon aún con huella 🐾.
- **Edad dinámica:** función JS que calcula años/meses desde el 22 ago 2020 e inyecta en `<span id="edad">`.
- **Extracción de PDF (para valores):** revisar primero los magic bytes. Si es ZIP (`PK`), `unzip -o -q` + `cat *.txt > _all.txt`. Si es PDF real (`%PDF`), `pdftotext -layout`. Fechas con `grep -i "FECHA RECEPCION"`.
- **Git/deploy:** en `/tmp`, clonar, fijar `user.email` y `user.name` antes de commitear. Push por HTTPS con el token a `main` (token enmascarado en cualquier salida con `sed -E 's/github_pat_[A-Za-z0-9_]*/<token>/g; s/ghp_[A-Za-z0-9]*/<token>/g'`); Vercel despliega solo. Para procesar archivos se copian `index.html` + `/archivos/`, commit y push.
- **Edición de index.html:** cargar el archivo como string en Python y hacer `str_replace` con `assert` de unicidad por cada string objetivo antes de reemplazar; validar al final: `node --check` sobre el JS concatenado (o balance + `json.loads` del array `ITEMS` + chequeo de que cada `mk()` tenga `len(labels)==len(data)`).
- **Preview obligatorio:** mostrar a Camilo los cambios propuestos y obtener su visto bueno explícito **antes** de cada commit/push. Su revisión ha detectado errores reales y es el mejor control de calidad.
- **Documento canónico:** este `Análisis_exámenes_actualizado.md` es la fuente de verdad y se **regenera completo, de forma automática, al cierre de CADA actualización con exámenes nuevos, sin que Camilo lo pida** (mantener lo que no cambió, actualizar lo que evolucionó, agregar lo nuevo, eliminar lo que ya no aplica — ver paso 7 del Flujo). **Desde ago 2026 se mantiene sincronizado con `PROYECTO.md` del repo** (mismo contenido), y además se le entrega a Camilo la versión descargable para el Proyecto.
- **`procesar_examen.py` (corregido oct 2026):** antes descartaba en silencio todo parámetro no listado (con el #45 solo mostraba 9 de 15) y tenía mapeos erróneos: "creatinina en orina" iba a la serie de creatinina en sangre y HDL/LDL/VLDL a colesterol total. Ahora: (a) toda fila "valor · unidad · rango" entra a la tabla, marcada con su serie, `[nota]` o `[NO MAPEADO]`, más el conteo de filas para contrastar con el PDF; (b) mapea el resto del bioquímico (proteínas, albúmina, globulinas, GGT, urea, bilirrubina) y el hemograma (hematocrito → cHcto, hemoglobina → cHb, leucocitos → cLeuco); (c) el formato "sección + RESULTADO" reconoce SDMA, PLI, TLI, fructosamina y glucosa además de T4/TSH; (d) los avisos ℹ️ de no mapeados van en una sola línea por examen. Validado sobre los 21 exámenes de laboratorio: 0 regresiones y 169/169 valores de series iguales al dashboard. **Pendiente de vigilar:** la ruta ZIP no se pudo probar con archivos ZIP reales (las copias del Proyecto son PDF); revisar con el primer ZIP que llegue.
- **Pendiente opcional:** exportación a Excel de todas las series (no iniciada); buscador simple sobre la lista de archivos (acordado, no implementado); cambiar favicon por la foto; renombrar archivo 28 (2024→2025); resumen clínico hepático de una página para coordinación con especialista (ofrecido, no confirmado); tarjeta del eco tiroides en la pestaña Imágenes (no hecho por decisión de Camilo; se puede agregar si se quiere).
- **Token GitHub:** solo-repo, fine-grained (Contents: Read and write). **Quedó expuesto en varias conversaciones (incluidas las de ago y oct 2026); rotarlo cuanto antes**. En oct 2026 el acceso al repo se habilitó desde la propia sesión (add_repo), sin necesitar el token (revocar el actual y generar uno nuevo en GitHub → Settings → Developer settings → Personal access tokens).
- Todo es material de apoyo, **no reemplaza el criterio veterinario**.

## Flujo para agregar exámenes nuevos (próximos controles)

Cuando llegue un examen nuevo, Camilo lo sube a Claude para actualizar indicadores; en la **misma conversación** se actualiza también la pestaña Archivos. Pasos para el asistente:

1. Leer este documento para recuperar toda la lógica (categorización, detección por resultados reales, convenciones de nombres, naming de imágenes, navegación por gestos, dos formatos de PDF).
2. Consultar el repo vía API GitHub para ver qué hay en `/archivos/` y procesar **solo lo nuevo** (Claude no recuerda entre chats qué ya se subió).
3. Revisar magic bytes del archivo nuevo. Extraer imágenes: si es ZIP, sacar los JPEG internos; si es PDF real, rasterizar con `pdftoppm -r 200 -png`. Convertir a WebP q88 (máx 1400 px, sin agrandar) → `archivos/{idx:02d}_{pagina:02d}.webp`.
4. Categorizar por contenido y detectar exámenes con la regla de resultados-no-recomendaciones. **Mostrar a Camilo cómo quedó categorizado y todos los valores antes del push** (su revisión es el mejor control de calidad).
5. Actualizar el array `ITEMS` (insertar respetando el orden por fecha, más reciente arriba), las series `mk()` que correspondan, y los textos/tarjetas/línea de tiempo. Actualizar el conteo de exámenes en la prosa.
6. Commit + push a `main`. Vercel despliega.
7. **PASO OBLIGATORIO DE CIERRE — SIEMPRE Y SIN QUE CAMILO LO PIDA.** Cada vez que haya una actualización de expediente con exámenes nuevos, al final de todo se regenera el documento canónico. La instrucción exacta es: *"Basándote en el `Análisis_exámenes_actualizado.md` del Proyecto y en todo lo trabajado en esta conversación, genera un nuevo `Análisis_exámenes_actualizado.md` completo que lo reemplace. Mantén lo que no cambió, actualiza lo que evolucionó, agrega lo nuevo y elimina lo que ya no aplica."* Luego se entrega como archivo descargable para el Proyecto y se sincroniza `PROYECTO.md` del repo con el mismo contenido. Esto es parte del flujo, no un extra opcional ni algo que Camilo deba solicitar.

## Historial de cambios

**Sesión oct 2026 (continuación) — Script, tarjeta de creatinina y corrección del NUS:**
1. `procesar_examen.py` corregido (ver Notas de mantenimiento): ya no omite parámetros, corrige los mapeos erróneos (creatinina en orina, HDL/LDL/VLDL), suma el hemograma y SDMA/PLI en formato RESULTADO, y agrupa avisos ℹ️.
2. Tarjeta de tendencia de creatinina (pestaña Evolución): `4.0 → 1.0` → `4.0 → 1.5 (oct 26)`.
3. **Corrección de datos aprobada por Camilo:** gráfico de NUS con el punto faltante del 24 may 2024 (22.8 mg/dL, archivo #10). Round-trip OK.
4. Validación: `node --check` OK, `ITEMS` 45, todas las `mk()` balanceadas. Este `.md` y `PROYECTO.md` actualizados.

**Sesión oct 2026 — Examen 45 (control hepático post-Hepatocan Forte):**
1. Archivo **45** (2 oct 2026, VetLab): Perfil Bioquímico S/F, **PDF real**, 1 página → `archivos/45_01.webp`. Control tras 1 mes de Hepatocan Forte indicado por endocrinología.
2. Verificación: canal 1 + canal 2 coinciden 15/15; sin alertas del script; round-trip OK. Errata del lab en el encabezado ("TEODMO", edad 00A0M0D) — Camilo confirmó que es Teodoro.
3. Series con nuevo punto Oct 26: Creatinina (1.5), NUS (24.4), Fósforo (2.9), ALT (252), FA (183), AST (46.5), Colesterol (262). SDMA, PLI, hemograma, T4/TSH, electrolitos y UPC sin cambios (no medidos).
4. **Cambio de tendencia hepática:** ALT 388 → 252 (primer descenso en más de un año), FA 273 → 183, AST 61.7 → 46.5. Tarjeta de tendencia ALT pasó de 🔴 "Empeorando" a 🟡 "Bajó, sigue alta"; conclusión hígado y 🔴 general reformulados (se mantiene en 🔴). Calcio vuelve a rango (9.3); glucosa 61 con tubo sin fluoruro.
5. Textos: nuevo hito "Oct 2026 · 6 a 1 m" en la línea de tiempo; fósforo agregado al 🟡; correcciones de texto desactualizado aprobadas (conclusión renal "creatinina 1.0" → "1.5 en octubre 2026"; definición de Fósforo "dentro de rango" → "bajó al límite inferior en 2026"). Conteo 44 → 45 exámenes (184 imágenes); nuevo ítem al tope de `ITEMS`.
6. Validación: `node --check` OK, `ITEMS` JSON de 45 elementos, todas las `mk()` balanceadas. Un commit a `main`; este `.md` regenerado y `PROYECTO.md` sincronizado.

**Sesión ago 2026 — Exámenes 43 y 44 (interconsulta endocrinología):**
1. Archivo **43** (5 ago 2026): perfil bioquímico + T4 Total + TSH. Archivo **44** (7 ago 2026): primera eco cervical/tiroidea. Ambos son **PDF reales** (no ZIP) → primer uso de rasterizado con `pdftoppm` + WebP.
2. Series con nuevo punto Ago 26: T4 (2.77), TSH (0.23), ALT (388), FA (273), AST (61.7), Colesterol (252), Creatinina (1.4), NUS (26.9), Fósforo (2.8). SDMA sin cambios (no medido).
3. **T4 volvió a rango:** la tarjeta pasó de 🟡 (3.97) a 🟢 (2.77); se reformuló la narrativa "alza sostenida" → "bajó a rango en agosto". Fósforo pasó a límite bajo.
4. Nota del **eco cervical/tiroideo** (volumen 0.157 cc, tiroiditis leve) en la pestaña Tiroides + hito en la línea de tiempo. Calcio (8.8) y glucosa (65) como nota, sin gráfico.
5. Conclusiones 🟡/🔴 y tarjetas de tendencia actualizadas (ALT "sube a 388", T4 "volvió a rango"). Conteo de archivos 42 → 44 (183 imágenes). Dos ítems nuevos en `ITEMS`.
6. Validación: `node --check` OK, `ITEMS` JSON de 44 elementos, todas las `mk()` balanceadas. Un commit a `main`; Vercel desplegando. Este `.md` regenerado y `PROYECTO.md` sincronizado.

**Sesión jun 2026 — Navegación por gestos en móvil:**
1. Swipe horizontal entre pestañas (solo móvil) además del tap.
2. Animación de deslizamiento (`slInR`/`slInL`, 0.24s, GPU, sin re-render de gráficos); respeta `prefers-reduced-motion`.
3. Auto-scroll que centra la pestaña activa (`centerTab`).
4. Protecciones: desactivado con lightbox abierto; ignora header/barra/chips; gesto claramente horizontal; solo móvil; `body overflow-x:hidden`.

**Sesión previa — Pestaña Archivos:**
1. Nueva pestaña Archivos (índice 8) con lista filtrable y visor lightbox.
2. Extracción de las páginas de los archivos; categorización por contenido; vistas de radiografía identificadas.
3. Imágenes a WebP q88, carga diferida; visor con paginación, swipe, zoom, y descarga de PDF por examen (jsPDF lazy).

**Sesión anterior — Tiroides/Electrolitos y auditoría:**
1. Pestaña Tiroides/Electrolitos (T4, TSH, Na, K, Cl) con el examen del 30 may 2026.
2. Evolución actualizada; auditoría completa de todas las series; corrección de creatinina Ene26 (1.4).
3. Avatar del header cambiado a foto de Teodoro; edad dinámica agregada.
