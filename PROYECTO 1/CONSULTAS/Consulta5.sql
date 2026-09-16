/*
Consulta 5 - Clientes con mayor compra

Muestra cada cliente, su municipio de residencia,
la cantidad de ventas pagadas y el monto total comprado.
Solo se consideran ventas con estado PAGADA.
*/

SELECT
    per.nombre_persona || ' ' || per.apellido_persona AS cliente,
    m.nombre_mun AS municipio_residencia,
    COUNT(DISTINCT v.id_venta) AS cantidad_ventas_pagadas,
    ROUND(SUM(dv.subtotal_des_venta), 2) AS monto_total_comprado
FROM cliente c
INNER JOIN persona per
    ON c.id_persona = per.id_persona
INNER JOIN municipio m
    ON per.id_mun = m.id_mun
INNER JOIN venta v
    ON c.id_cliente = v.id_cliente
INNER JOIN estado_venta ev
    ON v.id_es_venta = ev.id_es_venta
INNER JOIN desglose_venta dv
    ON v.id_venta = dv.id_venta
WHERE UPPER(ev.nombre_es_venta) = 'PAGADA'
GROUP BY
    c.id_cliente,
    per.nombre_persona,
    per.apellido_persona,
    m.nombre_mun
ORDER BY
    monto_total_comprado DESC,
    cantidad_ventas_pagadas DESC;
