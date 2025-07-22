
# Bolsas de Calidad - api -  Documentación y Estado de Cumplimiento

📋 Nuevas Correcciones y Requerimientos

🔧 **Mejoras a la API:**
- El endpoint de bolsas de calidad ahora soporta filtros para consultas más específicas de los registros.

✅ **Cumplido:**  
La funcionalidad de filtros ha sido implementada en el endpoint de bolsas de calidad. Ahora es posible realizar consultas específicas utilizando los siguientes parámetros:

| Parámetro         | Tipo         | Descripción                                         | Ejemplo                           |
|-------------------|--------------|-----------------------------------------------------|-----------------------------------|
| id                | string       | ID específico del registro de bolsa de calidad      | a1b2c3d4-e5f6-7890-abcd-ef1234567890 |
| empresa           | string       | Nombre de la empresa (tabla Proveedores)            | MINEROS S.A.                      |
| centro            | string       | Nombre del centro de despacho (tabla destino)       | BUENAVENTURA                      |
| producto          | string       | Nombre del producto (tabla Productos)               | CARBON TERMICO                    |
| tipoMovimiento    | string       | Tipo de movimiento                                  | DESPACHO o RECEPCIÓN              |
| tipoOrigen        | string       | Nombre del tipo de origen                           | PUERTO MARITIMO                   |
| tipoDestino       | string       | Nombre del tipo de destino (tabla clase)            | EXPORTACIÓN                       |
| destino           | string       | Nombre del destino específico                       | SANTA MARTA                       |
| aplicaOrden       | boolean/int  | Aplica orden de muestreo en puerto                  | 1 o 0                             |


- Tambien es posible filtrar por el parámetro `id`.
- Si no se envían parámetros, se retornan todos los registros.
- Los filtros pueden combinarse según la necesidad de la consulta.

🏢 1. Configuración de Empresa  
**Cumplido:** Las empresas ahora se cargan correctamente desde la tabla de `proveedores` en la base de datos.

🚛 2. Centro de Despacho  
**Cumplido:** Ahora los centros de despacho se obtienen correctamente desde la tabla `destino` en la base de datos.

📦 3. Producto  
**Cumplido:** Los productos disponibles se cargan correctamente desde la tabla `Productos`.

🔄 4. Tipo de Movimiento
El sistema debe manejar dos tipos de movimiento principales:

**Cumplido:**  
4.1 Despacho  
Cuando se selecciona "Despacho", se habilitan dos campos dependientes:

- **Campo 1: Tipo Destino**  
    - Fuente de datos: Tabla `clase`  
    - Función: Selector principal que determina las opciones del segundo campo

- **Campo 2: Destino**  
    - Fuente de datos: Tabla `destino`  
    - Relación: Asociado a la tabla `clase` mediante `idClase`  
    - Comportamiento: Se carga dinámicamente según la selección de Tipo Destino

4.2 Recepción  
Cuando se selecciona "Recepción", se habilita un único campo:

- **Campo: Origen**  
    - Fuente de datos: Tabla `origenes`  
    - Función: Carga todos los orígenes disponibles


✅ Filtros **Cumplido:**  
Los casos de uso prácticos han sido implementados y el flujo de filtrado es el siguiente:

### Flujo de Filtrado

1. **Selección de Parámetros:**  
    El usuario selecciona uno o varios parámetros de filtrado (empresa, centro, producto, tipo de movimiento, etc.) desde la interfaz o mediante la API.

2. **Envío de Consulta:**  
    Se envía la consulta al endpoint de bolsas de calidad con los parámetros seleccionados.

3. **Procesamiento:**  
    El backend procesa los filtros recibidos y realiza la búsqueda en la base de datos aplicando las condiciones correspondientes.

**Resumen del flujo:**  
Usuario/Interfaz → API → Controlador → Modelo (DB) → Controlador → API → Usuario/Interfaz

# 📚 Documentación Backend (Rama API)

## 📁 Estructura de la Rama `api`

```
api-bolsas-calidad/
├── api.php
├── controlador/
│   └── controlador.php
├── modelo/
│   └── modelo.php
└── README.md
```

---

## Descripción Detallada de Archivos y Funcionalidad

### 1. `api.php`  Recibe las solicitudes HTTP delega la lógica al controlador.

---

### 2. `controlador/controlador.php`

**Funciones:**
- `obtenerBolsas($filtros)`: Devuelve una lista de bolsas.
- `crearBolsa($datos)`: Inserta una nueva bolsa en la base de datos.
- `actualizarBolsa($id, $datos)`: Actualiza una bolsa existente.
- `eliminarBolsa($id)`: Elimina(Desactiva) una bolsa por su identificador.
---

### 3. `modelo/modelo.php`
Gestiona el acceso a la base de datos.  
Contiene todas las consultas SQL y operaciones CRUD.

**Responsabilidades:**
- Conectar a la base de datos usando los parámetros definidos.
- Ejecutar consultas SQL seguras (usando sentencias preparadas).
- Devolver los resultados al controlador.
- Manejar errores de conexión o consulta.

**Funciones:**
- `getBolsas($filtros)`: Consulta y devuelve bolsas según filtros.
- `insertBolsa($datos)`: Inserta una nueva bolsa y devuelve el ID.
- `updateBolsa($id, $datos)`: Actualiza los datos de una bolsa.
- `deleteBolsa($id)`: Elimina una bolsa por su ID.

---

## 📝 Cumplimiento de Tareas Backend

- **Separación de lógica:**  
  El backend está dividido en API (`api.php`), controlador y modelo, siguiendo el patrón MVC recomendado.

- **Compatibilidad PHP 5.6.31:**  
  Todo el código evita operadores y sintaxis modernas, asegurando compatibilidad.

- **Uso de `uniqueidentifier`:**  
  Todos los identificadores en la base de datos y en el código son de tipo `uniqueidentifier`.

- **Eliminación de archivos innecesarios:**  
  No se usan archivos como `autoload.php` o `conexion.php` fuera de la estructura recomendada.

- **Nombres de ramas:**  
  Se respeta la convención de nombres en minúsculas.

- **Validaciones:**  
  El controlador valida todos los datos antes de llamar al modelo y devuelve mensajes claros.

- **Estructura recomendada:**  
  Se sigue la estructura de carpetas y archivos propuesta en el README.

---
## 📝 Documentación API

[Documentación en Postman](https://documenter.getpostman.com/view/45445905/2sB2xBD9qS)

Esta documentación incluye:
- Todos los endpoints disponibles
- Parámetros requeridos para cada solicitud
- Ejemplos de respuestas
- Códigos de estado HTTP