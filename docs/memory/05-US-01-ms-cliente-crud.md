# US-01 + TASK-07 — CRUD Clientes + Global Exception Handler (MS-Cliente)

**Fecha implementación**: 2026-05-10

---

## Archivos creados

### application/port/in/ — Interfaces de casos de uso

| Archivo | Descripción |
|---|---|
| `ClienteUpdateData.java` | Record con campos opcionales (String nombre, Integer edad, String direccion, String telefono, Boolean estado) |
| `CreateClienteUseCase.java` | `Cliente create(Cliente)` |
| `GetClienteUseCase.java` | `Cliente getById(UUID)` |
| `ListClientesUseCase.java` | `List<Cliente> listAll()` |
| `UpdateClienteUseCase.java` | `Cliente update(UUID, ClienteUpdateData)` |
| `DeleteClienteUseCase.java` | `void deleteById(UUID)` |

### application/port/out/
| Archivo | Descripción |
|---|---|
| `CuentaQueryPort.java` | `boolean hasCuentas(UUID clienteId)` — check cross-service |

### application/service/
| Archivo | Descripción |
|---|---|
| `ClienteService.java` | Implementa los 5 use cases. `@Transactional` en mutaciones, `readOnly=true` en lecturas. Valida identificacion duplicada en `create`; merge de campos no-null en `update`; verifica cuentas antes de `delete`. |

### infrastructure/persistence/adapter/
| Archivo | Descripción |
|---|---|
| `ClientePersistenceAdapter.java` | Implementa `ClienteRepositoryPort`. `deleteById` elimina `cliente` → luego `persona` (orden FK: ON DELETE RESTRICT). |

### infrastructure/web/
| Archivo | Descripción |
|---|---|
| `dto/request/CreateClienteRequest.java` | jakarta.validation: @NotBlank, @Size, @Min/@Max, @NotNull |
| `dto/request/UpdateClienteRequest.java` | Todos opcionales (nullable) |
| `dto/response/ClienteResponse.java` | Respuesta completa (GET /{id}, POST, PUT) |
| `dto/response/ClienteSummaryResponse.java` | Resumen (GET /) |
| `dto/response/ErrorResponse.java` | Record: timestamp, status, error, message, path |
| `mapper/ClienteDtoMapper.java` | toDomain, toUpdateData, toResponse, toSummary |
| `controller/ClienteController.java` | 5 endpoints REST |
| `exception/GlobalExceptionHandler.java` | @RestControllerAdvice |
| `client/CuentaRestClient.java` | Implementa CuentaQueryPort con RestClient, graceful degradation |

### infrastructure/config/
| `RestClientConfig.java` | @Bean RestTemplate |

### db/migration/
| `V4__fix_genero_column_type.sql` | ALTER TABLE persona ALTER COLUMN genero TYPE VARCHAR(1) |

---

## Endpoints implementados

| Método | URL | Status | Descripción |
|---|---|---|---|
| POST | `/api/clientes` | 201 | Crea cliente + persona |
| GET | `/api/clientes` | 200 | Lista todos (summary) |
| GET | `/api/clientes/{id}` | 200/404 | Detalle por ID |
| PUT | `/api/clientes/{id}` | 200/404 | Actualiza nombre/edad/direccion/telefono/estado |
| DELETE | `/api/clientes/{id}` | 204/400/404 | Elimina (valida cuentas) |

---

## Manejo de errores — GlobalExceptionHandler

| Excepción | HTTP | Mensaje |
|---|---|---|
| `ClienteNotFoundException` | 404 | "Cliente no encontrado con id: {id}" |
| `ClienteConCuentasException` | 400 | "No se puede eliminar el cliente porque tiene cuentas asociadas: {id}" |
| `IllegalArgumentException` | 400 | Mensaje de la excepción |
| `MethodArgumentNotValidException` | 400 | Concatenación de todos los field errors |
| `Exception` | 500 | Mensaje genérico |

Formato estándar de error:
```json
{
  "timestamp": "2026-05-11T00:38:52.724947722",
  "status": 400,
  "error": "Bad Request",
  "message": "...",
  "path": "/api/clientes"
}
```

---

## Corrección necesaria durante el proceso — V4 migration

**Problema**: `persona.genero` fue creado como `CHAR(1)` en V1, que PostgreSQL almacena como `bpchar`. Hibernate 6 con `ddl-auto: validate` espera `VARCHAR(1)` para campos `String`. La validación fallaba con:
```
Schema validation: wrong column type encountered in column [genero] in table [persona]; 
found [bpchar (Types#CHAR)], but expecting [varchar(1) (Types#VARCHAR)]
```

**Solución**: Migración `V4__fix_genero_column_type.sql` que ejecuta:
```sql
ALTER TABLE persona ALTER COLUMN genero TYPE VARCHAR(1);
```

**Lección**: Para futuros microservicios (ms-cuenta), usar `VARCHAR(n)` en lugar de `CHAR(n)` en las migraciones Flyway para evitar el mismo problema.

---

## Decisiones de diseño

### CuentaQueryPort — Graceful degradation

MS-Cliente no tiene acceso directo a los datos de `cuenta` (propiedad de MS-Cuenta). Se implementó un `CuentaRestClient` que llama a `GET /api/cuentas?clienteId=X` en MS-Cuenta. Si la llamada falla (MS-Cuenta no disponible), retorna `false` (permite la eliminación). Una vez que MS-Cuenta implemente el endpoint (US-02), el check funcionará correctamente.

### ClienteUpdateData record

Para evitar acoplar la capa de aplicación con DTOs web, se creó `ClienteUpdateData` (record en `application/port/in/`) con campos nullable (tipo `Integer`, `Boolean`, `String`). El mapper web convierte `UpdateClienteRequest → ClienteUpdateData`.

### Validación de contrasena en create

La validación de contraseña se hace en dos niveles:
1. `@Size(min=8)` en `CreateClienteRequest` (Bean Validation) → 400 si la request llega con < 8 chars
2. Value object `Contrasena` en dominio → como segunda línea de defensa

### Migración V4 vs changesets

Se prefirió una migración nueva (V4) sobre resetear volúmenes para:
1. No perder los datos de prueba ya insertados por V3
2. Documentar explícitamente el cambio de tipo como corrección evolutiva
3. Seguir el patrón Flyway de "nunca modificar migraciones aplicadas"

---

## Verificación funcional

```bash
# Listar clientes (3 del seed)
curl http://localhost:8081/api/clientes

# Obtener por ID
curl http://localhost:8081/api/clientes/00000000-0000-0000-0002-000000000001

# Crear nuevo cliente
curl -X POST http://localhost:8081/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Test","genero":"M","edad":25,"identificacion":"9999999999","direccion":"Calle Test","telefono":"099","contrasena":"pass1234"}'

# Error: identificacion duplicada → 400
# Error: contraseña corta → 400  
# Error: ID no existe → 404
```

---

## Estado del servicio

- **ms-cliente**: healthy ✅ en puerto 8081
- **Flyway**: 4 migraciones aplicadas (V1, V2, V3, V4)
- **JPA validate**: pasa sin errores
- **5 endpoints** funcionales y verificados

---

## Pendiente (Bloque 3 y 4 de la misma rama)

| Tarea | Descripción |
|---|---|
| TASK-08 (Bloque 3) | Test unitario `ClienteTest.java` en `src/test/java/` |
| TASK-09 (Bloque 4) | `RabbitMQConfig.java` + `ClienteCreadoPublisher.java` |
| TASK-10 (Bloque 4) | `MovimientoRegistradoConsumer.java` |
