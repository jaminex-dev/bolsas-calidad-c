# Bolsas de Calidad - Documentación y Estado de Cumplimiento

📋 Nuevas Correcciones y Requerimientos

**Cumplido:** El formulario ha sido actualizado a la nueva estructura.

📝 5. Estructura del Formulario

┌─────────────────────────────────────────────────────────┐
│  🧪 Restricciones Sticker Calidad                       │
├─────────────────────────────────────────────────────────┤
│ 🏢 Empresa               [Tabla: Proveedores   ▼]      │
│ 🏭 Centro Despacho       [Tabla: destino       ▼]      │
│ 📦 Producto              [Tabla: Productos     ▼]      │
│ ↔️ Tipo Movimiento       [DESPACHO/RECEPCIÓN   ▼]      │
│                                                         │
│ ┌─ SI DESPACHO ─────────────────────────────────────┐   │
│ │ 🎯 Tipo Destino        [Tabla: clase          ▼] │   │
│ │ 📍 Destino             [Dinámico por idClase  ▼] │    │
│ └─────────────────────────────────────────────────┘    │
│                                                        │
│ ┌─ SI RECEPCIÓN ────────────────────────────────────┐  │
│ │ 📍 Origen              [Tabla: origenes       ▼] │    │
│ └─────────────────────────────────────────────────┘    │
│                                                        │
│ 📦 Bolsas de Calidad     [____] (Máx 6)                │
│ ☑️ Aplica Orden de Muestreo en Puerto                  │
│                                                         │
│ [💾 Guardar]                      [🧹 Limpiar]         │
└─────────────────────────────────────────────────────────┘


✅ **Cumplido:** El formulario ha sido actualizado según los cambios principales requeridos:

- **Empresa:** Fuente de datos: Proveedores
- **Centro Despacho:** Fuente de datos: destino
- **Producto:** Fuente de datos: Productos
- **Tipo Movimiento:** Sin cambios (DESPACHO/RECEPCIÓN)
- **Tipo Destino:** Solo visible si Movimiento = DESPACHO (Fuente de datos: clase)
- **Destino:** Solo visible si Movimiento = DESPACHO, carga dinámica basada en Tipo Destino (tabla destino filtrada por idClase)
- **Origen:** Solo visible si Movimiento = RECEPCIÓN (Fuente de datos: origenes)

**Lógica condicional implementada:**
- Al seleccionar **DESPACHO**:
    - Se muestran los campos "Tipo Destino" y "Destino"
    - Se oculta el campo "Origen"
- Al seleccionar **RECEPCIÓN**:
    - Se muestra el campo "Origen"
    - Se ocultan los campos "Tipo Destino" y "Destino"

**Validaciones:**
- Todos los campos visibles son obligatorios
- La carga de "Destino" es dinámica según "Tipo Destino"
- Se mantiene la validación de bolsas (1-6)


✅ **Cumplido:** La vista de tabla principal ha sido actualizada a la nueva estructura requerida.

📊 6. Vista de Tabla Principal

┌─────────────┬─────────────────┬──────────┬─────────────┬──────────────┬──────────────┬──────────────┬────────┬────────┬──────────┬─────────────┬──────────┐
│   Empresa   │ Centro Despacho │ Producto │ Movimiento  │ Tipo Destino │ Destino      │ Origen       │ Bolsas │ Viajes │ Análisis │ Orden Puerto│ Acciones │
├─────────────┼─────────────────┼──────────┼─────────────┼──────────────┼──────────────┼──────────────┼────────┼────────┼──────────┼─────────────┼──────────┤
│ PROVEEDOR A │ BUENAVENTURA    │ CARBÓN   │ DESPACHO    │ PUERTO       │ SANTA MARTA  │ -            │   3    │   1    │ TIPO-A   │ SI APLICA   │ ✏️ 🗑️   │
│ PROVEEDOR B │ CARTAGENA       │ COQUE    │ RECEPCIÓN   │ -            │ -            │ MINA-CERREJÓN│   2    │   2    │ TIPO-B   │ NO APLICA   │ ✏️ 🗑️   │
│ PROVEEDOR C │ BARRANQUILLA    │ HIERRO   │ DESPACHO    │ EXPORTACIÓN  │ DUBAI        │ -            │   4    │   2    │ TIPO-C   │ SI APLICA   │ ✏️ 🗑️   │
└─────────────┴─────────────────┴──────────┴─────────────┴──────────────┴──────────────┴──────────────┴────────┴────────┴──────────┴─────────────┴──────────┘

✅ **Cumplido:** Los cambios principales requeridos han sido implementados:

- **Centro Despacho:** Ahora se carga correctamente desde la tabla `destino`.
- **Tipo Destino:** Solo visible cuando el movimiento es **DESPACHO**, cargado desde la tabla `clase`.
- **Destino/Origen:** Lógica condicional aplicada:
    - Si el movimiento es **DESPACHO**, se muestra el campo **Destino** (tabla `destino`).
    - Si el movimiento es **RECEPCIÓN**, se muestra el campo **Origen** (tabla `origenes`).

**Lógica condicional de visualización:**
- La columna **Tipo Destino** solo se muestra cuando el movimiento es **DESPACHO**; en caso contrario, se muestra "-".
- La columna **Destino/Origen** muestra el **Destino** si el movimiento es **DESPACHO** y el **Origen** si es **RECEPCIÓN**.


## 📁 Estructura del Proyecto

```
bolsas-calidad/
├── css/
│   └── style.css
├── controllers/
│   └── controlador.js
├── models/
├── views/
│   └── index.php
└── README.md
```

---

## Descripción Detallada de Cada Componente

### 1. `views/index.php`
Interfaz principal del sistema. Permite:
- Visualizar, crear, editar y eliminar configuraciones de "Bolsas de Calidad".
- Mostrar formularios para ingresar datos de empresa, centro, producto, tipo de movimiento, tipo de origen, número de bolsas, orígenes, viajes por bolsa y tipo de análisis.
- Utiliza DataTables para mostrar y filtrar las configuraciones existentes.
- Integra SweetAlert2 para validaciones y confirmaciones visuales.
- Importa el CSS desde `css/style.css` y el JS desde `controllers/controlador.js`.

### 2. `css/style.css`
- Contiene todos los estilos personalizados para la interfaz.
- Incluye estilos para formularios, botones, tarjetas, DataTables y personalización de SweetAlert2.
- Permite mantener la separación de estilos respecto a la lógica y la estructura HTML.

### 3. `controllers/controlador.js`
- Controla toda la lógica de interacción de la interfaz.
- Inicializa y gestiona la tabla de configuraciones con DataTables.
- Implementa filtros personalizados para la columna "Orden Puerto" y búsqueda global.
- Maneja la validación de formularios (crear y editar) usando SweetAlert2.
- Realiza peticiones AJAX para cargar, crear, editar y eliminar configuraciones.
- Genera dinámicamente los formularios y tarjetas de "Viajes por Bolsa" y "Tipo de Análisis".
- Gestiona la recarga de datos y la actualización visual tras cada operación.

### 4. `models/`
- (Carpeta en desarrollo).

---

## 📋 Estado de Cumplimiento de Correcciones Requeridas

### 1. Separación de Archivos CSS
✅ Cumplido. El CSS está en `css/style.css` y se importa en `index.php`.

### 2. Reorganización de Archivos JavaScript
✅ Cumplido. El JS principal está en `controllers/controlador.js` (no existe carpeta `public`).

### 3. Eliminación de Archivos No Necesarios
✅ Cumplido. No se utiliza `autoload.php` y se usa la estructura del proyecto del repo `conexion.php` ya creados para las conexiones "estructura-servidor/servicios".

### 4. Separación de Lógica de API en Servicios
⚠️ No aplica en esta documentación, ya que la carpeta `servicios/` no se detalla aquí según tu instrucción.

### 5. Modificación de Base de Datos
✅ Cumplido. El campo `id` en la tabla `BolsasCalidadDetalle` debe ser `uniqueidentifier` (según la convención y documentación del proyecto).

### 6. Compatibilidad con PHP 5.6.31
✅ Cumplido. El código PHP (en la vista y lógica principal) evita el uso de operadores y sintaxis de PHP 7+.

### 7. Manejo de Ramas
✅ Cumplido. Se cambió el nombre de la rama de "Qa" a "qa" y se creó la rama api para separar la lógica del frontend y backend.

### 8. Uso de uniqueidentifier
✅ Cumplido. Se implementó el uso de `uniqueidentifier` para todos los IDs en la tabla `BolsasCalidadDetalle` según lo requerido.

---




