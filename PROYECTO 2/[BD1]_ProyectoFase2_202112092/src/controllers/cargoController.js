const {
    crearCrudController
} = require('./crudController');

const entidades = require('../config/entities');


// CARGO utiliza el controlador CRUD reutilizable.
module.exports = crearCrudController(
    entidades.cargo
);