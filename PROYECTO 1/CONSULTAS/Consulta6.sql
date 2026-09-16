/*
Consulta 6 - Facturacion por categoria y marca

Muestra la categoria, marca, unidades vendidas
y el total facturado.
Las ventas anuladas no se consideran.
*/

SELECT
    c.nombre_cat AS categoria,
    m.nombre_marca AS marca,
    SUM(dv.cantidad_des_venta) AS unidades_vendidas,
    ROUND(SUM(dv.subtotal_des_venta), 2) AS total_facturado
FROM desglose_venta dv
INNER JOIN producto p
    ON dv.id_pro = p.id_pro
INNER JOIN categoria c
    ON p.id_cat = c.id_cat
INNER JOIN marca m
    ON p.id_marca = m.id_marca
INNER JOIN venta v
    ON dv.id_venta = v.id_venta
INNER JOIN estado_venta ev
    ON v.id_es_venta = ev.id_es_venta
WHERE UPPER(ev.nombre_es_venta) <> 'ANULADA'
GROUP BY
    c.nombre_cat,
    m.nombre_marca
ORDER BY
    total_facturado DESC,
    unidades_vendidas DESC;
