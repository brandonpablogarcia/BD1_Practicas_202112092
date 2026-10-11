import re
from pathlib import Path

origen = Path("database/03_carga_oracle.sql")
destino = Path("database/02_data.sql")

texto = origen.read_text(encoding="utf-8")

# ---------------------------------------------------------
# Correcciones de nombres que quedaron en el modelo final
# ---------------------------------------------------------

texto = texto.replace(
    "NOMBRE_TIPO_TIENDA",
    "NOMBRE_TIP_TIENDA"
)

texto = texto.replace(
    "NOMBRES_PERSONA",
    "NOMBRE_PERSONA"
)

# ---------------------------------------------------------
# Oracle TO_DATE(...) -> fecha compatible con SQL Server
# ---------------------------------------------------------

texto = re.sub(
    r"TO_DATE\(\s*'(\d{4}-\d{2}-\d{2})'\s*,\s*'YYYY-MM-DD'\s*\)",
    r"CAST('\1' AS DATE)",
    texto,
    flags=re.IGNORECASE
)

# ---------------------------------------------------------
# Nos quedamos solamente con los INSERT del dataset.
# El antiguo script contenia comandos exclusivos de Oracle.
# ---------------------------------------------------------

inserts = []

for linea in texto.splitlines():
    linea_limpia = linea.strip()

    if linea_limpia.upper().startswith("INSERT INTO"):
        inserts.append(linea_limpia)

# ---------------------------------------------------------
# Construir script T-SQL final
# ---------------------------------------------------------

cabecera = """-- =========================================================
-- BASES DE DATOS 1 - PROYECTO FASE 2
-- Comercial La Estrella
-- Carnet: 202112092
-- Carga migrada de Oracle hacia SQL Server 2022
-- =========================================================

USE ComercialLaEstrella;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

"""

final = cabecera
final += "\n".join(inserts)

final += """

COMMIT TRANSACTION;
GO

PRINT 'Carga de datos finalizada correctamente.';
GO
"""

destino.write_text(final, encoding="utf-8")

print("========================================")
print("Conversion finalizada")
print("Archivo:", destino)
print("INSERT generados:", len(inserts))
print("========================================")
