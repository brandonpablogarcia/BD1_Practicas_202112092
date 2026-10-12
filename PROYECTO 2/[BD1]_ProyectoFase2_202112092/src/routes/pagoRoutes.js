const express = require('express');

const {
    obtenerPagos,
    obtenerPagoPorId,
    crearPago,
    actualizarPago,
    eliminarPago
} = require('../controllers/pagoController');

const router = express.Router();


// CRUD de PAGO.
router.get(
    '/',
    obtenerPagos
);

router.get(
    '/:id',
    obtenerPagoPorId
);

router.post(
    '/',
    crearPago
);

router.put(
    '/:id',
    actualizarPago
);

router.delete(
    '/:id',
    eliminarPago
);


module.exports = router;