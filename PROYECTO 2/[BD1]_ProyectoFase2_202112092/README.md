# Proyecto Fase 2 - Comercial La Estrella

**Curso:** Bases de Datos 1  
**Nombre:** Brandon Eduardo Pablo Garcia - 202112092  
**Proyecto:** Backend y Exposición de Servicios para la Base de Datos Comercial La Estrella

---

## Descripción

Este proyecto implementa la segunda fase de la base de datos **Comercial La Estrella**, utilizando Microsoft SQL Server 2022 como motor de base de datos y Node.js con Express para la exposición de servicios mediante una API REST.

La solución incluye:

- SQL Server 2022 ejecutado mediante Docker Compose.
- 19 tablas relacionadas.
- 3 vistas analíticas.
- 2 triggers para reglas de negocio.
- API REST desarrollada con Node.js y Express.
- CRUD para las 19 tablas.
- Manejo centralizado de errores.
- Colección de Postman con pruebas CRUD, vistas y triggers.

---

## Tecnologías utilizadas

- Microsoft SQL Server 2022
- Docker
- Docker Compose
- Node.js
- Express
- mssql
- dotenv
- cors
- nodemon
- Postman

---

## Estructura principal

```text
[BD1]_ProyectoFase2_202112092/
│
├── database/
│   ├── 02_data.sql
│   ├── 03_views.sql
│   ├── 04_triggers.sql
│   └── archivos de prueba
│
├── evidencias/
│
├── postman/
│   └── Comercial_La_Estrella_Fase_2.postman_collection.json
│
├── scripts/
│   └── convertir_carga.py
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── entities.js
│   │
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── init.sql
├── package.json
├── package-lock.json
└── README.md
```

---

## Requisitos

Para ejecutar el proyecto se necesita:

- Docker
- Docker Compose
- Node.js
- npm
- Postman

---

## 1. Configuración de variables de entorno

Crear el archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Configurar las variables:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=TU_PASSWORD
DB_NAME=ComercialLaEstrella
```

La contraseña debe cumplir con los requisitos de seguridad de SQL Server.

El archivo `.env` no se incluye en el repositorio.

---

## 2. Levantar SQL Server por primera vez

Ejecutar desde la raíz del proyecto:

```bash
docker compose up -d
```

Verificar los contenedores:

```bash
docker compose ps -a
```

El contenedor principal debe aparecer como:

```text
bd1-fase2-sqlserver   healthy
```

El contenedor de inicialización debe finalizar con:

```text
bd1-fase2-sqlserver-init   Exited (0)
```

El archivo `init.sql` crea automáticamente:

```text
19 tablas
3 vistas
2 triggers
```

---

## 3. Cargar los datos iniciales

Copiar el script de carga al contenedor:

```bash
docker cp database/02_data.sql bd1-fase2-sqlserver:/tmp/02_data.sql
```

Ejecutar la carga:

```bash
docker exec -it bd1-fase2-sqlserver bash -lc \
'/opt/mssql-tools18/bin/sqlcmd \
-S localhost \
-U sa \
-P "$MSSQL_SA_PASSWORD" \
-C \
-f 65001 \
-b \
-i /tmp/02_data.sql'
```

La carga inicial contiene:

```text
9068 registros
```

Distribuidos entre las 19 tablas.

---

## 4. Instalar dependencias del backend

Ejecutar:

```bash
npm install
```

Las principales dependencias utilizadas son:

```text
express
mssql
dotenv
cors
nodemon
```

---

## 5. Ejecutar la API

En modo desarrollo:

```bash
npm run dev
```

En modo normal:

```bash
npm start
```

La API queda disponible en:

```text
http://localhost:3000
```

---

## 6. Verificar la conexión

Endpoint:

```text
GET /api/health
```

Ejemplo:

```text
http://localhost:3000/api/health
```

La respuesta esperada es similar a:

```json
{
    "estado": "OK",
    "mensaje": "Conexion con SQL Server correcta",
    "datos": {
        "base_datos": "ComercialLaEstrella"
    }
}
```

---

## 7. CRUD

La API implementa operaciones CRUD para las 19 tablas de la base de datos.

Las operaciones estándar son:

```text
GET     /api/recurso
GET     /api/recurso/:id
POST    /api/recurso
PUT     /api/recurso/:id
DELETE  /api/recurso/:id
```

Las tablas con llave primaria compuesta utilizan dos parámetros.

Ejemplo para `CATALOGO_PRODUCTO`:

```text
GET /api/catalogo-productos/:idTienda/:idProducto
```

Ejemplo para `DESGLOSE_VENTA`:

```text
GET /api/detalles/:idVenta/:idProducto
```

---

## 8. Vistas analíticas

SQL Server contiene las siguientes vistas:

### Vista_Ventas_Ubicacion

Muestra las ventas agrupadas por tienda y ubicación, excluyendo las ventas anuladas.

Endpoint:

```text
GET /api/reportes/ventas-ubicacion
```

### Vista_Top_Productos

Muestra los productos más vendidos junto con su categoría, marca, unidades vendidas y monto generado.

Endpoint:

```text
GET /api/reportes/top-productos
```

### Vista_Saldos_Pendientes

Muestra las ventas en estado REGISTRADA junto con el total de la venta, pagos acumulados y saldo pendiente.

Endpoint:

```text
GET /api/reportes/saldos-pendientes
```

La lógica compleja de JOIN, agrupaciones y cálculos permanece dentro de SQL Server. La API únicamente consulta las vistas.

---

## 9. Trigger Insert_Detalle

El trigger `Insert_Detalle` se ejecuta al insertar un registro en `DESGLOSE_VENTA`.

Su funcionamiento es:

```text
INSERT detalle
      |
      v
Identifica la tienda de la venta
      |
      v
Consulta el inventario del producto
      |
      +--> Stock insuficiente
      |        |
      |        v
      |    THROW 50001
      |
      v
Stock suficiente
      |
      v
Descuenta automáticamente el inventario
```

Cuando no existe inventario suficiente, la API responde:

```text
HTTP 400
```

```json
{
    "estado": "ERROR",
    "mensaje": "Stock insuficiente"
}
```

---

## 10. Trigger Insert_Pago

El trigger `Insert_Pago` se ejecuta después de insertar un pago.

Calcula:

```text
Total de la venta
       |
       v
Pagos acumulados
       |
       v
¿Pagos >= Total?
       |
       +--- No ---> REGISTRADA
       |
       +--- Sí ---> PAGADA
```

Cuando los pagos acumulados cubren el total de la venta, el estado cambia automáticamente a:

```text
PAGADA
```

---

## 11. Colección de Postman

La colección se encuentra en:

```text
postman/Comercial_La_Estrella_Fase_2.postman_collection.json
```

Para utilizarla:

1. Abrir Postman.
2. Seleccionar `Import`.
3. Seleccionar el archivo JSON.
4. Abrir la colección `Comercial La Estrella - Fase 2`.
5. Verificar que la variable `baseUrl` tenga el valor:

```text
http://localhost:3000
```

La colección contiene:

```text
CRUD de las 19 tablas
3 vistas analíticas
prueba de descuento de inventario
prueba de stock insuficiente
prueba de pago parcial
prueba de cambio automático a PAGADA
```

---

## 12. Prueba de inventario

La colección de Postman contiene una prueba que:

```text
consulta stock inicial
        |
        v
inserta detalle válido
        |
        v
comprueba reducción de stock
```

También contiene el escenario:

```text
cantidad solicitada > existencia
        |
        v
HTTP 400
        |
        v
Stock insuficiente
```

---

## 13. Prueba de pagos

La colección contiene una prueba con dos pagos.

```text
Venta REGISTRADA
       |
       v
Primer pago parcial
       |
       v
REGISTRADA
       |
       v
Segundo pago
       |
       v
Total pagado >= total venta
       |
       v
PAGADA
```

---

## 14. Detener el proyecto

Para detener únicamente SQL Server conservando los datos:

```bash
docker compose stop sqlserver
```

Para volver a iniciarlo:

```bash
docker compose up -d sqlserver
```

Para detener los contenedores:

```bash
docker compose down
```

No utilizar `docker compose down -v` si se desea conservar el volumen y los datos actuales.

---

## 15. Reiniciar completamente la base de datos

Únicamente si se desea eliminar todos los datos y crear nuevamente la base desde cero:

```bash
docker compose down -v
docker compose up -d
```

Después debe ejecutarse nuevamente la carga:

```bash
docker cp database/02_data.sql bd1-fase2-sqlserver:/tmp/02_data.sql
```

y:

```bash
docker exec -it bd1-fase2-sqlserver bash -lc \
'/opt/mssql-tools18/bin/sqlcmd \
-S localhost \
-U sa \
-P "$MSSQL_SA_PASSWORD" \
-C \
-f 65001 \
-b \
-i /tmp/02_data.sql'
```

---

## Repositorio

El proyecto se encuentra dentro del repositorio:

```text
BD1_Practicas_202112092
```

en:

```text
PROYECTO 2/[BD1]_ProyectoFase2_202112092
```

Repositorio:

```text
https://github.com/brandonpablogarcia/BD1_Practicas_202112092
```
