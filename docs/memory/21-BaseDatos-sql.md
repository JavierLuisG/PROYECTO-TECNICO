# TASK-21 — Script SQL `BaseDatos.sql`

**Fecha implementación**: 2026-05-11

---

## Archivo generado

| Archivo | Tamaño | Líneas |
|---|---|---|
| `backend/BaseDatos.sql` | ~18 KB | 500 |

Generado con:
```bash
docker exec banco-postgres pg_dump -U postgres banco_db > backend/BaseDatos.sql
```

---

## Contenido del dump

El archivo es un dump completo en formato nativo de `pg_dump` (PostgreSQL 16.13).  
Usa bloques `COPY … FROM stdin;` para los datos (más eficiente que INSERT individuales).

### Objetos incluidos

| Tipo | Nombres |
|---|---|
| Función | `update_updated_at_column()` |
| Tablas de dominio | `persona`, `cliente`, `cliente_ref`, `cuenta`, `movimiento` |
| Tablas Flyway | `flyway_schema_history_cliente`, `flyway_schema_history_cuenta` |
| Constraints | PKs, UKs, FKs de todas las tablas |
| Índices de performance | `idx_identificacion`, `idx_numero_cuenta`, `idx_movimiento_cuenta_fecha` + auxiliares |
| Triggers | `update_updated_at` en persona, cliente, cuenta |

### Datos de prueba del ejercicio

| Tabla | Filas |
|---|---|
| `persona` | 3 (Jose Lema, Marianela Montalvo, Juan Osorio) |
| `cliente` | 3 |
| `cliente_ref` | 3 (sincronizados vía migración V3) |
| `cuenta` | 5 (478758, 585545, 225487, 496825, 495878) |
| `movimiento` | 4 (retiro -575, depósito 600, depósito 150, retiro -540) |
| `flyway_schema_history_cliente` | 4 versiones (V1–V4) |
| `flyway_schema_history_cuenta` | 4 versiones (baseline + V1–V3) |

---

## Cómo restaurar en una base de datos vacía

```bash
# Crear la base de datos de destino
psql -U postgres -c "CREATE DATABASE banco_db;"

# Restaurar
psql -U postgres -d banco_db -f backend/BaseDatos.sql
```

> **Nota**: El archivo contiene `\restrict` / `\unrestrict` (nuevo en pg_dump 16) que aborten la restauración ante cualquier error. Requiere el cliente `psql` versión 16+.
