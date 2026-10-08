# Proyecto: Dashboard médico de Teodoro

**Paciente:** Teodoro Guerrero, Chihuahua macho, nacido **22 ago 2020**. Diagnósticos: ERC IRIS 1-2, ACVIM B1 (valvulopatía mitral leve), pancreatitis crónica. Tutor: Camilo Guerrero. Clínica: Nueva Madrid / laboratorio VetLab. Equipo tratante: veterinaria de cabecera (Loreto), nefrólogo (Dr. Eduardo Guzmán) y, desde ago 2026, endocrinología (interconsulta derivada por el nefrólogo por la T4 al alza). **Tratamiento hepático vigente:** Hepatocan Forte, indicado por endocrinología tras el control de ago 2026 y **comenzado el 1 sep 2026**, por 1 mes; el examen de oct 2026 (archivo 45) fue el control posterior a ese mes.

**Usuarios del sitio:** Camilo, tres especialistas de Teodoro y algunos familiares. Por eso cualquier cambio grande se revisa antes en un enlace de prueba y el enlace público no cambia nunca.

**Repo:** github.com/camwarrior/teodoro-examenes (rama `main`). **Deploy:** Vercel (`teodoro-examenes.vercel.app` redirige a **teo.camiloworks.com**), framework preset **Other**, root `./`, sitio estático HTML + Chart.js vía CDN, sin build. Diseñado para escritorio y móvil (iPhone). **Archivos fuente:** 45 exámenes (lab, ecografías abdominales y cervical/tiroidea, ecocardiogramas, ECG, radiografías), ago 2022 – oct 2026, más la carpeta `/archivos/` con 184 imágenes WebP que alimentan el visor.

**Respaldo del sitio anterior (pestañas, tema oscuro):** rama `respaldo-v1-clasico` (las etiquetas de git están bloqueadas desde las sesiones de Claude, por eso es una rama). Para volver atrás: restaurar `index.html` desde esa rama.

## Arquitectura (desde oct 2026)

Tres archivos con funciones separadas:

1. **`datos.js` — fuente única de datos.** Todas las series, los 45 archivos y todos los textos. La línea `window.DATOS =` va seguida de **JSON estricto** terminado en `;` (se valida quitando ese prefijo y pasando el texto por `json.loads`). Ningún valor se escribe en otro lugar.
2. **`index.html` — solo presentación.** Lee `datos.js` (vía `<script src="datos.js?v=VERSION">`) y arma todo con JavaScript. No contiene valores clínicos.
3. **`validar_datos.py` — chequeos automáticos** de `datos.js` antes de cada commit (ver más abajo).

`procesar_examen.py` (canal 1 de verificación) lee el histórico desde `datos.js`.

### Estructura de `datos.js`

- `version`: fecha ISO del examen más reciente (ej. `"2026-10-02"`). **Debe coincidir** con el `?v=` del `<script src="datos.js?v=...">` de `index.html`; así los navegadores de los especialistas no se quedan con datos viejos en caché. `validar_datos.py` lo exige.
- `series`: una entrada por indicador, clave en minúsculas (`alt`, `creatinina`, `glucosa`...). Cada una: `nombre`, `unidad`, `rango` `[min, max]` (`null` si no hay límite, ej. presión `[null, 140]`), `organo` (id del órgano donde se muestra), opcional `decimales` (para mostrar `114,0` o `0,30`), opcional `nota`, y `puntos`: lista en orden cronológico, **una línea por punto**: `{"fecha": "2026-10-02", "valor": 252, "archivo": 45}`. Campos extra por punto: `tubo` (obligatorio en glucosa: `"con fluoruro"` / `"sin fluoruro"`), `pad`/`pam` (presión diastólica/media), `nota`.
- `contenido`: `paciente`; `resumen` (titular y "Resumen general en palabras simples"); `organos` (lista de 8: `id`, `nombre`, `estado` `ok`/`watch`/`alert`, `nota` corta del resumen, `titular` de la ficha, `principal` (serie del mini gráfico), `series`, `definiciones`, `conclusion` {`titulo`, `nivel`, `parrafos`}, `bloques`); `bloques` (diagnósticos IRIS, urocultivos, métricas y estudios cardíacos, proteína en orina, GGT, tratamiento); `hitos` (líneas punteadas en los gráficos); `imagenes` (estudios, eco de tiroides, definiciones, conclusión); `linea_tiempo`; `tendencias`. Los textos pueden llevar `<strong>`. Se escriben con punto decimal: el sitio los muestra con coma.
- `archivos`: los 45 ítems del visor (antes array `ITEMS` en `index.html`), del más reciente al más antiguo: `{id, cat, catLabel, icon, color, dateLabel, codes, pages, embedded, images}`. `icon` y `color` se conservan por compatibilidad; el sitio nuevo usa su propia paleta por categoría.

**El estado de cada órgano lo decide Camilo**, no el código (ej. Hígado se mantiene en "Conversar" por decisión suya aunque la ALT bajó). El chip de cada valor (Normal / Alto / Bajo / En el límite) sí se calcula contra el `rango` de la serie; un valor exactamente igual a un límite se muestra "En el límite".

## Estructura del sitio (index.html)

Tema claro de ficha clínica (fondo `#F3F4F1`, tinta `#16191B`, azul de series `#1E4F8F`, verde de rango `#E2EDE5`; estados: estable `#1D7348`, vigilar `#8F5600`, conversar `#A8261E`). Tipografía Hanken Grotesk (Google Fonts) con números tabulares. Decimales con **coma** (es-CL); miles con punto (10.380).

**Rutas con enlace propio** (para mandar a un especialista directo a lo suyo): `#resumen` (inicio), `#rinones`, `#orina`, `#higado`, `#pancreas`, `#tiroides`, `#electrolitos`, `#corazon`, `#sangre`, `#linea-de-tiempo`, `#imagenes`, `#archivos`. Ej.: `teo.camiloworks.com/#higado`.

**Navegación:** en escritorio (≥980 px), barra lateral con Resumen, los 8 órganos (con su estado) y Historial (línea de tiempo, imágenes, archivos). En móvil, encabezado con avatar y barra inferior fija (Resumen, Línea de tiempo, Imágenes, Archivos); a las fichas se entra desde el Resumen.

1. **Resumen:** titular, conteo por estado, una fila por órgano (estado, nota corta, último valor del indicador principal, mini gráfico con el rango sombreado, fecha), "Último control" con botón al examen, y el "Resumen general en palabras simples" (Va bien / A vigilar / Conversar con la veterinaria). Órganos ordenados por estado (conversar, vigilar, estable).
2. **Ficha de órgano** (8): titular, estado, selector de período (Todo / Último año / Desde 2025), un gráfico por serie (eje de tiempo real, franja del rango normal, puntos coloreados por estado, hitos punteados, último valor con su chip). Al tocar o hacer clic en un punto aparece su fecha, valor y un botón "Ver examen N" que abre el visor; tocar fuera del gráfico, cambiar el período o elegir un punto de otro gráfico lo quita (solo hay uno a la vez). Luego los bloques del órgano, "Qué significa cada indicador" + conclusión, imágenes relacionadas, exámenes con esos valores y enlaces al órgano anterior/siguiente.
3. **Línea de tiempo:** tendencias clave y la línea de tiempo clínica (más reciente arriba).
4. **Imágenes:** ecografías, radiografías y eco de tiroides con botones a sus archivos; qué significa cada examen y conclusión.
5. **Archivos:** lista por año con filtros por tipo y el visor (ver sección dedicada).

**Orden de las listas:** todo lo que es un registro con fecha se muestra del más reciente al más antiguo: diagnósticos IRIS, urocultivos, ecocardiografías/ECG, imágenes relacionadas, ecografías del páncreas, exámenes de cada ficha, línea de tiempo, Imágenes y Archivos. En `datos.js` los bloques se guardan en orden cronológico y el sitio los ordena al mostrarlos (función `recientes()`), así que al agregar un registro nuevo basta con sumarlo al final. Los gráficos van de izquierda (antiguo) a derecha (reciente).

**Reparto por órgano:** Riñones (SDMA, creatinina, NUS, fósforo, calcio, diagnósticos IRIS) · Orina (UPC, proteínas en orina, urocultivos) · Hígado (ALT, FA, AST, colesterol, GGT, tratamiento) · Páncreas (PLI, glucosa, ecografías que describen el páncreas) · Tiroides (T4, TSH, eco cervical) · Electrolitos (sodio, potasio, cloro) · Corazón (presión sistólica, métricas ecocardiográficas, ecocardiografías y ECG) · Sangre (hematocrito, hemoglobina, leucocitos). Hitos: crisis renal (27 may 2024) en riñones, hígado, orina, páncreas, electrolitos y sangre; inicio de Hepatocan Forte (1 sep 2026, indicado tras el control del 5 ago 2026) en hígado.

**Gestos en móvil:** dentro de una ficha, deslizar el dedo horizontalmente pasa al órgano siguiente (izquierda) o anterior (derecha), en el orden del resumen, con animación de 0,24 s (respeta `prefers-reduced-motion`). Se ignora el gesto si nace sobre un gráfico, el selector de período, los filtros o la tarjeta del punto, si el visor está abierto, o si no es claramente horizontal (|Δx| ≥ 60 px, |Δx| > 1,5·|Δy|, < 700 ms). El visor conserva su propio swipe entre páginas y el pellizco.

**Edad dinámica** desde el 22 ago 2020 ("6 años 1 mes"). Avatar incrustado en base64. Favicon 🐾.

## Series de datos (en `datos.js`, cada punto con fecha exacta y archivo)

- **SDMA** (ref 1–14): Nov23=6, 14May24=33, 24May24=40, Jul24=20, Ago24=25, Dic24=24, Jun25=14, Sep25=11, Ene26=14. *(No se midió en ago ni oct 2026.)*
- **Creatinina** (0.6–2.0): Nov23=0.8, Ene24=0.6, Feb24=0.8, 14May24=4.0, 24May24=2.2, Jul24=2.0, Ago24=1.6, Dic24=1.5, Jun25=1.3, Sep25=1.0, Ene26=1.4, Ago26=1.4, **Oct26=1.5**
- **NUS** (8–29): 14May24=122, 24May24=22.8, resto en rango, Ene26=20.5, Ago26=26.9, Oct26=24.4
- **Fósforo** (2.9–5.3): picos 10.3/10.5 (Ene-Feb24), normal desde May24, Ene26=3.3, Ago26=2.8 (bajo), **Oct26=2.9 (en el límite inferior; el lab lo marca con ✱)**
- **Calcio** (9–11.5) — *graficado desde oct 2026, en Riñones*: Nov23=9 (✱ del lab, en el límite), Ene24=9.9, Feb24=9.0, 14May24=11.3, 24May24=10.8, Jul24=11.7 ↑, Ago24=10.5, Dic24=9.0, Jun25=11, Sep25=9.3, Ene26=8.4 ↓, Ago26=8.8 ↓, **Oct26=9.3**
- **PLI** (10–200, en Páncreas): Nov23=48, 14May24=221.7, 24May24=213.1, Jun24=270.3, Jul24=229, Ago24=273.6, Dic24=192.4, Jun25=311, Sep25=182.9, Ene26=197.4. *(No se midió en ago ni oct 2026.)*
- **Glucosa** (70–120) — *graficada desde oct 2026, en Páncreas*, cada punto con tipo de tubo. **Con fluoruro** (comparables): Nov23=91.5, Ene24=112.8, Feb24=91.3, May24=70.3, Ago24=94.1, Sep25=101.9, Ene26=83.6, **Ago26=65 ↓** (única con fluoruro bajo el rango). **Sin fluoruro** (artificialmente bajas, no comparables): Feb24=4, May24=34, Jul24=75, Dic24=27, Jun25=96, Oct26=61. El 7 feb 2024 (archivo 6) se midió con y sin fluoruro el mismo día (91.3 vs 4), lo que demuestra el artefacto.
- **Leucocitos** (6k–17k): rango normal, mínimo 4460 (Jul24), Ene26=10380. *(Sin hemograma en ago ni oct 2026.)*
- **Hematocrito** (40–60): pico 62 (Feb24), Ene26=45.1.
- **Hemoglobina** (13–20): Ene26=15.2.
- **ALT** (18–86): Nov23=438.9, Ene24=216.1, Feb24=116.9, 14May24=54, 24May24=542, Jul24=128, Ago24=298.6, Dic24=236.5, Jun25=175.7, Sep25=302, Ene26=311, Ago26=388, **Oct26=252 — primer descenso en más de un año (control tras 1 mes de Hepatocan Forte), aunque sigue ~3× sobre el límite**
- **FA** (12–121): pico 669 (Jul24), Sep25=594, Ene26=213, Ago26=273, **Oct26=183**
- **AST** (12–42): Ene26=66, Ago26=61.7, **Oct26=46.5**
- **Colesterol** (133–367): en rango, Ene26=323, Ago26=252, Oct26=262
- **UPC** (0.1–0.5): 18May24=1.55, 24May24=1.10, Jun24=0.63, Jul24=0.45, Ago24=0.42, Dic24=0.30, Jun25=0.58, Ago25=0.19, Ene26=0.12. *(No se midió orina en ago ni oct 2026.)*
- **Presión sistólica** (normotenso <140), con diastólica/media donde el informe las trae: Ago22=113/67/73, May24=143/68/95, Jul24=144/75/100, Sep24=136/71/94, Ene25=139/69/93, **15May25=154/96 (archivo 27, durante el ecocardiograma; el informe no indica método ni condiciones; agregado oct 2026 por decisión de Camilo)**, Jun25=141/69/94, Feb26=130/68/86. Informes renales: promedio de mediciones, método oscilométrico de alta definición. Las guías (ACVIM 2018, subetapa IRIS) clasifican por sistólica: <140 normotenso, 140–159 prehipertenso, 160–179 hipertenso, ≥180 severo.

**Valores no graficados (texto o tarjeta):** GGT Oct26=4.9 (2–10, tarjeta en Hígado); proteínas en orina Ene26=12.9 mg/dL (tarjeta en Orina). **Otros del bioquímico** (solo en este documento): ago 2026: proteínas 6.4, albúmina 3.0, globulinas 3.4, bilirrubina total 0.11, GGT 5.2, urea 57.5 (en rango); oct 2026: proteínas 6.6, albúmina 3.7, globulinas 2.9, GGT 4.9, urea 52.2 (en rango), bilirrubina total 0.3 (límite superior, ✱).

### Tiroides y electrolitos

**Últimos exámenes tiroideos:** archivo 42 (30 may 2026, T4/TSH/electrolitos) y archivos **43 (5 ago 2026, T4/TSH dentro del bioquímico)** y **44 (7 ago 2026, eco cervical de tiroides)**, estos dos pedidos por la endocrinóloga tras la interconsulta.

- **T4 total** (µg/dL): Ene24=2.98, Jun25=3.18, Ene26=3.69, May26=3.97, **Ago26=2.77**. Venía en alza (2.98→3.97) y en agosto **bajó a 2.77, de vuelta en rango**. **Ojo con el rango:** el laboratorio bajó el límite superior de **3,8** (informes 2024–2025) a **3,5** (informes 2026, "pacientes sin terapia"). La serie usa 3,5 (nota en `datos.js`). Pendiente opcional: guardar el rango de cada informe en cada punto.
- **TSH** (ng/mL): Ene24=0.22, Jun25=0.3, Ene26=0.3, May26=0.18, **Ago26=0.23** — siempre normal. El límite superior cambió 0,5→0,6; unidad "ng/dL" en informes viejos y "ng/mL" en nuevos (probable errata; comparables).
- **Eco cervical de tiroides (7 ago 2026, archivo 44 — Dra. Lina Pardo):** lóbulo derecho 12.0 × 3.6 × 3.6 mm (0.081 cc); izquierdo 13.6 × 2.7 × 4.0 mm (0.076 cc); **volumen total 0.157 cc** (ref 1–7 kg: 0.05–0.15 cc → conservado según el informe). **Leve hiperecogenicidad y márgenes algo menos definidos en el lóbulo derecho**, sin lesiones focales → cambios inespecíficos / tiroiditis leve. Va como tarjeta en la ficha de Tiroides y en Imágenes.
- **Sodio** (140–150): Nov23=145.5, 14May24=143.5, 24May24=147.1, Jun24=144.4, Ago24=148.2, Dic24=150.2, Jun25=148.8, Ene26=151.1, May26=150.7.
- **Potasio** (3.5–5.5): Nov23=4.9, 14May24=3.8, 24May24=5.3, Jun24=4.8, Ago24=4.8, Dic24=5.2, Jun25=5.4, Ene26=5.8, May26=5.6.
- **Cloro** (107–113): Nov23=108.9, 14May24=115.4, 24May24=115.9, Jun24=118, Ago24=116.8, Dic24=115.4, Jun25=113.9, Ene26=115.5, May26=114.0 — **crónicamente alto desde may 2024**. *(Sin electrolitos desde may 2026.)*

### Diagnósticos e imágenes

- **Diagnósticos IRIS:** May24 AKI II → Jul24-Ene25 CKD etapa 2 → Jun25 CKD etapa 1 → Feb26 IRIS 1-2 (tarjetas en Riñones, cada una con su informe).
- **Urocultivos:** negativos May/Jun/Jul24; E. coli >100k UFC/mL en Ago/Sep/Nov25 (sensibilidad reducida a Amoxi-Clav y Cefadroxilo en Nov).
- **Páncreas por imagen:** solo las ecografías de 2024 lo describen, todas normales: 2 ene 2024 (archivo 4, isoecoico, espesor normal), 18 may 2024 (archivo 9, rama derecha 5.29 mm) y 10 jul 2024 (archivo 14, rama derecha 5.63 mm), verificadas en texto e imagen. Las de jun 2025 (24/25) y ene 2026 (33/34) no lo mencionan. Bloque `pancreas_imagenes` en la ficha de Páncreas.
- **Eco:** masa renal + esplenomegalia (May24) → ERC crónica con nefrolitos/pielectasia + hepatopatía vacuolar + barro biliar (Jun25, Ene26). Rx May26 sin cambios. Eco cervical Ago26: tiroiditis leve.
- **Ecocardiograma Feb26 (ACVIM B1):** LA/Ao 1.49, LVIDd 19.6 mm, LVIDs 12.3 mm, EF 70.2%, FS 37.1%, E/A 1.47, PAS 130 mmHg. Sin progresión.

## Conclusiones clave (estados por órgano)

- 🟢 **Estable:** Riñones (creatinina 1.5 en oct 2026, sin proteinuria; SDMA en el límite y fósforo en el límite inferior se mencionan en la nota), Tiroides (T4 volvió a rango; seguimiento según endocrinología; la conclusión de la ficha queda en amarillo por la T4 libre nunca medida y el eco), Corazón (B1 sin progresión, sin medicación), Sangre (sin anemia).
- 🟡 **Vigilar:** Páncreas (PLI activa desde 2023; glucosa con fluoruro baja solo en ago 2026), Electrolitos (Na/K/Cl en el límite alto, cloro alto desde 2024, sin medir desde may 2026).
- 🔴 **Conversar:** Hígado (ALT bajó a 252 tras Hepatocan Forte pero sigue ~3× sobre el límite; FA 183 y AST 46.5 también bajaron; eco con cambios grasos — se mantiene en rojo por decisión de Camilo), Orina (ITU recurrente por E. coli en 2025 con sensibilidad decreciente; UPC normal).

**Sobre tiroides (contexto para el equipo tratante):** no hay hipotiroidismo (sería T4 baja + TSH alta). El hipertiroidismo verdadero es muy raro en perros. La deshidratación leve encaja con los electrolitos. **Nunca se ha medido T4 libre.** Todo esto es contexto, no recomendación clínica.

---

## Visor de archivos (sección Archivos)

Permite ver cada uno de los 45 exámenes sin descargar y descargar un PDF por examen. Carga diferida: ninguna imagen se baja hasta que se abre el examen. Además, cualquier botón "Ver examen N" de las fichas abre el mismo visor.

### Formato real de los archivos fuente — DOS TIPOS

Revisar los *magic bytes* de cada archivo nuevo (`head -c8 archivo | od -An -tx1` o `file archivo`).

1. **ZIP con extensión `.pdf`** (los originales del 1 al 42 salvo los `.jpg`): firma `PK\x03\x04`, app de escaneo de iPhone. Contienen JPEG por página (952×1260 px), texto OCR por página y `manifest.json`. Para valores: `unzip -o -q` + `cat *.txt > _all.txt` (NO `pdftotext`, falla en silencio). Para imágenes: los JPEG internos.
2. **PDF real** (`%PDF-`): archivos **43, 44 y 45** y las copias del Proyecto. `pdftotext -layout` funciona. Imágenes: rasterizar con `pdftoppm -r 200 -png` y convertir a WebP.

Los `.jpg` (radiografías 39 y 40) son JPEG reales. Los ZIP no abren bien en Safari iOS, por eso el visor genera un PDF real al descargar.

### Procesamiento de imágenes

WebP calidad 88, method=6, máx. 1400 px en el lado mayor con LANCZOS y **nunca se agranda**. Patrón `archivos/{idx:02d}_{pagina:02d}.webp`. Total: 184 imágenes. Los 43/44/45 (carta a 200 DPI) quedaron en 1082×1400.

### Categorización (por CONTENIDO, no por el nombre)

Texto normalizado (minúsculas, sin acentos, `_`→espacio). Categorías: **sangre** (hemograma / bioquímico / SDMA / PLI / fructosamina / TLI / TSH / T4 / electrolitos), **orina** (solo urianálisis/urocultivo; si es solo urocultivo, título "Urocultivo"), **renal** ("informe renal"), **eco** (ecografía o informe ecográfico), **rx** (radiografía), **cardio** (ECG / ecocardiograma / evaluación cardiológica / "cardiac"), **resumen** (tablas resumen, archivo 19). Colores en el sitio: sangre `#B3261E`, orina `#B26B00`, renal `#1D7348`, eco `#1E4F8F`, rx `#7A4E1D`, cardio `#6B3FA0`, resumen `#596067`.

> Bug histórico corregido: sin normalizar acentos, "Ecográfico"/"Radiográfico" caían en sangre. Siempre normalizar.

### Detección de exámenes — REGLA CRÍTICA: resultados reales, no recomendaciones

Solo **sangre** y **orina** listan exámenes; los informes llevan una descripción en frase. Un examen se lista **solo si tiene resultado medido**: se revisa una ventana de ~70 caracteres previa y, si contiene `recomien`, `sugier`, `idealmente`, `pendiente`, `aconseja`, `complementar`, `a futuro`, `proximo control`, `deberia`, `debera`, no cuenta.

Casos verificados: **T4 Libre nunca se midió** (solo aparece como recomendación del lab). Informes renales (#11, 17, 20, 22, 28) sin exámenes propios → "Informe renal de seguimiento". Urocultivo solo si dice "urocultivo c/antibiograma" o "en proceso" (en #10 dice "no solicitado"). Glucosa y colesterol van dentro del bioquímico. Perfil lipídico solo existe en #35. **#43:** Perfil Bioquímico · TSH · T4 Total. **#45:** Perfil Bioquímico.

Siglas: **PLI** = lipasa pancreática inmunorreactiva · **TLI** = TLI canino (digestivo, NO es T4 libre) · **UPC** = relación proteína/creatinina urinaria.

### Convenciones de nombres mostrados

Exámenes en Title Case (Hemograma, Perfil Bioquímico, T4 Total, Urianálisis...); siglas en mayúscula (SDMA, PLI, TSH, UPC). Descripciones de informes en frase ("Informe renal de seguimiento", "Descripción y conclusiones", "Estudio de imágenes", "Lectura radiográfica", "Eco-Doppler cardíaco", "Trazado y lectura", "Evaluación clínica", "Informe del estudio", "Urocultivo con antibiograma", "Tablas resumen · May–Ago 2024"). Eco cervical: "Informe ecográfico cervical (tiroides)". Radiografías #39 "Vista lateral", #40 "Vista ventrodorsal (VD)". En el sitio, los `codes` se muestran separados por comas.

### Visor y descarga

Lista del más reciente al más antiguo, agrupada por año, con filtros (Todos, Sangre, Orina, Informe renal, Ecografía, Radiografía, Cardiología, Resumen). Visor a pantalla completa (oscuro, para leer el documento): flechas, teclado (←/→/Esc), swipe en móvil, precarga de la página siguiente, zoom con rueda (1×–5×) y pellizco, arrastre con zoom, doble toque restaura. Descarga: PDF A4 con jsPDF 2.5.1 desde cdnjs, cargado solo al pedirlo; nombre `{catLabel}_{fecha}.pdf`. Funciones globales: `afOpenLb(idx)`, `afCloseLb()`, `afPage(d)`, `afDownload()`, `afSetFilter(f)`. IDs: `af-filters`, `af-list`, `lb`, `lbico`, `lbtitle`, `lbsub`, `lbstg`, `lbimg`, `lbpv`, `lbnx`, `lbcnt`, `lbhnt`, `lbdl`. Respeta `safe-area-inset` (notch).

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

(En `datos.js`, el ítem 19 tiene `dateLabel` "31 ago 2024" para ordenarlo; el contenido es May–Ago 2024.)

---

## Auditoría de datos

- **Corregido (jun 2026):** faltaba la creatinina de Ene26 (1.4, archivo 35).
- **Verificado:** el PAS "Jun25=141" es correcto; el archivo 28 tiene nombre 2024 pero fecha interna 19/26-06-2025 (pendiente renombrar).
- **Errata de origen:** el informe cardíaco en inglés (37) trae mal la fecha de nacimiento y el género.
- **Errata de origen (archivo 9):** la ecografía es del 18-05-2024 ("Fecha ecográfica", la que usa el dashboard), pero el pie de cada página dice "Fecha Informe: 20-04-2024". Camilo confirmó que el pie es incorrecto. No afecta al dashboard.
- **Ago 2026 (43/44):** 17 valores + T4 + TSH contrastados dos veces contra la imagen. Edad del lab (5A9M0D) errónea; no afecta.
- **Corregido (oct 2026):** al gráfico de NUS le faltaba el punto del 24 may 2024 (22.8, archivo 10).
- **Oct 2026 (45):** 15/15 valores coinciden entre canales; round-trip OK. Encabezado "TEODMO" / "00A0M0D" es errata del lab; Camilo confirmó que es Teodoro.
- **Migración a `datos.js` (oct 2026):** los 196 puntos de las 19 series se compararon automáticamente contra las series del `index.html` anterior: **0 diferencias** (valor, mes y año). 169 puntos se asignaron a su archivo por el texto del PDF (fecha de recepción = fecha del ítem en Archivos en todos); los 27 restantes (SDMA, PLI, UPC, presión) se asignaron a mano y un segundo chequeo encontró cada valor en la línea correcta de su PDF (27/27). Los 62 textos del sitio anterior están literal en `datos.js` (verificado).
- **Calcio y glucosa (oct 2026):** 13 + 14 valores, canal 1 (texto) = canal 2 (lectura visual) = **lectura a ciegas de un agente independiente** que solo vio las imágenes: 27/27. Round-trip OK. Aprobado por Camilo.
- **Presión 154/96 (15 may 2025, archivo 27, pág. 2):** confirmada en texto e imagen; agregada por decisión de Camilo.
- **`procesar_examen.py` contra `datos.js`:** los 197 valores que el script mapea a series en los exámenes de laboratorio están todos en `datos.js` con su archivo (0 faltantes).

## Notas de mantenimiento

- **Nunca editar valores en `index.html`:** todo dato vive en `datos.js`. Editar `datos.js` en Python cargando el archivo como texto y con `str_replace` + `assert` de unicidad (cada punto está en su propia línea, lo que facilita reemplazos únicos), o reescribiendo una sección con `json.dumps` sin tocar el resto.
- **Validación antes de cada commit:** `python3 validar_datos.py` (y `--nuevos nuevos.json` para el round-trip) + `node --check datos.js` + extraer el `<script>` de `index.html` y pasarlo por `node --check` si se tocó. `validar_datos.py` revisa: JSON válido; cada punto con fecha ISO, valor numérico y archivo existente cuya fecha coincide; orden cronológico; `tubo` en glucosa; imágenes existentes y conteo de páginas; órganos, series y bloques coherentes; **`version` = fecha del examen más reciente = `?v=` en `index.html`**; y avisa (ℹ️) si un texto menciona un decimal que no está en ninguna serie (posible errata).
- **`procesar_examen.py`** (canal 1): lee el histórico de `--datos ./datos.js` (en glucosa solo compara contra muestras con fluoruro), mapea calcio y glucosa (con `tubo`), e imprime además un **borrador de puntos para `datos.js`** (`{"fecha","valor","archivo"}` por serie). No edita nada. La ruta ZIP del script aún no se ha probado con un ZIP real: con el primero que llegue, comparar la tabla fila por fila contra la imagen, contar filas y avisar a Camilo si aparecen "NO MAPEADO" o valores raros; si pasa sin problemas, eliminar este aviso aquí y en el paso 3 del Flujo.
- **Git/deploy:** clonar, fijar `user.email`/`user.name`, push por HTTPS a `main` (token enmascarado: `sed -E 's/github_pat_[A-Za-z0-9_]*/<token>/g; s/ghp_[A-Za-z0-9]*/<token>/g'`); Vercel despliega solo. Desde oct 2026 el acceso al repo se habilita desde la sesión (add_repo) y no requiere token. **Cambios grandes de diseño** (no exámenes): en una rama aparte, revisión de Camilo en el enlace de prueba de Vercel y luego merge a `main`. **Exámenes nuevos:** push directo a `main`, como siempre.
- **Preview obligatorio:** mostrar a Camilo los cambios y obtener su visto bueno explícito **antes** de cada commit/push a `main`. Su revisión ha detectado errores reales.
- **Documento canónico:** este documento (`Análisis_exámenes_actualizado.md` en el Proyecto = `PROYECTO.md` en el repo) se regenera completo al cierre de **cada** actualización con exámenes nuevos, sin que Camilo lo pida.
- **Pendiente opcional:** exportación a Excel (ahora trivial desde `datos.js`); buscador en Archivos; favicon con la foto; renombrar archivo 28 (2024→2025); rango de referencia por punto (para T4/TSH); resumen clínico hepático de una página para el especialista (ofrecido, no confirmado).
- **Token GitHub:** si se vuelve a usar uno, fine-grained solo-repo (Contents: Read and write) y rotarlo tras cada uso. Los tokens anteriores quedaron expuestos en conversaciones: revocarlos.
- Todo es material de apoyo, **no reemplaza el criterio veterinario**.

## Flujo para agregar exámenes nuevos (próximos controles)

Camilo sube el examen y pide actualizar el expediente. Pasos para el asistente:

1. Leer este documento completo.
2. Ver qué hay en `/archivos/` (repo) y procesar **solo lo nuevo**.
3. Revisar magic bytes. Correr `python3 procesar_examen.py --archivos ./archivos --out ./archivos --datos ./datos.js <archivos_nuevos>`: genera las WebP, parsea valores (canal 1), corre chequeos contra el histórico y da borradores del ítem de archivos y de los puntos. ⚠️ Si el archivo es ZIP, ver el aviso de la ruta ZIP en Notas de mantenimiento.
4. **Verificación de dos canales:** canal 2 = lectura visual de las imágenes sin mirar el canal 1; reconciliar valor por valor; cualquier diferencia o alerta 🔴 detiene y se escala a Camilo; lo ilegible se marca "NO LEGIBLE — confirmar". Si Camilo lo pide, una tercera lectura a ciegas con un agente que solo vea las imágenes.
5. Categorizar por contenido y aplicar la regla resultados-no-recomendaciones. **Preview para Camilo:** tabla por indicador (parámetro · valor · unidad · rango · estado · página), reconciliación, alertas, categorización, puntos nuevos por serie, ítem de archivos, cambios de textos y si algún **estado de órgano** debería cambiar (lo decide Camilo). Esperar aprobación explícita.
6. Editar **`datos.js`**: agregar el ítem al inicio de `archivos`; agregar cada punto en su serie en orden cronológico (glucosa con `tubo`); actualizar `version` a la fecha del examen nuevo y el `?v=` en `index.html`; actualizar textos afectados en `contenido` (titulares, notas, conclusiones, línea de tiempo, tendencias, resumen general) y los estados que Camilo apruebe. Si aparece un indicador nuevo que deba graficarse: nueva serie con `organo` y agregarla a `series` del órgano.
7. Validar: `python3 validar_datos.py --nuevos nuevos.json` (round-trip de cada valor confirmado) + `node --check datos.js`. Corregir antes de push.
8. Commit + push a `main`. Vercel despliega.
9. **PASO OBLIGATORIO DE CIERRE — SIEMPRE Y SIN QUE CAMILO LO PIDA.** *"Basándote en el `Análisis_exámenes_actualizado.md` del Proyecto y en todo lo trabajado en esta conversación, genera un nuevo `Análisis_exámenes_actualizado.md` completo que lo reemplace. Mantén lo que no cambió, actualiza lo que evolucionó, agrega lo nuevo y elimina lo que ya no aplica."* Entregarlo descargable para el Proyecto y sincronizar `PROYECTO.md` del repo con el mismo contenido.

## Historial de cambios

**Sesión oct 2026 (ajustes tras publicar) — Orden y detalle del punto:** las tarjetas de diagnósticos IRIS, urocultivos y ecocardiografías/ECG pasan a mostrarse de la más reciente a la más antigua (revisadas además todas las demás listas); el examen sugerido al tocar un punto se borra al tocar fuera del gráfico, cambiar el período o elegir otro punto. Probado en escritorio y móvil.

**Sesión oct 2026 — Rediseño por órgano y datos en un solo archivo:**
1. Respaldo del sitio anterior en la rama `respaldo-v1-clasico`.
2. **Etapa 1:** `datos.js` con las 19 series (196 puntos, cada uno con fecha exacta y archivo) y los 45 archivos; 0 diferencias contra el sitio anterior. Presión 154/96 del 15 may 2025 (archivo 27) agregada, con diastólica/media en toda la serie.
3. **Etapa 2:** series nuevas de calcio (13) y glucosa (14, con tipo de tubo), verificadas 27/27 con texto, imagen y lectura a ciegas.
4. **Etapa 3:** sitio nuevo de tema claro (formato "estado por órgano"): resumen, 8 fichas con enlace propio, línea de tiempo, imágenes, archivos con el mismo visor. PLI pasa a Páncreas; calcio a Riñones; glucosa a Páncreas; presión a Corazón. Gráficos con eje de tiempo real, rango sombreado, hitos y detalle del punto con enlace al examen. Decimales con coma. Swipe entre órganos en móvil.
5. **Etapa 4:** `procesar_examen.py` lee `datos.js`; nuevo `validar_datos.py`; este documento e instrucciones del Proyecto actualizados.
6. Textos nuevos (revisados por Camilo en el enlace de prueba): titular del resumen, notas y titulares por órgano, definiciones de calcio y glucosa, tarjeta de tratamiento; las conclusiones de Sangre/Páncreas y Tiroides/Electrolitos se repartieron sin cambiar su redacción.

**Sesión oct 2026 (continuación) — Script, tarjeta de creatinina y corrección del NUS:** script corregido (no omite parámetros, mapeos arreglados, hemograma y SDMA/PLI); tarjeta de creatinina `4.0 → 1.5 (oct 26)`; punto faltante del NUS (24 may 2024 = 22.8).

**Sesión oct 2026 — Examen 45 (control hepático post-Hepatocan Forte):** perfil bioquímico del 2 oct 2026 (PDF real, 1 página); 15/15 valores verificados; ALT 388 → 252, FA 273 → 183, AST 61.7 → 46.5; calcio vuelve a rango (9.3); glucosa 61 sin fluoruro; 45 exámenes, 184 imágenes.

**Sesión ago 2026 — Exámenes 43 y 44 (interconsulta endocrinología):** bioquímico + T4/TSH (T4 vuelve a rango, 2.77) y primera eco cervical (tiroiditis leve); primeros PDF reales rasterizados.

**Sesión jun 2026 — Navegación por gestos en móvil** (swipe entre pestañas, reemplazado en oct 2026 por swipe entre órganos).

**Sesiones previas:** pestaña Archivos con visor y descarga PDF; pestaña Tiroides/Electrolitos; auditoría completa de series; avatar y edad dinámica.
