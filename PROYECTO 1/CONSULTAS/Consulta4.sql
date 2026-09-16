/*
Consulta 4 - Desempeno de empleados

Muestra el empleado, cargo, tienda, cantidad de ventas atendidas
y el total facturado.
Las ventas anuladas no se consideran.
*/

SELECT
    per.nombre_persona || ' ' || per.apellido_persona AS empleado,
    c.nombre_cargo AS cargo,
    t.nombre_tienda AS tienda,
    COUNT(DISTINCT v.id_venta) AS cantidad_ventas_atendidas,
    ROUND(SUM(dv.subtotal_des_venta), 2) AS total_facturado
FROM empleado e
INNER JOIN persona per
    ON e.id_persona = per.id_persona
INNER JOIN cargo c
    ON e.id_cargo = c.id_cargo
INNER JOIN tienda t
    ON e.id_tienda = t.id_tienda
INNER JOIN venta v
    ON e.id_empleado = v.id_empleado
INNER JOIN estado_venta ev
    ON v.id_es_venta = ev.id_es_venta
INNER JOIN desglose_venta dv
    ON v.id_venta = dv.id_venta
WHERE UPPER(ev.nombre_es_venta) <> 'ANULADA'
GROUP BY
    e.id_empleado,
    per.nombre_persona,
    per.apellido_persona,
    c.nombre_cargo,
    t.nombre_tienda
ORDER BY
    total_facturado DESC,
    cantidad_ventas_atendidas DESC;
