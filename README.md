Sistema de Báscula - Bolsas de Calidad
📋 Nuevas Correcciones y Requerimientos
🏢 1. Configuración de Empresa
Fuente de datos: Tabla Proveedores
Descripción: Las empresas se deben cargar desde la tabla de proveedores existente en la base de datos
🚛 2. Centro de Despacho
Fuente de datos: Tabla destino
Descripción: Los centros de despacho se obtienen de la tabla destino
📦 3. Producto
Fuente de datos: Tabla Productos
Descripción: Los productos disponibles se cargan desde la tabla de productos
🔄 4. Tipo de Movimiento
El sistema debe manejar dos tipos de movimiento principales:

4.1 Despacho
Cuando se selecciona "Despacho", se habilitan dos campos dependientes:

Campo 1: Tipo Destino

Fuente de datos: Tabla clase
Función: Campo selector principal que determina las opciones del segundo campo
Campo 2: Destino

Fuente de datos: Tabla destino
Relación: Se asocia con la tabla clase mediante idClase
Comportamiento: Se carga dinámicamente basado en la selección del Tipo Destino
4.2 Recepción
Cuando se selecciona "Recepción", se habilita un único campo:

Campo: Origen

Fuente de datos: Tabla origenes
Función: Carga todos los orígenes disponibles
📝 5. Estructura del Formulario
📋 Formulario Actual (Implementado)
┌─────────────────────────────────────────────────────────┐
│                  🧪 Restricciones Sticker Calidad        │
├─────────────────────────────────────────────────────────┤
│ 🏢 Empresa               [Seleccione...        ▼]      │
│ 🏭 Centro Despacho       [Seleccione...        ▼]      │
│ 📦 Producto              [Seleccione...        ▼]      │
│ ↔️ Tipo Movimiento       [DESPACHO/RECEPCIÓN   ▼]      │
│ 📍 Tipo Origen           [Seleccione...        ▼]      │
│ 📍 Orígenes              [Seleccione...        ▼]      │
│ 📦 Bolsas de Calidad     [____] (Máx 6)               │
│ ☑️ Aplica Orden de Muestreo en Puerto                  │
│                                                        │
│ [💾 Guardar]                      [🧹 Limpiar]        │
└─────────────────────────────────────────────────────────┘
🔄 Formulario Requerido (Nueva Estructura)
┌─────────────────────────────────────────────────────────┐
│                  🧪 Restricciones Sticker Calidad        │
├─────────────────────────────────────────────────────────┤
│ 🏢 Empresa               [Tabla: Proveedores   ▼]      │
│ 🏭 Centro Despacho       [Tabla: destino       ▼]      │
│ 📦 Producto              [Tabla: Productos     ▼]      │
│ ↔️ Tipo Movimiento       [DESPACHO/RECEPCIÓN   ▼]      │
│                                                        │
│ ┌─ SI DESPACHO ─────────────────────────────────────┐   │
│ │ 🎯 Tipo Destino        [Tabla: clase          ▼] │   │
│ │ 📍 Destino             [Dinámico por idClase  ▼] │   │
│ └─────────────────────────────────────────────────┘   │
│                                                        │
│ ┌─ SI RECEPCIÓN ────────────────────────────────────┐   │
│ │ 📍 Origen              [Tabla: origenes       ▼] │   │
│ └─────────────────────────────────────────────────┘   │
│                                                        │
│ 📦 Bolsas de Calidad     [____] (Máx 6)               │
│ ☑️ Aplica Orden de Muestreo en Puerto                  │
│                                                        │
│ [💾 Guardar]                      [🧹 Limpiar]        │
└─────────────────────────────────────────────────────────┘
🔍 Cambios Principales en Formulario:
Campo Actual	Campo Nuevo	Cambio Requerido
Empresa	Empresa	Fuente de datos: Proveedores
Centro Despacho	Centro Despacho	Fuente de datos: destino
Producto	Producto	Fuente de datos: Productos
Tipo Movimiento	Tipo Movimiento	Sin cambios (DESPACHO/RECEPCIÓN)
Tipo Origen	Tipo Destino	Solo visible si Movimiento = DESPACHO
Fuente de datos: clase
Orígenes	Destino	Solo visible si Movimiento = DESPACHO
Carga dinámica basada en Tipo Destino
Origen	Solo visible si Movimiento = RECEPCIÓN
Fuente de datos: origenes
📌 Lógica Condicional del Formulario:
Al seleccionar "DESPACHO":

✅ Mostrar campo "Tipo Destino" (tabla clase)
✅ Mostrar campo "Destino" (tabla destino filtrada por idClase)
❌ Ocultar campo "Origen"
Al seleccionar "RECEPCIÓN":

❌ Ocultar campo "Tipo Destino"
❌ Ocultar campo "Destino"
✅ Mostrar campo "Origen" (tabla origenes)
Validaciones requeridas:

Todos los campos visibles deben ser obligatorios
La carga de "Destino" debe ser dinámica según "Tipo Destino"
Mantener validación de bolsas (1-6)
📊 6. Vista de Tabla Principal
📋 Estructura Actual (Implementada)
┌─────────────┬────────┬──────────┬─────────────┬──────────────┬────────┬────────┬──────────┬─────────────┬──────────┐
│   Empresa   │ Centro │ Producto │ Movimiento  │ Tipo Origen  │ Bolsas │ Viajes │ Análisis │ Orden Puerto│ Acciones │
├─────────────┼────────┼──────────┼─────────────┼──────────────┼────────┼────────┼──────────┼─────────────┼──────────┤
│ PROVEEDOR A │ DEST-1 │ CARBÓN   │ DESPACHO    │ PUERTO       │   3    │   1    │ TIPO-A   │ SI APLICA   │ ✏️ 🗑️   │
│ PROVEEDOR B │ DEST-2 │ COQUE    │ RECEPCIÓN   │ MINA         │   2    │   2    │ TIPO-B   │ NO APLICA   │ ✏️ 🗑️   │
└─────────────┴────────┴──────────┴─────────────┴──────────────┴────────┴────────┴──────────┴─────────────┴──────────┘
🔄 Estructura Requerida (Nueva)
┌─────────────┬─────────────────┬──────────┬─────────────┬──────────────┬──────────────┬────────┬────────┬──────────┬─────────────┬──────────┐
│   Empresa   │ Centro Despacho │ Producto │ Movimiento  │ Tipo Destino │ Destino/     │ Bolsas │ Viajes │ Análisis │ Orden Puerto│ Acciones │
│             │                 │          │             │              │ Origen       │        │        │          │             │          │
├─────────────┼─────────────────┼──────────┼─────────────┼──────────────┼──────────────┼────────┼────────┼──────────┼─────────────┼──────────┤
│ PROVEEDOR A │ BUENAVENTURA    │ CARBÓN   │ DESPACHO    │ PUERTO       │ SANTA MARTA  │   3    │   1    │ TIPO-A   │ SI APLICA   │ ✏️ 🗑️   │
│ PROVEEDOR B │ CARTAGENA       │ COQUE    │ RECEPCIÓN   │ -            │ MINA-CERREJÓN│   2    │   2    │ TIPO-B   │ NO APLICA   │ ✏️ 🗑️   │
│ PROVEEDOR C │ BARRANQUILLA    │ HIERRO   │ DESPACHO    │ EXPORTACIÓN  │ DUBAI        │   4    │   2    │ TIPO-C   │ SI APLICA   │ ✏️ 🗑️   │
└─────────────┴─────────────────┴──────────┴─────────────┴──────────────┴──────────────┴────────┴────────┴──────────┴─────────────┴──────────┘
🔍 Cambios Principales Requeridos:
Campo Actual	Campo Nuevo	Cambio Requerido
Centro	Centro Despacho	Cargar desde tabla destino
Tipo Origen	Tipo Destino	Solo para DESPACHO, cargar desde tabla clase
Tipo Origen	Destino/Origen	Lógica Condicional:
• Si Movimiento = DESPACHO → Mostrar Destino (tabla destino)
• Si Movimiento = RECEPCIÓN → Mostrar Origen (tabla origenes)
📌 Lógica Condicional de Visualización:
Columna "Tipo Destino": Cuando Movimiento = "DESPACHO" se muestra el campo de Tipo Destino de lo contrario se muestra -
Columna "Destino/Origen":
Si movimiento = "DESPACHO" → Mostrar Destino basado en Tipo Destino seleccionado
Si movimiento = "RECEPCIÓN" → Mostrar Origen de tabla origenes
🔧 Mejoras a la API
📡 Endpoint de Bolsas de Calidad con Filtros
La API para obtener las bolsas de calidad ha sido mejorada para soportar filtros opcionales que permiten una consulta más específica de los registros.

🎯 Funcionalidad
Comportamiento actual: Si no se envían parámetros, se traen todos los registros
Nueva funcionalidad: Filtros opcionales para consultas específicas
📋 Parámetros de Filtrado Disponibles
Parámetro	Tipo	Descripción	Ejemplo
id	string	ID específico del registro de bolsa de calidad	a1b2c3d4-e5f6-7890-abcd-ef1234567890
empresa	string	Nombre de la empresa (tabla Proveedores)	MINEROS S.A.
centro	string	Nombre del centro de despacho (tabla destino)	BUENAVENTURA
producto	string	Nombre del producto (tabla Productos)	CARBON TERMICO
tipoMovimiento	string	Tipo de movimiento	DESPACHO o RECEPCIÓN
tipoOrigen	string	Nombre del tipo de origen	PUERTO MARITIMO
tipoDestino	string	Nombre del tipo de destino (tabla clase)	EXPORTACIÓN
destino	string	Nombre del destino específico	SANTA MARTA
aplicaOrden	boolean/int	Aplica orden de muestreo en puerto	1 o 0
⚡ Ventajas de los Filtros
Rendimiento mejorado: Consultas más rápidas al filtrar en base de datos
Flexibilidad: Combinación de múltiples filtros según necesidades
Compatibilidad: Mantiene funcionamiento actual sin parámetros
Escalabilidad: Mejor manejo de grandes volúmenes de datos
🎨 Casos de Uso Prácticos
Dashboard por empresa: Filtrar configuraciones de una empresa específica
Reportes por movimiento: Separar configuraciones de DESPACHO vs RECEPCIÓN
Auditoría: Buscar configuraciones que aplican orden de muestreo
Mantenimiento: Localizar configuraciones por centro o producto específico
🔗 Relaciones de Base de Datos
Proveedores → Empresas
destino → Centros de Despacho
Productos → Lista de Productos
clase → Tipos de Destino
destino (con idClase) → Destinos específicos
origenes → Lista de Orígenes




