const {
    crearCrudRoutes
} = require('./crudRoutes');

const cargoController = require(
    '../controllers/cargoController'
);


// Genera GET, POST, PUT y DELETE para CARGO.
module.exports = crearCrudRoutes(
    cargoController
);