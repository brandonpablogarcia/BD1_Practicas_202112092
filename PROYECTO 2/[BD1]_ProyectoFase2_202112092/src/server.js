require('dotenv').config();

const app = require('./app');
const { getConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Inicia la API solamente despues de comprobar
// que la conexion con SQL Server funciona.
async function iniciarServidor() {
    try {
        await getConnection();

        console.log('Conexion con SQL Server establecida.');

        app.listen(PORT, () => {
            console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('No fue posible iniciar el servidor.');
        console.error(error.message);

        process.exit(1);
    }
}

iniciarServidor();