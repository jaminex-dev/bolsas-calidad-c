<?php

class BolsasController {
    // GET: Consultar datos de ambas tablas
    public function get($params = []) {
        $model = new BolsasModel();
        $data = $model->getDatos($params);
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'data' => $data]);
    }

    // POST: Guardar datos en ambas tablas
    public function post($data) {
        $model = new BolsasModel();
        $id = $model->guardarDatos($data);
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'id' => $id]);
    }

    // PUT: Actualizar datos en ambas tablas
    public function put($id, $data) {
        $model = new BolsasModel();
        $ok = $model->actualizarDatos($id, $data);
        header('Content-Type: application/json');
        echo json_encode(['success' => $ok]);
    }

    // DELETE: Eliminar datos de ambas tablas (lógicamente, activo=0)
    public function delete($id) {
        $model = new BolsasModel();
        $ok = $model->eliminarDatos($id);
        header('Content-Type: application/json');
        echo json_encode(['success' => $ok]);
    }
}
