const {
    sql,
    getConnection
} = require('../config/database');


// Recalcula el estado de una venta despues de modificar
// o eliminar un pago. Las ventas anuladas no se modifican.
async function recalcularEstadoVenta(
    transaction,
    idVenta
) {
    await new sql.Request(transaction)
        .input('ID_VENTA', sql.Int, idVenta)
        .query(`
            UPDATE v
            SET v.ID_ES_VENTA =
                CASE
                    WHEN
                        EXISTS (
                            SELECT 1
                            FROM dbo.DESGLOSE_VENTA dv
                            WHERE dv.ID_VENTA = v.ID_VENTA
                        )
                        AND
                        ISNULL((
                            SELECT SUM(p.MONTO_PAGO)
                            FROM dbo.PAGO p
                            WHERE p.ID_VENTA = v.ID_VENTA
                        ), 0)
                        >=
                        ISNULL((
                            SELECT SUM(dv.SUBTOTAL_DES_VENTA)
                            FROM dbo.DESGLOSE_VENTA dv
                            WHERE dv.ID_VENTA = v.ID_VENTA
                        ), 0)
                    THEN (
                        SELECT TOP 1 ID_ES_VENTA
                        FROM dbo.ESTADO_VENTA
                        WHERE UPPER(NOMBRE_ES_VENTA) = 'PAGADA'
                    )
                    ELSE (
                        SELECT TOP 1 ID_ES_VENTA
                        FROM dbo.ESTADO_VENTA
                        WHERE UPPER(NOMBRE_ES_VENTA) = 'REGISTRADA'
                    )
                END
            FROM dbo.VENTA v
            INNER JOIN dbo.ESTADO_VENTA ev
                ON v.ID_ES_VENTA = ev.ID_ES_VENTA
            WHERE v.ID_VENTA = @ID_VENTA
              AND UPPER(ev.NOMBRE_ES_VENTA) <> 'ANULADA';
        `);
}


// Obtiene todos los pagos.
async function obtenerPagos(req, res, next) {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                ID_PAGO,
                MONTO_PAGO,
                ID_VENTA,
                ID_MET_PAGO
            FROM dbo.PAGO
            ORDER BY ID_PAGO;
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


// Obtiene un pago por su identificador.
async function obtenerPagoPorId(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'El ID del pago debe ser un numero entero'
            });
        }

        const pool = await getConnection();

        const resultado = await pool
            .request()
            .input('ID_PAGO', sql.Int, id)
            .query(`
                SELECT
                    ID_PAGO,
                    MONTO_PAGO,
                    ID_VENTA,
                    ID_MET_PAGO
                FROM dbo.PAGO
                WHERE ID_PAGO = @ID_PAGO;
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Pago no encontrado'
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


// Crea un pago.
// El trigger Insert_Pago se encarga de cambiar
// automaticamente la venta a PAGADA cuando corresponda.
async function crearPago(req, res, next) {
    try {
        const {
            ID_PAGO,
            MONTO_PAGO,
            ID_VENTA,
            ID_MET_PAGO
        } = req.body;

        if (
            !Number.isInteger(ID_PAGO) ||
            !Number.isInteger(ID_VENTA) ||
            !Number.isInteger(ID_MET_PAGO)
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_PAGO, ID_VENTA e ID_MET_PAGO deben ser enteros'
            });
        }

        const monto = Number(MONTO_PAGO);

        if (
            !Number.isFinite(monto) ||
            monto <= 0
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'MONTO_PAGO debe ser mayor que cero'
            });
        }

        const pool = await getConnection();

        await pool
            .request()
            .input('ID_PAGO', sql.Int, ID_PAGO)
            .input(
                'MONTO_PAGO',
                sql.Decimal(12, 2),
                monto
            )
            .input('ID_VENTA', sql.Int, ID_VENTA)
            .input(
                'ID_MET_PAGO',
                sql.Int,
                ID_MET_PAGO
            )
            .query(`
                INSERT INTO dbo.PAGO (
                    ID_PAGO,
                    MONTO_PAGO,
                    ID_VENTA,
                    ID_MET_PAGO
                )
                VALUES (
                    @ID_PAGO,
                    @MONTO_PAGO,
                    @ID_VENTA,
                    @ID_MET_PAGO
                );
            `);

        res.status(201).json({
            estado: 'OK',
            mensaje: 'Pago creado correctamente',
            datos: {
                ID_PAGO,
                MONTO_PAGO: monto,
                ID_VENTA,
                ID_MET_PAGO
            }
        });

    } catch (error) {
        next(error);
    }
}


// Actualiza un pago y recalcula el estado
// de las ventas afectadas.
async function actualizarPago(req, res, next) {
    let transaction;

    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'El ID del pago debe ser un numero entero'
            });
        }

        const {
            MONTO_PAGO,
            ID_VENTA,
            ID_MET_PAGO
        } = req.body;

        if (
            MONTO_PAGO === undefined &&
            ID_VENTA === undefined &&
            ID_MET_PAGO === undefined
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'No se enviaron campos para actualizar'
            });
        }

        const pool = await getConnection();

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const consultaActual =
            await new sql.Request(transaction)
                .input('ID_PAGO', sql.Int, id)
                .query(`
                    SELECT
                        ID_PAGO,
                        MONTO_PAGO,
                        ID_VENTA,
                        ID_MET_PAGO
                    FROM dbo.PAGO
                    WITH (UPDLOCK, HOLDLOCK)
                    WHERE ID_PAGO = @ID_PAGO;
                `);

        if (consultaActual.recordset.length === 0) {
            await transaction.rollback();

            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Pago no encontrado'
            });
        }

        const actual =
            consultaActual.recordset[0];

        let nuevoMonto =
            Number(actual.MONTO_PAGO);

        let nuevaVenta =
            actual.ID_VENTA;

        let nuevoMetodo =
            actual.ID_MET_PAGO;

        if (MONTO_PAGO !== undefined) {
            nuevoMonto = Number(MONTO_PAGO);

            if (
                !Number.isFinite(nuevoMonto) ||
                nuevoMonto <= 0
            ) {
                await transaction.rollback();

                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'MONTO_PAGO debe ser mayor que cero'
                });
            }
        }

        if (ID_VENTA !== undefined) {
            nuevaVenta = Number(ID_VENTA);

            if (!Number.isInteger(nuevaVenta)) {
                await transaction.rollback();

                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'ID_VENTA debe ser un numero entero'
                });
            }
        }

        if (ID_MET_PAGO !== undefined) {
            nuevoMetodo = Number(ID_MET_PAGO);

            if (!Number.isInteger(nuevoMetodo)) {
                await transaction.rollback();

                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'ID_MET_PAGO debe ser un numero entero'
                });
            }
        }

        await new sql.Request(transaction)
            .input('ID_PAGO', sql.Int, id)
            .input(
                'MONTO_PAGO',
                sql.Decimal(12, 2),
                nuevoMonto
            )
            .input(
                'ID_VENTA',
                sql.Int,
                nuevaVenta
            )
            .input(
                'ID_MET_PAGO',
                sql.Int,
                nuevoMetodo
            )
            .query(`
                UPDATE dbo.PAGO
                SET
                    MONTO_PAGO = @MONTO_PAGO,
                    ID_VENTA = @ID_VENTA,
                    ID_MET_PAGO = @ID_MET_PAGO
                WHERE ID_PAGO = @ID_PAGO;
            `);

        // Se recalcula la venta original.
        await recalcularEstadoVenta(
            transaction,
            actual.ID_VENTA
        );

        // Si el pago cambio de venta, tambien
        // se recalcula la nueva venta.
        if (nuevaVenta !== actual.ID_VENTA) {
            await recalcularEstadoVenta(
                transaction,
                nuevaVenta
            );
        }

        await transaction.commit();

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Pago actualizado correctamente'
        });

    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {
                // La transaccion puede haber terminado.
            }
        }

        next(error);
    }
}


// Elimina un pago y recalcula el estado
// de la venta relacionada.
async function eliminarPago(req, res, next) {
    let transaction;

    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'El ID del pago debe ser un numero entero'
            });
        }

        const pool = await getConnection();

        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const consulta =
            await new sql.Request(transaction)
                .input('ID_PAGO', sql.Int, id)
                .query(`
                    SELECT
                        ID_VENTA
                    FROM dbo.PAGO
                    WITH (UPDLOCK, HOLDLOCK)
                    WHERE ID_PAGO = @ID_PAGO;
                `);

        if (consulta.recordset.length === 0) {
            await transaction.rollback();

            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Pago no encontrado'
            });
        }

        const idVenta =
            consulta.recordset[0].ID_VENTA;

        await new sql.Request(transaction)
            .input('ID_PAGO', sql.Int, id)
            .query(`
                DELETE FROM dbo.PAGO
                WHERE ID_PAGO = @ID_PAGO;
            `);

        await recalcularEstadoVenta(
            transaction,
            idVenta
        );

        await transaction.commit();

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Pago eliminado correctamente'
        });

    } catch (error) {
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (_) {
                // La transaccion puede haber terminado.
            }
        }

        next(error);
    }
}


module.exports = {
    obtenerPagos,
    obtenerPagoPorId,
    crearPago,
    actualizarPago,
    eliminarPago
};