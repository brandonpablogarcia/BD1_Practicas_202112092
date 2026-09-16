/*
Validacion 1 - Empleado y tienda de la venta

Verifica que el empleado que atendio una venta
pertenezca a la misma tienda donde se registro la venta.

El resultado esperado es 0 registros.
*/

SELECT
    v.id_venta,
    v.id_tienda AS tienda_venta,
    e.id_empleado,
    e.id_tienda AS tienda_empleado
FROM venta v
INNER JOIN empleado e
    ON v.id_empleado = e.id_empleado
WHERE v.id_tienda <> e.id_tienda;
