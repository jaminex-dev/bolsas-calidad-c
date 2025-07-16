// Función global para mostrar alertas Bootstrap
function mostrarAlerta(mensaje, tipo = 'info', tiempo = 3000) {
    let icon = 'info';
    if (tipo === 'success') icon = 'success';
    else if (tipo === 'danger' || tipo === 'error') icon = 'error';
    else if (tipo === 'warning' || tipo === 'warn') icon = 'warning';
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: icon,
        title: mensaje,
        showConfirmButton: false,
        timer: tiempo,
        timerProgressBar: true
    });
}

// Variable global para tipos de análisis
let tiposAnalisisGlobal = [];

// Utilidad para generar opciones de un select
function generarOpcionesSelect(options, selected, placeholder = 'Seleccione...') {
    let html = `<option value="">${placeholder}</option>`;
    options.forEach(opt => {
        html += `<option value="${opt.value}"${opt.value == selected ? ' selected' : ''}>${opt.text}</option>`;
    });
    return html;
}

// Utilidad para generar un select genérico
function generarSelect({clase = '', options = [], selected = '', placeholder = 'Seleccione...', required = true}) {
    return `<select class="form-control ${clase}"${required ? ' required' : ''}>${generarOpcionesSelect(options, selected, placeholder)}</select>`;
}

// Genera select de viajes (parametrizado)
function generarSelectViajes(clase, selected) {
    let options = [];
    for (let i = 1; i <= 6; i++) {
        options.push({ value: i, text: i });
    }
    return generarSelect({ clase, options, selected, placeholder: 'Viajes...' });
}

// Genera select de análisis (parametrizado)
function generarSelectAnalisis(clase, selected) {
    let options = tiposAnalisisGlobal.map(tipo => ({ value: tipo.idTipoAnalisis, text: tipo.Descripcion }));
    return generarSelect({ clase: `tipo-analisis ${clase || ''}`, options, selected, placeholder: 'Tipo Analisis...' });
}

// Genera tarjetas de bolsas y análisis
function generarTarjetas(numBolsas, viajesArr = [], analisisArr = [], modo = 'crear') {
    let viajesClass = modo === 'editar' ? 'edit-viajes-bolsa' : 'viajes-bolsa';
    let analisisClass = modo === 'editar' ? 'edit-tipo-analisis' : 'tipo-analisis';
    let html = `<div class='col-md-6 mb-2'><div class='card h-100'><div class='card-header bg-primary text-white'><i class='fa-solid fa-box icon-step'></i> Viajes por Bolsa</div><div class='card-body'>`;
    for (let i = 0; i < numBolsas; i++) {
        html += `<div class='form-group row align-items-center mb-2'>
            <label class='col-2 col-form-label text-right pr-0'>#${i+1}</label>
            <div class='col-10'>${generarSelectViajes(viajesClass, viajesArr[i]||'')}</div>
        </div>`;
    }
    html += `</div></div></div>`;
    html += `<div class='col-md-6 mb-2'><div class='card h-100'><div class='card-header bg-info text-white'><i class='fa-solid fa-flask-vial icon-step'></i> Tipo de Análisis</div><div class='card-body'>`;
    for (let i = 0; i < numBolsas; i++) {
        html += `<div class='form-group row align-items-center mb-2'>
            <label class='col-2 col-form-label text-right pr-0'>#${i+1}</label>
            <div class='col-10'>${generarSelectAnalisis(analisisClass, analisisArr[i]||'')}</div>
        </div>`;
    }
    html += `</div></div></div>`;
    return html;
}

// Genera formulario 
function generarFormEditarUnificado(obj) {
    let isArray = Array.isArray(obj);
    let numBolsas = Math.min(parseInt(isArray ? obj[5] : obj.bolsas) || 1, 6);
    let viajesArr = isArray
        ? (obj[6] ? obj[6].split(',').map(v => v.trim()) : [])
        : ((obj.detalles || []).map(d => d.viajes));
    let analisisArr = isArray
        ? (obj[7] ? obj[7].split(',').map(a => a.trim()) : [])
        : ((obj.detalles || []).map(d => d.idTipoAnalisis));
    let checkedOrden = isArray
        ? (obj[8] && obj[8].toUpperCase().includes('APLICA') ? 'checked' : '')
        : (obj.aplicaOrden ? 'checked' : '');
    let empresaOptions = $('#empresa').html();
    let centroOptions = $('#centroDespacho').html();
    let productoOptions = $('#producto').html();
    let tipoDestinoOptions = $('#tipoDestino').html();
    let destinoOptions = $('#destino').html();
    let origenesOptions = $('#origenes').html();
    // Generar tarjetas y separar bloques
    let tarjetasHtml = generarTarjetas(numBolsas, viajesArr, analisisArr, 'editar');
    let tempDiv = $('<div>' + tarjetasHtml + '</div>');
    let viajesHtml = tempDiv.children().eq(0).prop('outerHTML');
    let analisisHtml = tempDiv.children().eq(1).prop('outerHTML');
    return `<form id='formEditar'>
        <div class='form-row'>
          <div class='form-group col-md-6'><label>Empresa</label>
            <select class='form-control' id='editEmpresa' required>${empresaOptions}</select></div>
          <div class='form-group col-md-6'><label>Centro</label>
            <select class='form-control' id='editCentro' required>${centroOptions}</select></div>
        </div>
        <div class='form-row'>
          <div class='form-group col-md-6'><label>Producto</label>
            <select class='form-control' id='editProducto' required>${productoOptions}</select></div>
          <div class='form-group col-md-6'><label>Movimiento</label>
            <select class='form-control' id='editMovimiento' required>
              <option value=''>Seleccione...</option>
              <option value='DESPACHO'>DESPACHO</option>
              <option value='RECEPCIÓN'>RECEPCIÓN</option>
            </select></div>
        </div>
        <div class='form-row'>
          <div class='form-group col-md-4'><label>Tipo Destino</label>
            <select class='form-control' id='editTipoDestino' required>${tipoDestinoOptions}</select></div>
          <div class='form-group col-md-4'><label>Destino</label>
            <select class='form-control' id='editDestino' required>${destinoOptions}</select></div>
          <div class='form-group col-md-2'><label>Bolsas</label>
            <input type='number' min='1' max='6' class='form-control' id='editBolsas' value='${numBolsas}' required></div>
          <div class='form-group col-md-2'><label>Orígenes</label>
            <select class='form-control' id='editOrigenes' required>${origenesOptions}</select></div>
        </div>
        <div class='row'>
          ${viajesHtml}
          ${analisisHtml}
        </div>
        <div class='form-group form-check mt-3'>
          <input type="checkbox" class="form-check-input" id="editOrdenPuerto" ${checkedOrden}>
          <label class="form-check-label" for="editOrdenPuerto">Aplica Orden de Muestreo en Puerto</label>
        </div>
      </form>`;
}

// Cargar tipos de análisis 
function cargarTiposAnalisisGlobal(callback) {
    if (tiposAnalisisGlobal.length > 0) {
        if (callback) callback();
        return;
    }
    $.ajax({
        url: '../servicios/api-bolsa-calidad/api.php/tiposanalisis',
        method: 'GET',
        dataType: 'json',
        success: function(res) {
            if(res.success && Array.isArray(res.data)) {
                tiposAnalisisGlobal = res.data;
                if (callback) callback();
            } else {
                mostrarAlerta('No se pudieron cargar los tipos de análisis', 'danger');
            }
        },
        error: function(xhr, status, error) {
            mostrarAlerta('Error al consultar tipos de análisis: ' + xhr.responseText, 'danger');
        }
    });
}

// Recargar tabla de configuraciones 
function recargarTablaConfiguraciones() {
    $.ajax({
        url: '../servicios/api-bolsa-calidad/api.php/bolsas',
        method: 'GET',
        dataType: 'json',
        success: function(res) {
            if(res.success && Array.isArray(res.data)) {
                window.ultimaRespuestaBolsas = res.data; 
                tablaConfiguraciones.clear();
                res.data.forEach(function(item) {
                    // Usar los campos destinoNombre y origenNombre que ya vienen del backend
                    let destinoNombre = (item.destinoNombre && item.destinoNombre !== '' && item.destinoNombre !== null) ? item.destinoNombre : '-';
                    let origenNombre = (item.origenNombre && item.origenNombre !== '' && item.origenNombre !== null) ? item.origenNombre : '-';
                    tablaConfiguraciones.row.add([
                        item.empresaNombre || item.empresa || '-',
                        item.centroDespacho || item.centro || '-',
                        item.productoNombre || item.producto || '-',
                        item.tipoMovimiento || '-',
                        item.tipoDestinoNombre || item.tipoDestino || '-',
                        destinoNombre,
                        origenNombre,
                        item.bolsas || '-',
                        (item.detalles && item.detalles.length > 0 ? item.detalles.map(d => d.viajes).join(', ') : '-'),
                        (item.detalles && item.detalles.length > 0 ? item.detalles.map(d => d.tipoAnalisisNombre || d.idTipoAnalisis).join(', ') : '-'),
                        Number(item.aplicaOrden) === 1 ? 'SI APLICA ORDEN EN PUERTO' : 'NO APLICA ORDEN EN PUERTO',
                        `<button class='btn btn-sm btn-primary btn-editar'><i class='fa fa-edit'></i></button> <button class='btn btn-sm btn-danger btn-eliminar'><i class='fa fa-trash'></i></button>`,
                        item.id || ''
                    ]);
                });
                tablaConfiguraciones.draw();
            } else {
                tablaConfiguraciones.clear().draw();
                mostrarAlerta('No hay configuraciones guardadas.', 'info');
            }
        },
        error: function(xhr) {
            mostrarAlerta('Error al cargar configuraciones: ' + xhr.responseText, 'danger');
        }
    });
}
 
$(document).ready(function() {
    // Lógica condicional para mostrar/ocultar campos según Tipo Movimiento
    function actualizarCamposPorMovimiento() {
        const tipoMovimiento = $('#tipoMovimiento').val();
        if (tipoMovimiento === 'DESPACHO') {
            // Mostrar y requerir destino y tipoDestino, ocultar y limpiar origenes
            $('#tipoDestino').closest('.form-group').show().find('select').prop('required', true);
            $('#destino').closest('.form-group').show().find('select').prop('required', true);
            $('#origenes').closest('.form-group').hide().find('select').prop('required', false).val('');
        } else if (tipoMovimiento === 'RECEPCIÓN') {
            // Mostrar y requerir origenes, ocultar y limpiar destino y tipoDestino
            $('#tipoDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
            $('#destino').closest('.form-group').hide().find('select').prop('required', false).val('');
            $('#origenes').closest('.form-group').show().find('select').prop('required', true);
        } else {
            // Si no hay selección, ocultar todos y limpiar
            $('#tipoDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
            $('#destino').closest('.form-group').hide().find('select').prop('required', false).val('');
            $('#origenes').closest('.form-group').hide().find('select').prop('required', false).val('');
        }
    }
    // Inicializar visibilidad al cargar
    actualizarCamposPorMovimiento();
    // Evento cambio de tipoMovimiento
    $('#tipoMovimiento').on('change', function() {
        actualizarCamposPorMovimiento();
        // Limpiar selects relacionados al cambiar tipo de movimiento
        $('#tipoDestino').val('');
        $('#destino').val('');
        $('#origenes').val('');
    });
    // Ocultar campos al limpiar
    $('#btnLimpiar').on('click', function() {
        $('#tipoDestino').closest('.form-group').hide().find('select').prop('required', false);
        $('#destino').closest('.form-group').hide().find('select').prop('required', false);
        $('#origenes').closest('.form-group').hide().find('select').prop('required', false);
    });
    if ($.fn.DataTable.isDataTable('#tablaConfiguraciones')) {
        $('#tablaConfiguraciones').DataTable().destroy();
    }
    // Inicializar DataTables
    tablaConfiguraciones = $('#tablaConfiguraciones').DataTable({
        dom: 'lrtip', 
        language: { url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json' },
        ordering: false, searching: true, paging: true, info: true,
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
        columns: [
            { title: 'Empresa' },
            { title: 'Centro Despacho' },
            { title: 'Producto' },
            { title: 'Movimiento' },
            { title: 'Tipo Destino' },
            { title: 'Destino' },
            { title: 'Origen' },
            { title: 'Bolsas' },
            { title: 'Viajes' },
            { title: 'Análisis' },
            { title: 'Orden Puerto' },
            { title: 'Acciones', orderable: false, searchable: false },
            { title: 'ID', visible: false, searchable: false } // Columna oculta para el ID
        ],
        drawCallback: function() {
            setTimeout(function() {
                $('[data-toggle="tooltip"]').tooltip({container: 'body', placement: 'top'});
            }, 200);
        },
        createdRow: function(row, data, dataIndex) {
            $(row).find('button.btn-editar, button.btn-eliminar').css('cursor', 'pointer');
        },
        columnDefs: [
            {
                targets: -1,
                orderable: false,
                searchable: false,
                createdCell: function(td, cellData, rowData, row, col) {
                    $(td).find('button').css('cursor', 'pointer');
                }
            },
            {
                targets: [12], // Columna ID oculta
                visible: false,
                searchable: false
            }
        ]
    });

    // --- Recargar tabla de configuraciones ---
    recargarTablaConfiguraciones();

    // Cargar proveedores (RESTful)
    function cargarProveedoresSelect(selector) {
        $.ajax({
            url: '../servicios/api-bolsa-calidad/api.php/proveedores',
            method: 'GET',
            dataType: 'json',
            success: function(res) {
                if(res.success && Array.isArray(res.data)) {
                    var $select = $(selector);
                    $select.empty();
                    $select.append('<option value="">Seleccione...</option>');
                    res.data.forEach(function(prov) {
                        $select.append('<option value="'+prov.idProveedor+'">'+prov.Proveedor+'</option>');
                    });
                } else {
                    mostrarAlerta('No se pudieron cargar los proveedores', 'danger');
                }
            },
            error: function(xhr, status, error) {
                mostrarAlerta('Error al consultar proveedores: ' + xhr.responseText, 'danger');
            }
        });
    }
    // Cargar productos (RESTful)
    function cargarProductosSelect(selector) {
        $.ajax({
            url: '../servicios/api-bolsa-calidad/api.php/productos',
            method: 'GET',
            dataType: 'json',
            success: function(res) {
                if(res.success && Array.isArray(res.data)) {
                    var $select = $(selector);
                    $select.empty();
                    $select.append('<option value="">Seleccione...</option>');
                    res.data.forEach(function(prod) {
                        $select.append('<option value="'+prod.idProducto+'">'+prod.Producto+'</option>');
                    });
                } else {
                    mostrarAlerta('No se pudieron cargar los productos', 'danger');
                }
            },
            error: function(xhr, status, error) {
                mostrarAlerta('Error al consultar productos: ' + xhr.responseText, 'danger');
            }
        });
    }
    // Cargar tipos de análisis (RESTful)
    function cargarTiposAnalisisSelect(selector) {
        $.ajax({
            url: '../servicios/api-bolsa-calidad/api.php/tiposanalisis',
            method: 'GET',
            dataType: 'json',
            success: function(res) {
                if(res.success && Array.isArray(res.data)) {
                    var $select = $(selector);
                    $select.empty();
                    $select.append('<option value="">Seleccione...</option>');
                    res.data.forEach(function(tipo) {
                        $select.append('<option value="'+tipo.idTipoAnalisis+'">'+tipo.Descripcion+'</option>');
                    });
                } else {
                    mostrarAlerta('No se pudieron cargar los tipos de análisis', 'danger');
                }
            },
            error: function(xhr, status, error) {
                mostrarAlerta('Error al consultar tipos de análisis: ' + xhr.responseText, 'danger');
            }
        });
    }
    // Cargar destino (RESTful, igual que proveedores pero función separada)
    function cargarDestinoSelect(selector) {
        $.ajax({
            url: '../servicios/api-bolsa-calidad/api.php/proveedores',
            method: 'GET',
            dataType: 'json',
            success: function(res) {
                if(res.success && Array.isArray(res.data)) {
                    var $select = $(selector);
                    $select.empty();
                    $select.append('<option value="">Seleccione...</option>');
                    res.data.forEach(function(prov) {
                        $select.append('<option value="'+prov.idProveedor+'">'+prov.Proveedor+'</option>');
                    });
                } else {
                    mostrarAlerta('No se pudieron cargar los destinos', 'danger');
                }
            },
            error: function(xhr, status, error) {
                mostrarAlerta('Error al consultar destinos: ' + xhr.responseText, 'danger');
            }
        });
    }

    // Llenar todos los campos
    cargarProveedoresSelect('#empresa');
    cargarProveedoresSelect('#centroDespacho');
    cargarProveedoresSelect('#tipoDestino');
    cargarProveedoresSelect('#origenes');
    cargarDestinoSelect('#destino');
    cargarProductosSelect('#producto');
    cargarTiposAnalisisSelect('#tipoAnalisis');

    // Evento cambio bolsas (crear)
    $('#bolsasCalidad').on('input change', function() {
        let self = this;
        let val = $(self).val();
        val = val.replace(/[^0-9]/g, '');
        let intVal = parseInt(val, 10);
        if (isNaN(intVal)) intVal = '';
        else if (intVal < 1) intVal = 1;
        else if (intVal > 6) intVal = 6;
        if (val !== '' && (val.includes('.') || val.includes(',') || /[^0-9]/.test(val))) {
            mostrarAlerta('Solo se permiten números enteros entre 1 y 6', 'warning');
        }
        $(self).val(intVal);
        cargarTiposAnalisisGlobal(function() {
            if (intVal >= 1 && intVal <= 6) {
                let html = `<div class="row">${generarTarjetas(intVal)}</div>`;
                $('#configDinamica').html(html).fadeIn();
            } else {
                let html = `<div class=\"row\">${generarTarjetas(1)}</div>`;
                $('#configDinamica').html(html).fadeIn();
            }
        });
    });
    // limpiar formulario
    $('#btnLimpiar').on('click', function() {
        tarjetasGeneradas = false;
        tarjetasCantidad = null;
        $('#formRestricciones')[0].reset();
        $('#configDinamica').hide();
        $('#formRestricciones').find('.is-invalid').removeClass('is-invalid');
        editIndex = null;
        $('#formRestricciones button[type="submit"]').html('<i class="fa-solid fa-check mr-1"></i> Activar');
    });

    // Validación Formulario 
    $('#formRestricciones').on('input change', 'select, input', function() {
        if ($(this).prop('required')) {
            if (!$(this).val()) {
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        }
    });

    // Validación de campos (viajes y análisis)
    $(document).on('input change', '.viajes-bolsa, .tipo-analisis', function() {
        if (!$(this).val()) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    // Funciones para obtener nombre por ID
    function getDestinoNombre(id) {
        let nombre = id;
        $('#destino option').each(function() {
            if ($(this).val() == id) nombre = $(this).text();
        });
        return nombre;
    }
    function getProveedorNombre(id) {
        let nombre = id;
        $('#empresa option').each(function() {
            if ($(this).val() == id) nombre = $(this).text();
        });
        return nombre;
    }
    function getCentroNombre(id) {
        let nombre = id;
        $('#centroDespacho option').each(function() {
            if ($(this).val() == id) nombre = $(this).text();
        });
        return nombre;
    }
    function getProductoNombre(id) {
        let nombre = id;
        $('#producto option').each(function() {
            if ($(this).val() == id) nombre = $(this).text();
        });
        return nombre;
    }
    function getTipoDestinoNombre(id) {
        let nombre = id;
        $('#tipoDestino option').each(function() {
            if ($(this).val() == id) nombre = $(this).text();
        });
        return nombre;
    }

    // --- Funciones para obtener nombre por ID para edición (usando selects del formulario principal) ---
    function getDestinoNombreByValue(value) {
        let nombre = value;
        $('#destino option').each(function() {
            if ($(this).val() == value) nombre = $(this).text();
        });
        return nombre;
    }
    function getProveedorNombreByValue(value) {
        let nombre = value;
        $('#empresa option').each(function() {
            if ($(this).val() == value) nombre = $(this).text();
        });
        return nombre;
    }
    function getCentroNombreByValue(value) {
        let nombre = value;
        $('#centroDespacho option').each(function() {
            if ($(this).val() == value) nombre = $(this).text();
        });
        return nombre;
    }
    function getProductoNombreByValue(value) {
        let nombre = value;
        $('#producto option').each(function() {
            if ($(this).val() == value) nombre = $(this).text();
        });
        return nombre;
    }
    function getTipoDestinoNombreByValue(value) {
        let nombre = value;
        $('#tipoDestino option').each(function() {
            if ($(this).val() == value) nombre = $(this).text();
        });
        return nombre;
    }

    // Envío formulario crear/editar
    $('#formRestricciones').on('submit', function(e) {
        e.preventDefault();
        let valid = true;
        const tipoMovimiento = $('#tipoMovimiento').val();
        // Validación según tipo de movimiento
        if (!$('#empresa').val()) { $('#empresa').addClass('is-invalid'); valid = false; }
        if (!$('#centroDespacho').val()) { $('#centroDespacho').addClass('is-invalid'); valid = false; }
        if (!$('#producto').val()) { $('#producto').addClass('is-invalid'); valid = false; }
        if (!tipoMovimiento) { $('#tipoMovimiento').addClass('is-invalid'); valid = false; }
        if (tipoMovimiento === 'DESPACHO') {
            if (!$('#tipoDestino').val()) { $('#tipoDestino').addClass('is-invalid'); valid = false; }
            if (!$('#destino').val()) { $('#destino').addClass('is-invalid'); valid = false; }
        }
        if (tipoMovimiento === 'RECEPCIÓN') {
            if (!$('#origenes').val()) { $('#origenes').addClass('is-invalid'); valid = false; }
        }
        if (!$('#bolsasCalidad').val() || isNaN($('#bolsasCalidad').val()) || $('#bolsasCalidad').val() < 1 || $('#bolsasCalidad').val() > 6) {
            $('#bolsasCalidad').addClass('is-invalid'); valid = false;
        }
        // Validar detalles
        $('.viajes-bolsa').each(function(){ if (!$(this).val()) { $(this).addClass('is-invalid'); valid = false; } });
        $('.tipo-analisis').each(function(){ if (!$(this).val()) { $(this).addClass('is-invalid'); valid = false; } });
        if (!valid) {
            mostrarAlerta('Por favor complete todos los campos obligatorios.', 'danger');
            return;
        }
        // Obtener valores del formulario
        const empresa = $('#empresa').val();
        const centro = $('#centroDespacho').val();
        const producto = $('#producto').val();
        const tipoDestino = tipoMovimiento === 'DESPACHO' ? $('#tipoDestino').val() : null;
        const destino = tipoMovimiento === 'DESPACHO' ? $('#destino').val() : null;
        const origen = tipoMovimiento === 'RECEPCIÓN' ? $('#origenes').val() : null;
        const bolsas = $('#bolsasCalidad').val();
        const aplicaOrden = $('#aplicaOrden').is(':checked') ? 1 : 0;
        let detalles = [];
        $('.viajes-bolsa').each(function(i){
            detalles[i] = detalles[i] || {};
            detalles[i].numeroBolsa = i+1;
            detalles[i].viajes = $(this).val();
        });
        $('.tipo-analisis').each(function(i){
            detalles[i] = detalles[i] || {};
            detalles[i].idTipoAnalisis = $(this).val();
        });
        // Enviar a la API 
        $.ajax({
            url: '../servicios/api-bolsa-calidad/api.php/bolsas',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                empresa,
                centro,
                producto,
                tipoMovimiento,
                tipoDestino,
                destino,
                origen,
                bolsas,
                aplicaOrden,
                detalles
            }),
            success: function(res) {
                mostrarAlerta('¡Configuración guardada en base de datos!', 'success');
                recargarTablaConfiguraciones(); // <--- Recargar tabla tras guardar
            },
            error: function(xhr) {
                mostrarAlerta('Error al guardar: ' + xhr.responseText, 'danger');
            }
        });
        // Limpiar formulario
        this.reset();
        $('#configDinamica').hide();
    });

    // Botón Limpiar
    $('#btnLimpiar').on('click', function() {
        $('#formRestricciones')[0].reset();
        $('#configDinamica').hide();
        $('#formRestricciones').find('.is-invalid').removeClass('is-invalid');
        editIndex = null;
        $('#formRestricciones button[type="submit"]').html('<i class="fa-solid fa-check mr-1"></i> Activar');
        mostrarAlerta('Formulario limpiado', 'info');
    });

   // Editar registro
    $(document).on('click', '.btn-editar', function(){
        let row = $(this).closest('tr');
        let data = tablaConfiguraciones.row(row).data();
        let id = data[10];
        let item = null;
        if (window.ultimaRespuestaBolsas && Array.isArray(window.ultimaRespuestaBolsas)) {
            item = window.ultimaRespuestaBolsas.find(x => x.id == id);
        }
        if (!item) {
            mostrarAlerta('No se pudo cargar el registro completo para edición.', 'danger');
            return;
        }
        // Asegura que los tipos de análisis estén cargados antes de abrir el modal y generar tarjetas
        cargarTiposAnalisisGlobal(function() {
            $('#editarBody').html(generarFormEditarUnificado(item));
            // Setear valores en selects
            $('#editEmpresa').val(item.empresa);
            $('#editCentro').val(item.centro);
            $('#editProducto').val(item.producto);
            $('#editMovimiento').val(item.tipoMovimiento);
            $('#editTipoDestino').val(item.tipoDestino);
            $('#editDestino').val(item.destino);
            $('#editOrigenes').val(item.origen);
            // Lógica condicional para mostrar/ocultar campos según Tipo Movimiento en el modal editar
            function actualizarCamposPorMovimientoEditar() {
                const tipoMovimiento = $('#editMovimiento').val();
                if (tipoMovimiento === 'DESPACHO') {
                    // Mostrar y requerir destino y tipoDestino, ocultar y limpiar origenes
                    $('#editTipoDestino').closest('.form-group').show().find('select').prop('required', true);
                    $('#editDestino').closest('.form-group').show().find('select').prop('required', true);
                    $('#editOrigenes').closest('.form-group').hide().find('select').prop('required', false).val('');
                } else if (tipoMovimiento === 'RECEPCIÓN') {
                    // Mostrar y requerir origenes, ocultar y limpiar destino y tipoDestino
                    $('#editTipoDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
                    $('#editDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
                    $('#editOrigenes').closest('.form-group').show().find('select').prop('required', true);
                } else {
                    // Si no hay selección, ocultar todos y limpiar
                    $('#editTipoDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
                    $('#editDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
                    $('#editOrigenes').closest('.form-group').hide().find('select').prop('required', false).val('');
                }
            }
            // Inicializar visibilidad al cargar el modal
            actualizarCamposPorMovimientoEditar();
            // Evento cambio de tipoMovimiento en el modal editar
            $('#editMovimiento').on('change', function() {
                actualizarCamposPorMovimientoEditar();
                // Limpiar selects relacionados al cambiar tipo de movimiento
                $('#editTipoDestino').val('');
                $('#editDestino').val('');
                $('#editOrigenes').val('');
            });
            $('#modalEditar').modal('show');
        });
        // Actualizar tarjetas al cambiar bolsas (edición)
        $(document).off('input change', '#editBolsas').on('input change', '#editBolsas', function() {
            let val = $(this).val();
            val = val.replace(/[^0-9]/g, '');
            let intVal = parseInt(val, 10);
            if (isNaN(intVal)) intVal = '';
            else if (intVal < 1) intVal = 1;
            else if (intVal > 6) intVal = 6;
            if (val !== '' && (val.includes('.') || val.includes(',') || /[^0-9]/.test(val))) {
                mostrarAlerta('Solo se permiten números enteros entre 1 y 6', 'warning');
            }
            $(this).val(intVal);
            // Solo actualizar tarjetas si el valor es válido
            if (intVal >= 1 && intVal <= 6) {
                let viajesArr = [];
                let analisisArr = [];
                $('.edit-viajes-bolsa').each(function(){ viajesArr.push($(this).val()); });
                $('.edit-tipo-analisis').each(function(){ analisisArr.push($(this).val()); });
                let tarjetas = generarTarjetas(intVal, viajesArr, analisisArr, 'editar');
                $('#editarBody .row.mt-3').replaceWith(`<div class='row mt-3'>${tarjetas}</div>`);
            }
        });
        // Validación en tiempo real para el modal editar
        $('#editarBody').on('input change', 'select, input', function() {
            if ($(this).prop('required')) {
                if (!$(this).val()) {
                    $(this).addClass('is-invalid');
                } else {
                    $(this).removeClass('is-invalid');
                }
            }
        });
        // Guardar cambios
        $('#btnGuardarEdicion').off('click').on('click', function() {
            let valid = true;
            // Validar todos los campos requeridos
            $('#formEditar [required]').each(function() {
                if (!$(this).val() || $(this).val() === '') {
                    $(this).addClass('is-invalid');
                    valid = false;
                } else {
                    $(this).removeClass('is-invalid');
                }
            });
            if (!valid) {
                Swal.fire({
                    icon: 'error',
                    title: 'Campos obligatorios',
                    text: 'Por favor complete todos los campos obligatorios antes de guardar.',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }
            let editViajes = [];
            let editAnalisis = [];
            $('.edit-viajes-bolsa').each(function(i){
                editViajes[i] = editViajes[i] || {};
                editViajes[i] = $(this).val();
            });
            $('.edit-tipo-analisis').each(function(i){
                editAnalisis[i] = editAnalisis[i] || {};
                editAnalisis[i] = $(this).val();
            });
            let detalles = [];
            for (let i = 0; i < editViajes.length; i++) {
                detalles[i] = detalles[i] || {};
                detalles[i].numeroBolsa = i+1;
                detalles[i].viajes = editViajes[i];
                detalles[i].idTipoAnalisis = editAnalisis[i];
            }
            // Obtener valores del formulario
            const empresa = $('#editEmpresa').val();
            const centro = $('#editCentro').val();
            const producto = $('#editProducto').val();
            const tipoMovimiento = $('#editMovimiento').val();
            const tipoDestino = $('#editTipoDestino').val();
            const origen = $('#editOrigenes').val();
            const bolsas = $('#editBolsas').val();
            const aplicaOrden = $('#editOrdenPuerto').is(':checked') ? 1 : 0;
            // Enviar PUT a la API
            $.ajax({
                url: '../servicios/api-bolsa-calidad/api.php/bolsas/' + encodeURIComponent(id),
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    empresa,
                    centro,
                    producto,
                    tipoMovimiento,
                    tipoDestino,
                    origen,
                    bolsas,
                    aplicaOrden,
                    detalles
                }),
                success: function(res) {
                    mostrarAlerta('¡Configuración actualizada correctamente!', 'success');
                    $('#modalEditar').modal('hide');
                    recargarTablaConfiguraciones();
                },
                error: function(xhr) {
                    mostrarAlerta('Error al actualizar: ' + xhr.responseText, 'danger');
                }
            });
        });
    }); 

    // Eliminar registro
    $(document).on('click', '.btn-eliminar', function(){
        let row = $(this).closest('tr');
        let data = tablaConfiguraciones.row(row).data();
        let id = data[10]; 
        Swal.fire({
            title: '¿Está seguro de eliminar esta configuración?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                if(id) {
                    $.ajax({
                        url: '../servicios/api-bolsa-calidad/api.php/bolsas/' + encodeURIComponent(id),
                        method: 'DELETE',
                        contentType: 'application/json',
                        data: JSON.stringify({ soloDesactivar: true }),
                        success: function(res) {
                            mostrarAlerta('Configuración eliminada correctamente.', 'success');
                            recargarTablaConfiguraciones();
                        },
                        error: function(xhr) {
                            mostrarAlerta('Error al eliminar: ' + xhr.responseText, 'danger');
                        }
                    });
                } else {
                    mostrarAlerta('No se pudo obtener el ID de la configuración.', 'danger');
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                mostrarAlerta('Eliminación cancelada.', 'info');
            }
        });
    });

    // Buscador fuera del DataTable
    $('#buscadorConfiguraciones').on('keyup', function() {
        $('#tablaConfiguraciones').DataTable().search(this.value).draw();
    });
});




