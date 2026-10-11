const sql = require('mssql');


// Configuracion de las entidades que utilizan
// el CRUD reutilizable.
const entidades = {

    // =====================================================
    // CARGO
    // =====================================================
    cargo: {
        tabla: 'CARGO',
        nombreEntidad: 'Cargo',

        primaryKey: {
            nombre: 'ID_CARGO',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_CARGO',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_CARGO',
                tipo: sql.NVarChar,
                requerido: true
            }
        ]
    },


    // =====================================================
    // DEPARTAMENTO
    // =====================================================
    departamento: {
        tabla: 'DEPARTAMENTO',
        nombreEntidad: 'Departamento',

        primaryKey: {
            nombre: 'ID_DEP',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_DEP',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_DEP',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'ID_PAIS',
                tipo: sql.Int,
                requerido: true
            }
        ]
    },


    // =====================================================
    // MUNICIPIO
    // =====================================================
    municipio: {
        tabla: 'MUNICIPIO',
        nombreEntidad: 'Municipio',

        primaryKey: {
            nombre: 'ID_MUN',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_MUN',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_MUN',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'ID_DEP',
                tipo: sql.Int,
                requerido: true
            }
        ]
    },


    // =====================================================
    // TIPO_TIENDA
    // =====================================================
    tipoTienda: {
        tabla: 'TIPO_TIENDA',
        nombreEntidad: 'Tipo de tienda',

        primaryKey: {
            nombre: 'ID_TIPO_TIENDA',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_TIPO_TIENDA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_TIP_TIENDA',
                tipo: sql.NVarChar,
                requerido: true
            }
        ]
    },


    // =====================================================
    // TIENDA
    // =====================================================
    tienda: {
        tabla: 'TIENDA',
        nombreEntidad: 'Tienda',

        primaryKey: {
            nombre: 'ID_TIENDA',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_TIENDA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_TIENDA',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'DIRECCION_TIENDA',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'TELEFONO_TIENDA',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'ID_MUN',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'ID_TIPO_TIENDA',
                tipo: sql.Int,
                requerido: true
            }
        ]
    },


    // =====================================================
    // PERSONA
    // =====================================================
    persona: {
        tabla: 'PERSONA',
        nombreEntidad: 'Persona',

        primaryKey: {
            nombre: 'ID_PERSONA',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_PERSONA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_PERSONA',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'APELLIDO_PERSONA',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'TELEFONO_PERSONA',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'CORREO_PERSONA',
                tipo: sql.NVarChar,
                requerido: false
            },
            {
                nombre: 'DIRECCION_PERSONA',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'ID_MUN',
                tipo: sql.Int,
                requerido: true
            }
        ]
    },


    // =====================================================
    // EMPLEADO
    // =====================================================
    empleado: {
        tabla: 'EMPLEADO',
        nombreEntidad: 'Empleado',

        primaryKey: {
            nombre: 'ID_EMPLEADO',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_EMPLEADO',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'FECHA_CONTRATACION',
                tipo: sql.Date,
                requerido: true
            },
            {
                nombre: 'ID_TIENDA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'ID_PERSONA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'ID_CARGO',
                tipo: sql.Int,
                requerido: true
            }
        ]
    },


    // =====================================================
    // TIPO_IDENTIFICACION
    // =====================================================
    tipoIdentificacion: {
        tabla: 'TIPO_IDENTIFICACION',
        nombreEntidad: 'Tipo de identificacion',

        primaryKey: {
            nombre: 'ID_TIP_IDENT',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_TIP_IDENT',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_TIP_IDENT',
                tipo: sql.NVarChar,
                requerido: true
            }
        ]
    },


    // =====================================================
    // CLIENTE
    // =====================================================
    cliente: {
        tabla: 'CLIENTE',
        nombreEntidad: 'Cliente',

        primaryKey: {
            nombre: 'ID_CLIENTE',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_CLIENTE',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NUMERO_IDENTIFICACION',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'ID_PERSONA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'ID_TIP_IDENT',
                tipo: sql.Int,
                requerido: true
            }
        ]
    },


    // =====================================================
    // CATEGORIA
    // =====================================================
    categoria: {
        tabla: 'CATEGORIA',
        nombreEntidad: 'Categoria',

        primaryKey: {
            nombre: 'ID_CAT',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_CAT',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_CAT',
                tipo: sql.NVarChar,
                requerido: true
            }
        ]
    },


    // =====================================================
    // MARCA
    // =====================================================
    marca: {
        tabla: 'MARCA',
        nombreEntidad: 'Marca',

        primaryKey: {
            nombre: 'ID_MARCA',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_MARCA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_MARCA',
                tipo: sql.NVarChar,
                requerido: true
            }
        ]
    },


    // =====================================================
    // PRODUCTO
    // =====================================================
    producto: {
        tabla: 'PRODUCTO',
        nombreEntidad: 'Producto',

        primaryKey: {
            nombre: 'ID_PRO',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_PRO',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_PRO',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'DESCRIPCION_PRO',
                tipo: sql.NVarChar,
                requerido: true
            },
            {
                nombre: 'ID_CAT',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'ID_MARCA',
                tipo: sql.Int,
                requerido: true
            }
        ]
    },


    // =====================================================
    // ESTADO_VENTA
    // =====================================================
    estadoVenta: {
        tabla: 'ESTADO_VENTA',
        nombreEntidad: 'Estado de venta',

        primaryKey: {
            nombre: 'ID_ES_VENTA',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_ES_VENTA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_ES_VENTA',
                tipo: sql.NVarChar,
                requerido: true
            }
        ]
    },


    // =====================================================
    // VENTA
    // =====================================================
    venta: {
        tabla: 'VENTA',
        nombreEntidad: 'Venta',

        primaryKey: {
            nombre: 'ID_VENTA',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_VENTA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'FECHA_VENTA',
                tipo: sql.Date,
                requerido: true
            },
            {
                nombre: 'ID_TIENDA',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'ID_EMPLEADO',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'ID_CLIENTE',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'ID_ES_VENTA',
                tipo: sql.Int,
                requerido: true
            }
        ]
    },


    // =====================================================
    // METODO_PAGO
    // =====================================================
    metodoPago: {
        tabla: 'METODO_PAGO',
        nombreEntidad: 'Metodo de pago',

        primaryKey: {
            nombre: 'ID_MET_PAGO',
            tipo: sql.Int
        },

        columnas: [
            {
                nombre: 'ID_MET_PAGO',
                tipo: sql.Int,
                requerido: true
            },
            {
                nombre: 'NOMBRE_MET_PAGO',
                tipo: sql.NVarChar,
                requerido: true
            }
        ]
    }

};


module.exports = entidades;