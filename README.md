# Expediente médico de Teodoro 🐾

Ficha clínica web con la evolución de los exámenes de laboratorio, cardiología, ecografías y radiografías de Teodoro (Chihuahua, ERC IRIS 1-2), para escritorio y móvil.

## Contenido

- **Resumen** — estado de cada órgano, último valor y tendencia.
- **Fichas por órgano**, cada una con enlace propio: riñones (`#rinones`), orina (`#orina`), hígado (`#higado`), páncreas (`#pancreas`), tiroides (`#tiroides`), electrolitos (`#electrolitos`), corazón (`#corazon`) y sangre (`#sangre`).
- **Línea de tiempo**, **imágenes** y **archivos** (los 45 exámenes con visor y descarga en PDF).

## Archivos

- `datos.js` — fuente única de datos (series, archivos y textos). JSON estricto después de `window.DATOS =`.
- `index.html` — presentación; lee `datos.js` y no contiene valores.
- `archivos/` — páginas de cada examen en WebP.
- `procesar_examen.py` — procesa exámenes nuevos (imágenes, lectura de valores y chequeos).
- `validar_datos.py` — chequeos de `datos.js` antes de cada commit.
- `PROYECTO.md` — documentación completa y flujo de trabajo.

## Despliegue

Sitio estático (HTML + Chart.js vía CDN). No requiere build.
En Vercel: framework preset **Other**, root directory `./`.

> Esta visualización es de apoyo y no reemplaza la interpretación del médico veterinario tratante.
