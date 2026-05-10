# TASK-04 — Reactivar Flyway en docker-compose

**Fecha implementación**: 2026-05-10

---

## Archivo modificado

| Archivo | Cambios aplicados |
|---|---|
| `docker-compose.yml` | 3 cambios en `ms-cliente` + 3 cambios en `ms-cuenta` |

---

## Cambios por servicio

### ms-cliente

| Variable | Antes | Después |
|---|---|---|
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `create` | `validate` |
| `SPRING_FLYWAY_ENABLED` | `"false"` | `"true"` |
| `SPRING_FLYWAY_TABLE` | *(ausente)* | `flyway_schema_history_cliente` |

### ms-cuenta

| Variable | Antes | Después |
|---|---|---|
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `create` | `validate` |
| `SPRING_FLYWAY_ENABLED` | `"false"` | `"true"` |
| `SPRING_FLYWAY_TABLE` | *(ausente)* | `flyway_schema_history_cuenta` |

---

## Por qué se necesita `SPRING_FLYWAY_TABLE`

En Docker, las variables de entorno **sobreescriben** la configuración del `application.yml`.
Si no se declara `SPRING_FLYWAY_TABLE` aquí, el valor `flyway.table` del `application.yml`
queda ignorado y ambos servicios vuelven a usar `flyway_schema_history` por defecto → conflicto
de checksum en V1 (explicado en detalle en `01-schema-indexes.md`).

La variable de entorno espeja exactamente lo configurado en `application.yml`:
- `spring.flyway.table: flyway_schema_history_cliente` → `SPRING_FLYWAY_TABLE: flyway_schema_history_cliente`
- `spring.flyway.table: flyway_schema_history_cuenta`  → `SPRING_FLYWAY_TABLE: flyway_schema_history_cuenta`

---

## Por qué `ddl-auto: validate` en lugar de `create`

| Modo | Comportamiento | Riesgo |
|---|---|---|
| `create` | Hibernate crea/recrea tablas al arrancar | **Destruye datos** en cada restart. Incompatible con Flyway. |
| `validate` | Hibernate valida que las entidades coincidan con el schema de BD | Seguro. Flyway gestiona el schema; Hibernate solo verifica. |

Con `validate`, si alguna entidad JPA no coincide con la tabla real (TASK-05 en adelante), Spring Boot falla al arrancar con un mensaje claro, evitando errores silenciosos en runtime.

---

## Criterios de aceptación cubiertos (TASK-04)

- [x] `SPRING_FLYWAY_ENABLED: "true"` en ms-cliente y ms-cuenta
- [x] `SPRING_JPA_HIBERNATE_DDL_AUTO: validate` restaurado en ambos servicios
- [x] `SPRING_FLYWAY_TABLE` declarado por servicio para evitar conflicto de historial

---

## Orden de ejecución de migraciones al levantar

Con `docker compose up`, el arranque ocurre en este orden garantizado por `depends_on`:

```
postgres (healthy)
   ↓
ms-cliente arranca → Flyway aplica V1, V2, V3 en flyway_schema_history_cliente
ms-cuenta  arranca → Flyway aplica V1, V2, V3 en flyway_schema_history_cuenta
   ↓
JPA valida entidades contra schema (ddl-auto: validate)
   ↓
Servicios disponibles en :8081 y :8082
```

ms-cliente y ms-cuenta pueden arrancar en paralelo sin race condition porque cada uno
gestiona tablas distintas (`persona/cliente` vs `cliente_ref/cuenta/movimiento`).

---

## Cómo probar

```bash
# Limpiar volúmenes previos (para forzar migraciones desde cero)
docker compose down -v

# Levantar todo
docker compose up -d

# Verificar migraciones aplicadas
docker exec banco-postgres psql -U postgres -d banco_db \
  -c "SELECT version, description, success FROM flyway_schema_history_cliente ORDER BY installed_rank;"

docker exec banco-postgres psql -U postgres -d banco_db \
  -c "SELECT version, description, success FROM flyway_schema_history_cuenta ORDER BY installed_rank;"

# Verificar datos de prueba
docker exec banco-postgres psql -U postgres -d banco_db \
  -c "SELECT nombre, identificacion FROM persona;"

docker exec banco-postgres psql -U postgres -d banco_db \
  -c "SELECT numero_cuenta, tipo_cuenta, saldo FROM cuenta ORDER BY numero_cuenta;"
```

Resultado esperado en `flyway_schema_history_cliente`:
```
 version | description           | success
---------+-----------------------+---------
 1       | schema cliente        | true
 2       | indexes cliente       | true
 3       | test data cliente     | true
```

Resultado esperado en `flyway_schema_history_cuenta`:
```
 version | description           | success
---------+-----------------------+---------
 1       | schema cuenta         | true
 2       | indexes cuenta        | true
 3       | test data cuenta      | true
```

---

## Estado final de la rama `feat/database-setup`

| Bloque | Tarea | Archivos | Estado |
|---|---|---|---|
| Bloque 1 | TASK-01 | V1__schema_*.sql | ✅ |
| Bloque 1 | TASK-02 | V2__indexes_*.sql | ✅ |
| Bloque 2 | TASK-03 | V3__test_data_*.sql | ✅ |
| Bloque 3 | TASK-04 | docker-compose.yml | ✅ |

**La rama `feat/database-setup` está lista para PR a `develop`.**

PR título: `feat(database): setup Flyway migrations and test data`
