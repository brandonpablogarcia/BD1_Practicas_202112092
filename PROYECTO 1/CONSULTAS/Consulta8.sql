/*
Consulta 8 - Ventas pendientes de pago

Muestra las ventas con estado REGISTRADA,
el total de la venta, el total pagado si existe
y la diferencia que queda pendiente de pagar.
*/

SELECT
    v.id_venta AS numero_venta,
    v.fecha_venta AS fecha_venta,
    ROUND(dt.total_venta, 2) AS total_venta,
    ROUND(NVL(pg.total_pagado, 0), 2) AS total_pagado,
    ROUND(dt.total_venta - NVL(pg.total_pagado, 0), 2) AS diferencia_pendiente
FROM venta v

INNER JOIN estado_venta ev
    ON v.id_es_venta = ev.id_es_venta

INNER JOIN (
    SELECT
        id_venta,
        SUM(subtotal_des_venta) AS total_venta
    FROM desglose_venta
    GROUP BY id_venta
) dt
    ON v.id_venta = dt.id_venta

LEFT JOIN (
    SELECT
        id_venta,
        SUM(monto_pago) AS total_pagado
    FROM pago
    GROUP BY id_venta
) pg
    ON v.id_venta = pg.id_venta

WHERE UPPER(ev.nombre_es_venta) = 'REGISTRADA'

ORDER BY
    diferencia_pendiente DESC,
    v.id_venta;
