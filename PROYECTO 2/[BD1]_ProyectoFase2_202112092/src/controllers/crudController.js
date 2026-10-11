const { sql, getConnection } = require('../config/database');


// Crea las funciones CRUD para una tabla a partir
// de una configuracion previamente definida.
function crearCrudController(config) {

    // -----------------------------------------------------
    // GET - Obtener todos los registros
    // -----------------------------------------------------
    async function obtenerTodos(req, res, next) {
        try {
            const pool = await getConnection();

            const columnas = config.columnas
                .map(columna => columna.nombre)
                .join(', ');

            const resultado = await pool.request().query(`
                SELECT ${columnas}
                FROM dbo.${config.tabla}
                ORDER BY ${config.primaryKey.nombre};
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


    // -----------------------------------------------------
    // GET por ID
    // -----------------------------------------------------
    async function obtenerPorId(req, res, next) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: `El ID de ${config.nombreEntidad} debe ser un numero entero`
                });
            }

            const pool = await getConnection();

            const columnas = config.columnas
                .map(columna => columna.nombre)
                .join(', ');

            const resultado = await pool
                .request()
                .input(
                    config.primaryKey.nombre,
                    config.primaryKey.tipo,
                    id
                )
                .query(`
                    SELECT ${columnas}
                    FROM dbo.${config.tabla}
                    WHERE ${config.primaryKey.nombre}
                        = @${config.primaryKey.nombre};
                `);

            if (resultado.recordset.length === 0) {
                return res.status(404).json({
                    estado: 'ERROR',
                    mensaje: `${config.nombreEntidad} no encontrado`
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


    // -----------------------------------------------------
    // POST - Crear registro
    // -----------------------------------------------------
    async function crear(req, res, next) {
        try {
            const request = (await getConnection()).request();

            const nombresColumnas = [];
            const parametros = [];

            for (const columna of config.columnas) {
                const valor = req.body[columna.nombre];

                if (
                    columna.requerido &&
                    (
                        valor === undefined ||
                        valor === null ||
                        (
                            typeof valor === 'string' &&
                            valor.trim().length === 0
                        )
                    )
                ) {
                    return res.status(400).json({
                        estado: 'ERROR',
                        mensaje: `${columna.nombre} es obligatorio`
                    });
                }

                // En un POST agregamos solamente las columnas
                // enviadas o las que son obligatorias.
                if (valor !== undefined) {
                    const valorFinal =
                        typeof valor === 'string'
                            ? valor.trim()
                            : valor;

                    request.input(
                        columna.nombre,
                        columna.tipo,
                        valorFinal
                    );

                    nombresColumnas.push(columna.nombre);
                    parametros.push(`@${columna.nombre}`);
                }
            }

            if (nombresColumnas.length === 0) {
                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'No se enviaron datos para crear el registro'
                });
            }

            await request.query(`
                INSERT INTO dbo.${config.tabla} (
                    ${nombresColumnas.join(', ')}
                )
                VALUES (
                    ${parametros.join(', ')}
                );
            `);

            res.status(201).json({
                estado: 'OK',
                mensaje: `${config.nombreEntidad} creado correctamente`
            });

        } catch (error) {
            next(error);
        }
    }


    // -----------------------------------------------------
    // PUT - Actualizar registro
    // -----------------------------------------------------
    async function actualizar(req, res, next) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: `El ID de ${config.nombreEntidad} debe ser un numero entero`
                });
            }

            const pool = await getConnection();
            const request = pool.request();

            request.input(
                config.primaryKey.nombre,
                config.primaryKey.tipo,
                id
            );

            const asignaciones = [];

            for (const columna of config.columnas) {

                // La PK no se modifica.
                if (columna.nombre === config.primaryKey.nombre) {
                    continue;
                }

                if (req.body[columna.nombre] !== undefined) {
                    const valor = req.body[columna.nombre];

                    if (
                        columna.requerido &&
                        (
                            valor === null ||
                            (
                                typeof valor === 'string' &&
                                valor.trim().length === 0
                            )
                        )
                    ) {
                        return res.status(400).json({
                            estado: 'ERROR',
                            mensaje: `${columna.nombre} no puede estar vacio`
                        });
                    }

                    const valorFinal =
                        typeof valor === 'string'
                            ? valor.trim()
                            : valor;

                    request.input(
                        columna.nombre,
                        columna.tipo,
                        valorFinal
                    );

                    asignaciones.push(
                        `${columna.nombre} = @${columna.nombre}`
                    );
                }
            }

            if (asignaciones.length === 0) {
                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: 'No se enviaron campos para actualizar'
                });
            }

            const resultado = await request.query(`
                UPDATE dbo.${config.tabla}
                SET ${asignaciones.join(', ')}
                WHERE ${config.primaryKey.nombre}
                    = @${config.primaryKey.nombre};
            `);

            if (resultado.rowsAffected[0] === 0) {
                return res.status(404).json({
                    estado: 'ERROR',
                    mensaje: `${config.nombreEntidad} no encontrado`
                });
            }

            res.status(200).json({
                estado: 'OK',
                mensaje: `${config.nombreEntidad} actualizado correctamente`
            });

        } catch (error) {
            next(error);
        }
    }


    // -----------------------------------------------------
    // DELETE - Eliminar registro
    // -----------------------------------------------------
    async function eliminar(req, res, next) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({
                    estado: 'ERROR',
                    mensaje: `El ID de ${config.nombreEntidad} debe ser un numero entero`
                });
            }

            const pool = await getConnection();

            const resultado = await pool
                .request()
                .input(
                    config.primaryKey.nombre,
                    config.primaryKey.tipo,
                    id
                )
                .query(`
                    DELETE FROM dbo.${config.tabla}
                    WHERE ${config.primaryKey.nombre}
                        = @${config.primaryKey.nombre};
                `);

            if (resultado.rowsAffected[0] === 0) {
                return res.status(404).json({
                    estado: 'ERROR',
                    mensaje: `${config.nombreEntidad} no encontrado`
                });
            }

            res.status(200).json({
                estado: 'OK',
                mensaje: `${config.nombreEntidad} eliminado correctamente`
            });

        } catch (error) {
            next(error);
        }
    }


    return {
        obtenerTodos,
        obtenerPorId,
        crear,
        actualizar,
        eliminar
    };
}


module.exports = {
    crearCrudController,
    sql
};