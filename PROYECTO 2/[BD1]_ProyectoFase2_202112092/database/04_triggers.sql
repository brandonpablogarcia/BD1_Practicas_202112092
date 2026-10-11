USE ComercialLaEstrella;
GO

-- =========================================================
-- TRIGGER 1 - INSERT_DETALLE
-- Protege y actualiza automaticamente el inventario.
-- =========================================================

CREATE OR ALTER TRIGGER dbo.Insert_Detalle
ON dbo.DESGLOSE_VENTA
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Esta tabla almacena la cantidad total solicitada
    -- por producto y tienda en la operacion actual.
    DECLARE @SOLICITUDES TABLE (
        ID_TIENDA INT NOT NULL,
        ID_PRO INT NOT NULL,
        CANTIDAD_TOTAL INT NOT NULL,
        PRIMARY KEY (ID_TIENDA, ID_PRO)
    );

    -- La tienda se obtiene desde la venta.
    INSERT INTO @SOLICITUDES (
        ID_TIENDA,
        ID_PRO,
        CANTIDAD_TOTAL
    )
    SELECT
        v.ID_TIENDA,
        i.ID_PRO,
        SUM(i.CANTIDAD_DES_VENTA)
    FROM inserted i
    INNER JOIN dbo.VENTA v
        ON i.ID_VENTA = v.ID_VENTA
    GROUP BY
        v.ID_TIENDA,
        i.ID_PRO;

    -- Verifica que el producto exista en el catalogo de
    -- la tienda y que tenga inventario suficiente.
    IF EXISTS (
        SELECT 1
        FROM @SOLICITUDES s
        LEFT JOIN dbo.CATALOGO_PRODUCTO cp
            ON cp.ID_TIENDA = s.ID_TIENDA
           AND cp.ID_PRO = s.ID_PRO
        WHERE cp.ID_PRO IS NULL
           OR s.CANTIDAD_TOTAL > cp.EXISTENCIA_ACTUAL_CAT_PRO
    )
    BEGIN
        THROW 50001, 'Stock insuficiente', 1;
    END;

    -- Si todo es valido, descuenta automaticamente
    -- la cantidad vendida del inventario.
    UPDATE cp
    SET cp.EXISTENCIA_ACTUAL_CAT_PRO =
        cp.EXISTENCIA_ACTUAL_CAT_PRO - s.CANTIDAD_TOTAL
    FROM dbo.CATALOGO_PRODUCTO cp
    INNER JOIN @SOLICITUDES s
        ON cp.ID_TIENDA = s.ID_TIENDA
       AND cp.ID_PRO = s.ID_PRO;
END;
GO

-- =========================================================
-- TRIGGER 2 - INSERT_PAGO
-- Cambia automaticamente una venta a PAGADA cuando
-- los pagos acumulados cubren el total de la venta.
-- =========================================================

CREATE OR ALTER TRIGGER dbo.Insert_Pago
ON dbo.PAGO
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Se toman unicamente las ventas involucradas
    -- en la operacion que acaba de ejecutarse.
    ;WITH VENTAS_AFECTADAS AS (
        SELECT DISTINCT
            ID_VENTA
        FROM inserted
    ),
    TOTAL_VENTA AS (
        SELECT
            dv.ID_VENTA,
            SUM(dv.SUBTOTAL_DES_VENTA) AS MONTO_TOTAL
        FROM dbo.DESGLOSE_VENTA dv
        INNER JOIN VENTAS_AFECTADAS va
            ON dv.ID_VENTA = va.ID_VENTA
        GROUP BY
            dv.ID_VENTA
    ),
    TOTAL_PAGADO AS (
        SELECT
            p.ID_VENTA,
            SUM(p.MONTO_PAGO) AS MONTO_PAGADO
        FROM dbo.PAGO p
        INNER JOIN VENTAS_AFECTADAS va
            ON p.ID_VENTA = va.ID_VENTA
        GROUP BY
            p.ID_VENTA
    )
    UPDATE v
    SET v.ID_ES_VENTA = ev.ID_ES_VENTA
    FROM dbo.VENTA v
    INNER JOIN TOTAL_VENTA tv
        ON v.ID_VENTA = tv.ID_VENTA
    INNER JOIN TOTAL_PAGADO tp
        ON v.ID_VENTA = tp.ID_VENTA
    CROSS JOIN dbo.ESTADO_VENTA ev
    WHERE UPPER(ev.NOMBRE_ES_VENTA) = 'PAGADA'
      AND tp.MONTO_PAGADO >= tv.MONTO_TOTAL;
END;
GO
