const express = require('express');

const {
    obtenerDetalles,
    obtenerDetallePorId,
    crearDetalle,
    actualizarDetalle,
    eliminarDetalle
} = require('../controllers/detalleVentaController');

const router = express.Router();


// CRUD de DESGLOSE_VENTA.
router.get(
    '/',
    obtenerDetalles
);

router.get(
    '/:idVenta/:idProducto',
    obtenerDetallePorId
);

router.post(
    '/',
    crearDetalle
);

router.put(
    '/:idVenta/:idProducto',
    actualizarDetalle
);

router.delete(
    '/:idVenta/:idProducto',
    eliminarDetalle
);


module.exports = router;