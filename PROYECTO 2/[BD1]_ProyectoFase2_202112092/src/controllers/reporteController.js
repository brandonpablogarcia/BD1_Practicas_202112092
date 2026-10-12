const {
    getConnection
} = require('../config/database');


// Obtiene las ventas agrupadas por tienda y ubicacion.
// Toda la logica de JOIN y agrupacion esta en la vista.
async function obtenerVentasUbicacion(req, res, next) {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                ID_TIENDA,
                TIENDA,
                MUNICIPIO,
                DEPARTAMENTO,
                PAIS,
                CANTIDAD_VENTAS,
                TOTAL_FACTURADO
            FROM dbo.Vista_Ventas_Ubicacion
            ORDER BY TOTAL_FACTURADO DESC;
        `);

        res.status(200).json({
            estado: 'OK',
            total: resultado.recordset.length,
            datos: resultado.recordset
        });

    } catch (error) {
        next(error);
    }
}


// Obtiene el ranking de productos vendidos.
// Los calculos se realizan dentro de la vista SQL Server.
async function obtenerTopProductos(req, res, next) {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                CODIGO_PRODUCTO,
                PRODUCTO,
                CATEGORIA,
                MARCA,
                UNIDADES_VENDIDAS,
                MONTO_GENERADO
            FROM dbo.Vista_Top_Productos
            ORDER BY UNIDADES_VENDIDAS DESC,
                     MONTO_GENERADO DESC;
        `);

        res.status(200).json({
            estado: 'OK',
            total: resultado.recordset.length,
            datos: resultado.recordset
        });

    } catch (error) {
        next(error);
    }
}


// Obtiene las ventas registradas que poseen saldo pendiente.
async function obtenerSaldosPendientes(req, res, next) {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                ID_VENTA,
                FECHA_VENTA,
                TOTAL_VENTA,
                TOTAL_PAGADO,
                SALDO_PENDIENTE
            FROM dbo.Vista_Saldos_Pendientes
            ORDER BY SALDO_PENDIENTE DESC,
                     ID_VENTA;
        `);

        res.status(200).json({
            estado: 'OK',
            total: resultado.recordset.length,
            datos: resultado.recordset
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    obtenerVentasUbicacion,
    obtenerTopProductos,
    obtenerSaldosPendientes
};