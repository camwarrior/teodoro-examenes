# Proyecto: Dashboard médico de Teodoro

**Paciente:** Teodoro Guerrero, Chihuahua macho, nacido 20 ago 2020. Diagnósticos: ERC IRIS 1-2, ACVIM B1 (valvulopatía mitral leve), pancreatitis crónica. Tutor: Camilo Guerrero. Clínica: Nueva Madrid / laboratorio VetLab.

**Repo:** github.com/camwarrior/teodoro-examenes (rama `main`). **Deploy:** Vercel, framework preset **Other**, root `./`, sitio estático HTML + Chart.js vía CDN, sin build. Responsivo mobile-first (iPhone).

## Estructura del dashboard (index.html)

7 pestañas, cada una con: tarjetas de métricas, gráficos de tendencia con líneas de referencia, y una sección explicativa final ("¿Qué significa cada indicador?" + conclusión con código de color 🟢 a vigilar / 🟡 / 🔴 conversar con veterinaria).

1. **Renal** — SDMA, creatinina, NUS, fósforo + 6 diagnósticos IRIS con presión arterial.
2. **Sangre** — PLI, leucocitos, hematocrito, hemoglobina.
3. **Hígado** — ALT, FA, AST, colesterol.
4. **Orina** — UPC + 6 urocultivos con antibiogramas.
5. **Cardiología** — métricas ecocardiográficas, PAS, 3 ecocardiografías/ECG.
6. **Imágenes** — 5 ecografías + 1 radiografía con conclusiones.
7. **Evolución** — línea de tiempo clínica (2022–2026) + resumen general.

## Series de datos (verificadas, todas las fechas)

- **SDMA** (ref 1–14): Nov23=6, May24=33→40, Jul24=20, Ago24=25, Dic24=24, Jun25=14, Sep25=11, **Ene26=14**
- **Creatinina** (0.6–2.0): Nov23=0.8, Ene24=0.6, Feb24=0.8, May24=4.0→2.2, Jul24=2.0, Ago24=1.6, Dic24=1.5, Jun25=1.3, Sep25=1.0
- **NUS** (8–29): pico 122 en May24, resto en rango, Ene26=20.5
- **Fósforo** (2.9–5.3): picos 10.3/10.5 (Ene-Feb24), normal desde May24, Ene26=3.3
- **PLI** (10–200): Nov23=48, May24=221.7/213.1, Jun24=270.3, Jul24=229, Ago24=273.6, Dic24=192.4, Jun25=311, Sep25=182.9, Ene26=197.4
- **Leucocitos** (6k–17k): rango normal, mínimo 4460 (Jul24), Ene26=10380
- **Hematocrito** (40–60): pico 62 (Feb24), Ene26=45.1
- **Hemoglobina** (13–20): Ene26=15.2
- **ALT** (18–86): Nov23=438.9, Ene24=216.1, Feb24=116.9, May24=54/542, Jul24=128, Ago24=298.6, Dic24=236.5, Jun25=175.7, Sep25=302, **Ene26=311 (subiendo)**
- **FA** (12–121): pico 669 (Jul24), Sep25=594, Ene26=213
- **AST** (12–42): Ene26=66
- **Colesterol** (133–367): en rango, Ene26=323
- **UPC** (0.1–0.5): May24=1.55→1.10, Jun24=0.63, Jul24=0.45, Ago24=0.42, Dic24=0.30, Jun25=0.58, Ago25=0.19, Ene26=0.12
- **PAS** (<140): Ago22=113, May24=143, Jul24=144, Sep24=136, Ene25=139, Jun25=141, Feb26=130
- **Diagnósticos IRIS:** May24 AKI II → Jul24-Ene25 CKD etapa 2 → Jun25 CKD etapa 1 → Feb26 IRIS 1-2
- **Urocultivos:** negativos May/Jun/Jul24; E. coli >100k UFC/mL en Ago/Sep/Nov25 (sensibilidad reducida a Amoxi-Clav y Cefadroxilo en Nov)
- **Eco:** masa renal + esplenomegalia (May24) → ERC crónica con nefrolitos/pielectasia + hepatopatía vacuolar + barro biliar (Jun25, Ene26). Rx May26 sin cambios.

## Conclusiones clave

- 🟢 **Riñones:** recuperación notable de crisis aguda a ERC estable temprana; creatinina normal, sin proteinuria, normotenso. **Corazón:** B1 sin progresión, sin medicación. **Sangre:** sin anemia.
- 🟡 **A vigilar:** SDMA de vuelta en el límite (14); PLI persistentemente activa; cálculos renales y barro biliar.
- 🔴 **Conversar con veterinaria:** ALT en ascenso (311) + cambios hepáticos grasos en eco; ITU recurrente por E. coli con sensibilidad antibiótica decreciente.

## Notas de mantenimiento

- Datos editables en llamadas `mk(...)` al final de index.html; textos en secciones `class="explain"`.
- Pendiente opcional: exportación a Excel (no iniciada).
- Token GitHub: solo-repo, 90 días, el usuario optó por mantenerlo activo.
- Todo es material de apoyo, no reemplaza criterio veterinario.
