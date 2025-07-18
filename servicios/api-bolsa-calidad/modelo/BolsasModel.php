<?php
// Modelo para manejar las operaciones de Bolsas de Calidad
include '../conexion.php';

class BolsasModel {
    
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

        // Consulta principal para obtener las bolsas de calidad
        $sql = "SELECT b.id, b.empresa, b.centro, c.Descripcion as centroDespacho, b.producto, b.tipoMovimiento, b.tipoDestino, b.destino, b.origen, b.bolsas, b.aplicaOrden, b.activo, b.fechaCreacion
                FROM BolsasCalidad b
                LEFT JOIN Destino c ON b.centro = c.idDestino
                WHERE b.activo = 1 ORDER BY b.fechaCreacion ASC";
        $stmt = sqlsrv_query($conn, $sql);
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
