const express = require('express');
const cors = require('cors');

const { getConnection } = require('./config/database');
const paisRoutes = require('./routes/paisRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const simpleEntityRoutes = require('./routes/simpleEntityRoutes');
const catalogoProductoRoutes = require('./routes/catalogoProductoRoutes');
const detalleVentaRoutes = require('./routes/detalleVentaRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const {
    notFound,
    errorHandler
} = require('./middleware/errorHandler');

const app = express();


// Permite recibir solicitudes con cuerpo en formato JSON.
app.use(express.json());


// Permite solicitudes desde otros clientes o aplicaciones.
app.use(cors());


// Ruta principal para comprobar que la API esta activa.
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'API Comercial La Estrella funcionando correctamente'
    });
});


// Comprueba la conexion entre la API y SQL Server.
app.get('/api/health', async (req, res, next) => {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                DB_NAME() AS base_datos,
                GETDATE() AS fecha_servidor
        `);

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Conexion con SQL Server correcta',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        next(error);
    }
});

// Rutas CRUD de paises.
app.use('/api/paises', paisRoutes);
app.use('/api/cargos', cargoRoutes);

// Registra las entidades que utilizan el CRUD reutilizable.
simpleEntityRoutes.forEach(({ path, router }) => {
    app.use(path, router);
});
// CRUD de catalogo de productos.
app.use('/api/catalogo-productos',catalogoProductoRoutes);
// CRUD de detalles de venta.
app.use('/api/detalles',detalleVentaRoutes);
// CRUD de pagos.
app.use('/api/pagos',pagoRoutes);
// Endpoints de las vistas analiticas. CRUD de reportes.
app.use('/api/reportes',reporteRoutes);

// Deben permanecer al final de todas las rutas.
app.use(notFound);
app.use(errorHandler);


module.exports = app;