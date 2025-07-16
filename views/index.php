<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restricciones Sticker Calidad</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/css/alertify.min.css"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/css/themes/bootstrap.min.css"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css"/>
</head>
<body>
<!-- Contenedor de alertas visuales -->
<div id="alertas" style="position:fixed; top:24px; right:24px; z-index:9999; min-width:300px;"></div>
<div class="container-fluid">
    <div class="main-card row d-flex align-items-stretch align-items-start">
        <!-- Formulario principal -->
        <div class="col-lg-4 form-section d-flex flex-column justify-content-start">
            <h4 class="mb-4"><i class="fa-solid fa-flask-vial icon-step"></i>Restricciones Sticker Calidad</h4>
            <form id="formRestricciones">
                <!-- Empresa -->
                <div class="form-group">
                    <label for="empresa"><i class="fa-solid fa-building select-icon"></i>Empresa</label>
                    <select class="form-control custom-select" id="empresa" required>
                        <option value="">Seleccione...</option>
                    </select>
                </div>
                <!-- Centro Despacho -->
                <div class="form-group">
                    <label for="centroDespacho"><i class="fa-solid fa-warehouse select-icon"></i>Centro Despacho</label>
                    <select class="form-control custom-select" id="centroDespacho" required>
                        <option value="">Seleccione...</option>
                    </select>
                </div>
                <!-- Producto -->
                <div class="form-group">
                    <label for="producto"><i class="fa-solid fa-cube select-icon"></i>Producto</label>
                    <select class="form-control custom-select" id="producto" required>
                        <option value="">Seleccione...</option>
                    </select>
                </div>
                <!-- Tipo Movimiento -->
                <div class="form-group">
                    <label for="tipoMovimiento"><i class="fa-solid fa-arrows-left-right select-icon"></i>Tipo Movimiento</label>
                    <select class="form-control custom-select" id="tipoMovimiento" required>
                        <option value="">Seleccione...</option>
                        <option>DESPACHO</option>
                        <option>RECEPCIÓN</option>
                    </select>
                </div>
                <!-- Tipo Origen -->
                <div class="form-group">
                    <label for="tipoOrigen"><i class="fa-solid fa-location-dot select-icon"></i>Tipo Origen</label>
                    <select class="form-control custom-select" id="tipoOrigen" required>
                        <option value="">Seleccione...</option>
                    </select>
                </div>
                <!-- Origenes -->
                <div class="form-group">
                    <label for="origenes"><i class="fa-solid fa-map-pin select-icon"></i>Origenes</label>
                    <select class="form-control custom-select" id="origenes" required>
                        <option value="">Seleccione...</option>
                    </select>
                </div>
                <!-- Numeros de Bolsas -->
                <div class="form-group">
                    <label for="bolsasCalidad"><i class="fa-solid fa-boxes-stacked select-icon"></i>Bolsas de Calidad por Ingreso</label>
                    <input type="number" class="form-control" id="bolsasCalidad" min="1" max="6" placeholder="Máx 6" required>
                </div>
                <!-- Orden de Muestreo en Puerto -->
                <div class="form-group form-check">
                    <input type="checkbox" class="form-check-input" id="aplicaOrden">
                    <label class="form-check-label" for="aplicaOrden">Aplica Orden de Muestreo en Puerto</label>
                </div>
                <div id="configDinamica" class="fade-in" style="display:none;"></div>
                <!-- Botones Guardar/Limpiar -->
                <div class="d-flex justify-content-between mt-4">
                    <button type="submit" class="btn btn-success"><i class="fa-solid fa-check mr-1"></i> Guardar</button>
                    <button type="button" class="btn btn-primary" id="btnLimpiar"><i class="fa-solid fa-eraser mr-1"></i> Limpiar</button>
                </div>
            </form>
        </div>
        <!-- Panel de configuración dinámica y registros -->
        <div class="col-lg-8 preview-section">
            <div class="row fade-in" id="configDinamica" style="display:none;"></div>
            <div class="mt-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0"><i class="fa-solid fa-list icon-step"></i>CONFIGURACIONES GUARDADAS</h5>
                    <div class="d-flex align-items-center gap-2">
                        <input type="text" id="buscadorConfiguraciones" class="form-control mr-2" placeholder="Buscar..." style="width: 200px;">
                    </div>
                </div>
                <div class="table-responsive">
<table id="tablaConfiguraciones" class="table table-striped table-bordered w-100" style="min-width:900px;">
    <!-- Titulos de la tabla -->
    <thead>
        <tr>
            <th>Empresa</th>
            <th>Centro</th>
            <th>Producto</th>
            <th>Movimiento</th>
            <th>Tipo Origen</th>
            <th>Bolsas</th>
            <th>Viajes</th>
            <th>Análisis</th>
            <th>Orden Puerto</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
     <!-- Aquí van los registros -->
    </tbody>
</table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal Editar -->
<div class="modal fade" id="modalEditar" tabindex="-1" role="dialog" aria-labelledby="modalEditarLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalEditarLabel"><i class="fa-solid fa-pen-to-square"></i> Editar Configuración</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Cerrar">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" id="editarBody">
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-success" id="btnGuardarEdicion">Guardar Cambios</button>
      </div>
    </div>
  </div>
</div>

<!-- Scripts -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap4.min.js"></script>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap4.min.css">
<script src="../controllers/controlador.js"></script>
<script src="https://cdn.jsdelivr.net/npm/alertifyjs@1.13.1/build/alertify.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</body>
</html>
