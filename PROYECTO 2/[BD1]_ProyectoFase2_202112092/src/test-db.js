const { getConnection } = require('./config/database');

// Esta prueba verifica que Node.js pueda conectarse
// correctamente con ComercialLaEstrella.
async function probarConexion() {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                DB_NAME() AS BASE_DATOS,

                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_TYPE = 'BASE TABLE'
                ) AS TOTAL_TABLAS,

                (
                    SELECT COUNT(*)
                    FROM INFORMATION_SCHEMA.VIEWS
                ) AS TOTAL_VISTAS,

                (
                    SELECT COUNT(*)
                    FROM sys.triggers
                    WHERE name IN (
                        'Insert_Detalle',
                        'Insert_Pago'
                    )
                ) AS TOTAL_TRIGGERS;
        `);

        console.log('Conexion con SQL Server exitosa.');
        console.table(resultado.recordset);

        await pool.close();
        process.exit(0);

    } catch (error) {
        console.error('No fue posible conectar con la base de datos.');
        console.error(error.message);

        process.exit(1);
    }
}

probarConexion();