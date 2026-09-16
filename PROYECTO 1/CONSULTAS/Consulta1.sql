/*
Consulta 1 - Ventas por tienda y ubicación

Muestra cada tienda con su municipio, departamento y país,
la cantidad de ventas registradas y el monto total facturado.
Las ventas anuladas no se consideran.
*/

SELECT
    t.nombre_tienda AS tienda,
    m.nombre_mun AS municipio,
    d.nombre_dep AS departamento,
    p.nombre_pais AS pais,
    COUNT(DISTINCT v.id_venta) AS cantidad_ventas,
    ROUND(SUM(dv.subtotal_des_venta), 2) AS total_facturado
FROM venta v
INNER JOIN tienda t
    ON v.id_tienda = t.id_tienda
INNER JOIN municipio m
    ON t.id_mun = m.id_mun
INNER JOIN departamento d
    ON m.id_dep = d.id_dep
INNER JOIN pais p
    ON d.id_pais = p.id_pais
INNER JOIN estado_venta ev
    ON v.id_es_venta = ev.id_es_venta
INNER JOIN desglose_venta dv
    ON v.id_venta = dv.id_venta
WHERE UPPER(ev.nombre_es_venta) <> 'ANULADA'
GROUP BY
    t.id_tienda,
    t.nombre_tienda,
    m.nombre_mun,
    d.nombre_dep,
    p.nombre_pais
ORDER BY
    total_facturado DESC;
