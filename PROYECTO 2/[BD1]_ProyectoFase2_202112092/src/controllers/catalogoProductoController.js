const {
    sql,
    getConnection
} = require('../config/database');


// Obtiene todos los productos disponibles en los catalogos.
async function obtenerCatalogoProductos(req, res, next) {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                ID_TIENDA,
                ID_PRO,
                PRECIO_VIGENTE_CAT_PRO,
                EXISTENCIA_ACTUAL_CAT_PRO
            FROM dbo.CATALOGO_PRODUCTO
            ORDER BY ID_TIENDA, ID_PRO;
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


// Obtiene un registro utilizando la llave primaria compuesta.
async function obtenerCatalogoProductoPorId(req, res, next) {
    try {
        const idTienda = Number(req.params.idTienda);
        const idProducto = Number(req.params.idProducto);

        if (
            !Number.isInteger(idTienda) ||
            !Number.isInteger(idProducto)
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_TIENDA e ID_PRO deben ser numeros enteros'
            });
        }

        const pool = await getConnection();

        const resultado = await pool
            .request()
            .input('ID_TIENDA', sql.Int, idTienda)
            .input('ID_PRO', sql.Int, idProducto)
            .query(`
                SELECT
                    ID_TIENDA,
                    ID_PRO,
                    PRECIO_VIGENTE_CAT_PRO,
                    EXISTENCIA_ACTUAL_CAT_PRO
                FROM dbo.CATALOGO_PRODUCTO
                WHERE ID_TIENDA = @ID_TIENDA
                  AND ID_PRO = @ID_PRO;
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Producto de catalogo no encontrado'
            });
        }

        res.status(200).json({
            estado: 'OK',
            datos: resultado.recordset[0]
        });

    } catch (error) {
        next(error);
    }
}


// Agrega un producto al catalogo de una tienda.
async function crearCatalogoProducto(req, res, next) {
    try {
        const {
            ID_TIENDA,
            ID_PRO,
            PRECIO_VIGENTE_CAT_PRO,
            EXISTENCIA_ACTUAL_CAT_PRO
        } = req.body;

        if (
            !Number.isInteger(ID_TIENDA) ||
            !Number.isInteger(ID_PRO)
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_TIENDA e ID_PRO son obligatorios y deben ser enteros'
            });
        }

        const precio = Number(PRECIO_VIGENTE_CAT_PRO);
        const existencia = Number(EXISTENCIA_ACTUAL_CAT_PRO);

        if (
            !Number.isFinite(precio) ||
            precio <= 0
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'PRECIO_VIGENTE_CAT_PRO debe ser mayor que cero'
            });
        }

        if (
            !Number.isInteger(existencia) ||
            existencia < 0
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'EXISTENCIA_ACTUAL_CAT_PRO debe ser un entero mayor o igual a cero'
            });
        }

        const pool = await getConnection();

        await pool
            .request()
            .input('ID_TIENDA', sql.Int, ID_TIENDA)
            .input('ID_PRO', sql.Int, ID_PRO)
            .input(
                'PRECIO_VIGENTE_CAT_PRO',
                sql.Decimal(10, 2),
                precio
            )
            .input(
                'EXISTENCIA_ACTUAL_CAT_PRO',
                sql.Int,
                existencia
            )
            .query(`
                INSERT INTO dbo.CATALOGO_PRODUCTO (
                    ID_TIENDA,
                    ID_PRO,
                    PRECIO_VIGENTE_CAT_PRO,
                    EXISTENCIA_ACTUAL_CAT_PRO
                )
                VALUES (
                    @ID_TIENDA,
                    @ID_PRO,
                    @PRECIO_VIGENTE_CAT_PRO,
                    @EXISTENCIA_ACTUAL_CAT_PRO
                );
            `);

        res.status(201).json({
            estado: 'OK',
            mensaje: 'Producto agregado al catalogo correctamente',
            datos: {
                ID_TIENDA,
                ID_PRO,
                PRECIO_VIGENTE_CAT_PRO: precio,
                EXISTENCIA_ACTUAL_CAT_PRO: existencia
            }
        });

    } catch (error) {
        next(error);
    }
}


// Modifica precio y/o existencia.
// La llave compuesta no se modifica.
async function actualizarCatalogoProducto(req, res, next) {
    try {
        const idTienda = Number(req.params.idTienda);
        const idProducto = Number(req.params.idProducto);

        if (
            !Number.isInteger(idTienda) ||
            !Number.isInteger(idProducto)
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_TIENDA e ID_PRO deben ser numeros enteros'
            });
        }

        const {
            PRECIO_VIGENTE_CAT_PRO,
            EXISTENCIA_ACTUAL_CAT_PRO
        } = req.body;

        if (
            PRECIO_VIGENTE_CAT_PRO === undefined &&
            EXISTENCIA_ACTUAL_CAT_PRO === undefined
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'No se enviaron campos para actualizar'
            });
        }

        const pool = await getConnection();
        const request = pool.request();

        request.input(
            'ID_TIENDA',
            sql.Int,
            idTienda
        );

        request.input(
            'ID_PRO',
            sql.Int,
            idProducto
        );

        const asignaciones = [];

        if (PRECIO_VIGENTE_CAT_PRO !== undefined) {
            const precio = Number(PRECIO_VIGENTE_CAT_PRO);

            if (
                !Number.isFinite(precio) ||
                precio <= 0
            ) {
                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'PRECIO_VIGENTE_CAT_PRO debe ser mayor que cero'
                });
            }

            request.input(
                'PRECIO_VIGENTE_CAT_PRO',
                sql.Decimal(10, 2),
                precio
            );

            asignaciones.push(
                'PRECIO_VIGENTE_CAT_PRO = @PRECIO_VIGENTE_CAT_PRO'
            );
        }

        if (EXISTENCIA_ACTUAL_CAT_PRO !== undefined) {
            const existencia = Number(
                EXISTENCIA_ACTUAL_CAT_PRO
            );

            if (
                !Number.isInteger(existencia) ||
                existencia < 0
            ) {
                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'EXISTENCIA_ACTUAL_CAT_PRO debe ser un entero mayor o igual a cero'
                });
            }

            request.input(
                'EXISTENCIA_ACTUAL_CAT_PRO',
                sql.Int,
                existencia
            );

            asignaciones.push(
                'EXISTENCIA_ACTUAL_CAT_PRO = @EXISTENCIA_ACTUAL_CAT_PRO'
            );
        }

        const resultado = await request.query(`
            UPDATE dbo.CATALOGO_PRODUCTO
            SET ${asignaciones.join(', ')}
            WHERE ID_TIENDA = @ID_TIENDA
              AND ID_PRO = @ID_PRO;
        `);

        if (resultado.rowsAffected[0] === 0) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Producto de catalogo no encontrado'
            });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Producto de catalogo actualizado correctamente'
        });

    } catch (error) {
        next(error);
    }
}


// Elimina un producto del catalogo de una tienda.
async function eliminarCatalogoProducto(req, res, next) {
    try {
        const idTienda = Number(req.params.idTienda);
        const idProducto = Number(req.params.idProducto);

        if (
            !Number.isInteger(idTienda) ||
            !Number.isInteger(idProducto)
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_TIENDA e ID_PRO deben ser numeros enteros'
            });
        }

        const pool = await getConnection();

        const resultado = await pool
            .request()
            .input('ID_TIENDA', sql.Int, idTienda)
            .input('ID_PRO', sql.Int, idProducto)
            .query(`
                DELETE FROM dbo.CATALOGO_PRODUCTO
                WHERE ID_TIENDA = @ID_TIENDA
                  AND ID_PRO = @ID_PRO;
            `);

        if (resultado.rowsAffected[0] === 0) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Producto de catalogo no encontrado'
            });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Producto eliminado del catalogo correctamente'
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    obtenerCatalogoProductos,
    obtenerCatalogoProductoPorId,
    crearCatalogoProducto,
    actualizarCatalogoProducto,
    eliminarCatalogoProducto
};