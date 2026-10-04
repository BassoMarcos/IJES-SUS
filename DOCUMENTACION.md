# Finanzas IJES — Documentación de la app

App web de gestión financiera de la Iglesia IJES. Un solo archivo HTML, alojado en
GitHub Pages, con datos sincronizados en la nube (JSONBin).

**Link en vivo:** https://bassomarcos.github.io/IJES-SUS/
**Repositorio:** https://github.com/BassoMarcos/IJES-SUS

---

## 1. Qué hace

La app tiene una **pantalla de inicio** con dos accesos protegidos por contraseña:

1. **IJES Suscriptores** — la caja de aportes de los colaboradores (lo que ya existía).
2. **Administración General** — las finanzas de toda la iglesia (ingresos, egresos, fondos).

Cada sección guarda sus movimientos por separado, pero ambas se sincronizan en la nube,
así se ven iguales desde cualquier dispositivo (PC, celu).

---

## 2. Contraseñas

Definidas en el código, al principio del `<script>` principal, en el objeto `PASS`:

```js
var PASS = {
  subs:  "ijes2024",      // IJES Suscriptores
  admin: "admin2024"      // Administración General
};
```

**Para cambiarlas:** editar esos valores. (Nota de seguridad: el repo es público, así que
las contraseñas son visibles en el código fuente. Sirven para separar secciones entre
usuarios comunes, NO son seguridad fuerte. Para eso haría falta un servidor con login real.)

---

## 3. Secciones

### 3.1 IJES Suscriptores
Igual que la versión anterior. Cada movimiento tiene:
- `fecha` (ISO: `2026-08-01T00:00`)
- `detalle` (nombre de la persona o concepto)
- `monto` (número; negativo = salida)
- `tipo` — `aporte` | `interes` | `salida`

Tiles: Aportes, Intereses, Salidas. Saldo total arriba.

### 3.2 Administración General
Tiene 4 pestañas:
- **Resumen** — saldo general + saldo de cada fondo.
- **Ingresos** — lista de ingresos (diezmos, ofrendas, etc.).
- **Egresos** — lista de gastos por categoría.
- **Fondos** — tarjetas con el saldo de cada caja/fondo.

Cada movimiento de administración tiene:
- `fecha`
- `detalle` (nota libre)
- `monto` (negativo = egreso)
- `tipo` — `ingreso` | `egreso`
- `categoria` — ver listas abajo
- `fondo` — a qué caja pertenece

**Fondos** (editable en el código, array `FONDOS`):
General, Construcción, Misiones, Ayuda social, Caja chica.

**Categorías de ingresos** (`CAT_ING`):
Diezmos, Ofrendas, Donaciones, Eventos, Otros ingresos.

**Categorías de egresos** (`CAT_EGR`):
Servicios, Edificio, Sueldos/Honorarios, Materiales, Ayuda social, Eventos, Otros gastos.

---

## 4. Dónde viven los datos

- **En la nube:** JSONBin, un único "bin" (cajita) con este formato:
  ```json
  { "subs": [ ...movimientos... ], "admin": [ ...movimientos... ] }
  ```
- **Bin ID:** `6abfff09ac6210605a0d7ea5`
- **Config en el código:** variables `BIN_ID` y `BIN_KEY` al inicio del script.
- **Respaldo local:** también se guarda en `localStorage` (clave `ijes_data`) por si no hay internet.

### Sincronización
- Al entrar a una sección → baja lo último de la nube.
- Al modificar → sube a la nube (con medio segundo de agrupación).
- Cada 20 segundos con la app abierta → refresca solo.
- Al volver a la app (cambio de pestaña/segundo plano) → refresca.
- **Sin internet → modo solo lectura** (no deja cargar/editar, para no pisar datos).

---

## 5. Funciones por sección

Ambas secciones comparten:
- **Buscador** y **filtro** (por tipo en subs, por fondo en admin).
- **Informes** — resumen del último mes + descarga PDF.
- **CSV** — exporta la sección activa a planilla.
- **Respaldo** — descarga un `.json` con AMBAS secciones (backup completo).
- **Importar** — carga un `.json` de respaldo.
- **Tema** claro/oscuro.
- **Salir** — vuelve al inicio (login).

---

## 6. Archivos del repositorio

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (HTML + CSS + JS, todo en uno) |
| `sw.js` | Service worker — permite uso sin internet (cachea la app) |
| `manifest.webmanifest` | Config para instalar como app en el celu (PWA) |
| `icon-192.png` / `icon-512.png` | Íconos de la app |
| `icon-maskable-512.png` | Ícono para Android (safe zone) |

---

## 7. Cosas a revisar / mejorar (pendientes)

- [ ] Confirmar contraseñas definitivas (ahora son provisorias: `ijes2024` / `admin2024`).
- [ ] Rotar la Master Key de JSONBin (quedó expuesta) o usar una Access Key limitada.
- [ ] Pestaña "Estado de cuotas por persona" en Suscriptores (quién está al día / debe).
- [ ] Revisar las categorías y fondos: sacar o agregar según lo que use la iglesia.
- [ ] Evaluar si el saldo de IJES Suscriptores debería volcar como un ingreso en Administración.
- [ ] Decidir si separar los datos de admin en otro bin distinto (hoy comparten uno).

---

## 8. Notas técnicas

- El código se genera desde `build_app.py` (en el entorno de trabajo), que arma el `index.html`
  reemplazando el logo, los datos semilla y la config. Para cambios grandes conviene editar
  el generador; para cambios chicos se puede editar el `index.html` directo.
- La app usa jsPDF (desde cdnjs) para los PDF. Todo lo demás es vanilla JS, sin frameworks.
- Formato de fechas: ISO en los datos, mostrado como `DD/MM/YYYY HH:MM`.
- Montos en pesos argentinos, formato `es-AR`.
