# US-02 — CRUD de Cuentas Bancarias (MS-Cuenta)

**Fecha implementación**: 2026-05-11

---

## Archivos creados (9 archivos)

### Application Layer

| Archivo | Tipo | Descripción |
|---|---|---|
| `application/service/CuentaService.java` | `@Service` | Implementa los 5 use cases de Cuenta: Create, Get, ListAll, ListByClienteId, Update, Delete |

**Lógica de dominio en CuentaService:**
- `create()`: valida número de cuenta único + cliente existente en `ClienteRef`; inicializa `saldo = saldoInicial` y `estado = true`
- `update()`: PATCH-style — solo actualiza los campos no-nulos del `CuentaUpdateData`
- `deleteById()`: verifica existencia (404) y ausencia de movimientos (400) antes de eliminar
- `parseTipoCuenta()`: convierte String → TipoCuenta con mensaje de error enriquecido que lista los valores válidos

### Infrastructure — Persistence Adapters

| Archivo | Tipo | Descripción |
|---|---|---|
| `infrastructure/persistence/adapter/CuentaPersistenceAdapter.java` | `@Component` | Implementa `CuentaRepositoryPort`; delega en `CuentaJpaRepository` + `MovimientoJpaRepository` |
| `infrastructure/persistence/adapter/ClienteRefPersistenceAdapter.java` | `@Component` | Implementa `ClienteRefRepositoryPort`; requerido por `CuentaService.create()` para validar existencia del cliente |

### Infrastructure — Web Layer

| Archivo | Tipo | Descripción |
|---|---|---|
| `infrastructure/web/dto/request/CreateCuentaRequest.java` | Record | `clienteId`, `numeroCuenta`, `tipoCuenta`, `saldoInicial` con validaciones `@NotNull`/`@NotBlank`/`@DecimalMin` |
| `infrastructure/web/dto/request/UpdateCuentaRequest.java` | Record | `tipoCuenta` (nullable), `estado` (nullable) — permite actualizaciones parciales |
| `infrastructure/web/dto/response/CuentaResponse.java` | Record | Todos los campos de Cuenta; `tipoCuenta` como String |
| `infrastructure/web/mapper/CuentaDtoMapper.java` | `@Component` | `toDomain(CreateCuentaRequest)` + `toResponse(Cuenta)`; incluye `parseTipoCuenta()` con mensaje enriquecido |
| `infrastructure/web/controller/CuentaController.java` | `@RestController` | 5 endpoints en `/api/cuentas` |
| `infrastructure/web/exception/GlobalExceptionHandler.java` | `@RestControllerAdvice` | Handlers para CuentaNotFoundException (404), SaldoInsuficienteException (400), IllegalArgumentException (400), MethodArgumentNotValidException (400), Exception (500) |

---

## Endpoints implementados

| Método | Ruta | HTTP Status | Descripción |
|---|---|---|---|
| `POST` | `/api/cuentas` | 201 | Crea cuenta; saldo inicial = saldo actual |
| `GET` | `/api/cuentas/{cuentaId}` | 200 / 404 | Obtiene cuenta por ID |
| `GET` | `/api/cuentas?clienteId={id}` | 200 | Lista cuentas (todas o por cliente) |
| `PUT` | `/api/cuentas/{cuentaId}` | 200 | Actualiza tipoCuenta y/o estado |
| `DELETE` | `/api/cuentas/{cuentaId}` | 204 / 400 | Elimina si no tiene movimientos |

---

## Validaciones implementadas

| Regla | Respuesta |
|---|---|
| Número de cuenta duplicado | 400 `"Número de cuenta ya registrado: {num}"` |
| Cliente inexistente en ClienteRef | 400 `"Cliente no encontrado con id: {id}"` |
| Tipo de cuenta inválido | 400 `"Tipo de cuenta inválido: '{val}'. Valores válidos: Ahorro, Corriente, Tarjeta, Deposito"` |
| Cuenta con movimientos al eliminar | 400 `"La cuenta tiene movimientos registrados"` |
| Cuenta no encontrada | 404 `"Cuenta no encontrada con id: {id}"` |

---

## Decisiones de diseño

### ClienteRef como validación de existencia de cliente

`CuentaService.create()` valida la existencia del cliente consultando `ClienteRefRepositoryPort` (tabla `cliente_ref`). Esta tabla se puebla desde RabbitMQ (evento `cliente-creado`). Para el entorno de prueba, los datos V3 de Flyway ya insertan los 3 registros en `cliente_ref` directamente.

### update() con PATCH semántico

`UpdateCuentaRequest` acepta `tipoCuenta` y `estado` como nullables. Solo se actualiza el campo si el valor no es nulo, preservando el valor actual. Esto evita sobreescrituras accidentales.

### parseTipoCuenta en mapper y en service

Tanto `CuentaDtoMapper` (para create) como `CuentaService` (para update) tienen `parseTipoCuenta()` con el mismo mensaje enriquecido. Duplicación intencional para mantener la responsabilidad de validación en cada capa sin crear una dependencia entre mapper y service.

---

## Verificación funcional

```
GET  /api/cuentas              → 200 (5 cuentas del V3)
GET  /api/cuentas/{id}         → 200 ✓ / 404 ✓
GET  /api/cuentas?clienteId=X  → 200 (filtrado por cliente)
POST /api/cuentas              → 201 (saldo=saldoInicial)
POST (núm. duplicado)          → 400 ✓
POST (cliente inexistente)     → 400 ✓
POST (tipo inválido)           → 400 con valores válidos ✓
PUT  (cambiar estado)          → 200 ✓
DELETE (con movimientos)       → 400 ✓
DELETE (sin movimientos)       → 204 ✓
```

---

## Pendiente (rama siguiente)

| Tarea | Descripción |
|---|---|
| TASK-14 | GlobalExceptionHandler ya está implementado (reutilizable para US-03) |
| US-03 Bloque 1 | RegistrarMovimientoUseCase + MovimientoService + MovimientoController |
| US-03 Bloque 2 | RabbitMQ bidireccional (ClienteCreadoConsumer + MovimientoRegistradoPublisher) |
