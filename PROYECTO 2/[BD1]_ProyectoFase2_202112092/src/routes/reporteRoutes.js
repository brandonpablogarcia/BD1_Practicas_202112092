const express = require('express');

const {
    obtenerVentasUbicacion,
    obtenerTopProductos,
    obtenerSaldosPendientes
} = require('../controllers/reporteController');

const router = express.Router();


// Endpoints asociados a las vistas analiticas.
router.get(
    '/ventas-ubicacion',
    obtenerVentasUbicacion
);

router.get(
    '/top-productos',
    obtenerTopProductos
);

router.get(
    '/saldos-pendientes',
    obtenerSaldosPendientes
);


module.exports = router;