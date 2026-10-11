USE ComercialLaEstrella;
GO


-- =========================================================
-- VISTA 1
-- Ventas por tienda y ubicacion
-- Excluye las ventas anuladas.
-- =========================================================

CREATE OR ALTER VIEW dbo.Vista_Ventas_Ubicacion
AS
SELECT
    t.ID_TIENDA,
    t.NOMBRE_TIENDA AS TIENDA,
    m.NOMBRE_MUN AS MUNICIPIO,
    d.NOMBRE_DEP AS DEPARTAMENTO,
    p.NOMBRE_PAIS AS PAIS,
    COUNT(DISTINCT v.ID_VENTA) AS CANTIDAD_VENTAS,
    CAST(SUM(dv.SUBTOTAL_DES_VENTA) AS DECIMAL(18,2)) AS TOTAL_FACTURADO
FROM dbo.VENTA v
INNER JOIN dbo.TIENDA t
    ON v.ID_TIENDA = t.ID_TIENDA
INNER JOIN dbo.MUNICIPIO m
    ON t.ID_MUN = m.ID_MUN
INNER JOIN dbo.DEPARTAMENTO d
    ON m.ID_DEP = d.ID_DEP
INNER JOIN dbo.PAIS p
    ON d.ID_PAIS = p.ID_PAIS
INNER JOIN dbo.ESTADO_VENTA ev
    ON v.ID_ES_VENTA = ev.ID_ES_VENTA
INNER JOIN dbo.DESGLOSE_VENTA dv
    ON v.ID_VENTA = dv.ID_VENTA
WHERE UPPER(ev.NOMBRE_ES_VENTA) <> 'ANULADA'
GROUP BY
    t.ID_TIENDA,
    t.NOMBRE_TIENDA,
    m.NOMBRE_MUN,
    d.NOMBRE_DEP,
    p.NOMBRE_PAIS;
GO


-- =========================================================
-- VISTA 2
-- Productos mas vendidos
-- Excluye las ventas anuladas.
-- =========================================================

CREATE OR ALTER VIEW dbo.Vista_Top_Productos
AS
SELECT
    p.ID_PRO AS CODIGO_PRODUCTO,
    p.NOMBRE_PRO AS PRODUCTO,
    c.NOMBRE_CAT AS CATEGORIA,
    m.NOMBRE_MARCA AS MARCA,
    SUM(dv.CANTIDAD_DES_VENTA) AS UNIDADES_VENDIDAS,
    CAST(SUM(dv.SUBTOTAL_DES_VENTA) AS DECIMAL(18,2)) AS MONTO_GENERADO
FROM dbo.PRODUCTO p
INNER JOIN dbo.CATEGORIA c
    ON p.ID_CAT = c.ID_CAT
INNER JOIN dbo.MARCA m
    ON p.ID_MARCA = m.ID_MARCA
INNER JOIN dbo.DESGLOSE_VENTA dv
    ON p.ID_PRO = dv.ID_PRO
INNER JOIN dbo.VENTA v
    ON dv.ID_VENTA = v.ID_VENTA
INNER JOIN dbo.ESTADO_VENTA ev
    ON v.ID_ES_VENTA = ev.ID_ES_VENTA
WHERE UPPER(ev.NOMBRE_ES_VENTA) <> 'ANULADA'
GROUP BY
    p.ID_PRO,
    p.NOMBRE_PRO,
    c.NOMBRE_CAT,
    m.NOMBRE_MARCA;
GO


-- =========================================================
-- VISTA 3
-- Ventas registradas con saldo pendiente.
-- =========================================================

CREATE OR ALTER VIEW dbo.Vista_Saldos_Pendientes
AS
WITH TOTALES_VENTA AS (
    SELECT
        ID_VENTA,
        SUM(SUBTOTAL_DES_VENTA) AS TOTAL_VENTA
    FROM dbo.DESGLOSE_VENTA
    GROUP BY ID_VENTA
),
TOTALES_PAGO AS (
    SELECT
        ID_VENTA,
        SUM(MONTO_PAGO) AS TOTAL_PAGADO
    FROM dbo.PAGO
    GROUP BY ID_VENTA
)
SELECT
    v.ID_VENTA,
    v.FECHA_VENTA,
    CAST(tv.TOTAL_VENTA AS DECIMAL(18,2)) AS TOTAL_VENTA,
    CAST(ISNULL(tp.TOTAL_PAGADO, 0) AS DECIMAL(18,2)) AS TOTAL_PAGADO,
    CAST(
        tv.TOTAL_VENTA - ISNULL(tp.TOTAL_PAGADO, 0)
        AS DECIMAL(18,2)
    ) AS SALDO_PENDIENTE
FROM dbo.VENTA v
INNER JOIN dbo.ESTADO_VENTA ev
    ON v.ID_ES_VENTA = ev.ID_ES_VENTA
INNER JOIN TOTALES_VENTA tv
    ON v.ID_VENTA = tv.ID_VENTA
LEFT JOIN TOTALES_PAGO tp
    ON v.ID_VENTA = tp.ID_VENTA
WHERE UPPER(ev.NOMBRE_ES_VENTA) = 'REGISTRADA';
GO
