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