# Expediente médico de Teodoro 🐾

Ficha clínica web con la evolución de los exámenes de laboratorio, cardiología, ecografías y radiografías de Teodoro (Chihuahua, ERC IRIS 1-2), para escritorio y móvil.

## Contenido

- **Resumen** — estado de cada área de seguimiento, último valor y tendencia.
- **Áreas de seguimiento** (órganos y grupos de indicadores), cada una con enlace propio: riñones (`#rinones`), orina (`#orina`), hígado (`#higado`), páncreas (`#pancreas`), tiroides (`#tiroides`), electrolitos (`#electrolitos`), corazón (`#corazon`) y sangre (`#sangre`).
- **Línea de tiempo**, **imágenes** y **archivos** (los 49 exámenes con visor y descarga en PDF).
- **Agua y clima** (`#agua`, pestaña temporal): registro diario del agua que toma Teodoro y la temperatura mínima y máxima medida ese día (DMC, solo estación Tobalaba). Exporta PDF para el nefrólogo.

## Archivos

- `datos.js` — fuente única de datos (series, archivos y textos). JSON estricto después de `window.DATOS =`.
- `index.html` — presentación; lee `datos.js` y no contiene valores.
- `archivos/` — páginas de cada examen en WebP.
- `procesar_examen.py` — procesa exámenes nuevos (imágenes, lectura de valores y chequeos).
- `validar_datos.py` — chequeos de `datos.js` antes de cada commit.
- `PROYECTO.md` — documentación completa y flujo de trabajo.
- `agua.json` — registro de agua (lo escribe `/api/agua` con PIN; no se edita a mano salvo emergencia).
- `clima.json` — temperaturas diarias (lo escribe `.github/workflows/clima.yml` con `scripts/clima_dmc.py`).
- `agua-vista.js` — la pestaña "Agua y clima". `api/agua.js` + `api/_agua-logica.js` — guardado con PIN.
- Variables en Vercel: `GITHUB_TOKEN_AGUA`, `PIN_AGUA`. Secretos en GitHub Actions: `DMC_USUARIO`, `DMC_TOKEN`.
- Para ocultar la pestaña sin borrar datos: `"activo": false` en `agua.json`.

## Despliegue

Sitio estático (HTML + Chart.js vía CDN). No requiere build.
En Vercel: framework preset **Other**, root directory `./`.

> Esta visualización es de apoyo y no reemplaza la interpretación del médico veterinario tratante.
