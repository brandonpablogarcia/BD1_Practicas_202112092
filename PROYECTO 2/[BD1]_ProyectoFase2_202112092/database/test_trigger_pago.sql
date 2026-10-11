USE ComercialLaEstrella;
GO

DECLARE @ID_TIENDA INT;
DECLARE @ID_PRO INT;
DECLARE @PRECIO DECIMAL(10,2);
DECLARE @ID_EMPLEADO INT;
DECLARE @ID_CLIENTE INT;

DECLARE @ESTADO_REGISTRADA INT;
DECLARE @ESTADO_PAGADA INT;

DECLARE @ID_MET_PAGO INT;

DECLARE @ID_VENTA INT;
DECLARE @ID_PAGO1 INT;
DECLARE @ID_PAGO2 INT;

DECLARE @PAGO1 DECIMAL(12,2);
DECLARE @PAGO2 DECIMAL(12,2);


-- =========================================================
-- Buscar un producto con existencia suficiente
-- =========================================================

SELECT TOP 1
    @ID_TIENDA = cp.ID_TIENDA,
    @ID_PRO = cp.ID_PRO,
    @PRECIO = cp.PRECIO_VIGENTE_CAT_PRO
FROM dbo.CATALOGO_PRODUCTO cp
WHERE cp.EXISTENCIA_ACTUAL_CAT_PRO >= 1
AND EXISTS (
    SELECT 1
    FROM dbo.EMPLEADO e
    WHERE e.ID_TIENDA = cp.ID_TIENDA
)
ORDER BY
    cp.ID_TIENDA,
    cp.ID_PRO;


-- Empleado de la misma tienda
SELECT TOP 1
    @ID_EMPLEADO = ID_EMPLEADO
FROM dbo.EMPLEADO
WHERE ID_TIENDA = @ID_TIENDA
ORDER BY ID_EMPLEADO;


-- Cliente para la prueba
SELECT TOP 1
    @ID_CLIENTE = ID_CLIENTE
FROM dbo.CLIENTE
ORDER BY ID_CLIENTE;


-- Estados
SELECT
    @ESTADO_REGISTRADA = ID_ES_VENTA
FROM dbo.ESTADO_VENTA
WHERE UPPER(NOMBRE_ES_VENTA) = 'REGISTRADA';


SELECT
    @ESTADO_PAGADA = ID_ES_VENTA
FROM dbo.ESTADO_VENTA
WHERE UPPER(NOMBRE_ES_VENTA) = 'PAGADA';


-- Metodo de pago
SELECT TOP 1
    @ID_MET_PAGO = ID_MET_PAGO
FROM dbo.METODO_PAGO
ORDER BY ID_MET_PAGO;


-- IDs temporales
SELECT
    @ID_VENTA = ISNULL(MAX(ID_VENTA), 0) + 1
FROM dbo.VENTA;


SELECT
    @ID_PAGO1 = ISNULL(MAX(ID_PAGO), 0) + 1
FROM dbo.PAGO;

SET @ID_PAGO2 = @ID_PAGO1 + 1;


-- Dividir el total en dos pagos
SET @PAGO1 = ROUND(@PRECIO * 0.40, 2);
SET @PAGO2 = @PRECIO - @PAGO1;


BEGIN TRANSACTION;


-- =========================================================
-- Crear venta en estado REGISTRADA
-- =========================================================

INSERT INTO dbo.VENTA (
    ID_VENTA,
    FECHA_VENTA,
    ID_TIENDA,
    ID_EMPLEADO,
    ID_CLIENTE,
    ID_ES_VENTA
)
VALUES (
    @ID_VENTA,
    CAST(GETDATE() AS DATE),
    @ID_TIENDA,
    @ID_EMPLEADO,
    @ID_CLIENTE,
    @ESTADO_REGISTRADA
);


-- =========================================================
-- Agregar un producto.
-- Aqui tambien trabaja el Trigger Insert_Detalle.
-- =========================================================

INSERT INTO dbo.DESGLOSE_VENTA (
    ID_VENTA,
    ID_PRO,
    CANTIDAD_DES_VENTA,
    PRECIO_UNITARIO_DES_VENTA,
    SUBTOTAL_DES_VENTA
)
VALUES (
    @ID_VENTA,
    @ID_PRO,
    1,
    @PRECIO,
    @PRECIO
);


PRINT '==============================';
PRINT 'ESTADO INICIAL';
PRINT '==============================';

SELECT
    v.ID_VENTA,
    ev.NOMBRE_ES_VENTA AS ESTADO,
    @PRECIO AS TOTAL_VENTA
FROM dbo.VENTA v
INNER JOIN dbo.ESTADO_VENTA ev
    ON v.ID_ES_VENTA = ev.ID_ES_VENTA
WHERE v.ID_VENTA = @ID_VENTA;


-- =========================================================
-- Primer pago parcial
-- =========================================================

INSERT INTO dbo.PAGO (
    ID_PAGO,
    MONTO_PAGO,
    ID_VENTA,
    ID_MET_PAGO
)
VALUES (
    @ID_PAGO1,
    @PAGO1,
    @ID_VENTA,
    @ID_MET_PAGO
);


PRINT '==============================';
PRINT 'DESPUES DEL PRIMER PAGO';
PRINT '==============================';

SELECT
    v.ID_VENTA,
    ev.NOMBRE_ES_VENTA AS ESTADO,
    @PRECIO AS TOTAL_VENTA,
    (
        SELECT SUM(MONTO_PAGO)
        FROM dbo.PAGO
        WHERE ID_VENTA = @ID_VENTA
    ) AS TOTAL_PAGADO
FROM dbo.VENTA v
INNER JOIN dbo.ESTADO_VENTA ev
    ON v.ID_ES_VENTA = ev.ID_ES_VENTA
WHERE v.ID_VENTA = @ID_VENTA;


-- =========================================================
-- Segundo pago: completa el total
-- =========================================================

INSERT INTO dbo.PAGO (
    ID_PAGO,
    MONTO_PAGO,
    ID_VENTA,
    ID_MET_PAGO
)
VALUES (
    @ID_PAGO2,
    @PAGO2,
    @ID_VENTA,
    @ID_MET_PAGO
);


PRINT '==============================';
PRINT 'DESPUES DEL SEGUNDO PAGO';
PRINT '==============================';

SELECT
    v.ID_VENTA,
    ev.NOMBRE_ES_VENTA AS ESTADO,
    @PRECIO AS TOTAL_VENTA,
    (
        SELECT SUM(MONTO_PAGO)
        FROM dbo.PAGO
        WHERE ID_VENTA = @ID_VENTA
    ) AS TOTAL_PAGADO
FROM dbo.VENTA v
INNER JOIN dbo.ESTADO_VENTA ev
    ON v.ID_ES_VENTA = ev.ID_ES_VENTA
WHERE v.ID_VENTA = @ID_VENTA;


-- La prueba no modifica permanentemente los datos.
ROLLBACK TRANSACTION;
GO

