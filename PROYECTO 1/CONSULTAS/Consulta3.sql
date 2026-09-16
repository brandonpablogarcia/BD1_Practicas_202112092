/*
Consulta 3 - Productos mas vendidos

Muestra el codigo del producto, nombre, categoria, marca,
unidades vendidas y monto total generado.
Las ventas anuladas no se consideran.
*/

SELECT
    p.id_pro AS codigo_producto,
    p.nombre_pro AS producto,
    c.nombre_cat AS categoria,
    m.nombre_marca AS marca,
    SUM(dv.cantidad_des_venta) AS unidades_vendidas,
    ROUND(SUM(dv.subtotal_des_venta), 2) AS monto_generado
FROM producto p
INNER JOIN categoria c
    ON p.id_cat = c.id_cat
INNER JOIN marca m
    ON p.id_marca = m.id_marca
INNER JOIN desglose_venta dv
    ON p.id_pro = dv.id_pro
INNER JOIN venta v
    ON dv.id_venta = v.id_venta
INNER JOIN estado_venta ev
    ON v.id_es_venta = ev.id_es_venta
WHERE UPPER(ev.nombre_es_venta) <> 'ANULADA'
GROUP BY
    p.id_pro,
    p.nombre_pro,
    c.nombre_cat,
    m.nombre_marca
ORDER BY
    unidades_vendidas DESC,
    monto_generado DESC;
