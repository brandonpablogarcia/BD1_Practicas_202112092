const {
    sql,
    getConnection
} = require('../config/database');


// Obtiene todos los detalles de venta.
async function obtenerDetalles(req, res, next) {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                ID_VENTA,
                ID_PRO,
                CANTIDAD_DES_VENTA,
                PRECIO_UNITARIO_DES_VENTA,
                SUBTOTAL_DES_VENTA
            FROM dbo.DESGLOSE_VENTA
            ORDER BY ID_VENTA, ID_PRO;
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


// Obtiene un detalle mediante su llave primaria compuesta.
async function obtenerDetallePorId(req, res, next) {
    try {
        const idVenta = Number(req.params.idVenta);
        const idProducto = Number(req.params.idProducto);

        if (
            !Number.isInteger(idVenta) ||
            !Number.isInteger(idProducto)
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_VENTA e ID_PRO deben ser numeros enteros'
            });
        }

        const pool = await getConnection();

        const resultado = await pool
            .request()
            .input('ID_VENTA', sql.Int, idVenta)
            .input('ID_PRO', sql.Int, idProducto)
            .query(`
                SELECT
                    ID_VENTA,
                    ID_PRO,
                    CANTIDAD_DES_VENTA,
                    PRECIO_UNITARIO_DES_VENTA,
                    SUBTOTAL_DES_VENTA
                FROM dbo.DESGLOSE_VENTA
                WHERE ID_VENTA = @ID_VENTA
                  AND ID_PRO = @ID_PRO;
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Detalle de venta no encontrado'
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


// Crea un detalle.
// El trigger Insert_Detalle verifica y descuenta el inventario.
async function crearDetalle(req, res, next) {
    try {
        const {
            ID_VENTA,
            ID_PRO,
            CANTIDAD_DES_VENTA,
            PRECIO_UNITARIO_DES_VENTA
        } = req.body;

        if (
            !Number.isInteger(ID_VENTA) ||
            !Number.isInteger(ID_PRO)
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_VENTA e ID_PRO son obligatorios y deben ser enteros'
            });
        }

        const cantidad = Number(CANTIDAD_DES_VENTA);
        const precio = Number(PRECIO_UNITARIO_DES_VENTA);

        if (
            !Number.isInteger(cantidad) ||
            cantidad <= 0
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'CANTIDAD_DES_VENTA debe ser un entero mayor que cero'
            });
        }

        if (
            !Number.isFinite(precio) ||
            precio <= 0
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'PRECIO_UNITARIO_DES_VENTA debe ser mayor que cero'
            });
        }

        const subtotal = Number(
            (cantidad * precio).toFixed(2)
        );

        const pool = await getConnection();

        await pool
            .request()
            .input('ID_VENTA', sql.Int, ID_VENTA)
            .input('ID_PRO', sql.Int, ID_PRO)
            .input(
                'CANTIDAD_DES_VENTA',
                sql.Int,
                cantidad
            )
            .input(
                'PRECIO_UNITARIO_DES_VENTA',
                sql.Decimal(10, 2),
                precio
            )
            .input(
                'SUBTOTAL_DES_VENTA',
                sql.Decimal(12, 2),
                subtotal
            )
            .query(`
                INSERT INTO dbo.DESGLOSE_VENTA (
                    ID_VENTA,
                    ID_PRO,
                    CANTIDAD_DES_VENTA,
                    PRECIO_UNITARIO_DES_VENTA,
                    SUBTOTAL_DES_VENTA
                )
                VALUES (
                    @ID_VENTA,
                    @ID_PRO,
                    @CANTIDAD_DES_VENTA,
                    @PRECIO_UNITARIO_DES_VENTA,
                    @SUBTOTAL_DES_VENTA
                );
            `);

        res.status(201).json({
            estado: 'OK',
            mensaje: 'Detalle de venta creado correctamente',
            datos: {
                ID_VENTA,
                ID_PRO,
                CANTIDAD_DES_VENTA: cantidad,
                PRECIO_UNITARIO_DES_VENTA: precio,
                SUBTOTAL_DES_VENTA: subtotal
            }
        });

    } catch (error) {
        next(error);
    }
}


// Actualiza cantidad y/o precio.
// Si cambia la cantidad, la API ajusta el inventario
// dentro de la misma transaccion.
async function actualizarDetalle(req, res, next) {
    let transaction;

    try {
        const idVenta = Number(req.params.idVenta);
        const idProducto = Number(req.params.idProducto);

        if (
            !Number.isInteger(idVenta) ||
            !Number.isInteger(idProducto)
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_VENTA e ID_PRO deben ser numeros enteros'
            });
        }

        const {
            CANTIDAD_DES_VENTA,
            PRECIO_UNITARIO_DES_VENTA
        } = req.body;

        if (
            CANTIDAD_DES_VENTA === undefined &&
            PRECIO_UNITARIO_DES_VENTA === undefined
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'No se enviaron campos para actualizar'
            });
        }

        const pool = await getConnection();

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const consultaActual = await new sql.Request(transaction)
            .input('ID_VENTA', sql.Int, idVenta)
            .input('ID_PRO', sql.Int, idProducto)
            .query(`
                SELECT
                    dv.CANTIDAD_DES_VENTA,
                    dv.PRECIO_UNITARIO_DES_VENTA,
                    v.ID_TIENDA
                FROM dbo.DESGLOSE_VENTA dv
                INNER JOIN dbo.VENTA v
                    ON dv.ID_VENTA = v.ID_VENTA
                WHERE dv.ID_VENTA = @ID_VENTA
                  AND dv.ID_PRO = @ID_PRO;
            `);

        if (consultaActual.recordset.length === 0) {
            await transaction.rollback();

            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Detalle de venta no encontrado'
            });
        }

        const actual = consultaActual.recordset[0];

        let nuevaCantidad = actual.CANTIDAD_DES_VENTA;
        let nuevoPrecio = Number(
            actual.PRECIO_UNITARIO_DES_VENTA
        );

        if (CANTIDAD_DES_VENTA !== undefined) {
            nuevaCantidad = Number(CANTIDAD_DES_VENTA);

            if (
                !Number.isInteger(nuevaCantidad) ||
                nuevaCantidad <= 0
            ) {
                await transaction.rollback();

                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'CANTIDAD_DES_VENTA debe ser un entero mayor que cero'
                });
            }
        }

        if (PRECIO_UNITARIO_DES_VENTA !== undefined) {
            nuevoPrecio = Number(
                PRECIO_UNITARIO_DES_VENTA
            );

            if (
                !Number.isFinite(nuevoPrecio) ||
                nuevoPrecio <= 0
            ) {
                await transaction.rollback();

                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'PRECIO_UNITARIO_DES_VENTA debe ser mayor que cero'
                });
            }
        }

        const diferencia =
            nuevaCantidad - actual.CANTIDAD_DES_VENTA;

        // Si ahora se venden mas unidades, debe existir
        // inventario suficiente para cubrir la diferencia.
        if (diferencia > 0) {
            const inventario = await new sql.Request(transaction)
                .input(
                    'ID_TIENDA',
                    sql.Int,
                    actual.ID_TIENDA
                )
                .input(
                    'ID_PRO',
                    sql.Int,
                    idProducto
                )
                .query(`
                    SELECT
                        EXISTENCIA_ACTUAL_CAT_PRO
                    FROM dbo.CATALOGO_PRODUCTO
                    WITH (UPDLOCK, HOLDLOCK)
                    WHERE ID_TIENDA = @ID_TIENDA
                      AND ID_PRO = @ID_PRO;
                `);

            if (
                inventario.recordset.length === 0 ||
                inventario.recordset[0]
                    .EXISTENCIA_ACTUAL_CAT_PRO < diferencia
            ) {
                await transaction.rollback();

                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'Stock insuficiente'
                });
            }

            await new sql.Request(transaction)
                .input(
                    'ID_TIENDA',
                    sql.Int,
                    actual.ID_TIENDA
                )
                .input(
                    'ID_PRO',
                    sql.Int,
                    idProducto
                )
                .input(
                    'DIFERENCIA',
                    sql.Int,
                    diferencia
                )
                .query(`
                    UPDATE dbo.CATALOGO_PRODUCTO
                    SET EXISTENCIA_ACTUAL_CAT_PRO =
                        EXISTENCIA_ACTUAL_CAT_PRO - @DIFERENCIA
                    WHERE ID_TIENDA = @ID_TIENDA
                      AND ID_PRO = @ID_PRO;
                `);
        }

        // Si ahora se venden menos unidades,
        // las unidades sobrantes regresan al inventario.
        if (diferencia < 0) {
            await new sql.Request(transaction)
                .input(
                    'ID_TIENDA',
                    sql.Int,
                    actual.ID_TIENDA
                )
                .input(
                    'ID_PRO',
                    sql.Int,
                    idProducto
                )
                .input(
                    'DEVOLUCION',
                    sql.Int,
                    Math.abs(diferencia)
                )
                .query(`
                    UPDATE dbo.CATALOGO_PRODUCTO
                    SET EXISTENCIA_ACTUAL_CAT_PRO =
                        EXISTENCIA_ACTUAL_CAT_PRO + @DEVOLUCION
                    WHERE ID_TIENDA = @ID_TIENDA
                      AND ID_PRO = @ID_PRO;
                `);
        }

        const subtotal = Number(
            (nuevaCantidad * nuevoPrecio).toFixed(2)
        );

        await new sql.Request(transaction)
            .input('ID_VENTA', sql.Int, idVenta)
            .input('ID_PRO', sql.Int, idProducto)
            .input(
                'CANTIDAD_DES_VENTA',
                sql.Int,
                nuevaCantidad
            )
            .input(
                'PRECIO_UNITARIO_DES_VENTA',
                sql.Decimal(10, 2),
                nuevoPrecio
            )
            .input(
                'SUBTOTAL_DES_VENTA',
                sql.Decimal(12, 2),
                subtotal
            )
            .query(`
                UPDATE dbo.DESGLOSE_VENTA
                SET
                    CANTIDAD_DES_VENTA =
                        @CANTIDAD_DES_VENTA,
                    PRECIO_UNITARIO_DES_VENTA =
                        @PRECIO_UNITARIO_DES_VENTA,
                    SUBTOTAL_DES_VENTA =
                        @SUBTOTAL_DES_VENTA
                WHERE ID_VENTA = @ID_VENTA
                  AND ID_PRO = @ID_PRO;
            `);

        await transaction.commit();

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Detalle de venta actualizado correctamente'
        });

    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {
                // La transaccion puede haber terminado previamente.
            }
        }

        next(error);
    }
}


// Elimina un detalle y devuelve sus unidades al inventario.
async function eliminarDetalle(req, res, next) {
    let transaction;

    try {
        const idVenta = Number(req.params.idVenta);
        const idProducto = Number(req.params.idProducto);

        if (
            !Number.isInteger(idVenta) ||
            !Number.isInteger(idProducto)
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_VENTA e ID_PRO deben ser numeros enteros'
            });
        }

        const pool = await getConnection();

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const detalle = await new sql.Request(transaction)
            .input('ID_VENTA', sql.Int, idVenta)
            .input('ID_PRO', sql.Int, idProducto)
            .query(`
                SELECT
                    dv.CANTIDAD_DES_VENTA,
                    v.ID_TIENDA
                FROM dbo.DESGLOSE_VENTA dv
                INNER JOIN dbo.VENTA v
                    ON dv.ID_VENTA = v.ID_VENTA
                WHERE dv.ID_VENTA = @ID_VENTA
                  AND dv.ID_PRO = @ID_PRO;
            `);

        if (detalle.recordset.length === 0) {
            await transaction.rollback();

            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Detalle de venta no encontrado'
            });
        }

        const registro = detalle.recordset[0];

        await new sql.Request(transaction)
            .input('ID_VENTA', sql.Int, idVenta)
            .input('ID_PRO', sql.Int, idProducto)
            .query(`
                DELETE FROM dbo.DESGLOSE_VENTA
                WHERE ID_VENTA = @ID_VENTA
                  AND ID_PRO = @ID_PRO;
            `);

        // Al eliminar el detalle, sus unidades
        // regresan al inventario de la tienda.
        await new sql.Request(transaction)
            .input(
                'ID_TIENDA',
                sql.Int,
                registro.ID_TIENDA
            )
            .input(
                'ID_PRO',
                sql.Int,
                idProducto
            )
            .input(
                'CANTIDAD',
                sql.Int,
                registro.CANTIDAD_DES_VENTA
            )
            .query(`
                UPDATE dbo.CATALOGO_PRODUCTO
                SET EXISTENCIA_ACTUAL_CAT_PRO =
                    EXISTENCIA_ACTUAL_CAT_PRO + @CANTIDAD
                WHERE ID_TIENDA = @ID_TIENDA
                  AND ID_PRO = @ID_PRO;
            `);

        await transaction.commit();

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Detalle de venta eliminado correctamente'
        });

    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {
                // La transaccion puede haber terminado previamente.
            }
        }

        next(error);
    }
}


module.exports = {
    obtenerDetalles,
    obtenerDetallePorId,
    crearDetalle,
    actualizarDetalle,
    eliminarDetalle
};