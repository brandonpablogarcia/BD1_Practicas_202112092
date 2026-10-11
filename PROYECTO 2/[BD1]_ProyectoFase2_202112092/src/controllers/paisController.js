const { sql, getConnection } = require('../config/database');


// Obtiene todos los paises.
async function obtenerPaises(req, res, next) {
    try {
        const pool = await getConnection();

        const resultado = await pool.request().query(`
            SELECT
                ID_PAIS,
                NOMBRE_PAIS
            FROM dbo.PAIS
            ORDER BY ID_PAIS;
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


// Obtiene un pais por su identificador.
async function obtenerPaisPorId(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'El ID del pais debe ser un numero entero'
            });
        }

        const pool = await getConnection();

        const resultado = await pool
            .request()
            .input('ID_PAIS', sql.Int, id)
            .query(`
                SELECT
                    ID_PAIS,
                    NOMBRE_PAIS
                FROM dbo.PAIS
                WHERE ID_PAIS = @ID_PAIS;
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Pais no encontrado'
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


// Crea un nuevo pais.
async function crearPais(req, res, next) {
    try {
        const {
            ID_PAIS,
            NOMBRE_PAIS
        } = req.body;

        if (
            !Number.isInteger(ID_PAIS) ||
            !NOMBRE_PAIS ||
            typeof NOMBRE_PAIS !== 'string'
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'ID_PAIS y NOMBRE_PAIS son obligatorios'
            });
        }

        const nombre = NOMBRE_PAIS.trim();

        if (nombre.length === 0) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'NOMBRE_PAIS no puede estar vacio'
            });
        }

        const pool = await getConnection();

        await pool
            .request()
            .input('ID_PAIS', sql.Int, ID_PAIS)
            .input('NOMBRE_PAIS', sql.NVarChar, nombre)
            .query(`
                INSERT INTO dbo.PAIS (
                    ID_PAIS,
                    NOMBRE_PAIS
                )
                VALUES (
                    @ID_PAIS,
                    @NOMBRE_PAIS
                );
            `);

        res.status(201).json({
            estado: 'OK',
            mensaje: 'Pais creado correctamente',
            datos: {
                ID_PAIS,
                NOMBRE_PAIS: nombre
            }
        });

    } catch (error) {
        next(error);
    }
}


// Actualiza el nombre de un pais.
async function actualizarPais(req, res, next) {
    try {
        const id = Number(req.params.id);
        const { NOMBRE_PAIS } = req.body;

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'El ID del pais debe ser un numero entero'
            });
        }

        if (
            !NOMBRE_PAIS ||
            typeof NOMBRE_PAIS !== 'string' ||
            NOMBRE_PAIS.trim().length === 0
        ) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'NOMBRE_PAIS es obligatorio'
            });
        }

        const nombre = NOMBRE_PAIS.trim();

        const pool = await getConnection();

        const resultado = await pool
            .request()
            .input('ID_PAIS', sql.Int, id)
            .input('NOMBRE_PAIS', sql.NVarChar, nombre)
            .query(`
                UPDATE dbo.PAIS
                SET NOMBRE_PAIS = @NOMBRE_PAIS
                WHERE ID_PAIS = @ID_PAIS;
            `);

        if (resultado.rowsAffected[0] === 0) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Pais no encontrado'
            });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Pais actualizado correctamente',
            datos: {
                ID_PAIS: id,
                NOMBRE_PAIS: nombre
            }
        });

    } catch (error) {
        next(error);
    }
}


// Elimina un pais.
async function eliminarPais(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'El ID del pais debe ser un numero entero'
            });
        }

        const pool = await getConnection();

        const resultado = await pool
            .request()
            .input('ID_PAIS', sql.Int, id)
            .query(`
                DELETE FROM dbo.PAIS
                WHERE ID_PAIS = @ID_PAIS;
            `);

        if (resultado.rowsAffected[0] === 0) {
            return res.status(404).json({
                estado: 'ERROR',
                mensaje: 'Pais no encontrado'
            });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Pais eliminado correctamente'
        });

    } catch (error) {
        next(error);
    }
}


module.exports = {
    obtenerPaises,
    obtenerPaisPorId,
    crearPais,
    actualizarPais,
    eliminarPais
};