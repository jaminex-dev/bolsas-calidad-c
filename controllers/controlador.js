// Controlador para la gestión de bolsas de calidad
$('#tipoDestino').on('change', function() {
    var idClase = $(this).val();
    var $destino = $('#destino');
    $destino.empty().append('<option value="">Seleccione...</option>');
    if (idClase) {
        $.ajax({
            url: '../servicios/api-bolsa-calidad/api.php/destino?idClase=' + encodeURIComponent(idClase),
            method: 'GET',
            dataType: 'json',
            success: function(res) {
                $destino.empty().append('<option value="">Seleccione...</option>');
                if(res.success && Array.isArray(res.data) && res.data.length > 0) {
                    res.data.forEach(function(item) {
                        $destino.append('<option value="'+item.idDestino+'">'+(item.Descripcion || '-')+'</option>');
                    });
                    $destino.prop('disabled', false);
                } else {
                    $destino.prop('disabled', true);
                }
            },
            error: function(xhr) {
                $destino.empty().append('<option value="">Seleccione...</option>').prop('disabled', true);
            }
        });
    } else {
        $destino.prop('disabled', true);
    }
});

// Función para decodificar entidades HTML y mostrar caracteres especiales correctamente
function decodeHtmlEntities(str) {
    if (!str) return '';
    return $('<textarea/>').html(str).text();
}

// Llenar select de origenes al cargar la página
$(document).ready(function() {
    var $origenes = $('#origenes');
    if ($origenes.length) {
        $.ajax({
            url: '../servicios/api-bolsa-calidad/api.php/origenes',
            method: 'GET',
            dataType: 'json',
            success: function(res) {
                $origenes.empty().append('<option value="">Seleccione...</option>');
                if(res.success && Array.isArray(res.data) && res.data.length > 0) {
                    res.data.forEach(function(item) {
                        $origenes.append('<option value="'+item.idOrigen+'">'+decodeHtmlEntities(item.Mina || '-')+'</option>');
                    });
                    $origenes.prop('disabled', false);
                } else {
                    $origenes.prop('disabled', true);
                }
            },
            error: function(xhr) {
                $origenes.empty().append('<option value="">Seleccione...</option>').prop('disabled', true);
            }
        });
    }
});
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
        html += `<option value="${opt.value}"${opt.value == selected ? ' selected' : ''}>${decodeHtmlEntities(opt.text)}</option>`;
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
          <div class='form-group col-md-2'><label>Bolsas</label>
            <input type='number' min='1' max='6' class='form-control' id='editBolsas' value='${numBolsas}' required></div>
          <div class='form-group col-md-4'><label>Tipo Destino</label>
            <select class='form-control' id='editTipoDestino' required>${tipoDestinoOptions}</select></div>
          <div class='form-group col-md-4'><label>Destino</label>
            <select class='form-control' id='editDestino' required>${destinoOptions}</select></div>
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
                    let destinoNombre = (item.destinoNombre && item.destinoNombre !== '' && item.destinoNombre !== null) ? item.destinoNombre : '-';
                    let origenNombre = (item.origenNombre && item.origenNombre !== '' && item.origenNombre !== null) ? item.origenNombre : '-';
                    tablaConfiguraciones.row.add([
                        item.empresaNombre || item.empresa || '-',
                        item.centroDespachoNombre || item.centro || '-',
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
                        item.id || '',
                        JSON.stringify(item) 
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
    $('#tipoMovimiento').on('change', function() {
        actualizarCamposPorMovimiento();
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
            { title: 'ID', visible: false, searchable: false } 
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
                targets: [12], 
                visible: false,
                searchable: false
            }
        ]
    });


    // --- Recargar tabla de configuraciones y filtrar visualmente por centroDespacho y tipoMovimiento ---
    function recargarTablaConfiguracionesFiltrado() {
        const tipoMovimiento = $('#tipoMovimiento').val();
        const centroDespacho = $('#centroDespacho').val();
        $.ajax({
            url: '../servicios/api-bolsa-calidad/api.php/bolsas',
            method: 'GET',
            dataType: 'json',
            success: function(res) {
                if(res.success && Array.isArray(res.data)) {
                    window.ultimaRespuestaBolsas = res.data; 
                    tablaConfiguraciones.clear();
                    let filtrados = res.data;
                    // Si hay centroDespacho seleccionado, filtrar por el ID del centro
                    if (centroDespacho) {
                        filtrados = filtrados.filter(function(item) {
                            return (item.centro || '').toString() === centroDespacho.toString();
                        });
                    }
                    // Si hay tipoMovimiento seleccionado, filtrar por ese movimiento
                    if (tipoMovimiento) {
                        filtrados = filtrados.filter(function(item) {
                            return (item.tipoMovimiento || '').toUpperCase() === tipoMovimiento.toUpperCase();
                        });
                    }
                    filtrados.forEach(function(item) {
                        let destinoNombre = (item.destinoNombre && item.destinoNombre !== '' && item.destinoNombre !== null) ? item.destinoNombre : '-';
                        let origenNombre = (item.origenNombre && item.origenNombre !== '' && item.origenNombre !== null) ? item.origenNombre : '-';
                        tablaConfiguraciones.row.add([
                            item.empresaNombre || item.empresa || '-',
                            item.centroDespachoNombre || item.centro || '-',
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
                            item.id || '',
                            JSON.stringify(item)
                        ]);
                    });
                    tablaConfiguraciones.draw();
                } else {
                    tablaConfiguraciones.clear().draw();
                    mostrarAlerta('No hay configuraciones guardadas.', 'info');
                }
            },
            error: function(xhr) {
                tablaConfiguraciones.clear().draw();
                mostrarAlerta('Error al cargar configuraciones: ' + xhr.responseText, 'danger');
            }
        });
    }

    // Evento para recargar tabla al cambiar centroDespacho o tipoMovimiento
    $('#tipoMovimiento, #centroDespacho').on('change', function() {
        recargarTablaConfiguracionesFiltrado();
    });

    // Al cargar la página, mostrar todas las configuraciones guardadas
    recargarTablaConfiguracionesFiltrado();

    // Cargar proveedores (RESTful) y clase para tipoDestino
    function cargarProveedoresSelect(selector) {
        var url, labelField, valueField;
        if(selector === '#empresa') {
            url = '../servicios/api-bolsa-calidad/api.php/proveedores';
            labelField = 'RazonSocial';
            valueField = 'idProveedor';
        } else if(selector === '#tipoDestino') {
            url = '../servicios/api-bolsa-calidad/api.php/clase';
            labelField = 'Descripcion';
            valueField = 'idClase';
        } else if(selector === '#centroDespacho') {
            url = '../servicios/api-bolsa-calidad/api.php/centrodespacho';
            labelField = 'Descripcion';
            valueField = 'idDestino';
        } else if(selector === '#destino') {
            var idClase = $('#tipoDestino').val();
            url = '../servicios/api-bolsa-calidad/api.php/destino' + (idClase ? ('?idClase=' + encodeURIComponent(idClase)) : '');
            labelField = 'Descripcion';
            valueField = 'idDestino';
        } else {
            url = '../servicios/api-bolsa-calidad/api.php/centrodespacho';
            labelField = 'Descripcion';
            valueField = 'idDestino';
        }
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function(res) {
                if(res.success && Array.isArray(res.data)) {
                    var $select = $(selector);
                    $select.empty();
                    $select.append('<option value="">Seleccione...</option>');
                    res.data.forEach(function(item) {
                        $select.append('<option value="'+item[valueField]+'">'+(item[labelField] || '-')+'</option>');
                    });
                } else {
                    let msg = 'No se pudieron cargar los datos';
                    if(selector === '#centroDespacho') msg = 'No se pudieron cargar los centros de despacho';
                    else if(selector === '#destino') msg = 'No se pudieron cargar los destinos';
                    mostrarAlerta(msg, 'danger');
                }
            },
            error: function(xhr, status, error) {
                let msg = 'Error al consultar datos: ' + xhr.responseText;
                if(selector === '#centroDespacho') msg = 'Error al consultar centros de despacho: ' + xhr.responseText;
                else if(selector === '#destino') msg = 'Error al consultar destinos: ' + xhr.responseText;
                mostrarAlerta(msg, 'danger');
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
    // Cargar selects al iniciar
    cargarProveedoresSelect('#empresa');
    cargarProveedoresSelect('#centroDespacho');
    cargarProveedoresSelect('#tipoDestino');
    cargarProveedoresSelect('#origenes');
    cargarProductosSelect('#producto');
    cargarTiposAnalisisSelect('#tipoAnalisis');

    // Llenar todos los campos
    cargarProveedoresSelect('#empresa');
    cargarProveedoresSelect('#centroDespacho');
    cargarProveedoresSelect('#tipoDestino');
    cargarProveedoresSelect('#origenes');

    // No cargar destino aquí, se cargará dinámicamente según tipoDestino
    $('#destino').empty().append('<option value="">Seleccione...</option>').prop('disabled', true);
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
                recargarTablaConfiguraciones(); 
                // Llamar al handler del botón limpiar para limpiar y ocultar los campos
                $('#btnLimpiar').trigger('click');
            },
            error: function(xhr) {
                mostrarAlerta('Error al guardar: ' + xhr.responseText, 'danger');
            }
        });
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
        let id = data[12] || data[11];
        let item = {};
        try {
            item = JSON.parse(data[13]);
        } catch(e) {
            mostrarAlerta('No se pudo obtener los datos para editar.', 'danger');
            return;
        }

        cargarTiposAnalisisGlobal(function() {
            let formHtml = generarFormEditarUnificado(item);
            if($('#modalEditar').length === 0) {
                $('body').append(`<div class="modal fade" id="modalEditar" tabindex="-1" role="dialog"><div class="modal-dialog modal-lg" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Editar Configuración</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-primary" id="btnGuardarEdicion">Guardar Cambios</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button></div></div></div></div>`);
            } else {
                if($('#modalEditar .modal-footer').length === 0) {
                    $('#modalEditar .modal-content').append('<div class="modal-footer"><button type="button" class="btn btn-primary" id="btnGuardarEdicion">Guardar Cambios</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button></div>');
                }
            }
            $('#modalEditar .modal-body').html(formHtml);

            // Setear valores en selects y campos solo si existen y no son nulos/vacíos
            if(item.empresa) $('#editEmpresa').val(item.empresa); else $('#editEmpresa').val('');
            if(item.centro) $('#editCentro').val(item.centro); else $('#editCentro').val('');
            if(item.producto) $('#editProducto').val(item.producto); else $('#editProducto').val('');
            if(item.tipoMovimiento) $('#editMovimiento').val(item.tipoMovimiento); else $('#editMovimiento').val('');
            if(item.tipoDestino) $('#editTipoDestino').val(item.tipoDestino); else $('#editTipoDestino').val('');
            if(item.destino) $('#editDestino').val(item.destino); else $('#editDestino').val('');
            if(item.origen) $('#editOrigenes').val(item.origen); else $('#editOrigenes').val('');
            if(item.bolsas) $('#editBolsas').val(item.bolsas); else $('#editBolsas').val('1');
            if(item.aplicaOrden == 1 || item.aplicaOrden === true) {
                $('#editOrdenPuerto').prop('checked', true);
            } else {
                $('#editOrdenPuerto').prop('checked', false);
            }

            // --- Lógica dinámica para el campo Destino en edición ---
            function cargarDestinoEdicion(idClase, selectedDestino) {
                var $destino = $('#editDestino');
                $destino.empty().append('<option value="">Seleccione...</option>').prop('disabled', true);
                if (idClase) {
                    $.ajax({
                        url: '../servicios/api-bolsa-calidad/api.php/destino?idClase=' + encodeURIComponent(idClase),
                        method: 'GET',
                        dataType: 'json',
                        success: function(res) {
                            $destino.empty();
                            $destino.append('<option value="">Seleccione...</option>');
                            if(res.success && Array.isArray(res.data) && res.data.length > 0) {
                                res.data.forEach(function(item) {
                                    $destino.append('<option value="'+item.idDestino+'">'+(item.Descripcion || '-')+'</option>');
                                });
                                $destino.prop('disabled', false);
                                if(selectedDestino) $destino.val(selectedDestino);
                            } else {
                                $destino.prop('disabled', true);
                            }
                        },
                        error: function(xhr) {
                            $destino.empty().append('<option value="">Seleccione...</option>').prop('disabled', true);
                        }
                    });
                } else {
                    $destino.empty().append('<option value="">Seleccione...</option>').prop('disabled', true);
                }
            }

            // Evento para recargar destino en edición
            $(document).off('change', '#editTipoDestino').on('change', '#editTipoDestino', function() {
                var idClase = $(this).val();
                cargarDestinoEdicion(idClase, null);
            });

            // Inicializar destino en edición si hay tipoDestino
            if($('#editTipoDestino').val()) {
                cargarDestinoEdicion($('#editTipoDestino').val(), $('#editDestino').val());
            } else {
                $('#editDestino').empty().append('<option value="">Seleccione...</option>').prop('disabled', true);
            }

            // Validación y generación dinámica de tarjetas al cambiar bolsas (edición)
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
                    $('#modalEditar .row').replaceWith(`<div class='row'>${tarjetas}</div>`);
                }
            });

            // Lógica condicional para mostrar/ocultar campos según Tipo Movimiento en el modal editar
            function actualizarCamposPorMovimientoEditar() {
                const tipoMovimiento = $('#editMovimiento').val();
                if (tipoMovimiento === 'DESPACHO') {
                    $('#editTipoDestino').closest('.form-group').show().find('select').prop('required', true);
                    $('#editDestino').closest('.form-group').show().find('select').prop('required', true);
                    $('#editOrigenes').closest('.form-group').hide().find('select').prop('required', false).val('');
                } else if (tipoMovimiento === 'RECEPCIÓN') {
                    $('#editTipoDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
                    $('#editDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
                    $('#editOrigenes').closest('.form-group').show().find('select').prop('required', true);
                } else {
                    $('#editTipoDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
                    $('#editDestino').closest('.form-group').hide().find('select').prop('required', false).val('');
                    $('#editOrigenes').closest('.form-group').hide().find('select').prop('required', false).val('');
                }
            }
            actualizarCamposPorMovimientoEditar();
            $('#editMovimiento').on('change', function() {
                actualizarCamposPorMovimientoEditar();
                $('#editTipoDestino').val('');
                $('#editDestino').val('');
                $('#editOrigenes').val('');
            });

            $('#modalEditar').modal('show');

            // Validación en tiempo real para el modal editar
            $('#formEditar').off('input change').on('input change', 'select, input', function() {
                if ($(this).prop('required')) {
                    if (!$(this).val()) {
                        $(this).addClass('is-invalid');
                    } else {
                        $(this).removeClass('is-invalid');
                    }
                }
            });

            // Botón Guardar Cambios dispara el submit del formulario
            $('#btnGuardarEdicion').off('click').on('click', function(){
                $('#formEditar').submit();
            });

            // Guardar cambios 
            $('#formEditar').off('submit').on('submit', function(e){
                e.preventDefault();
                let valid = true;
                const tipoMovimiento = $('#editMovimiento').val();
                if (!$('#editEmpresa').val()) { $('#editEmpresa').addClass('is-invalid'); valid = false; }
                if (!$('#editCentro').val()) { $('#editCentro').addClass('is-invalid'); valid = false; }
                if (!$('#editProducto').val()) { $('#editProducto').addClass('is-invalid'); valid = false; }
                if (!tipoMovimiento) { $('#editMovimiento').addClass('is-invalid'); valid = false; }
                if (tipoMovimiento === 'DESPACHO') {
                    if (!$('#editTipoDestino').val()) { $('#editTipoDestino').addClass('is-invalid'); valid = false; }
                    if (!$('#editDestino').val()) { $('#editDestino').addClass('is-invalid'); valid = false; }
                }
                if (tipoMovimiento === 'RECEPCIÓN') {
                    if (!$('#editOrigenes').val()) { $('#editOrigenes').addClass('is-invalid'); valid = false; }
                }
                if (!$('#editBolsas').val() || isNaN($('#editBolsas').val()) || $('#editBolsas').val() < 1 || $('#editBolsas').val() > 6) {
                    $('#editBolsas').addClass('is-invalid'); valid = false;
                }
                $('.edit-viajes-bolsa').each(function(){ if (!$(this).val()) { $(this).addClass('is-invalid'); valid = false; } });
                $('.edit-tipo-analisis').each(function(){ if (!$(this).val()) { $(this).addClass('is-invalid'); valid = false; } });
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
                    editViajes[i] = $(this).val();
                });
                $('.edit-tipo-analisis').each(function(i){
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
                let tipoDestino = null;
                let destino = null;
                let origen = null;
                if (tipoMovimiento === 'DESPACHO') {
                    tipoDestino = $('#editTipoDestino').val();
                    destino = $('#editDestino').val();
                }
                if (tipoMovimiento === 'RECEPCIÓN') {
                    origen = $('#editOrigenes').val();
                }
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
                        destino,
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
    });

    // Eliminar registro
    $(document).on('click', '.btn-eliminar', function(){
        let row = $(this).closest('tr');
        let data = tablaConfiguraciones.row(row).data();
        let id = data[12] || data[11]; 
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




