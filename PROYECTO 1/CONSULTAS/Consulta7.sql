/*
Consulta 7 - Uso de metodos de pago

Muestra cada metodo de pago, la cantidad de pagos realizados
y el monto total recibido por dicho metodo.
*/

SELECT
    mp.nombre_met_pago AS metodo_pago,
    COUNT(p.id_pago) AS cantidad_pagos,
    ROUND(SUM(p.monto_pago), 2) AS monto_total_recibido
FROM pago p
INNER JOIN metodo_pago mp
    ON p.id_met_pago = mp.id_met_pago
GROUP BY
    mp.id_met_pago,
    mp.nombre_met_pago
ORDER BY
    monto_total_recibido DESC;
