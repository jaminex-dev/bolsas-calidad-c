<?php

require_once __DIR__ . '/modelo/BolsasModel.php';
require_once __DIR__ . '/controlador/BolsasController.php';

// Configuración de conexión a la base de datos
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$input = json_decode(file_get_contents('php://input'), true);

// Configurar encabezados para CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Authorization, Accept, Client-Security-Token");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Content-Type: application/json');

// Si es una solicitud OPTIONS, respondemos exitosamente (preflight request)
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Extraer recurso e id
$matches = [];
// Admite rutas con o sin /servicios/
$patterns = [
    '#/servicios/api-bolsa-calidad/api.php/([a-zA-Z0-9_]+)(?:/([a-zA-Z0-9_-]+))?#',
    '#/api-bolsa-calidad/api.php/([a-zA-Z0-9_]+)(?:/([a-zA-Z0-9_-]+))?#',
    '#/api.php/([a-zA-Z0-9_]+)(?:/([a-zA-Z0-9_-]+))?#',
    '#/api-bolsa-calidad/([a-zA-Z0-9_]+)(?:/([a-zA-Z0-9_-]+))?#'
];

$matched = false;
foreach ($patterns as $pattern) {
    if (preg_match($pattern, $uri, $matches)) {
        $matched = true;
        error_log("Patrón coincidente: $pattern");
        error_log("Matches: " . json_encode($matches));
        break;
    }
}

// Si no hay coincidencia, intentamos buscar el recurso de otra manera
if (!$matched || empty($matches)) {
    $path_parts = explode('/', trim($uri, '/'));
    error_log("Path parts: " . json_encode($path_parts));
    
    // Buscar el recurso después de api.php o api-bolsa-calidad
    $api_index = array_search('api.php', $path_parts);
    if ($api_index === false) {
        $api_index = array_search('api-bolsa-calidad', $path_parts);
    }
    
    if ($api_index !== false && isset($path_parts[$api_index + 1])) {
        $resource = $path_parts[$api_index + 1];
        $id = isset($path_parts[$api_index + 2]) ? $path_parts[$api_index + 2] : null;
        $matches = [0, $resource, $id];
        $matched = true;
        error_log("Recursos extraídos manualmente: Resource=$resource, ID=$id");
    }
}

$resource = $matches[1] ?? null;
$id = $matches[2] ?? null;

$controller = new BolsasController();

switch ($method) {
    case 'GET':
        if ($resource === 'bolsas') {
            if ($id) {
                $controller->get(['id' => $id]);
            } else {
                // Si viene tipoMovimiento, filtrar; si no, devolver todos
                $tipoMovimiento = isset($_GET['tipoMovimiento']) ? $_GET['tipoMovimiento'] : null;
                if ($tipoMovimiento) {
                    $controller->get(['tipoMovimiento' => $tipoMovimiento]);
                } else {
                    $controller->get();
                }
            }
        }
        break;
    case 'POST':
        if ($resource === 'bolsas') {
            $controller->post($input);
        }
        break;
    case 'PUT':
        if ($resource === 'bolsas' && $id) {
            $controller->put($id, $input);
        }
        break;
    case 'DELETE':
        if ($resource === 'bolsas' && $id) {
            $controller->delete($id);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

// Función para limpiar y normalizar texto (eliminar caracteres especiales y acentos)
function limpiarTexto($texto) {
    if (!is_string($texto)) return $texto;
    $texto = html_entity_decode($texto, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $texto = preg_replace('/[\x00-\x1F\x7F]/u', '', $texto); // quitar caracteres de control
    $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto); // quitar acentos
    $texto = preg_replace('/[^\p{L}\p{N} .\-\/]/u', '', $texto); // solo letras, números y algunos símbolos
    return trim($texto);
}

// Función helper para ejecutar consultas SQL
function executeQuery($sql, $errorMessage = 'Error en consulta SQL', $limpiarCampos = []) {
    try {
       global $conn;
        $stmt = sqlsrv_query($conn, $sql);
        $data = [];
        
        if ($stmt === false) {
            $errors = sqlsrv_errors();
            error_log("SQL Error: " . json_encode($errors));
            return [
                'success' => false,
                'message' => $errorMessage,
                'error' => json_encode($errors),
                'data' => []
            ];
        }
        
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            // Limpiar campos indicados
            foreach ($limpiarCampos as $campo) {
                if (isset($row[$campo])) {
                    $row[$campo] = limpiarTexto($row[$campo]);
                }
            }
            $data[] = $row;
        }
        
        return ['success' => true, 'data' => $data];
    } catch (Exception $e) {
        error_log("Exception: " . $e->getMessage());
        return [
            'success' => false,
            'message' => $errorMessage,
            'error' => $e->getMessage(),
            'data' => []
        ];
    }
}

// ENDPOINTS 
// Endpoint para centro despacho
if ($method === 'GET' && $resource === 'centrodespacho') {
    $sql = "SELECT idDestino, Descripcion, idClase FROM Destino WHERE Descripcion IS NOT NULL AND Descripcion <> '' ORDER BY Descripcion";
    $result = executeQuery($sql, 'Error al obtener centros de despacho');
    echo json_encode($result);
    exit;
}

// Endpoint para destino filtrado por tipo destino (idClase)
if ($method === 'GET' && $resource === 'destino') {
    $idClase = isset($_GET['idClase']) ? $_GET['idClase'] : null;
    $where = " WHERE Descripcion IS NOT NULL AND Descripcion <> ''";
    if ($idClase) {
        $where .= " AND idClase = '" . addslashes($idClase) . "'";
    }
    $sql = "SELECT idDestino, Descripcion, idClase FROM Destino $where ORDER BY Descripcion";
    $result = executeQuery($sql, 'Error al obtener destinos');
    echo json_encode($result);
    exit;
}
// Endpoint para proveedor por ID
if ($method === 'GET' && $resource === 'proveedores' && $id) {
    $sql = "SELECT idProveedor, RazonSocial FROM Proveedores WHERE idProveedor = '" . addslashes($id) . "'";
    $result = executeQuery($sql, 'Error al obtener proveedor');
    echo json_encode($result);
    exit;
}
// Endpoint para proveedores 
if ($method === 'GET' && $resource === 'proveedores') {
    $sql = "SELECT idProveedor, RazonSocial FROM Proveedores WHERE RazonSocial IS NOT NULL AND RazonSocial <> '' ORDER BY RazonSocial";
    $result = executeQuery($sql, 'Error al obtener proveedores', ['RazonSocial']);
    echo json_encode($result);
    exit;
}
// Endpoint para producto por ID
if ($method === 'GET' && $resource === 'productos' && $id) {
    $sql = "SELECT DISTINCT idProducto, Producto FROM vclasificacion WHERE idProducto = '" . addslashes($id) . "'";
    $result = executeQuery($sql, 'Error al obtener producto');
    echo json_encode($result);
    exit;
}
// Endpoint para productos
if ($method === 'GET' && $resource === 'productos') {
    $sql = "SELECT DISTINCT idProducto, Producto FROM vclasificacion WHERE Producto IS NOT NULL AND Producto <> ''";
    $result = executeQuery($sql, 'Error al obtener productos');
    echo json_encode($result);
    exit;
}
// Endpoint para clase por ID
if ($method === 'GET' && $resource === 'clase' && $id) {
    $sql = "SELECT idClase, Descripcion FROM Clase WHERE idClase = '" . addslashes($id) . "'";
    $result = executeQuery($sql, 'Error al obtener clase');
    echo json_encode($result);
    exit;
}
// Endpoint para clase
if ($method === 'GET' && $resource === 'clase') {
    $sql = "SELECT idClase, Descripcion FROM Clase WHERE Descripcion IS NOT NULL AND Descripcion <> '' ORDER BY Descripcion";
    $result = executeQuery($sql, 'Error al obtener clases');
    echo json_encode($result);
    exit;
}
// Endpoint para tipo de análisis por ID
if ($method === 'GET' && $resource === 'tiposanalisis' && $id) {
    $sql = "SELECT idTipoAnalisis, Descripcion FROM TipoAnalisis WHERE idTipoAnalisis = '" . addslashes($id) . "'";
    $result = executeQuery($sql, 'Error al obtener tipo de análisis');
    echo json_encode($result);
    exit;
}
// Endpoint para tipos de análisis
if ($method === 'GET' && $resource === 'tiposanalisis') {
    $sql = "SELECT idTipoAnalisis, Descripcion FROM TipoAnalisis WHERE Descripcion IS NOT NULL AND Descripcion <> ''";
    $result = executeQuery($sql, 'Error al obtener tipos de análisis');
    echo json_encode($result);
    exit;
}

// Endpoint para origenes (solo minas únicas, texto legible)
if ($method === 'GET' && $resource === 'origenes') {
    $sql = "SELECT MIN(idOrigen) as idOrigen, Mina FROM Origenes WHERE Mina IS NOT NULL AND Mina <> '' GROUP BY Mina ORDER BY Mina";
    $result = executeQuery($sql, 'Error al obtener origenes', ['Mina']);
    echo json_encode($result);
    exit;
}

// Punto de acceso para verificar si la API está funcionando
if ($uri === '/servicios/api-bolsa-calidad/api.php' || $uri === '/api-bolsa-calidad/api.php' || $uri === '/api.php') {
    echo json_encode([
        'success' => true, 
        'message' => 'API Bolsas Calidad funcionando correctamente',
        'endpoints' => [
            '/bolsas' => 'GET/POST/PUT/DELETE - Administración de bolsas',
            '/proveedores' => 'GET - Listado de proveedores',
            '/productos' => 'GET - Listado de productos',
            '/tiposanalisis' => 'GET - Listado de tipos de análisis'
        ]
    ]);
    exit;
}


