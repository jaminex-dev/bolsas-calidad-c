-- Crear tabla principal
CREATE TABLE dbo.BolsasCalidad (
    id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    empresa UNIQUEIDENTIFIER NOT NULL,
    centro UNIQUEIDENTIFIER NOT NULL,
    producto UNIQUEIDENTIFIER NOT NULL,
    tipoMovimiento VARCHAR(20) NOT NULL,
    tipoDestino UNIQUEIDENTIFIER NULL,
    destino UNIQUEIDENTIFIER NULL,
    origen UNIQUEIDENTIFIER NULL,
    bolsas INT NOT NULL CHECK (bolsas BETWEEN 1 AND 6),
    aplicaOrden BIT NOT NULL DEFAULT 0,
    activo BIT NOT NULL DEFAULT 1,
    fechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
);

-- Crear tabla de detalles
CREATE TABLE dbo.BolsasCalidadDetalle (
    id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    idBolsasCalidad UNIQUEIDENTIFIER NOT NULL,
    numeroBolsa INT NOT NULL,
    viajes INT NOT NULL,
    idTipoAnalisis UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (idBolsasCalidad) REFERENCES dbo.BolsasCalidad(id) ON DELETE CASCADE
);


-- Agrega la columna 'usuarioCreador' a la tabla 'BolsasCalidad' para almacenar el nombre del usuario que creó el registro.
ALTER TABLE dbo.BolsasCalidad
ADD usuarioCreador VARCHAR(100) NOT NULL DEFAULT 'admin';


