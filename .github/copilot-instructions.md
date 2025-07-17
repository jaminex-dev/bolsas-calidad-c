# Guía para agentes IA en "Bolsas de Calidad"

## Arquitectura y componentes principales
- El sistema sigue un patrón MVC clásico en PHP para el backend (`servicios/api-bolsa-calidad/`).
- El frontend está en `views/index.php` y usa JavaScript (`controllers/controlador.js`) para la lógica de interfaz y AJAX.
- Los estilos están centralizados en `css/style.css`.
- La base de datos se conecta mediante `servicios/conexion.php`.

## Flujos y comunicación
- El usuario interactúa con formularios en la vista principal (`views/index.php`).
- Las operaciones CRUD se gestionan vía API RESTful en `servicios/api-bolsa-calidad/api.php`.
- El controlador (`BolsasController.php`) delega la lógica de negocio al modelo (`BolsasModel.php`).
- El modelo realiza operaciones SQL y devuelve resultados al controlador.
- El frontend consume la API usando AJAX y actualiza la interfaz dinámicamente.

## Convenciones y patrones específicos
- Todos los identificadores en la base de datos son `uniqueidentifier`.
- El backend valida los datos antes de operar y responde con mensajes claros en JSON.
- El frontend utiliza DataTables y SweetAlert2 para tablas y alertas.
- Los selects y formularios se generan dinámicamente según la selección de campos (ver lógica en `controlador.js`).
- El número de bolsas por ingreso está limitado a 6 (validación en frontend y backend).
- La estructura de carpetas y nombres respeta la separación de responsabilidades y convenciones de minúsculas.

## Ejemplo de flujo de datos
1. El usuario completa el formulario en `index.php`.
2. Se envía una petición AJAX a la API (`api.php/bolsas`).
3. El controlador procesa la petición y usa el modelo para acceder a la base de datos.
4. La respuesta se muestra en la tabla de configuraciones.

## Integraciones y dependencias
- No se usan frameworks modernos ni gestores de dependencias (Composer, npm).
- El sistema depende de librerías externas vía CDN (Bootstrap, jQuery, DataTables, SweetAlert2).
- La documentación de la API está disponible en Postman: https://documenter.getpostman.com/view/45445905/2sB2xBD9qS

## Archivos clave
- `views/index.php`: interfaz principal y formularios.
- `controllers/controlador.js`: lógica de interacción y AJAX.
- `servicios/api-bolsa-calidad/api.php`: API RESTful.
- `servicios/api-bolsa-calidad/controlador/BolsasController.php`: controlador backend.
- `servicios/api-bolsa-calidad/modelo/BolsasModel.php`: modelo de datos.
- `servicios/conexion.php`: conexión a la base de datos.
- `css/style.css`: estilos personalizados.

## Recomendaciones para agentes IA
- Mantener la estructura y convenciones existentes.
- Seguir el patrón MVC para nuevas funcionalidades backend.
- Validar siempre los datos antes de operar.
- Usar AJAX y actualizar la interfaz dinámicamente en el frontend.



# Instrucciones para implementación de la tabla(datatable) en Báscula - Bolsas de Calidad

1. 