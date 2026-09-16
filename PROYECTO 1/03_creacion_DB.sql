-- Generado por Oracle SQL Developer Data Modeler 24.3.1.347.1153
--   en:        2026-09-15 16:33:32 CST
--   sitio:      Oracle Database 11g
--   tipo:      Oracle Database 11g



-- predefined type, no DDL - MDSYS.SDO_GEOMETRY

-- predefined type, no DDL - XMLTYPE

CREATE TABLE cargo (
    id_cargo     INTEGER NOT NULL,
    nombre_cargo VARCHAR2(100) NOT NULL
);

ALTER TABLE cargo ADD CONSTRAINT cargo_pk PRIMARY KEY ( id_cargo );

ALTER TABLE cargo ADD CONSTRAINT uq_cargo_nom UNIQUE ( nombre_cargo );

CREATE TABLE catalogo_producto (
    precio_vigente_cat_pro    NUMBER(10, 2) NOT NULL,
    existencia_actual_cat_pro INTEGER NOT NULL,
    id_tienda                 INTEGER NOT NULL,
    id_pro                    INTEGER NOT NULL
);

ALTER TABLE catalogo_producto ADD CONSTRAINT ck_cat_precio_pos CHECK ( precio_vigente_cat_pro > 0 );

ALTER TABLE catalogo_producto ADD CONSTRAINT ck_cat_exist_no_neg CHECK ( existencia_actual_cat_pro >= 0 );

ALTER TABLE catalogo_producto ADD CONSTRAINT catalogo_producto_pk PRIMARY KEY ( id_tienda,
                                                                                id_pro );

CREATE TABLE categoria (
    id_cat     INTEGER NOT NULL,
    nombre_cat VARCHAR2(100) NOT NULL
);

ALTER TABLE categoria ADD CONSTRAINT categoria_pk PRIMARY KEY ( id_cat );

ALTER TABLE categoria ADD CONSTRAINT uq_categoria_nom UNIQUE ( nombre_cat );

CREATE TABLE cliente (
    id_cliente            INTEGER NOT NULL,
    numero_identificacion VARCHAR2(30) NOT NULL,
    id_persona            INTEGER NOT NULL,
    id_tip_ident          INTEGER NOT NULL
);

CREATE UNIQUE INDEX cliente__idx ON
    cliente (
        id_persona
    ASC );

ALTER TABLE cliente ADD CONSTRAINT cliente_pk PRIMARY KEY ( id_cliente );

ALTER TABLE cliente ADD CONSTRAINT uq_cli_tipo_num UNIQUE ( numero_identificacion,
                                                            id_tip_ident );

CREATE TABLE departamento (
    id_dep     INTEGER NOT NULL,
    nombre_dep VARCHAR2(100) NOT NULL,
    id_pais    INTEGER NOT NULL
);

ALTER TABLE departamento ADD CONSTRAINT departamento_pk PRIMARY KEY ( id_dep );

ALTER TABLE departamento ADD CONSTRAINT uq_dep_pais_nom UNIQUE ( nombre_dep,
                                                                 id_pais );

CREATE TABLE desglose_venta (
    cantidad_des_venta        INTEGER NOT NULL,
    precio_unitario_des_venta NUMBER(10, 2) NOT NULL,
    subtotal_des_venta        NUMBER(12, 2) NOT NULL,
    id_pro                    INTEGER NOT NULL,
    id_venta                  INTEGER NOT NULL
);

ALTER TABLE desglose_venta ADD CONSTRAINT ck_des_ven_cantidad_positiva CHECK ( cantidad_des_venta > 0 );

ALTER TABLE desglose_venta ADD CONSTRAINT ck_des_ven_precio_positivo CHECK ( precio_unitario_des_venta > 0 );

ALTER TABLE desglose_venta ADD CONSTRAINT ck_des_ven_subtotal_positivo CHECK ( subtotal_des_venta > 0 );

ALTER TABLE desglose_venta
    ADD CONSTRAINT ck_des_ven_subtotal_calculado CHECK ( subtotal_des_venta = cantidad_des_venta * precio_unitario_des_venta );

ALTER TABLE desglose_venta ADD CONSTRAINT desglose_venta_pk PRIMARY KEY ( id_venta,
                                                                          id_pro );

CREATE TABLE empleado (
    id_empleado        INTEGER NOT NULL,
    fecha_contratacion DATE NOT NULL,
    id_tienda          INTEGER NOT NULL,
    id_persona         INTEGER NOT NULL,
    id_cargo           INTEGER NOT NULL
);

CREATE UNIQUE INDEX empleado__idx ON
    empleado (
        id_persona
    ASC );

ALTER TABLE empleado ADD CONSTRAINT empleado_pk PRIMARY KEY ( id_empleado );

CREATE TABLE estado_venta (
    id_es_venta     INTEGER NOT NULL,
    nombre_es_venta VARCHAR2(100) NOT NULL
);

ALTER TABLE estado_venta ADD CONSTRAINT estado_venta_pk PRIMARY KEY ( id_es_venta );

ALTER TABLE estado_venta ADD CONSTRAINT uq_est_venta_nom UNIQUE ( nombre_es_venta );

CREATE TABLE marca (
    id_marca     INTEGER NOT NULL,
    nombre_marca VARCHAR2(100) NOT NULL
);

ALTER TABLE marca ADD CONSTRAINT marca_pk PRIMARY KEY ( id_marca );

ALTER TABLE marca ADD CONSTRAINT uq_marca_nom UNIQUE ( nombre_marca );

CREATE TABLE metodo_pago (
    id_met_pago     INTEGER NOT NULL,
    nombre_met_pago VARCHAR2(100) NOT NULL
);

ALTER TABLE metodo_pago ADD CONSTRAINT metodo_pago_pk PRIMARY KEY ( id_met_pago );

ALTER TABLE metodo_pago ADD CONSTRAINT uq_met_pago_nom UNIQUE ( nombre_met_pago );

CREATE TABLE municipio (
    id_mun     INTEGER NOT NULL,
    nombre_mun VARCHAR2(100) NOT NULL,
    id_dep     INTEGER NOT NULL
);

ALTER TABLE municipio ADD CONSTRAINT municipio_pk PRIMARY KEY ( id_mun );

ALTER TABLE municipio ADD CONSTRAINT uq_mun_dep_nom UNIQUE ( id_dep,
                                                             nombre_mun );

CREATE TABLE pago (
    id_pago     INTEGER NOT NULL,
    monto_pago  NUMBER(12, 2) NOT NULL,
    id_venta    INTEGER NOT NULL,
    id_met_pago INTEGER NOT NULL
);

ALTER TABLE pago ADD CONSTRAINT ck_pago_monto_positivo CHECK ( monto_pago > 0 );

ALTER TABLE pago ADD CONSTRAINT pago_pk PRIMARY KEY ( id_pago );

CREATE TABLE pais (
    id_pais     INTEGER NOT NULL,
    nombre_pais VARCHAR2(100) NOT NULL
);

ALTER TABLE pais ADD CONSTRAINT pais_pk PRIMARY KEY ( id_pais );

ALTER TABLE pais ADD CONSTRAINT uq_pais_nom UNIQUE ( nombre_pais );

CREATE TABLE persona (
    id_persona        INTEGER NOT NULL,
    nombre_persona    VARCHAR2(100) NOT NULL,
    apellido_persona  VARCHAR2(100) NOT NULL,
    telefono_persona  VARCHAR2(20) NOT NULL,
    correo_persona    VARCHAR2(150),
    direccion_persona VARCHAR2(200) NOT NULL,
    id_mun            INTEGER NOT NULL
);

ALTER TABLE persona ADD CONSTRAINT persona_pk PRIMARY KEY ( id_persona );

ALTER TABLE persona ADD CONSTRAINT uq_persona_correo UNIQUE ( correo_persona );

CREATE TABLE producto (
    id_pro          INTEGER NOT NULL,
    nombre_pro      VARCHAR2(150) NOT NULL,
    descripcion_pro VARCHAR2(300) NOT NULL,
    id_cat          INTEGER NOT NULL,
    id_marca        INTEGER NOT NULL
);

ALTER TABLE producto ADD CONSTRAINT producto_pk PRIMARY KEY ( id_pro );

CREATE TABLE tienda (
    id_tienda        INTEGER NOT NULL,
    nombre_tienda    VARCHAR2(150) NOT NULL,
    direccion_tienda VARCHAR2(200) NOT NULL,
    telefono_tienda  VARCHAR2(20) NOT NULL,
    id_mun           INTEGER NOT NULL,
    id_tipo_tienda   INTEGER NOT NULL
);

ALTER TABLE tienda ADD CONSTRAINT tienda_pk PRIMARY KEY ( id_tienda );

CREATE TABLE tipo_identificacion (
    id_tip_ident     INTEGER NOT NULL,
    nombre_tip_ident VARCHAR2(100) NOT NULL
);

ALTER TABLE tipo_identificacion ADD CONSTRAINT tipo_identificacion_pk PRIMARY KEY ( id_tip_ident );

ALTER TABLE tipo_identificacion ADD CONSTRAINT uq_tip_ident_nom UNIQUE ( nombre_tip_ident );

CREATE TABLE tipo_tienda (
    id_tip_tienda     INTEGER NOT NULL,
    nombre_tip_tienda VARCHAR2(100) NOT NULL
);

ALTER TABLE tipo_tienda ADD CONSTRAINT tipo_tienda_pk PRIMARY KEY ( id_tip_tienda );

ALTER TABLE tipo_tienda ADD CONSTRAINT uq_tipo_tienda_nom UNIQUE ( nombre_tip_tienda );

CREATE TABLE venta (
    id_venta    INTEGER NOT NULL,
    fecha_venta DATE NOT NULL,
    id_tienda   INTEGER NOT NULL,
    id_empleado INTEGER NOT NULL,
    id_cliente  INTEGER NOT NULL,
    id_es_venta INTEGER NOT NULL
);

ALTER TABLE venta ADD CONSTRAINT venta_pk PRIMARY KEY ( id_venta );

ALTER TABLE catalogo_producto
    ADD CONSTRAINT catalogo_producto_producto_fk FOREIGN KEY ( id_pro )
        REFERENCES producto ( id_pro );

ALTER TABLE catalogo_producto
    ADD CONSTRAINT catalogo_producto_tienda_fk FOREIGN KEY ( id_tienda )
        REFERENCES tienda ( id_tienda );

ALTER TABLE cliente
    ADD CONSTRAINT cliente_persona_fk FOREIGN KEY ( id_persona )
        REFERENCES persona ( id_persona );

ALTER TABLE cliente
    ADD CONSTRAINT cliente_tipo_identificacion_fk FOREIGN KEY ( id_tip_ident )
        REFERENCES tipo_identificacion ( id_tip_ident );

ALTER TABLE departamento
    ADD CONSTRAINT departamento_pais_fk FOREIGN KEY ( id_pais )
        REFERENCES pais ( id_pais );

ALTER TABLE desglose_venta
    ADD CONSTRAINT desglose_venta_producto_fk FOREIGN KEY ( id_pro )
        REFERENCES producto ( id_pro );

ALTER TABLE desglose_venta
    ADD CONSTRAINT desglose_venta_venta_fk FOREIGN KEY ( id_venta )
        REFERENCES venta ( id_venta );

ALTER TABLE empleado
    ADD CONSTRAINT empleado_cargo_fk FOREIGN KEY ( id_cargo )
        REFERENCES cargo ( id_cargo );

ALTER TABLE empleado
    ADD CONSTRAINT empleado_persona_fk FOREIGN KEY ( id_persona )
        REFERENCES persona ( id_persona );

ALTER TABLE empleado
    ADD CONSTRAINT empleado_tienda_fk FOREIGN KEY ( id_tienda )
        REFERENCES tienda ( id_tienda );

ALTER TABLE municipio
    ADD CONSTRAINT municipio_departamento_fk FOREIGN KEY ( id_dep )
        REFERENCES departamento ( id_dep );

ALTER TABLE pago
    ADD CONSTRAINT pago_metodo_pago_fk FOREIGN KEY ( id_met_pago )
        REFERENCES metodo_pago ( id_met_pago );

ALTER TABLE pago
    ADD CONSTRAINT pago_venta_fk FOREIGN KEY ( id_venta )
        REFERENCES venta ( id_venta );

ALTER TABLE persona
    ADD CONSTRAINT persona_municipio_fk FOREIGN KEY ( id_mun )
        REFERENCES municipio ( id_mun );

ALTER TABLE producto
    ADD CONSTRAINT producto_categoria_fk FOREIGN KEY ( id_cat )
        REFERENCES categoria ( id_cat );

ALTER TABLE producto
    ADD CONSTRAINT producto_marca_fk FOREIGN KEY ( id_marca )
        REFERENCES marca ( id_marca );

ALTER TABLE tienda
    ADD CONSTRAINT tienda_municipio_fk FOREIGN KEY ( id_mun )
        REFERENCES municipio ( id_mun );

ALTER TABLE tienda
    ADD CONSTRAINT tienda_tipo_tienda_fk FOREIGN KEY ( id_tipo_tienda )
        REFERENCES tipo_tienda ( id_tip_tienda );

ALTER TABLE venta
    ADD CONSTRAINT venta_cliente_fk FOREIGN KEY ( id_cliente )
        REFERENCES cliente ( id_cliente );

ALTER TABLE venta
    ADD CONSTRAINT venta_empleado_fk FOREIGN KEY ( id_empleado )
        REFERENCES empleado ( id_empleado );

ALTER TABLE venta
    ADD CONSTRAINT venta_estado_venta_fk FOREIGN KEY ( id_es_venta )
        REFERENCES estado_venta ( id_es_venta );

ALTER TABLE venta
    ADD CONSTRAINT venta_tienda_fk FOREIGN KEY ( id_tienda )
        REFERENCES tienda ( id_tienda );



-- Informe de Resumen de Oracle SQL Developer Data Modeler: 
-- 
-- CREATE TABLE                            19
-- CREATE INDEX                             2
-- ALTER TABLE                             60
-- CREATE VIEW                              0
-- ALTER VIEW                               0
-- CREATE PACKAGE                           0
-- CREATE PACKAGE BODY                      0
-- CREATE PROCEDURE                         0
-- CREATE FUNCTION                          0
-- CREATE TRIGGER                           0
-- ALTER TRIGGER                            0
-- CREATE COLLECTION TYPE                   0
-- CREATE STRUCTURED TYPE                   0
-- CREATE STRUCTURED TYPE BODY              0
-- CREATE CLUSTER                           0
-- CREATE CONTEXT                           0
-- CREATE DATABASE                          0
-- CREATE DIMENSION                         0
-- CREATE DIRECTORY                         0
-- CREATE DISK GROUP                        0
-- CREATE ROLE                              0
-- CREATE ROLLBACK SEGMENT                  0
-- CREATE SEQUENCE                          0
-- CREATE MATERIALIZED VIEW                 0
-- CREATE MATERIALIZED VIEW LOG             0
-- CREATE SYNONYM                           0
-- CREATE TABLESPACE                        0
-- CREATE USER                              0
-- 
-- DROP TABLESPACE                          0
-- DROP DATABASE                            0
-- 
-- REDACTION POLICY                         0
-- 
-- ORDS DROP SCHEMA                         0
-- ORDS ENABLE SCHEMA                       0
-- ORDS ENABLE OBJECT                       0
-- 
-- ERRORS                                   0
-- WARNINGS                                 0
