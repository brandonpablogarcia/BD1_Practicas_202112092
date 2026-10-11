const express = require('express');


// Genera automaticamente las cinco rutas CRUD
// a partir de un controlador.
function crearCrudRoutes(controller) {
    const router = express.Router();

    router.get('/', controller.obtenerTodos);
    router.get('/:id', controller.obtenerPorId);
    router.post('/', controller.crear);
    router.put('/:id', controller.actualizar);
    router.delete('/:id', controller.eliminar);

    return router;
}


module.exports = {
    crearCrudRoutes
};