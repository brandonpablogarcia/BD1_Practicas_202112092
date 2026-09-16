/*
Consulta 2 - Ventas por tipo de tienda

Muestra el tipo de tienda, la cantidad de tiendas asociadas,
la cantidad de ventas realizadas y el monto total facturado.
Las ventas anuladas no se consideran para la facturacion.
*/

SELECT
    tt.nombre_tip_tienda AS tipo_tienda,
    COUNT(DISTINCT t.id_tienda) AS cantidad_tiendas,
    COUNT(DISTINCT v.id_venta) AS cantidad_ventas,
    ROUND(SUM(dv.subtotal_des_venta), 2) AS monto_facturado
FROM tipo_tienda tt
INNER JOIN tienda t
    ON tt.id_tip_tienda = t.id_tipo_tienda
INNER JOIN venta v
    ON t.id_tienda = v.id_tienda
INNER JOIN estado_venta ev
    ON v.id_es_venta = ev.id_es_venta
INNER JOIN desglose_venta dv
    ON v.id_venta = dv.id_venta
WHERE UPPER(ev.nombre_es_venta) <> 'ANULADA'
GROUP BY
    tt.id_tip_tienda,
    tt.nombre_tip_tienda
ORDER BY
    monto_facturado DESC;
