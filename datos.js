// Fuente única de datos del expediente de Teodoro.
// La línea siguiente a este encabezado empieza con 'window.DATOS =' y el resto es JSON estricto:
// se valida quitando ese prefijo y el ';' final y pasando el texto por json.loads.
window.DATOS =
{
  "version": "2026-10-02",
  "series": {
    "sdma": {"nombre": "SDMA", "unidad": "µg/dL", "rango": [1, 14], "organo": "rinones", "puntos": [
      {"fecha": "2023-11-08", "valor": 6.0, "archivo": 3},
      {"fecha": "2024-05-14", "valor": 33.0, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 40.0, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 20.0, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 25.0, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 24.0, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 14.0, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 11.0, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 14.0, "archivo": 35}
    ]},
    "creatinina": {"nombre": "Creatinina", "unidad": "mg/dL", "rango": [0.6, 2.0], "organo": "rinones", "decimales": 1, "puntos": [
      {"fecha": "2023-11-08", "valor": 0.8, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 0.6, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 0.8, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 4.0, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 2.2, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 2.0, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 1.6, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 1.5, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 1.3, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 1.0, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 1.4, "archivo": 35},
      {"fecha": "2026-08-05", "valor": 1.4, "archivo": 43},
      {"fecha": "2026-10-02", "valor": 1.5, "archivo": 45}
    ]},
    "nus": {"nombre": "NUS", "unidad": "mg/dL", "rango": [8, 29], "organo": "rinones", "puntos": [
      {"fecha": "2023-11-08", "valor": 32.1, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 14.4, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 25.4, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 122.0, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 22.8, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 32.5, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 22.8, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 25.8, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 25.0, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 12.4, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 20.5, "archivo": 35},
      {"fecha": "2026-08-05", "valor": 26.9, "archivo": 43},
      {"fecha": "2026-10-02", "valor": 24.4, "archivo": 45}
    ]},
    "fosforo": {"nombre": "Fósforo", "unidad": "mg/dL", "rango": [2.9, 5.3], "organo": "rinones", "puntos": [
      {"fecha": "2023-11-08", "valor": 4.2, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 10.3, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 10.5, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 7.5, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 5.3, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 4.2, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 4.3, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 3.5, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 3.1, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 2.5, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 3.3, "archivo": 35},
      {"fecha": "2026-08-05", "valor": 2.8, "archivo": 43},
      {"fecha": "2026-10-02", "valor": 2.9, "archivo": 45}
    ]},
    "pli": {"nombre": "PLI", "unidad": "µg/L", "rango": [10, 200], "organo": "pancreas", "puntos": [
      {"fecha": "2023-11-08", "valor": 48.0, "archivo": 3},
      {"fecha": "2024-05-14", "valor": 221.7, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 213.1, "archivo": 10},
      {"fecha": "2024-06-03", "valor": 270.3, "archivo": 12},
      {"fecha": "2024-07-11", "valor": 229.0, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 273.6, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 192.4, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 311.0, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 182.9, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 197.4, "archivo": 35}
    ]},
    "leucocitos": {"nombre": "Leucocitos", "unidad": "/µL", "rango": [6000, 17000], "organo": "sangre", "puntos": [
      {"fecha": "2023-11-08", "valor": 8500.0, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 14940.0, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 10510.0, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 8940.0, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 10710.0, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 4460.0, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 6000.0, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 6250.0, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 8750.0, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 13080.0, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 10380.0, "archivo": 35}
    ]},
    "hematocrito": {"nombre": "Hematocrito", "unidad": "%", "rango": [40, 60], "organo": "sangre", "puntos": [
      {"fecha": "2023-11-08", "valor": 54.6, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 50.1, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 62.0, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 54.8, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 43.9, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 48.0, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 50.7, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 56.5, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 55.1, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 47.5, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 45.1, "archivo": 35}
    ]},
    "hemoglobina": {"nombre": "Hemoglobina", "unidad": "g/dL", "rango": [13, 20], "organo": "sangre", "decimales": 1, "puntos": [
      {"fecha": "2023-11-08", "valor": 19.0, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 18.0, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 20.2, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 18.4, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 14.5, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 16.3, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 17.4, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 19.4, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 18.7, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 16.5, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 15.2, "archivo": 35}
    ]},
    "alt": {"nombre": "ALT", "unidad": "UI/L", "rango": [18, 86], "organo": "higado", "puntos": [
      {"fecha": "2023-11-08", "valor": 438.9, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 216.1, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 116.9, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 54.0, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 542.0, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 128.0, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 298.6, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 236.5, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 175.7, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 302.0, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 311.0, "archivo": 35},
      {"fecha": "2026-08-05", "valor": 388.0, "archivo": 43},
      {"fecha": "2026-10-02", "valor": 252.0, "archivo": 45}
    ]},
    "fa": {"nombre": "Fosfatasa alcalina", "unidad": "UI/L", "rango": [12, 121], "organo": "higado", "puntos": [
      {"fecha": "2023-11-08", "valor": 231.0, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 435.0, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 110.0, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 114.0, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 64.0, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 669.0, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 323.0, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 263.0, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 217.0, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 594.0, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 213.0, "archivo": 35},
      {"fecha": "2026-08-05", "valor": 273.0, "archivo": 43},
      {"fecha": "2026-10-02", "valor": 183.0, "archivo": 45}
    ]},
    "ast": {"nombre": "AST", "unidad": "UI/L", "rango": [12, 42], "organo": "higado", "puntos": [
      {"fecha": "2023-11-08", "valor": 110.1, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 215.2, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 268.4, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 25.1, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 200.0, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 41.3, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 51.3, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 46.5, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 45.0, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 63.0, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 66.0, "archivo": 35},
      {"fecha": "2026-08-05", "valor": 61.7, "archivo": 43},
      {"fecha": "2026-10-02", "valor": 46.5, "archivo": 45}
    ]},
    "colesterol": {"nombre": "Colesterol", "unidad": "mg/dL", "rango": [133, 367], "organo": "higado", "puntos": [
      {"fecha": "2023-11-08", "valor": 213.0, "archivo": 3},
      {"fecha": "2024-01-03", "valor": 306.0, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 149.0, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 217.0, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 190.0, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 330.0, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 309.0, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 321.0, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 320.0, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 298.0, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 323.0, "archivo": 35},
      {"fecha": "2026-08-05", "valor": 252.0, "archivo": 43},
      {"fecha": "2026-10-02", "valor": 262.0, "archivo": 45}
    ]},
    "upc": {"nombre": "UPC", "unidad": "", "rango": [0.1, 0.5], "organo": "orina", "decimales": 2, "puntos": [
      {"fecha": "2024-05-18", "valor": 1.55, "archivo": 8},
      {"fecha": "2024-05-24", "valor": 1.1, "archivo": 10},
      {"fecha": "2024-06-03", "valor": 0.63, "archivo": 12},
      {"fecha": "2024-07-11", "valor": 0.45, "archivo": 16},
      {"fecha": "2024-08-30", "valor": 0.42, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 0.3, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 0.58, "archivo": 23},
      {"fecha": "2025-08-29", "valor": 0.19, "archivo": 29},
      {"fecha": "2026-01-29", "valor": 0.12, "archivo": 35}
    ]},
    "pas": {"nombre": "Presión sistólica", "unidad": "mmHg", "rango": [null, 140], "organo": "corazon", "puntos": [
      {"fecha": "2022-08-31", "valor": 113.0, "archivo": 2, "pad": 67, "pam": 73},
      {"fecha": "2024-05-27", "valor": 143.0, "archivo": 11, "pad": 68, "pam": 95},
      {"fecha": "2024-07-19", "valor": 144.0, "archivo": 17, "pad": 75, "pam": 100},
      {"fecha": "2024-09-09", "valor": 136.0, "archivo": 20, "pad": 71, "pam": 94},
      {"fecha": "2025-01-07", "valor": 139.0, "archivo": 22, "pad": 69, "pam": 93},
      {"fecha": "2025-05-15", "valor": 154, "archivo": 27, "pad": 96, "nota": "Medida durante el ecocardiograma; el informe no indica método ni condiciones."},
      {"fecha": "2025-06-19", "valor": 141.0, "archivo": 28, "pad": 69, "pam": 94},
      {"fecha": "2026-02-11", "valor": 130.0, "archivo": 36, "pad": 68, "pam": 86}
    ]},
    "t4": {"nombre": "T4 total", "unidad": "µg/dL", "rango": [1.3, 3.5], "organo": "tiroides", "nota": "El laboratorio bajó el límite superior de 3,8 (informes 2024-2025) a 3,5 (informes 2026, pacientes sin terapia).", "puntos": [
      {"fecha": "2024-01-03", "valor": 2.98, "archivo": 5},
      {"fecha": "2025-06-05", "valor": 3.18, "archivo": 23},
      {"fecha": "2026-01-29", "valor": 3.69, "archivo": 35},
      {"fecha": "2026-05-30", "valor": 3.97, "archivo": 42},
      {"fecha": "2026-08-05", "valor": 2.77, "archivo": 43}
    ]},
    "tsh": {"nombre": "TSH", "unidad": "ng/mL", "rango": [0.01, 0.6], "organo": "tiroides", "nota": "El límite superior cambió de 0,5 a 0,6; la unidad figura como ng/dL en informes antiguos y ng/mL en los nuevos (probable errata del laboratorio; valores comparables).", "puntos": [
      {"fecha": "2024-01-03", "valor": 0.22, "archivo": 5},
      {"fecha": "2025-06-05", "valor": 0.3, "archivo": 23},
      {"fecha": "2026-01-29", "valor": 0.3, "archivo": 35},
      {"fecha": "2026-05-30", "valor": 0.18, "archivo": 42},
      {"fecha": "2026-08-05", "valor": 0.23, "archivo": 43}
    ]},
    "sodio": {"nombre": "Sodio", "unidad": "mEq/L", "rango": [140, 150], "organo": "electrolitos", "decimales": 1, "puntos": [
      {"fecha": "2023-11-08", "valor": 145.5, "archivo": 3},
      {"fecha": "2024-05-14", "valor": 143.5, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 147.1, "archivo": 10},
      {"fecha": "2024-06-03", "valor": 144.4, "archivo": 12},
      {"fecha": "2024-08-30", "valor": 148.2, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 150.2, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 148.8, "archivo": 23},
      {"fecha": "2026-01-29", "valor": 151.1, "archivo": 35},
      {"fecha": "2026-05-30", "valor": 150.7, "archivo": 42}
    ]},
    "potasio": {"nombre": "Potasio", "unidad": "mEq/L", "rango": [3.5, 5.5], "organo": "electrolitos", "decimales": 1, "puntos": [
      {"fecha": "2023-11-08", "valor": 4.9, "archivo": 3},
      {"fecha": "2024-05-14", "valor": 3.8, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 5.3, "archivo": 10},
      {"fecha": "2024-06-03", "valor": 4.8, "archivo": 12},
      {"fecha": "2024-08-30", "valor": 4.8, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 5.2, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 5.4, "archivo": 23},
      {"fecha": "2026-01-29", "valor": 5.8, "archivo": 35},
      {"fecha": "2026-05-30", "valor": 5.6, "archivo": 42}
    ]},
    "cloro": {"nombre": "Cloro", "unidad": "mEq/L", "rango": [107, 113], "organo": "electrolitos", "decimales": 1, "puntos": [
      {"fecha": "2023-11-08", "valor": 108.9, "archivo": 3},
      {"fecha": "2024-05-14", "valor": 115.4, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 115.9, "archivo": 10},
      {"fecha": "2024-06-03", "valor": 118.0, "archivo": 12},
      {"fecha": "2024-08-30", "valor": 116.8, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 115.4, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 113.9, "archivo": 23},
      {"fecha": "2026-01-29", "valor": 115.5, "archivo": 35},
      {"fecha": "2026-05-30", "valor": 114.0, "archivo": 42}
    ]},
    "calcio": {"nombre": "Calcio", "unidad": "mg/dL", "rango": [9, 11.5], "organo": "rinones", "puntos": [
      {"fecha": "2023-11-08", "valor": 9, "archivo": 3, "nota": "El laboratorio lo marcó fuera de rango (✱) aunque el valor impreso es 9, el límite inferior."},
      {"fecha": "2024-01-03", "valor": 9.9, "archivo": 5},
      {"fecha": "2024-02-07", "valor": 9.0, "archivo": 6},
      {"fecha": "2024-05-14", "valor": 11.3, "archivo": 7},
      {"fecha": "2024-05-24", "valor": 10.8, "archivo": 10},
      {"fecha": "2024-07-11", "valor": 11.7, "archivo": 15},
      {"fecha": "2024-08-30", "valor": 10.5, "archivo": 18},
      {"fecha": "2024-12-28", "valor": 9.0, "archivo": 21},
      {"fecha": "2025-06-05", "valor": 11, "archivo": 23},
      {"fecha": "2025-09-01", "valor": 9.3, "archivo": 30},
      {"fecha": "2026-01-29", "valor": 8.4, "archivo": 35},
      {"fecha": "2026-08-05", "valor": 8.8, "archivo": 43},
      {"fecha": "2026-10-02", "valor": 9.3, "archivo": 45}
    ]},
    "glucosa": {"nombre": "Glucosa", "unidad": "mg/dL", "rango": [70, 120], "organo": "pancreas", "nota": "Sin fluoruro, la glucosa se sigue consumiendo dentro del tubo y el valor sale artificialmente bajo. Solo las muestras con fluoruro son comparables entre sí.", "puntos": [
      {"fecha": "2023-11-08", "valor": 91.5, "archivo": 3, "tubo": "con fluoruro"},
      {"fecha": "2024-01-03", "valor": 112.8, "archivo": 5, "tubo": "con fluoruro"},
      {"fecha": "2024-02-07", "valor": 91.3, "archivo": 6, "tubo": "con fluoruro"},
      {"fecha": "2024-02-07", "valor": 4, "archivo": 6, "tubo": "sin fluoruro"},
      {"fecha": "2024-05-14", "valor": 70.3, "archivo": 7, "tubo": "con fluoruro"},
      {"fecha": "2024-05-24", "valor": 34, "archivo": 10, "tubo": "sin fluoruro"},
      {"fecha": "2024-07-11", "valor": 75, "archivo": 15, "tubo": "sin fluoruro"},
      {"fecha": "2024-08-30", "valor": 94.1, "archivo": 18, "tubo": "con fluoruro"},
      {"fecha": "2024-12-28", "valor": 27, "archivo": 21, "tubo": "sin fluoruro"},
      {"fecha": "2025-06-05", "valor": 96, "archivo": 23, "tubo": "sin fluoruro"},
      {"fecha": "2025-09-01", "valor": 101.9, "archivo": 30, "tubo": "con fluoruro"},
      {"fecha": "2026-01-29", "valor": 83.6, "archivo": 35, "tubo": "con fluoruro"},
      {"fecha": "2026-08-05", "valor": 65, "archivo": 43, "tubo": "con fluoruro"},
      {"fecha": "2026-10-02", "valor": 61, "archivo": 45, "tubo": "sin fluoruro"}
    ]}
  },
  "contenido": {
    "paciente": {
      "nombre": "Teodoro Guerrero",
      "corto": "Teodoro",
      "raza": "Chihuahua",
      "sexo": "Macho",
      "nacimiento": "2020-08-22",
      "diagnosticos": [
        "Enfermedad renal crónica IRIS 1-2",
        "Válvula mitral ACVIM B1",
        "Pancreatitis crónica"
      ]
    },
    "resumen": {
      "titular": "Hígado y orina son los temas para conversar con la veterinaria. Lo demás está estable o en observación.",
      "general": {
        "intro": "Teodoro tiene tres temas crónicos que conviven y se vigilan juntos: <strong>los riñones</strong> (lo principal), <strong>el páncreas/hígado</strong> (de donde nació todo) y <strong>el corazón</strong> (un hallazgo más reciente y leve). Esta es la lectura de cada uno:",
        "bloques": [
          {
            "nivel": "ok",
            "titulo": "Va bien",
            "html": "<strong>Riñones:</strong> superó una crisis grave y hoy está estable en etapa temprana, con creatinina normal, sin proteinuria y presión controlada. <strong>Corazón:</strong> valvulopatía leve que no ha progresado y no requiere medicación. <strong>Sangre:</strong> sin anemia, buenas defensas."
          },
          {
            "nivel": "watch",
            "titulo": "A vigilar",
            "html": "<strong>SDMA:</strong> volvió al límite (14) tras estar mejor, conviene seguir midiéndolo. <strong>Páncreas:</strong> la PLI sigue activa desde 2023. <strong>Cálculos renales y barro biliar:</strong> presentes y en seguimiento por ecografía. <strong>Tiroides:</strong> la T4 había venido subiendo, pero en agosto 2026 bajó a 2.77, de vuelta en rango; la TSH normal descarta hipotiroidismo. El eco cervical mostró la tiroides de tamaño conservado con leve hiperecogenicidad del lóbulo derecho (tiroiditis leve). Conviene seguir el control según indique la endocrinóloga. <strong>Electrolitos:</strong> sodio, potasio y cloro en el límite alto, compatible con deshidratación leve. <strong>Fósforo:</strong> en el límite inferior (2.9 en octubre 2026)."
          },
          {
            "nivel": "alert",
            "titulo": "Conversar con la veterinaria",
            "html": "<strong>Hígado:</strong> la ALT bajó a 252 en octubre 2026 (desde 388 en agosto), en el control tras un mes de Hepatocan Forte, pero sigue elevada y la ecografía muestra cambios grasos. <strong>Infecciones urinarias:</strong> la misma bacteria reapareció tres veces en 2025, con sensibilidad antibiótica que empezó a reducirse. Estos dos puntos son los que más vale la pena plantear en el próximo control."
          }
        ],
        "nota": "Recuerda: este resumen es para ayudarte a entender los exámenes, no para reemplazar a tu veterinaria. Las decisiones de tratamiento siempre las toma ella con el examen físico de Teodoro."
      }
    },
    "organos": [
      {
        "id": "rinones",
        "nombre": "Riñones",
        "estado": "ok",
        "nota": "Creatinina normal y sin proteinuria. SDMA justo en el límite (14).",
        "titular": "Recuperación notable de la crisis de mayo 2024. Hoy, enfermedad renal crónica estable en etapa temprana.",
        "principal": "creatinina",
        "series": [
          "sdma",
          "creatinina",
          "nus",
          "fosforo",
          "calcio"
        ],
        "definiciones": [
          {
            "t": "SDMA",
            "d": "Es el detector más temprano de daño renal. Sube cuando los riñones empiezan a filtrar peor, incluso antes que la creatinina. En perros se considera normal hasta 14. Es el marcador más fino para vigilar a Teodoro."
          },
          {
            "t": "Creatinina",
            "d": "Un desecho que los riñones eliminan. Si se acumula en sangre, indica que los riñones no están filtrando bien. Es el valor \"clásico\" de función renal, pero reacciona más tarde que el SDMA."
          },
          {
            "t": "NUS (nitrógeno ureico)",
            "d": "Otro desecho que filtran los riñones. Sube en falla renal, pero también con deshidratación o dieta alta en proteína, por eso se lee junto a la creatinina."
          },
          {
            "t": "Fósforo",
            "d": "Mineral que los riñones ayudan a equilibrar. En enfermedad renal avanzada tiende a subir; mantenerlo controlado protege los riñones. En Teodoro no ha vuelto a subir desde 2024; en 2026 bajó al límite inferior (2.8 en agosto, 2.9 en octubre)."
          },
          {
            "t": "Calcio",
            "d": "Mineral que el riñón ayuda a regular junto con el fósforo; por eso se leen juntos en la enfermedad renal. En Teodoro estuvo bajo el rango en enero (8.4) y agosto 2026 (8.8) y volvió a rango en octubre (9.3).",
            "nuevo": true
          },
          {
            "t": "Clasificación IRIS",
            "d": "Es el \"estadio\" oficial de la enfermedad renal crónica, de 1 (más leve) a 4. AKI significa daño agudo y reversible; CKD significa daño crónico. También indica si hay proteína en orina y si la presión está alta."
          }
        ],
        "conclusion": {
          "titulo": "Conclusión renal",
          "nivel": "ok",
          "parrafos": [
            "Teodoro tuvo una crisis renal aguda grave en mayo 2024 (SDMA 40, creatinina 4.0), pero se ha recuperado muy bien: pasó de AKI grado II a enfermedad crónica estable en etapa 1-2, con la creatinina normal (1.5 en octubre 2026) y sin proteinuria en el último control. El SDMA en 14 está justo en el límite, así que conviene seguir vigilándolo, pero la tendencia general de los riñones ha sido claramente positiva."
          ]
        },
        "bloques": [
          "iris"
        ]
      },
      {
        "id": "orina",
        "nombre": "Orina",
        "estado": "alert",
        "nota": "Proteína en orina normal. Infección por E. coli en 3 cultivos de 2025.",
        "titular": "La proteína en orina se normalizó, pero la misma bacteria apareció en tres urocultivos de 2025.",
        "principal": "upc",
        "series": [
          "upc"
        ],
        "definiciones": [
          {
            "t": "UPC (proteína/creatinina en orina)",
            "d": "Mide cuánta proteína se está \"fugando\" por la orina. Los riñones sanos retienen la proteína; si la dejan escapar, es señal de daño en el filtro renal. Normal hasta 0.5. Es uno de los mejores marcadores de cómo evoluciona la enfermedad renal."
          },
          {
            "t": "Proteínas en orina",
            "d": "La cantidad bruta de proteína detectada. Se usa junto al UPC, que es más confiable porque corrige según lo concentrada que esté la orina."
          },
          {
            "t": "Urocultivo",
            "d": "Se cultiva la orina para ver si crecen bacterias. Si crecen más de 100.000 unidades (UFC/mL), hay infección urinaria. El antibiograma indica qué antibióticos funcionan (\"sensible\") y cuáles no tanto (\"intermedio\" o \"resistente\")."
          }
        ],
        "conclusion": {
          "titulo": "Conclusión orina",
          "nivel": "alert",
          "parrafos": [
            "Buena noticia por un lado: el UPC mejoró muchísimo, de 1.55 en la crisis a 0.12 (normal) en el último control, lo que confirma que los riñones están reteniendo bien la proteína. El punto rojo es la infección urinaria recurrente: la misma bacteria (E. coli) apareció en tres cultivos seguidos durante 2025, y en noviembre ya mostraba sensibilidad reducida a dos antibióticos. Las infecciones urinarias repetidas pueden dañar los riñones, así que es importante seguirlas de cerca y completar siempre los tratamientos."
          ]
        },
        "bloques": [
          "proteina_orina",
          "urocultivos"
        ]
      },
      {
        "id": "higado",
        "nombre": "Hígado",
        "estado": "alert",
        "nota": "La ALT bajó desde 388 tras un mes de Hepatocan Forte, pero sigue alta.",
        "titular": "Las tres enzimas bajaron en el control del 2 oct 2026, tras un mes de Hepatocan Forte. Siguen sobre el rango y la ecografía muestra cambios grasos.",
        "principal": "alt",
        "series": [
          "alt",
          "fa",
          "ast",
          "colesterol"
        ],
        "definiciones": [
          {
            "t": "ALT",
            "d": "Una enzima que vive dentro de las células del hígado. Cuando esas células se dañan o irritan, la ALT se \"escapa\" a la sangre y sube. Es el marcador más específico de daño hepático."
          },
          {
            "t": "FA (fosfatasa alcalina)",
            "d": "Sube por problemas en el hígado o las vías biliares, pero también con ciertos medicamentos (como corticoides) y otras causas. Se interpreta junto a la ALT."
          },
          {
            "t": "AST",
            "d": "Parecida a la ALT, pero está también en músculo, así que es menos específica del hígado. Confirma la tendencia que marca la ALT."
          },
          {
            "t": "Colesterol",
            "d": "Se procesa en el hígado. Puede alterarse en problemas hepáticos, hormonales o metabólicos. En Teodoro se mantiene dentro del rango normal."
          }
        ],
        "conclusion": {
          "titulo": "Conclusión hígado",
          "nivel": "alert",
          "parrafos": [
            "Esta es el área que más conviene conversar con la veterinaria. La ALT está elevada de forma persistente: venía subiendo (311 en enero 2026 y 388 en agosto 2026) y en octubre 2026, en el control tras un mes de Hepatocan Forte indicado por endocrinología, bajó a 252, el primer descenso en más de un año, aunque sigue unas 3 veces sobre el límite. La FA y la AST también bajaron (183 y 46.5). Esto coincide con lo que muestra la ecografía: un hígado agrandado con cambios grasos/esteroidales y bastante \"barro biliar\" en la vesícula. No es una urgencia inmediata, pero sí un punto de vigilancia activa que no debería pasarse por alto."
          ]
        },
        "bloques": [
          "ggt",
          "tratamiento"
        ]
      },
      {
        "id": "pancreas",
        "nombre": "Páncreas",
        "estado": "watch",
        "nota": "PLI activa desde 2023, rondando el límite de 200.",
        "titular": "La PLI sigue activa desde 2023 y ronda el límite de 200. La glucosa con fluoruro estuvo en rango, salvo en agosto 2026.",
        "principal": "pli",
        "series": [
          "pli",
          "glucosa"
        ],
        "definiciones": [
          {
            "t": "PLI (lipasa pancreática)",
            "d": "Mide cuánto está \"inflamado\" el páncreas. Valores sobre 200 sugieren pancreatitis. Este es el indicador central del problema original de Teodoro: su enfermedad renal arrancó tras una pancreatitis."
          },
          {
            "t": "Glucosa",
            "d": "El azúcar de la sangre. Solo es confiable si la muestra se tomó en tubo con fluoruro; sin fluoruro se sigue consumiendo dentro del tubo y sale artificialmente baja. Por eso el gráfico separa ambos tipos de muestra.",
            "nuevo": true
          }
        ],
        "conclusion": {
          "titulo": "Conclusión páncreas",
          "nivel": "watch",
          "parrafos": [
            "El punto a seguir es la PLI: lleva activa desde 2023 y sigue rondando el límite (197–311), lo que indica que la inflamación del páncreas no está del todo resuelta y necesita seguimiento."
          ]
        },
        "bloques": []
      },
      {
        "id": "tiroides",
        "nombre": "Tiroides",
        "estado": "ok",
        "nota": "La T4 volvió a rango en agosto; TSH normal.",
        "titular": "La T4 venía subiendo y en agosto 2026 volvió a rango. TSH normal y tiroides de tamaño conservado en la ecografía.",
        "principal": "t4",
        "series": [
          "t4",
          "tsh"
        ],
        "definiciones": [
          {
            "t": "T4 total",
            "d": "La principal hormona de la tiroides. Si está baja con TSH alta, indica hipotiroidismo (lo común en perros). Si está alta con TSH baja sugiere hipertiroidismo, que en perros es muy poco frecuente. En Teodoro venía subiendo lentamente (2.98 → 3.18 → 3.69 → 3.97) y en agosto 2026 bajó a 2.77, de vuelta dentro de rango."
          },
          {
            "t": "TSH",
            "d": "La hormona que el cerebro usa para \"dar la orden\" a la tiroides. Se interpreta siempre junto a la T4. En Teodoro está normal, incluso en la parte baja, lo que descarta hipotiroidismo."
          }
        ],
        "conclusion": {
          "titulo": "Conclusión tiroides",
          "nivel": "watch",
          "parrafos": [
            "<strong>Importante sobre los rangos:</strong> el laboratorio cambió su valor de referencia de la T4 entre 2025 y 2026: los informes de 2024–2025 usaban un límite superior de <strong>3,8</strong> µg/dL, y los de 2026 usan <strong>3,5</strong> µg/dL (pacientes sin terapia). Por eso la T4 de enero 2026 (3.69) y la de mayo 2026 (3.97) figuran como altas bajo el criterio nuevo; con el criterio antiguo, 3.69 habría quedado dentro de rango. En <strong>agosto 2026</strong>, sin embargo, la T4 bajó a <strong>2.77</strong>, de vuelta dentro de rango con cualquiera de los dos criterios — un solo control no confirma una reversión definitiva, pero corta la tendencia al alza que se venía observando.",
            "No hay hipotiroidismo (sería T4 baja con TSH alta; Teodoro tiene lo contrario). El hipertiroidismo verdadero es muy raro en perros y poco probable sin signos clínicos. Punto a conversar con el equipo tratante: el propio informe del laboratorio sugiere medir <strong>T4 libre</strong> cuando la T4 total sale elevada sin tratamiento; a la fecha nunca se ha medido.",
            "<strong>Eco cervical (7 ago 2026):</strong> por la interconsulta con endocrinología se realizó la primera ecografía de tiroides. La glándula tiene <strong>tamaño/volumen conservado</strong> (volumen total 0.157 cc; referencia 1–7 kg: 0.05–0.15 cc) y muestra una <strong>leve hiperecogenicidad con márgenes algo menos definidos en el lóbulo derecho</strong>, interpretada como cambios inespecíficos / tiroiditis leve, sin lesiones focales ni aumento significativo de tamaño. La ecografista recomienda un control ecográfico según criterio clínico."
          ]
        },
        "bloques": []
      },
      {
        "id": "electrolitos",
        "nombre": "Electrolitos",
        "estado": "watch",
        "nota": "Cloro sobre el rango desde 2024; sodio y potasio en el límite alto.",
        "titular": "Sodio, potasio y cloro en el límite alto en los últimos controles; el cloro, sobre el rango desde 2024. Sin electrolitos desde mayo 2026.",
        "principal": "cloro",
        "series": [
          "sodio",
          "potasio",
          "cloro"
        ],
        "definiciones": [
          {
            "t": "Sodio, potasio y cloro (electrolitos)",
            "d": "Sales minerales que regulan la hidratación y el equilibrio del cuerpo. Cuando los tres suben juntos de forma leve suele reflejar que la sangre está \"concentrada\" por deshidratación leve, más que un trastorno propio de cada sal."
          }
        ],
        "conclusion": {
          "titulo": "Conclusión electrolitos",
          "nivel": "watch",
          "parrafos": [
            "Los electrolitos están los tres en el límite alto, compatible con deshidratación leve por su condición renal; el cloro, de hecho, lleva alto de forma crónica desde 2024."
          ]
        },
        "bloques": []
      },
      {
        "id": "corazon",
        "nombre": "Corazón",
        "estado": "ok",
        "nota": "Válvula mitral ACVIM B1 sin progresión. Presión normal en el último control.",
        "titular": "Valvulopatía mitral leve (ACVIM B1) sin progresión y sin medicación.",
        "principal": "pas",
        "series": [
          "pas"
        ],
        "definiciones": [
          {
            "t": "Clasificación ACVIM",
            "d": "Es el \"estadio\" de la enfermedad de la válvula mitral en perros. Va de A (en riesgo) a D (insuficiencia grave). <strong>B1</strong> significa que hay una alteración leve en la válvula pero el corazón aún no ha cambiado de tamaño ni necesita medicación. Es la etapa más temprana con hallazgos."
          },
          {
            "t": "Válvula mitral / regurgitación",
            "d": "La válvula que separa dos cámaras del corazón izquierdo. Con la edad puede engrosarse (degeneración mixomatosa) y dejar pasar un poco de sangre hacia atrás (\"regurgitación\"). En Teodoro esa fuga es leve."
          },
          {
            "t": "Fracción de eyección / acortamiento",
            "d": "Miden qué tan fuerte bombea el corazón en cada latido. Los valores de Teodoro son normales, o sea que el músculo cardíaco trabaja bien."
          },
          {
            "t": "AI/Ao",
            "d": "Compara el tamaño de la aurícula izquierda con la aorta. Si la aurícula se agranda, es señal de que la válvula está sobrecargando el corazón. En Teodoro está normal (1.49), sin agrandamiento."
          },
          {
            "t": "PAS (presión arterial sistólica)",
            "d": "La presión de la sangre. Importa mucho en pacientes renales, porque la presión alta daña los riñones. Bajo 140 es normotenso (lo ideal). Teodoro está en 130."
          },
          {
            "t": "ECG",
            "d": "Registra el ritmo eléctrico del corazón. El de Teodoro es normal, con una \"arritmia sinusal respiratoria\" que en realidad es algo sano y esperable en perros."
          }
        ],
        "conclusion": {
          "titulo": "Conclusión cardiología",
          "nivel": "ok",
          "parrafos": [
            "El corazón de Teodoro está en buen estado. Tiene una valvulopatía mitral leve (ACVIM B1) que se detectó en 2025 y que <strong>no ha progresado</strong>: el corazón conserva tamaño y fuerza normales, y aún no requiere medicación cardíaca. Además se mantiene normotenso, algo muy importante para proteger sus riñones. El plan habitual en esta etapa es solo seguimiento periódico con ecocardiograma."
          ]
        },
        "bloques": [
          "ecocardio_metricas",
          "ecocardiografias"
        ]
      },
      {
        "id": "sangre",
        "nombre": "Sangre",
        "estado": "ok",
        "nota": "Sin anemia y con defensas normales.",
        "titular": "Hemograma esencialmente normal: sin anemia y con buenas defensas. Último hemograma en enero 2026.",
        "principal": "hematocrito",
        "series": [
          "hematocrito",
          "hemoglobina",
          "leucocitos"
        ],
        "definiciones": [
          {
            "t": "Leucocitos (glóbulos blancos)",
            "d": "Las células de defensa. Suben cuando hay infección o inflamación, y bajan si las defensas están deprimidas. Sirven para detectar infecciones, como las urinarias que tuvo."
          },
          {
            "t": "Hematocrito",
            "d": "El porcentaje de la sangre formado por glóbulos rojos. Bajo = anemia (común en enfermedad renal); alto = deshidratación. En Teodoro se mantiene en rango."
          },
          {
            "t": "Hemoglobina",
            "d": "La proteína de los glóbulos rojos que transporta oxígeno. Va de la mano con el hematocrito y confirma si hay o no anemia."
          }
        ],
        "conclusion": {
          "titulo": "Conclusión sangre",
          "nivel": "ok",
          "parrafos": [
            "El hemograma de Teodoro es esencialmente normal: buenas defensas, sin anemia (algo muy positivo, porque la anemia es una complicación frecuente de la enfermedad renal)."
          ]
        },
        "bloques": []
      }
    ],
    "bloques": {
      "iris": [
        {
          "fecha": "27 may 2024",
          "dx": "IRIS AKI grado II – no oligúrico",
          "meta": "PAS 143 · PAD 68 · PAM 95 mmHg",
          "tono": "alert",
          "archivo": 11
        },
        {
          "fecha": "19 jul 2024",
          "dx": "IRIS CKD etapa 2 – proteinuria limítrofe – prehipertenso",
          "meta": "PAS 144 · PAD 75 · PAM 100 mmHg",
          "tono": "watch",
          "archivo": 17
        },
        {
          "fecha": "9 sep 2024",
          "dx": "IRIS CKD etapa 2 – proteinuria limítrofe – normotenso",
          "meta": "PAS 136 · PAD 71 · PAM 94 mmHg",
          "tono": "watch",
          "archivo": 20
        },
        {
          "fecha": "7 ene 2025",
          "dx": "IRIS CKD etapa 2 – proteinuria limítrofe – normotenso",
          "meta": "PAS 139 · PAD 69 · PAM 93 mmHg",
          "tono": "watch",
          "archivo": 22
        },
        {
          "fecha": "19 jun 2025",
          "dx": "IRIS CKD etapa 1 – con proteinuria – normotenso",
          "meta": "PAS 141 · PAD 69 · PAM 94 mmHg",
          "tono": "ok",
          "archivo": 28
        },
        {
          "fecha": "11 feb 2026",
          "dx": "ERC IRIS 1-2 – sin proteinuria – normotenso",
          "meta": "PAS 130 · PAD 68 · PAM 86 mmHg",
          "tono": "ok",
          "archivo": 36
        }
      ],
      "urocultivos": [
        {
          "fecha": "18 may 2024",
          "resultado": "Negativo (72 h)",
          "detalle": "",
          "tono": "ok",
          "archivo": 8
        },
        {
          "fecha": "3 jun 2024",
          "resultado": "Negativo (48 h)",
          "detalle": "",
          "tono": "ok",
          "archivo": 12
        },
        {
          "fecha": "11 jul 2024",
          "resultado": "Negativo (48 h)",
          "detalle": "",
          "tono": "ok",
          "archivo": 16
        },
        {
          "fecha": "29 ago 2025",
          "resultado": "E. coli >100k UFC/mL",
          "detalle": "Sensible: Amikacina, Amoxi-Clav, Enrofloxacino, Nitrofurantoína",
          "tono": "alert",
          "archivo": 29
        },
        {
          "fecha": "15 sep 2025",
          "resultado": "E. coli >100k UFC/mL",
          "detalle": "Sensible a todos los antibióticos probados",
          "tono": "alert",
          "archivo": 31
        },
        {
          "fecha": "12 nov 2025",
          "resultado": "E. coli >100k UFC/mL",
          "detalle": "Intermedio: Amoxi-Clav, Cefadroxilo",
          "tono": "alert",
          "archivo": 32
        }
      ],
      "ecocardio_metricas": [
        {
          "t": "LVIDd",
          "v": "19.6 mm",
          "ref": "Diástole"
        },
        {
          "t": "LVIDs",
          "v": "12.3 mm",
          "ref": "Sístole"
        },
        {
          "t": "AI/Ao",
          "v": "1.49",
          "ref": "Normal <1.6"
        },
        {
          "t": "EF Teicholz",
          "v": "70.2%",
          "ref": "Normal >50%"
        },
        {
          "t": "FS",
          "v": "37.1%",
          "ref": "Normal 25-45%"
        },
        {
          "t": "E/A mitral",
          "v": "1.47",
          "ref": "Diast. normal"
        }
      ],
      "ecocardiografias": [
        {
          "fecha": "31 ago 2022",
          "titulo": "Ecocardiografía + ECG",
          "texto": "Sin alteraciones cardiológicas. Ritmo sinusal regular. FC 133 lpm. FA 40.96%",
          "tono": "ok",
          "archivo": 2
        },
        {
          "fecha": "15 may 2025",
          "titulo": "Ecocardiografía + ECG",
          "texto": "Diagnóstico EDMVM ACVIM B1 (degeneración mixomatosa válvula mitral, regurgitación discreta)",
          "tono": "watch",
          "archivo": 27
        },
        {
          "fecha": "11 feb 2026",
          "titulo": "Ecocardiograma + ECG",
          "texto": "ACVIM B1 sin cambios. Regurgitación mitral leve. Score MINE 4 (leve). Ritmo sinusal con arritmia respiratoria fisiológica. FC 66-166 lpm",
          "tono": "ok",
          "archivo": 36
        }
      ],
      "proteina_orina": {
        "valor": "12.9 mg/dL",
        "detalle": "Elevado ≤10 · Ene 2026"
      },
      "tratamiento": {
        "titulo": "Hepatocan Forte",
        "texto": "Hepatoprotector indicado por endocrinología tras el control de agosto 2026, por un mes. El examen del 2 oct 2026 fue el control posterior.",
        "nuevo": true
      },
      "ggt": {
        "nombre": "GGT",
        "valor": 4.9,
        "unidad": "UI/L",
        "rango": [
          2,
          10
        ],
        "fecha": "2026-10-02",
        "archivo": 45
      }
    },
    "hitos": [
      {
        "fecha": "2024-05-27",
        "texto": "Crisis renal",
        "organos": [
          "rinones",
          "higado",
          "orina",
          "pancreas",
          "electrolitos",
          "sangre"
        ]
      },
      {
        "fecha": "2026-08-05",
        "texto": "Inicio Hepatocan Forte",
        "detalle": "Indicado por endocrinología después del control del 5 ago 2026.",
        "organos": [
          "higado"
        ]
      }
    ],
    "imagenes": {
      "estudios": [
        {
          "fecha": "2 ene 2024",
          "titulo": "Ecografía abdominal",
          "texto": "Riñones con ecoarquitectura conservada y tamaño normal. Páncreas isoecoico. Componente mucoso gástrico levemente engrosado. Gastritis y colitis leve.",
          "etiqueta": "Inicio seguimiento",
          "tono": "ok",
          "archivos": [
            4
          ],
          "organos": [
            "rinones",
            "pancreas"
          ]
        },
        {
          "fecha": "18 may 2024",
          "titulo": "Ecografía abdominal · crisis renal aguda",
          "texto": "R. derecho: corteza hiperecoica, diferenciación corticomedular disminuida. R. izquierdo: masa polo craneal 5.6×5.8 mm con halo anecoico. Esplenomegalia. Nefropatía bilateral aguda.",
          "etiqueta": "Crisis renal AKI",
          "tono": "alert",
          "archivos": [
            9
          ],
          "organos": [
            "rinones"
          ]
        },
        {
          "fecha": "10 jul 2024",
          "titulo": "Ecografía abdominal · control",
          "texto": "Riñones: forma, posición y ecogenicidad conservados. R. derecho 27.7 mm, R. izquierdo 28.6 mm. Bazo, hígado y tracto GI conservados. Signo de leve inflamación intestinal.",
          "etiqueta": "Mejoría parcial",
          "tono": "watch",
          "archivos": [
            14
          ],
          "organos": [
            "rinones",
            "higado"
          ]
        },
        {
          "fecha": "5 jun 2025",
          "titulo": "Ecografía abdominal · control",
          "texto": "Nefropatía bilateral leve inflamatoria crónica. Pielectasia leve bilateral. Nefrolito izquierdo. Hepatomegalia leve con hepatopatía difusa moderada (vacuolar/esteroidal). Barro biliar leve a moderado.",
          "etiqueta": "ERC crónica establecida",
          "tono": "watch",
          "archivos": [
            24,
            25
          ],
          "organos": [
            "rinones",
            "higado"
          ]
        },
        {
          "fecha": "28 ene 2026",
          "titulo": "Ecografía abdominal · control",
          "texto": "R. izquierdo 3.23 cm con pielectasia leve (0.19 cm) y ≥3 nefrolitos (mayor 0.21 cm). R. derecho 2.60 cm reducido, bordes irregulares, pielectasia (0.11 cm) con microlitos. Hígado aumentado, hepatopatía vacuolar moderada. Barro biliar ocupando 2/3 de cavidad. Sin evolución negativa vs jun 2025.",
          "etiqueta": "Progresión renal vigilada",
          "tono": "watch",
          "archivos": [
            33,
            34
          ],
          "organos": [
            "rinones",
            "higado"
          ]
        },
        {
          "fecha": "22 may 2026",
          "titulo": "Radiografía abdominal (L-L y V-D)",
          "texto": "Sin cambios anatómicos ni patológicos. Hígado, riñones, estómago, yeyuno, colon y vejiga conservados. Control ERC etapa II.",
          "etiqueta": "Sin cambios patológicos",
          "tono": "ok",
          "archivos": [
            41,
            39,
            40
          ],
          "organos": [
            "rinones",
            "higado"
          ]
        }
      ],
      "definiciones": [
        {
          "t": "Ecografía abdominal",
          "d": "Usa ultrasonido para \"ver\" los órganos por dentro: riñones, hígado, páncreas, bazo, vejiga e intestinos. Permite medir tamaños, detectar cálculos (litos), inflamación, cambios de textura y masas. Es el examen que más información da sobre los órganos de Teodoro."
        },
        {
          "t": "Radiografía abdominal",
          "d": "Una imagen de rayos X que muestra la forma, tamaño y posición general de los órganos, y detecta cálculos o gas anormal. Es complementaria a la ecografía: aporta una visión de conjunto."
        },
        {
          "t": "Términos que aparecen seguido",
          "d": "<strong>Nefropatía:</strong> daño renal. <strong>Pielectasia:</strong> leve dilatación de la zona donde se recoge la orina en el riñón. <strong>Nefrolito / microlito:</strong> piedra o piedrita en el riñón. <strong>Hepatomegalia:</strong> hígado agrandado. <strong>Barro biliar:</strong> contenido espeso acumulado en la vesícula."
        }
      ],
      "conclusion": {
        "titulo": "Conclusión imágenes",
        "nivel": "watch",
        "parrafos": [
          "Las ecografías cuentan la historia completa: del riñón con una masa en plena crisis de 2024 se pasó a una enfermedad renal crónica estable, aunque con cálculos renales y leve dilatación que conviene seguir. Lo que más ha cambiado es el hígado y la vesícula (más graso, con barro biliar abundante), coherente con la ALT elevada de la pestaña de hígado. La radiografía de mayo 2026 no mostró nada nuevo ni alarmante, lo cual es tranquilizador."
        ]
      },
      "tiroides": {
        "fecha": "7 ago 2026",
        "archivos": [
          44
        ],
        "titulo": "Ecografía cervical (tiroides)",
        "texto": "<strong>Eco cervical (7 ago 2026):</strong> por la interconsulta con endocrinología se realizó la primera ecografía de tiroides. La glándula tiene <strong>tamaño/volumen conservado</strong> (volumen total 0.157 cc; referencia 1–7 kg: 0.05–0.15 cc) y muestra una <strong>leve hiperecogenicidad con márgenes algo menos definidos en el lóbulo derecho</strong>, interpretada como cambios inespecíficos / tiroiditis leve, sin lesiones focales ni aumento significativo de tamaño. La ecografista recomienda un control ecográfico según criterio clínico."
      }
    },
    "linea_tiempo": [
      {
        "cuando": "Ago 2022 · 2 años",
        "texto": "Evaluación cardiológica de rutina. Sin soplo. ECG normal.",
        "tono": "ok"
      },
      {
        "cuando": "Nov 2023 · 3 a 3 m",
        "texto": "Inicio síntomas GI. PLI 48 y SDMA 6 (normales). ALT 438.9 ↑↑, FA 231 ↑.",
        "tono": "watch"
      },
      {
        "cuando": "Ene 2024 · 3 a 5 m",
        "texto": "Ecografía: gastritis y colitis leve. ALT 216 ↑, AST 215 ↑↑, FA 435 ↑↑, Fósforo 10.3 ↑↑.",
        "tono": "watch"
      },
      {
        "cuando": "Feb 2024 · 3 a 6 m",
        "texto": "ALT 116.9 ↑, AST 268 ↑↑, Fósforo 10.5 ↑↑, Hematocrito 62 ↑.",
        "tono": "watch"
      },
      {
        "cuando": "May 2024 · 3 a 9 m",
        "texto": "CRISIS: SDMA 33→40 ↑↑, Creatinina 4.0 ↑↑, NUS 122 ↑↑, ALT 542 ↑↑. Nefropatía bilateral aguda con masa renal izquierda. Esplenomegalia. IRIS AKI grado II. UPC 1.55.",
        "tono": "alert"
      },
      {
        "cuando": "Jun–Ago 2024 · 4 años",
        "texto": "Creatinina baja a 2.0→1.6, SDMA 20→25. Transición a CKD. FA pico 669 ↑↑. UPC mejora a 0.42. TLI >50 ↑. IRIS CKD etapa 2.",
        "tono": "watch"
      },
      {
        "cuando": "Dic 2024 · 4 a 4 m",
        "texto": "SDMA 24, Creatinina 1.5, ALT 236 ↑, FA 263 ↑. UPC 0.30. IRIS CKD etapa 2.",
        "tono": "watch"
      },
      {
        "cuando": "May 2025 · 4 a 9 m",
        "texto": "Diagnóstico cardíaco EDMVM ACVIM B1 (valvulopatía mitral leve). Sin repercusión hemodinámica.",
        "tono": "watch"
      },
      {
        "cuando": "Jun 2025 · 4 a 10 m",
        "texto": "SDMA 14 (normal por 1ª vez), Creatinina 1.3. PLI pico 311 ↑↑ (pancreatitis activa). UPC sube a 0.58. Nefrolito izquierdo. IRIS CKD etapa 1.",
        "tono": "watch"
      },
      {
        "cuando": "Ago–Nov 2025 · 5 años",
        "texto": "ITU recurrente por E. coli (>100k UFC/mL) en 3 urocultivos. Creatinina 1.0, SDMA 11 (mejor valor renal). UPC 0.19. ALT 302 ↑, FA 594 ↑↑.",
        "tono": "alert"
      },
      {
        "cuando": "Ene 2026 · 5 a 5 m",
        "texto": "SDMA 14 (vuelve al límite). UPC 0.12 (normal), sin proteinuria. ALT 311 ↑↑, FA 213 ↑, Calcio 8.4 ↓. PLI 197. Ecografía: progresión renal y barro biliar 2/3.",
        "tono": "watch"
      },
      {
        "cuando": "Feb 2026 · 5 a 5 m",
        "texto": "Ecocardiograma ACVIM B1 sin cambios. ECG normal. Normotenso. ERC IRIS 1-2.",
        "tono": "ok"
      },
      {
        "cuando": "May 2026 · 5 a 9 m",
        "texto": "Radiografía abdominal: sin cambios anatómicos ni patológicos.",
        "tono": "ok"
      },
      {
        "cuando": "May 2026 · 5 a 9 m",
        "texto": "Perfil tiroideo y electrolitos (pedido por nefrólogo). T4 3.97 ↑ bajo el límite nuevo del laboratorio (3,5), TSH 0.18 normal → sin hipotiroidismo. Na 150.7, K 5.6, Cl 114 en el límite alto, compatible con deshidratación leve.",
        "tono": "watch"
      },
      {
        "cuando": "Ago 2026 · 5 a 11 m",
        "texto": "Interconsulta con endocrinología (derivada por el nefrólogo). T4 baja a 2.77 (de vuelta en rango 1,3–3,5), TSH 0.23 normal. Eco cervical: tiroides de volumen conservado (0.157 cc) con leve hiperecogenicidad del lóbulo derecho (tiroiditis leve / cambios inespecíficos). Hígado: ALT 388 ↑↑, FA 273 ↑, AST 61.7 ↑. Renal: Creatinina 1.4, NUS 26.9, Fósforo 2.8 ↓. Calcio 8.8 ↓ y Glucosa 65 ↓ (leves).",
        "tono": "watch"
      },
      {
        "cuando": "Oct 2026 · 6 a 1 m",
        "texto": "Control tras 1 mes de Hepatocan Forte (indicado por endocrinología). Perfil bioquímico. Hígado: ALT 252 ↑ (baja desde 388), FA 183 ↑, AST 46.5 ↑, GGT 4.9. Renal: Creatinina 1.5, NUS 24.4, Fósforo 2.9 (límite inferior). Calcio 9.3 (vuelve a rango). Glucosa 61 ↓ (muestra sin fluoruro).",
        "tono": "watch"
      }
    ],
    "tendencias": [
      {
        "t": "SDMA",
        "v": "↓ Controlado",
        "d": "40 → 14",
        "tono": "ok"
      },
      {
        "t": "Creatinina",
        "v": "↓ Mejoró",
        "d": "4.0 → 1.5 (oct 26)",
        "tono": "ok"
      },
      {
        "t": "UPC",
        "v": "↓ Mejoró",
        "d": "1.55 → 0.12",
        "tono": "ok"
      },
      {
        "t": "ALT",
        "v": "↓ Bajó, sigue alta",
        "d": "388 → 252 (oct 26)",
        "tono": "watch"
      },
      {
        "t": "PLI",
        "v": "→ Persistente",
        "d": "Pancreatitis activa",
        "tono": "watch"
      },
      {
        "t": "ITU E. coli",
        "v": "⚠ Recurrente",
        "d": "3 episodios 2025",
        "tono": "alert"
      },
      {
        "t": "T4 total",
        "v": "↓ Volvió a rango",
        "d": "3.97 → 2.77 (ago 26)",
        "tono": "ok"
      }
    ]
  },
  "archivos": [
    {"id": 45, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "2 oct 2026", "codes": "Perfil Bioquímico", "pages": 1, "embedded": true, "images": ["archivos/45_01.webp"]},
    {"id": 44, "cat": "eco", "catLabel": "Informe ecográfico cervical (tiroides)", "icon": "📡", "color": "#60a5fa", "dateLabel": "7 ago 2026", "codes": "Descripción y conclusiones", "pages": 2, "embedded": true, "images": ["archivos/44_01.webp", "archivos/44_02.webp"]},
    {"id": 43, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "5 ago 2026", "codes": "Perfil Bioquímico · TSH · T4 Total", "pages": 2, "embedded": true, "images": ["archivos/43_01.webp", "archivos/43_02.webp"]},
    {"id": 42, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "30 may 2026", "codes": "Electrolitos · TSH · T4 Total", "pages": 2, "embedded": true, "images": ["archivos/42_01.webp", "archivos/42_02.webp"]},
    {"id": 41, "cat": "rx", "catLabel": "Informe radiográfico", "icon": "🩻", "color": "#fb923c", "dateLabel": "22 may 2026", "codes": "Lectura radiográfica", "pages": 1, "embedded": true, "images": ["archivos/41_01.webp"]},
    {"id": 40, "cat": "rx", "catLabel": "Radiografía abdominal", "icon": "🩻", "color": "#fb923c", "dateLabel": "22 may 2026", "codes": "Vista ventrodorsal (VD)", "pages": 1, "embedded": true, "images": ["archivos/40_01.webp"]},
    {"id": 39, "cat": "rx", "catLabel": "Radiografía abdominal", "icon": "🩻", "color": "#fb923c", "dateLabel": "22 may 2026", "codes": "Vista lateral", "pages": 1, "embedded": true, "images": ["archivos/39_01.webp"]},
    {"id": 38, "cat": "cardio", "catLabel": "Electrocardiograma (ECG)", "icon": "❤️", "color": "#a78bfa", "dateLabel": "11 feb 2026", "codes": "Trazado y lectura", "pages": 5, "embedded": true, "images": ["archivos/38_01.webp", "archivos/38_02.webp", "archivos/38_03.webp", "archivos/38_04.webp", "archivos/38_05.webp"]},
    {"id": 37, "cat": "cardio", "catLabel": "Informe cardiológico", "icon": "❤️", "color": "#a78bfa", "dateLabel": "11 feb 2026", "codes": "Informe del estudio", "pages": 5, "embedded": true, "images": ["archivos/37_01.webp", "archivos/37_02.webp", "archivos/37_03.webp", "archivos/37_04.webp", "archivos/37_05.webp"]},
    {"id": 36, "cat": "cardio", "catLabel": "Ecocardiografía", "icon": "❤️", "color": "#a78bfa", "dateLabel": "11 feb 2026", "codes": "Eco-Doppler cardíaco", "pages": 2, "embedded": true, "images": ["archivos/36_01.webp", "archivos/36_02.webp"]},
    {"id": 35, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "29 ene 2026", "codes": "Hemograma · Perfil Bioquímico · Perfil Lipídico · SDMA · Electrolitos · PLI · TSH · T4 Total · Urianálisis · Urocultivo", "pages": 8, "embedded": true, "images": ["archivos/35_01.webp", "archivos/35_02.webp", "archivos/35_03.webp", "archivos/35_04.webp", "archivos/35_05.webp", "archivos/35_06.webp", "archivos/35_07.webp", "archivos/35_08.webp"]},
    {"id": 34, "cat": "eco", "catLabel": "Ecografía abdominal", "icon": "📡", "color": "#60a5fa", "dateLabel": "28 ene 2026", "codes": "Estudio de imágenes", "pages": 3, "embedded": true, "images": ["archivos/34_01.webp", "archivos/34_02.webp", "archivos/34_03.webp"]},
    {"id": 33, "cat": "eco", "catLabel": "Informe ecográfico abdominal", "icon": "📡", "color": "#60a5fa", "dateLabel": "28 ene 2026", "codes": "Descripción y conclusiones", "pages": 1, "embedded": true, "images": ["archivos/33_01.webp"]},
    {"id": 32, "cat": "orina", "catLabel": "Urocultivo", "icon": "🧫", "color": "#fcd34d", "dateLabel": "12 nov 2025", "codes": "Urocultivo con antibiograma", "pages": 1, "embedded": true, "images": ["archivos/32_01.webp"]},
    {"id": 31, "cat": "orina", "catLabel": "Urocultivo", "icon": "🧫", "color": "#fcd34d", "dateLabel": "15 sep 2025", "codes": "Urocultivo con antibiograma", "pages": 1, "embedded": true, "images": ["archivos/31_01.webp"]},
    {"id": 30, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "1 sep 2025", "codes": "Hemograma · Perfil Bioquímico · SDMA · PLI", "pages": 3, "embedded": true, "images": ["archivos/30_01.webp", "archivos/30_02.webp", "archivos/30_03.webp"]},
    {"id": 29, "cat": "orina", "catLabel": "Orina", "icon": "💧", "color": "#fbbf24", "dateLabel": "29 ago 2025", "codes": "Urianálisis · Urocultivo", "pages": 3, "embedded": true, "images": ["archivos/29_01.webp", "archivos/29_02.webp", "archivos/29_03.webp"]},
    {"id": 28, "cat": "renal", "catLabel": "Informe renal", "icon": "🫘", "color": "#2dd4bf", "dateLabel": "19 jun 2025", "codes": "Informe renal de seguimiento", "pages": 2, "embedded": true, "images": ["archivos/28_01.webp", "archivos/28_02.webp"]},
    {"id": 25, "cat": "eco", "catLabel": "Ecografía abdominal", "icon": "📡", "color": "#60a5fa", "dateLabel": "5 jun 2025", "codes": "Estudio de imágenes", "pages": 3, "embedded": true, "images": ["archivos/25_01.webp", "archivos/25_02.webp", "archivos/25_03.webp"]},
    {"id": 24, "cat": "eco", "catLabel": "Informe ecográfico abdominal", "icon": "📡", "color": "#60a5fa", "dateLabel": "5 jun 2025", "codes": "Descripción y conclusiones", "pages": 1, "embedded": true, "images": ["archivos/24_01.webp"]},
    {"id": 23, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "5 jun 2025", "codes": "Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · TSH · T4 Total · Urianálisis · Urocultivo", "pages": 6, "embedded": true, "images": ["archivos/23_01.webp", "archivos/23_02.webp", "archivos/23_03.webp", "archivos/23_04.webp", "archivos/23_05.webp", "archivos/23_06.webp"]},
    {"id": 27, "cat": "cardio", "catLabel": "Ecocardiografía", "icon": "❤️", "color": "#a78bfa", "dateLabel": "15 may 2025", "codes": "Eco-Doppler cardíaco", "pages": 6, "embedded": true, "images": ["archivos/27_01.webp", "archivos/27_02.webp", "archivos/27_03.webp", "archivos/27_04.webp", "archivos/27_05.webp", "archivos/27_06.webp"]},
    {"id": 26, "cat": "cardio", "catLabel": "Electrocardiograma (ECG)", "icon": "❤️", "color": "#a78bfa", "dateLabel": "15 may 2025", "codes": "Trazado y lectura", "pages": 3, "embedded": true, "images": ["archivos/26_01.webp", "archivos/26_02.webp", "archivos/26_03.webp"]},
    {"id": 22, "cat": "renal", "catLabel": "Informe renal", "icon": "🫘", "color": "#2dd4bf", "dateLabel": "7 ene 2025", "codes": "Informe renal de seguimiento", "pages": 2, "embedded": true, "images": ["archivos/22_01.webp", "archivos/22_02.webp"]},
    {"id": 21, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "28 dic 2024", "codes": "Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · TLI Canino · Urianálisis · Urocultivo", "pages": 6, "embedded": true, "images": ["archivos/21_01.webp", "archivos/21_02.webp", "archivos/21_03.webp", "archivos/21_04.webp", "archivos/21_05.webp", "archivos/21_06.webp"]},
    {"id": 20, "cat": "renal", "catLabel": "Informe renal", "icon": "🫘", "color": "#2dd4bf", "dateLabel": "9 sep 2024", "codes": "Informe renal de seguimiento", "pages": 2, "embedded": true, "images": ["archivos/20_01.webp", "archivos/20_02.webp"]},
    {"id": 19, "cat": "resumen", "catLabel": "Resumen de exámenes", "icon": "📋", "color": "#9aa0aa", "dateLabel": "31 ago 2024", "codes": "Tablas resumen · May–Ago 2024", "pages": 3, "embedded": true, "images": ["archivos/19_01.webp", "archivos/19_02.webp", "archivos/19_03.webp"]},
    {"id": 18, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "30 ago 2024", "codes": "Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · TLI Canino · Urianálisis · Urocultivo", "pages": 6, "embedded": true, "images": ["archivos/18_01.webp", "archivos/18_02.webp", "archivos/18_03.webp", "archivos/18_04.webp", "archivos/18_05.webp", "archivos/18_06.webp"]},
    {"id": 17, "cat": "renal", "catLabel": "Informe renal", "icon": "🫘", "color": "#2dd4bf", "dateLabel": "19 jul 2024", "codes": "Informe renal de seguimiento", "pages": 2, "embedded": true, "images": ["archivos/17_01.webp", "archivos/17_02.webp"]},
    {"id": 16, "cat": "orina", "catLabel": "Orina", "icon": "💧", "color": "#fbbf24", "dateLabel": "11 jul 2024", "codes": "Urianálisis · Urocultivo", "pages": 3, "embedded": true, "images": ["archivos/16_01.webp", "archivos/16_02.webp", "archivos/16_03.webp"]},
    {"id": 15, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "11 jul 2024", "codes": "Hemograma · Perfil Bioquímico · SDMA · PLI · TLI Canino", "pages": 2, "embedded": true, "images": ["archivos/15_01.webp", "archivos/15_02.webp"]},
    {"id": 14, "cat": "eco", "catLabel": "Informe ecográfico abdominal", "icon": "📡", "color": "#60a5fa", "dateLabel": "10 jul 2024", "codes": "Descripción y conclusiones", "pages": 26, "embedded": true, "images": ["archivos/14_01.webp", "archivos/14_02.webp", "archivos/14_03.webp", "archivos/14_04.webp", "archivos/14_05.webp", "archivos/14_06.webp", "archivos/14_07.webp", "archivos/14_08.webp", "archivos/14_09.webp", "archivos/14_10.webp", "archivos/14_11.webp", "archivos/14_12.webp", "archivos/14_13.webp", "archivos/14_14.webp", "archivos/14_15.webp", "archivos/14_16.webp", "archivos/14_17.webp", "archivos/14_18.webp", "archivos/14_19.webp", "archivos/14_20.webp", "archivos/14_21.webp", "archivos/14_22.webp", "archivos/14_23.webp", "archivos/14_24.webp", "archivos/14_25.webp", "archivos/14_26.webp"]},
    {"id": 13, "cat": "rx", "catLabel": "Radiografías laterales", "icon": "🩻", "color": "#fb923c", "dateLabel": "3 jun 2024", "codes": "Imágenes radiográficas", "pages": 2, "embedded": true, "images": ["archivos/13_01.webp", "archivos/13_02.webp"]},
    {"id": 12, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "3 jun 2024", "codes": "Electrolitos · PLI · TLI Canino · Fructosamina · Urianálisis · Urocultivo", "pages": 4, "embedded": true, "images": ["archivos/12_01.webp", "archivos/12_02.webp", "archivos/12_03.webp", "archivos/12_04.webp"]},
    {"id": 11, "cat": "renal", "catLabel": "Informe renal", "icon": "🫘", "color": "#2dd4bf", "dateLabel": "27 may 2024", "codes": "Informe renal de seguimiento", "pages": 2, "embedded": true, "images": ["archivos/11_01.webp", "archivos/11_02.webp"]},
    {"id": 10, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "24 may 2024", "codes": "Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · Urianálisis", "pages": 4, "embedded": true, "images": ["archivos/10_01.webp", "archivos/10_02.webp", "archivos/10_03.webp", "archivos/10_04.webp"]},
    {"id": 9, "cat": "eco", "catLabel": "Ecografía abdominal", "icon": "📡", "color": "#60a5fa", "dateLabel": "18 may 2024", "codes": "Estudio de imágenes", "pages": 24, "embedded": true, "images": ["archivos/09_01.webp", "archivos/09_02.webp", "archivos/09_03.webp", "archivos/09_04.webp", "archivos/09_05.webp", "archivos/09_06.webp", "archivos/09_07.webp", "archivos/09_08.webp", "archivos/09_09.webp", "archivos/09_10.webp", "archivos/09_11.webp", "archivos/09_12.webp", "archivos/09_13.webp", "archivos/09_14.webp", "archivos/09_15.webp", "archivos/09_16.webp", "archivos/09_17.webp", "archivos/09_18.webp", "archivos/09_19.webp", "archivos/09_20.webp", "archivos/09_21.webp", "archivos/09_22.webp", "archivos/09_23.webp", "archivos/09_24.webp"]},
    {"id": 8, "cat": "orina", "catLabel": "Orina", "icon": "💧", "color": "#fbbf24", "dateLabel": "18 may 2024", "codes": "Urianálisis · Urocultivo", "pages": 3, "embedded": true, "images": ["archivos/08_01.webp", "archivos/08_02.webp", "archivos/08_03.webp"]},
    {"id": 7, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "14 may 2024", "codes": "Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI", "pages": 4, "embedded": true, "images": ["archivos/07_01.webp", "archivos/07_02.webp", "archivos/07_03.webp", "archivos/07_04.webp"]},
    {"id": 6, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "7 feb 2024", "codes": "Hemograma · Perfil Bioquímico", "pages": 2, "embedded": true, "images": ["archivos/06_01.webp", "archivos/06_02.webp"]},
    {"id": 5, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "3 ene 2024", "codes": "Hemograma · Perfil Bioquímico · TLI Canino · TSH · T4 Total", "pages": 3, "embedded": true, "images": ["archivos/05_01.webp", "archivos/05_02.webp", "archivos/05_03.webp"]},
    {"id": 4, "cat": "eco", "catLabel": "Ecografía abdominal", "icon": "📡", "color": "#60a5fa", "dateLabel": "2 ene 2024", "codes": "Estudio de imágenes", "pages": 14, "embedded": true, "images": ["archivos/04_01.webp", "archivos/04_02.webp", "archivos/04_03.webp", "archivos/04_04.webp", "archivos/04_05.webp", "archivos/04_06.webp", "archivos/04_07.webp", "archivos/04_08.webp", "archivos/04_09.webp", "archivos/04_10.webp", "archivos/04_11.webp", "archivos/04_12.webp", "archivos/04_13.webp", "archivos/04_14.webp"]},
    {"id": 3, "cat": "sangre", "catLabel": "Sangre / Bioquímica", "icon": "🩸", "color": "#f87171", "dateLabel": "8 nov 2023", "codes": "Hemograma · Perfil Bioquímico · SDMA · Electrolitos · PLI · Parvovirus", "pages": 4, "embedded": true, "images": ["archivos/03_01.webp", "archivos/03_02.webp", "archivos/03_03.webp", "archivos/03_04.webp"]},
    {"id": 2, "cat": "cardio", "catLabel": "Evaluación cardiológica", "icon": "❤️", "color": "#a78bfa", "dateLabel": "31 ago 2022", "codes": "Evaluación clínica", "pages": 2, "embedded": true, "images": ["archivos/02_01.webp", "archivos/02_02.webp"]},
    {"id": 1, "cat": "cardio", "catLabel": "Electrocardiograma (ECG)", "icon": "❤️", "color": "#a78bfa", "dateLabel": "31 ago 2022", "codes": "Trazado y lectura", "pages": 1, "embedded": true, "images": ["archivos/01_01.webp"]}
  ]
};
