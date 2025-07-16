<?php
// Modelo para manejar las operaciones de Bolsas de Calidad
include '../conexion.php';

class BolsasModel {
    
    public function getDatos($params = []) {
        global $conn;
        // Mapeo de nombres para las tablas
        $empresaMap = $this->getNombres('vDestino', 'idProveedor', 'Proveedor');
        $centroMap = $this->getNombres('vDestino', 'idProveedor', 'Proveedor');
        $productoMap = $this->getNombres('vclasificacion', 'idProducto', 'Producto');
        $tipoDestinoMap = $this->getNombres('vDestino', 'idProveedor', 'Proveedor');
        $destinoMap = $this->getNombres('vDestino', 'idProveedor', 'Proveedor');
        $tipoAnalisisMap = $this->getNombres('TipoAnalisis', 'idTipoAnalisis', 'Descripcion');

        // Consulta principal para obtener las bolsas de calidad
        $sql = "SELECT b.id, b.empresa, b.centro, c.Descripcion as centroDespacho, b.producto, b.tipoMovimiento, b.tipoDestino, b.destino, b.origen, b.bolsas, b.aplicaOrden, b.activo, b.fechaCreacion
                FROM BolsasCalidad b
                LEFT JOIN vDestino c ON b.centro = c.idDestino
                WHERE b.activo = 1 ORDER BY b.fechaCreacion ASC";
        $stmt = sqlsrv_query($conn, $sql);
        $bolsas = [];
        if ($stmt === false) {
            error_log('Error en consulta principal: ' . print_r(sqlsrv_errors(), true));
            return [];
        }
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $bolsas[] = $row;
        }

        // Procesar los datos de las bolsas
        foreach ($bolsas as &$bolsa) {
            $bolsa['empresaNombre'] = $empresaMap[$bolsa['empresa']] ?? $bolsa['empresa'];
            $bolsa['centroDespacho'] = $centroMap[$bolsa['centro']] ?? $bolsa['centro'];
            $bolsa['productoNombre'] = $productoMap[$bolsa['producto']] ?? $bolsa['producto'];            
            $bolsa['tipoDestinoNombre'] = $tipoDestinoMap[$bolsa['tipoDestino']] ?? $bolsa['tipoDestino'];
            $bolsa['destinoNombre'] = $destinoMap[$bolsa['destino']] ?? ($bolsa['destino'] ?? '');
            $bolsa['origenNombre'] = $destinoMap[$bolsa['origen']] ?? $bolsa['origen'];
            $sqlDet = "SELECT d.numeroBolsa, d.viajes, d.idTipoAnalisis FROM BolsasCalidadDetalle d WHERE d.idBolsasCalidad = ?";
            $params = array($bolsa['id']);
            $stmtDet = sqlsrv_query($conn, $sqlDet, $params);
            $detalles = [];
            if ($stmtDet === false) {
                error_log('Error en consulta de detalles: ' . print_r(sqlsrv_errors(), true));
            } else {
                while ($detRow = sqlsrv_fetch_array($stmtDet, SQLSRV_FETCH_ASSOC)) {
                    $detalles[] = $detRow;
                }
            }
            $bolsa['detalles'] = $detalles;
            foreach ($bolsa['detalles'] as &$det) {
                $det['tipoAnalisisNombre'] = $tipoAnalisisMap[$det['idTipoAnalisis']] ?? $det['idTipoAnalisis'];
            }
        }
        return $bolsas;
    }

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

    public function guardarDatos($data) {
        error_log('OJO: Iniciando guardarDatos');
        global $conn;
        $idBolsasCalidad = $this->generateGuid();
        error_log('OJO: GUID generado: ' . $idBolsasCalidad);
        $sql = "INSERT INTO BolsasCalidad (id, empresa, centro, producto, tipoMovimiento, tipoDestino, destino, origen, bolsas, aplicaOrden, activo, usuarioCreador) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)";
        $aplicaOrden = isset($data['aplicaOrden']) ? $data['aplicaOrden'] : 0;

        error_log('OJO: Datos recibidos: ' . print_r($data, true));

        // Validación condicional de datos mínimos
        if (empty($data['empresa']) || empty($data['centro']) || empty($data['producto']) || empty($data['tipoMovimiento']) || empty($data['bolsas'])) {
            error_log('OJO: Faltan datos obligatorios para guardar.');
            return false;
        }
        // Validación condicional para campos según tipoMovimiento
        if ($data['tipoMovimiento'] === 'DESPACHO') {
            if (empty($data['tipoDestino']) || empty($data['destino'])) {
                error_log('OJO: Faltan datos de destino para DESPACHO.');
                return false;
            }
        } else if ($data['tipoMovimiento'] === 'RECEPCIÓN') {
            if (empty($data['origen'])) {
                error_log('OJO: Faltan datos de origen para RECEPCIÓN.');
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

        error_log('OJO: Params para INSERT BolsasCalidad: ' . print_r($params, true));

        // Iniciar transacción
        if (!sqlsrv_begin_transaction($conn)) {
            error_log('OJO: No se pudo iniciar la transacción: ' . print_r(sqlsrv_errors(), true));
            return false;
        }

        $todoOk = true;
        $stmt = sqlsrv_query($conn, $sql, $params);
        if ($stmt === false) {
            error_log('OJO: Error al guardar BolsasCalidad: ' . print_r(sqlsrv_errors(), true));
            $todoOk = false;
        } else {
            error_log('OJO: Insert BolsasCalidad OK');
        }

        if ($todoOk && !empty($data['detalles'])) {
            error_log('OJO: Iniciando guardado de detalles');
            foreach ($data['detalles'] as $detalle) {
                $sqlDet = "INSERT INTO BolsasCalidadDetalle (idBolsasCalidad, numeroBolsa, viajes, idTipoAnalisis) VALUES (?, ?, ?, ?)";
                $paramsDet = array(
                    $idBolsasCalidad,
                    $detalle['numeroBolsa'] ?? null,
                    $detalle['viajes'] ?? null,
                    $detalle['idTipoAnalisis'] ?? null
                );
                error_log('OJO: Params detalle: ' . print_r($paramsDet, true));
                $stmtDet = sqlsrv_query($conn, $sqlDet, $paramsDet);
                if ($stmtDet === false) {
                    error_log('OJO: Error al guardar detalle: ' . print_r(sqlsrv_errors(), true));
                    $todoOk = false;
                    break;
                } else {
                    error_log('OJO: Insert detalle OK');
                }
            }
        } else if ($todoOk && empty($data['detalles'])) {
            error_log('OJO: No se recibieron detalles para guardar.');
        }

        if ($todoOk) {
            error_log('OJO: Commit de la transacción');
            sqlsrv_commit($conn);
            return $idBolsasCalidad;
        } else {
            error_log('OJO: Rollback de la transacción');
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
            error_log('Faltan datos obligatorios para actualizar.');
            return false;
        }
        // Validación condicional para campos según tipoMovimiento
        if ($data['tipoMovimiento'] === 'DESPACHO') {
            if (empty($data['tipoDestino']) || empty($data['destino'])) {
                error_log('Faltan datos de destino para DESPACHO.');
                return false;
            }
        } else if ($data['tipoMovimiento'] === 'RECEPCIÓN') {
            if (empty($data['origen'])) {
                error_log('Faltan datos de origen para RECEPCIÓN.');
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
            error_log('Error al actualizar BolsasCalidad: ' . print_r(sqlsrv_errors(), true));
            return false;
        }

        if (!isset($data['soloDesactivar']) || !$data['soloDesactivar']) {
            $sqlDel = "DELETE FROM BolsasCalidadDetalle WHERE idBolsasCalidad = ?";
            $paramsDel = array($id);
            $stmtDel = sqlsrv_query($conn, $sqlDel, $paramsDel);
            if ($stmtDel === false) {
                error_log('Error al eliminar detalles previos: ' . print_r(sqlsrv_errors(), true));
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
                    error_log('Error al guardar detalle (actualizar): ' . print_r(sqlsrv_errors(), true));
                }
            }
        }
        return true;
    }

    public function eliminarDatos($id) {
        global $conn;
        $sql = "UPDATE BolsasCalidad SET activo = 0 WHERE id = ?";
        $params = array($id);
        $stmt = sqlsrv_query($conn, $sql, $params);
        if ($stmt === false) {
            error_log('Error al eliminar registro: ' . print_r(sqlsrv_errors(), true));
            return false;
        }
        return true;
    }


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
