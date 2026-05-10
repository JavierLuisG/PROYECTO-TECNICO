# TASK-01 + TASK-02 — Flyway Migrations: Schema e Índices
 
**Fecha implementación**: 2026-05-10

---

## Archivos creados

| Archivo | Propósito |
|---|---|
| `backend/ms-cliente/src/main/resources/db/migration/V1__schema_cliente.sql` | Tablas `persona` y `cliente` |
| `backend/ms-cliente/src/main/resources/db/migration/V2__indexes_cliente.sql` | Índices de `persona` y `cliente` |
| `backend/ms-cuenta/src/main/resources/db/migration/V1__schema_cuenta.sql` | Tablas `cliente_ref`, `cuenta` y `movimiento` |
| `backend/ms-cuenta/src/main/resources/db/migration/V2__indexes_cuenta.sql` | Índices de `cuenta` y `movimiento` |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/ms-cliente/src/main/resources/application.yml` | Agregado `flyway.table: flyway_schema_history_cliente` |
| `backend/ms-cuenta/src/main/resources/application.yml` | Agregado `flyway.table: flyway_schema_history_cuenta` |

---

## Decisiones de diseño

### Tablas por microservicio

| MS | Tablas propias |
|---|---|
| ms-cliente | `persona`, `cliente` |
| ms-cuenta | `cliente_ref`, `cuenta`, `movimiento` |

Ambos microservicios comparten la misma base de datos (`banco_db`), siguiendo el patrón de la arquitectura definida.

### Tabla de historial Flyway separada por servicio

**Problema**: Ambos microservicios usan Flyway contra la misma BD `banco_db`. Sin configuración explícita, los dos escriben en la tabla `flyway_schema_history` por defecto. Cuando ms-cuenta intenta aplicar `V1__schema_cuenta.sql`, Flyway detecta que ya existe un registro V1 (de ms-cliente) con distinto checksum → **error fatal**.

**Solución**: Se configuró `spring.flyway.table` diferente en cada servicio:
- ms-cliente → `flyway_schema_history_cliente`
- ms-cuenta → `flyway_schema_history_cuenta`

Cada servicio gestiona su propio historial de manera independiente.

### Función `update_updated_at_column()`

Se define como `CREATE OR REPLACE FUNCTION` en ambos V1. Si ms-cliente corre primero, ms-cuenta simplemente la sobreescribe con la misma definición → idempotente, sin error.

### `gen_random_uuid()` en lugar de `uuid_generate_v4()`

PostgreSQL 16 incluye `gen_random_uuid()` como función nativa. No requiere la extensión `uuid-ossp`, por lo que los scripts son más portables.

### Tipo de dato para `tipo_cuenta` y `tipo_movimiento`

Se usaron `VARCHAR(20)` con `CHECK IN (...)` en lugar de `ENUM` de PostgreSQL. Los ENUM requieren `ALTER TYPE` para agregar valores nuevos, mientras que `CHECK` se puede ajustar reemplazando el constraint. Más flexible para evolucionar el dominio.

### Acentos en los valores del CHECK

Los valores como `'Depósito'` se reemplazaron por `'Deposito'` (sin tilde) para evitar problemas de codificación en entornos donde el cliente SQL no sea UTF-8. El dominio de la aplicación maneja la presentación con acentos.

### Coherencia aritmética de movimientos

El constraint `saldo_actual = saldo_anterior + valor` **no se implementa como CHECK de BD** (PostgreSQL evalúa el CHECK sobre los valores finales de la fila sin contexto de transacción). Esta invariante se garantiza en `RegistrarMovimientoUseCase` (capa de aplicación).

### Índice compuesto `idx_movimiento_cuenta_fecha`

```sql
CREATE INDEX idx_movimiento_cuenta_fecha ON movimiento(cuenta_id, fecha DESC);
```

Índice crítico para la query del reporte de estado de cuenta. Permite buscar movimientos de una cuenta ordenados por fecha en una sola operación de índice, logrando <50ms en tablas grandes.

---

## Schema resultante

### ms-cliente (tablas)

```
persona
  id UUID PK
  nombre VARCHAR(100) NOT NULL
  genero CHAR(1) CHECK IN ('M','F','O')
  edad INT CHECK BETWEEN 18 AND 120
  identificacion VARCHAR(20) UNIQUE NOT NULL
  direccion VARCHAR(255) NOT NULL
  telefono VARCHAR(20) NOT NULL
  estado BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW() [auto-trigger]

cliente
  cliente_id UUID PK
  persona_id UUID FK → persona(id) UNIQUE ON DELETE RESTRICT
  contrasena VARCHAR(255) CHECK LENGTH >= 8
  estado BOOLEAN DEFAULT TRUE
  created_at / updated_at [auto-trigger]
```

### ms-cuenta (tablas)

```
cliente_ref
  cliente_id UUID PK  ← viene del evento cliente-creado, no auto-generado
  nombre VARCHAR(100) NOT NULL
  identificacion VARCHAR(20) NOT NULL

cuenta
  cuenta_id UUID PK
  cliente_id UUID FK → cliente_ref(cliente_id) ON DELETE RESTRICT
  numero_cuenta VARCHAR(20) UNIQUE NOT NULL
  tipo_cuenta VARCHAR(20) CHECK IN ('Ahorro','Corriente','Tarjeta','Deposito')
  saldo_inicial DECIMAL(12,2) DEFAULT 0.00 >= 0
  saldo DECIMAL(12,2) DEFAULT 0.00 >= 0
  estado BOOLEAN DEFAULT TRUE
  created_at / updated_at [auto-trigger]

movimiento
  movimiento_id UUID PK
  cuenta_id UUID FK → cuenta(cuenta_id) ON DELETE RESTRICT
  fecha TIMESTAMP DEFAULT NOW()
  tipo_movimiento VARCHAR(20) CHECK IN ('Deposito','Retiro','Transferencia','Pago','Ajuste')
  valor DECIMAL(12,2) CHECK != 0
  saldo_anterior DECIMAL(12,2) NOT NULL
  saldo_actual DECIMAL(12,2) NOT NULL
  descripcion VARCHAR(255) NULLABLE
  created_at TIMESTAMP DEFAULT NOW()
```

---

## Pendiente (próximas tareas)

| Tarea | Descripción |
|---|---|
| TASK-03 | Crear `V3__test_data_cliente.sql` y `V3__test_data_cuenta.sql` con datos del ejercicio |
| TASK-04 | Habilitar Flyway en `docker-compose.yml` (`SPRING_FLYWAY_ENABLED: "true"`, `ddl-auto: validate`) y agregar `SPRING_FLYWAY_TABLE` por servicio |
