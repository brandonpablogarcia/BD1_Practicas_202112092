// Maneja las rutas que no existen dentro de la API.
function notFound(req, res, next) {
    const error = new Error(
        `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    );

    error.statusCode = 404;

    next(error);
}


// Maneja los errores generados dentro de la API.
function errorHandler(error, req, res, next) {
    let statusCode = error.statusCode || 500;
    let mensaje = error.message || 'Error interno del servidor';

    // Error personalizado generado por el trigger Insert_Detalle.
    if (
        error.number === 50001 ||
        error.originalError?.info?.number === 50001
    ) {
        statusCode = 400;
        mensaje = 'Stock insuficiente';
    }

    // Llave primaria o valor UNIQUE duplicado.
    if (
        error.number === 2627 ||
        error.number === 2601 ||
        error.originalError?.info?.number === 2627 ||
        error.originalError?.info?.number === 2601
    ) {
        statusCode = 400;
        mensaje = 'El registro ya existe';
    }

    // Error de llave foranea o alguna restriccion CHECK.
    if (
        error.number === 547 ||
        error.originalError?.info?.number === 547
    ) {
        statusCode = 400;
        mensaje = 'La operacion viola una restriccion de la base de datos';
    }

    // Se intento insertar NULL en una columna obligatoria.
    if (
        error.number === 515 ||
        error.originalError?.info?.number === 515
    ) {
        statusCode = 400;
        mensaje = 'Faltan datos obligatorios para realizar la operacion';
    }

    // Valor con tipo de dato incorrecto.
    if (
        error.number === 245 ||
        error.originalError?.info?.number === 245
    ) {
        statusCode = 400;
        mensaje = 'Uno de los valores tiene un tipo de dato incorrecto';
    }

    console.error('Error:', error.message);

    res.status(statusCode).json({
        estado: 'ERROR',
        mensaje
    });
}

module.exports = {
    notFound,
    errorHandler
};