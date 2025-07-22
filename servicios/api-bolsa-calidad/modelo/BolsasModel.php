<?php
// Modelo para manejar las operaciones de Bolsas de Calidad
include '../conexion.php';

class BolsasModel {
    // Normaliza texto para comparación robusta
    private function normalizarTexto($texto) {
        if (!is_string($texto)) return $texto;
        $texto = html_entity_decode($texto, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $texto = strtolower(trim($texto));
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto); // quita acentos
        $texto = preg_replace('/[^a-z0-9 ]/', '', $texto); // solo letras, números y espacios
        $texto = preg_replace('/\s+/', ' ', $texto); // espacios simples
        return $texto;
    }
    
    public function getDatos($params = []) {
        global $conn;
        // Mapeo de nombres para las tablas
        $empresaMap = $this->getNombres('Proveedores', 'idProveedor', 'RazonSocial');
        $centroMap = $this->getNombres('Destino', 'idDestino', 'Descripcion');
        $productoMap = $this->getNombres('vclasificacion', 'idProducto', 'Producto');
        $tipoDestinoMap = $this->getNombres('Clase', 'idClase', 'Descripcion');
        $destinoMap = $this->getNombres('Destino', 'idDestino', 'Descripcion');
        $origenMap = $this->getNombres('Origenes', 'idOrigen', 'Mina');
        $tipoAnalisisMap = $this->getNombres('TipoAnalisis', 'idTipoAnalisis', 'Descripcion');

        // Construir el WHERE dinámicamente según los parámetros recibidos
        $where = "WHERE b.activo = 1";
        $sqlParams = [];

        // Filtrar por id (GUID)
        if (!empty($params['id'])) {
            $where .= " AND b.id = ?";
            $sqlParams[] = $params['id'];
        }
        // Filtrar por empresa (ID o nombre, con normalización y sugerencias)
        if (!empty($params['empresa'])) {
            $empresaParam = $params['empresa'];
            // Si es un ID,
            if (isset($empresaMap[$empresaParam])) {
                $where .= " AND b.empresa = ?";
                $sqlParams[] = $empresaParam;
            } else {
                // Normaliza el parámetro y los nombres del mapeo
                $empresaParamNorm = $this->normalizarTexto($empresaParam);
                $idProveedor = false;
                $coincidencias = [];
                foreach ($empresaMap as $id => $nombre) {
                    $nombreNorm = $this->normalizarTexto($nombre);
                    if ($nombreNorm === $empresaParamNorm) {
                        $idProveedor = $id;
                        break;
                    }
                    // Guardar coincidencias parciales para sugerencias
                    if (strpos($nombreNorm, $empresaParamNorm) !== false || strpos($empresaParamNorm, $nombreNorm) !== false) {
                        $coincidencias[] = $nombre;
                    }
                }
                if ($idProveedor !== false) {
                    $where .= " AND b.empresa = ?";
                    $sqlParams[] = $idProveedor;
                } else if (!empty($coincidencias)) {
                    // Si no hay coincidencia exacta, pero sí sugerencias, lanzar excepción o devolver sugerencias
                    throw new Exception("No se encontró coincidencia exacta para la empresa. ¿Quizás quiso decir: " . implode(', ', $coincidencias) . "?");
                } else {
                    throw new Exception("No se encontró ninguna empresa que coincida con el nombre proporcionado.");
                }
            }
        }
        // Filtrar por centro (ID o nombre)
        if (!empty($params['centro'])) {
            $centroParam = $params['centro'];
            if (isset($centroMap[$centroParam])) {
                $where .= " AND b.centro = ?";
                $sqlParams[] = $centroParam;
            } else {
                $centroParamNorm = $this->normalizarTexto($centroParam);
                $idCentro = false;
                $coincidencias = [];
                foreach ($centroMap as $id => $nombre) {
                    $nombreNorm = $this->normalizarTexto($nombre);
                    if ($nombreNorm === $centroParamNorm) {
                        $idCentro = $id;
                        break;
                    }
                    if (strpos($nombreNorm, $centroParamNorm) !== false || strpos($centroParamNorm, $nombreNorm) !== false) {
                        $coincidencias[] = $nombre;
                    }
                }
                if ($idCentro !== false) {
                    $where .= " AND b.centro = ?";
                    $sqlParams[] = $idCentro;
                } else if (!empty($coincidencias)) {
                    throw new Exception("No se encontró coincidencia exacta para el centro. ¿Quizás quiso decir: " . implode(', ', $coincidencias) . "?");
                } else {
                    throw new Exception("No se encontró ningún centro que coincida con el nombre proporcionado.");
                }
            }
        }
        // Filtrar por producto (ID o nombre)
        if (!empty($params['producto'])) {
            $productoParam = $params['producto'];
            if (isset($productoMap[$productoParam])) {
                $where .= " AND b.producto = ?";
                $sqlParams[] = $productoParam;
            } else {
                $idProducto = array_search($productoParam, $productoMap);
                if ($idProducto !== false) {
                    $where .= " AND b.producto = ?";
                    $sqlParams[] = $idProducto;
                }
            }
        }
        // Filtrar por tipoMovimiento
        if (!empty($params['tipoMovimiento'])) {
            $where .= " AND b.tipoMovimiento = ?";
            $sqlParams[] = $params['tipoMovimiento'];
        }
        // Filtrar por tipoDestino (ID o nombre, con normalización y sugerencias)
        if (!empty($params['tipoDestino'])) {
            $tipoDestinoParam = $params['tipoDestino'];
            if (isset($tipoDestinoMap[$tipoDestinoParam])) {
                $where .= " AND b.tipoDestino = ?";
                $sqlParams[] = $tipoDestinoParam;
            } else {
                $tipoDestinoParamNorm = $this->normalizarTexto($tipoDestinoParam);
                $idTipoDestino = false;
                $coincidencias = [];
                foreach ($tipoDestinoMap as $id => $nombre) {
                    $nombreNorm = $this->normalizarTexto($nombre);
                    if ($nombreNorm === $tipoDestinoParamNorm) {
                        $idTipoDestino = $id;
                        break;
                    }
                    if (strpos($nombreNorm, $tipoDestinoParamNorm) !== false || strpos($tipoDestinoParamNorm, $nombreNorm) !== false) {
                        $coincidencias[] = $nombre;
                    }
                }
                if ($idTipoDestino !== false) {
                    $where .= " AND b.tipoDestino = ?";
                    $sqlParams[] = $idTipoDestino;
                } else if (!empty($coincidencias)) {
                    throw new Exception("No se encontró coincidencia exacta para el tipoDestino. ¿Quizás quiso decir: " . implode(', ', $coincidencias) . "?");
                } else {
                    throw new Exception("No se encontró ningún tipoDestino que coincida con el nombre proporcionado.");
                }
            }
        }
        // Filtrar por origen (ID o nombre, con normalización y sugerencias)
        if (!empty($params['origen'])) {
            $origenParam = $params['origen'];
            if (isset($origenMap[$origenParam])) {
                $where .= " AND b.origen = ?";
                $sqlParams[] = $origenParam;
            } else {
                $origenParamNorm = $this->normalizarTexto($origenParam);
                $idOrigen = false;
                $coincidencias = [];
                foreach ($origenMap as $id => $nombre) {
                    $nombreNorm = $this->normalizarTexto($nombre);
                    if ($nombreNorm === $origenParamNorm) {
                        $idOrigen = $id;
                        break;
                    }
                    if (strpos($nombreNorm, $origenParamNorm) !== false || strpos($origenParamNorm, $nombreNorm) !== false) {
                        $coincidencias[] = $nombre;
                    }
                }
                if ($idOrigen !== false) {
                    $where .= " AND b.origen = ?";
                    $sqlParams[] = $idOrigen;
                } else if (!empty($coincidencias)) {
                    throw new Exception("No se encontró coincidencia exacta para el origen. ¿Quizás quiso decir: " . implode(', ', $coincidencias) . "?");
                } else {
                    throw new Exception("No se encontró ningún origen que coincida con el nombre proporcionado.");
                }
            }
        }
        // Filtrar por destino (ID o nombre)
        if (!empty($params['destino'])) {
            $destinoParam = $params['destino'];
            if (isset($destinoMap[$destinoParam])) {
                $where .= " AND b.destino = ?";
                $sqlParams[] = $destinoParam;
            } else {
                $idDestino = array_search($destinoParam, $destinoMap);
                if ($idDestino !== false) {
                    $where .= " AND b.destino = ?";
                    $sqlParams[] = $idDestino;
                }
            }
        }
        // Filtrar por aplicaOrden (booleano/int)
        if (isset($params['aplicaOrden'])) {
            $where .= " AND b.aplicaOrden = ?";
            $sqlParams[] = $params['aplicaOrden'];
        }

        $sql = "SELECT b.id, b.empresa, b.centro, c.Descripcion as centroDespacho, b.producto, b.tipoMovimiento, b.tipoDestino, b.destino, b.origen, b.bolsas, b.aplicaOrden, b.activo, b.fechaCreacion
                FROM BolsasCalidad b
                LEFT JOIN Destino c ON b.centro = c.idDestino
                $where ORDER BY b.fechaCreacion ASC";
        $stmt = sqlsrv_query($conn, $sql, $sqlParams);
        $bolsas = [];
        if ($stmt === false) {
            return [];
        }
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $bolsas[] = $row;
        }

        // Procesar los datos de las bolsas
        foreach ($bolsas as &$bolsa) {
            $bolsa['empresaNombre'] = $empresaMap[$bolsa['empresa']] ?? $bolsa['empresa'];
            $bolsa['centroDespachoNombre'] = $centroMap[$bolsa['centro']] ?? $bolsa['centro'];
            // Eliminar campo duplicado centroDespacho si existe
            if (isset($bolsa['centroDespacho'])) {
                unset($bolsa['centroDespacho']);
            }
            $bolsa['productoNombre'] = $productoMap[$bolsa['producto']] ?? $bolsa['producto'];
            $bolsa['tipoDestinoNombre'] = $tipoDestinoMap[$bolsa['tipoDestino']] ?? $bolsa['tipoDestino'];
            $bolsa['destinoNombre'] = $destinoMap[$bolsa['destino']] ?? ($bolsa['destino'] ?? '');
            $bolsa['origenNombre'] = $origenMap[$bolsa['origen']] ?? $bolsa['origen'];
            // Detalles de bolsas
            $sqlDet = "SELECT d.numeroBolsa, d.viajes, d.idTipoAnalisis FROM BolsasCalidadDetalle d WHERE d.idBolsasCalidad = ? ORDER BY d.numeroBolsa ASC";
            $paramsDet = array($bolsa['id']);
            $stmtDet = sqlsrv_query($conn, $sqlDet, $paramsDet);
            $detalles = [];
            if ($stmtDet !== false) {
                while ($detRow = sqlsrv_fetch_array($stmtDet, SQLSRV_FETCH_ASSOC)) {
                    $detRow['tipoAnalisisNombre'] = $tipoAnalisisMap[$detRow['idTipoAnalisis']] ?? $detRow['idTipoAnalisis'];
                    $detalles[] = $detRow;
                }
            }
            $bolsa['detalles'] = $detalles;
            $bolsa['viajes'] = implode(',', array_column($detalles, 'viajes'));
            $bolsa['analisis'] = implode(',', array_column($detalles, 'idTipoAnalisis'));
        }
        return $bolsas;
    }
    // Obtiene un mapeo de nombres para una tabla específica
    private function getNombres($tabla, $campoId, $campoNombre) {
        global $conn;
        $sql  = "SELECT DISTINCT $campoId, $campoNombre FROM $tabla WHERE $campoNombre IS NOT NULL AND $campoNombre <> ''";
        $stmt = sqlsrv_query($conn, $sql);
        $map  = [];
        if ($stmt !== false) {
            while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
                $map[$row[$campoId]] = $row[$campoNombre];
            }
        }
        return $map;
    }
    // Guarda los datos de una nueva bolsa de calidad
    public function guardarDatos($data) {
        global $conn;
        $idBolsasCalidad = $this->generateGuid();
        $sql = "INSERT INTO BolsasCalidad (id, empresa, centro, producto, tipoMovimiento, tipoDestino, destino, origen, bolsas, aplicaOrden, activo, usuarioCreador) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)";
        $aplicaOrden = isset($data['aplicaOrden']) ? $data['aplicaOrden'] : 0;

        // Validación condicional de datos mínimos
        if (empty($data['empresa']) || empty($data['centro']) || empty($data['producto']) || empty($data['tipoMovimiento']) || empty($data['bolsas'])) {
            return false;
        }
        // Validación condicional para campos según tipoMovimiento
        if ($data['tipoMovimiento'] === 'DESPACHO') {
            if (empty($data['tipoDestino']) || empty($data['destino'])) {
                return false;
            }
        } else if ($data['tipoMovimiento'] === 'RECEPCIÓN') {
            if (empty($data['origen'])) {
                return false;
            }
            // Para recepción, tipoDestino y destino pueden ir vacíos
            $data['tipoDestino'] = null;
            $data['destino'] = null;
        }
        $usuarioCreador = 'B78A8160-A9F4-4DFA-B83D-061E597F54A9'; // Usuario estático GUID
        $params = array(
            $idBolsasCalidad,
            $data['empresa'],
            $data['centro'],
            $data['producto'],
            $data['tipoMovimiento'],
            $data['tipoDestino'],
            $data['destino'],
            $data['origen'],
            $data['bolsas'],
            $aplicaOrden,
            $usuarioCreador
        );

        // Iniciar transacción
        if (!sqlsrv_begin_transaction($conn)) {
            return false;
        }

        $todoOk = true;
        $stmt = sqlsrv_query($conn, $sql, $params);
        if ($stmt === false) {
            error_log('Error al insertar en BolsasCalidad: ' . print_r(sqlsrv_errors(), true));
            $todoOk = false;
        }

        if ($todoOk && !empty($data['detalles'])) {
            foreach ($data['detalles'] as $detalle) {
                $sqlDet = "INSERT INTO BolsasCalidadDetalle (idBolsasCalidad, numeroBolsa, viajes, idTipoAnalisis) VALUES (?, ?, ?, ?)";
                $paramsDet = array(
                    $idBolsasCalidad,
                    $detalle['numeroBolsa'] ?? null,
                    $detalle['viajes'] ?? null,
                    $detalle['idTipoAnalisis'] ?? null
                );
                $stmtDet = sqlsrv_query($conn, $sqlDet, $paramsDet);
                if ($stmtDet === false) {
                    error_log('Error al insertar en BolsasCalidadDetalle: ' . print_r(sqlsrv_errors(), true));
                    $todoOk = false;
                    break;
                }
            }
        } else if ($todoOk && empty($data['detalles'])) {
        }

        if ($todoOk) {
            sqlsrv_commit($conn);
            return $idBolsasCalidad;
        } else {
            sqlsrv_rollback($conn);
            return false;
        }
    }

    public function actualizarDatos($id, $data) {
        global $conn;
        $sql = "UPDATE BolsasCalidad SET empresa=?, centro=?, producto=?, tipoMovimiento=?, tipoDestino=?, destino=?, origen=?, bolsas=?, aplicaOrden=?, usuarioCreador=? WHERE id=?";
        $aplicaOrden = isset($data['aplicaOrden']) ? $data['aplicaOrden'] : 0;
        
        // Validación condicional de datos mínimos
        if (empty($data['empresa']) || empty($data['centro']) || empty($data['producto']) || empty($data['tipoMovimiento']) || empty($data['bolsas'])) {
            return false;
        }
        // Validación condicional para campos según tipoMovimiento
        if ($data['tipoMovimiento'] === 'DESPACHO') {
            if (empty($data['tipoDestino']) || empty($data['destino'])) {
                return false;
            }
        } else if ($data['tipoMovimiento'] === 'RECEPCIÓN') {
            if (empty($data['origen'])) {
                return false;
            }
            // Para recepción, tipoDestino y destino pueden ir vacíos
            $data['tipoDestino'] = null;
            $data['destino'] = null;
        }
        $usuarioCreador = 'B78A8160-A9F4-4DFA-B83D-061E597F54A9'; // Usuario estático GUID
        $params = array(
            $data['empresa'],
            $data['centro'],
            $data['producto'],
            $data['tipoMovimiento'],
            $data['tipoDestino'],
            $data['destino'],
            $data['origen'],
            $data['bolsas'],
            $aplicaOrden,
            $usuarioCreador,
            $id
        );
        $stmt = sqlsrv_query($conn, $sql, $params);
        if ($stmt === false) {
            return false;
        }

        if (!isset($data['soloDesactivar']) || !$data['soloDesactivar']) {
            $sqlDel = "DELETE FROM BolsasCalidadDetalle WHERE idBolsasCalidad = ?";
            $paramsDel = array($id);
            $stmtDel = sqlsrv_query($conn, $sqlDel, $paramsDel);
            if ($stmtDel === false) {
            }
            foreach ($data['detalles'] as $detalle) {
                $sqlDet = "INSERT INTO BolsasCalidadDetalle (idBolsasCalidad, numeroBolsa, viajes, idTipoAnalisis) VALUES (?, ?, ?, ?)";
                $paramsDet = array(
                    $id,
                    $detalle['numeroBolsa'] ?? null,
                    $detalle['viajes'] ?? null,
                    $detalle['idTipoAnalisis'] ?? null
                );
                $stmtDet = sqlsrv_query($conn, $sqlDet, $paramsDet);
                if ($stmtDet === false) {
                }
            }
        }
        return true;
    }
    // Elimina lógicamente los datos de una bolsa
    public function eliminarDatos($id) {
        global $conn;
        $sql = "UPDATE BolsasCalidad SET activo = 0 WHERE id = ?";
        $params = array($id);
        $stmt = sqlsrv_query($conn, $sql, $params);
        if ($stmt === false) {
            return false;
        }
        return true;
    }

    // Genera un GUID único
    private function generateGuid() {
        if (function_exists('com_create_guid')) {
            return trim(com_create_guid(), '{}');
        } else {
            $data = openssl_random_pseudo_bytes(16);
            $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
            $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
            return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
        }
    }
}
