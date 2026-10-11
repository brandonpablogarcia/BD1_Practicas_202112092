const {
    crearCrudController
} = require('../controllers/crudController');

const {
    crearCrudRoutes
} = require('./crudRoutes');

const entidades = require('../config/entities');


// Cada entrada relaciona una URL con la configuracion
// de una tabla que utiliza el CRUD reutilizable.
const rutas = [

    {
        path: '/api/departamentos',
        router: crearCrudRoutes(
            crearCrudController(entidades.departamento)
        )
    },

    {
        path: '/api/municipios',
        router: crearCrudRoutes(
            crearCrudController(entidades.municipio)
        )
    },

    {
        path: '/api/tipos-tienda',
        router: crearCrudRoutes(
            crearCrudController(entidades.tipoTienda)
        )
    },

    {
        path: '/api/tiendas',
        router: crearCrudRoutes(
            crearCrudController(entidades.tienda)
        )
    },

    {
        path: '/api/personas',
        router: crearCrudRoutes(
            crearCrudController(entidades.persona)
        )
    },

    {
        path: '/api/empleados',
        router: crearCrudRoutes(
            crearCrudController(entidades.empleado)
        )
    },

    {
        path: '/api/tipos-identificacion',
        router: crearCrudRoutes(
            crearCrudController(entidades.tipoIdentificacion)
        )
    },

    {
        path: '/api/clientes',
        router: crearCrudRoutes(
            crearCrudController(entidades.cliente)
        )
    },

    {
        path: '/api/categorias',
        router: crearCrudRoutes(
            crearCrudController(entidades.categoria)
        )
    },

    {
        path: '/api/marcas',
        router: crearCrudRoutes(
            crearCrudController(entidades.marca)
        )
    },

    {
        path: '/api/productos',
        router: crearCrudRoutes(
            crearCrudController(entidades.producto)
        )
    },

    {
        path: '/api/estados-venta',
        router: crearCrudRoutes(
            crearCrudController(entidades.estadoVenta)
        )
    },

    {
        path: '/api/ventas',
        router: crearCrudRoutes(
            crearCrudController(entidades.venta)
        )
    },

    {
        path: '/api/metodos-pago',
        router: crearCrudRoutes(
            crearCrudController(entidades.metodoPago)
        )
    }

];


module.exports = rutas;