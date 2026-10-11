const sql = require('mssql');
require('dotenv').config();

// Configuracion utilizada para conectarnos a SQL Server.
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,

    options: {
        // La conexion es local, por eso no necesitamos cifrado.
        encrypt: false,

        // Permite trabajar con el certificado local de SQL Server.
        trustServerCertificate: true
    },

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

// Devuelve una conexion reutilizable hacia la base de datos.
async function getConnection() {
    try {
        if (pool && pool.connected) {
            return pool;
        }

        pool = await new sql.ConnectionPool(dbConfig).connect();

        return pool;
    } catch (error) {
        console.error(
            'Error al conectar con SQL Server:',
            error.message
        );

        throw error;
    }
}

module.exports = {
    sql,
    getConnection
};