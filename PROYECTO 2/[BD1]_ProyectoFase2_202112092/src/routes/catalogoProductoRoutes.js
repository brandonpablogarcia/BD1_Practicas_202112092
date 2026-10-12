const express = require('express');

const {
    obtenerCatalogoProductos,
    obtenerCatalogoProductoPorId,
    crearCatalogoProducto,
    actualizarCatalogoProducto,
    eliminarCatalogoProducto
} = require('../controllers/catalogoProductoController');

const router = express.Router();


// CRUD de CATALOGO_PRODUCTO.
router.get(
    '/',
    obtenerCatalogoProductos
);

router.get(
    '/:idTienda/:idProducto',
    obtenerCatalogoProductoPorId
);

router.post(
    '/',
    crearCatalogoProducto
);

router.put(
    '/:idTienda/:idProducto',
    actualizarCatalogoProducto
);

router.delete(
    '/:idTienda/:idProducto',
    eliminarCatalogoProducto
);


module.exports = router;