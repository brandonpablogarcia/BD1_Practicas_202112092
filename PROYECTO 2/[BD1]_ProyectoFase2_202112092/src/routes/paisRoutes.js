const express = require('express');

const {
    obtenerPaises,
    obtenerPaisPorId,
    crearPais,
    actualizarPais,
    eliminarPais
} = require('../controllers/paisController');

const router = express.Router();


// Rutas CRUD para la tabla PAIS.
router.get('/', obtenerPaises);
router.get('/:id', obtenerPaisPorId);
router.post('/', crearPais);
router.put('/:id', actualizarPais);
router.delete('/:id', eliminarPais);


module.exports = router;