# US-03 Bloque 1 — Registrar Movimiento con Validación de Saldo (MS-Cuenta)

**Fecha implementación**: 2026-05-11  

---

## TASK-14 — GlobalExceptionHandler

El `GlobalExceptionHandler` ya fue creado en US-02 (Bloque 3). Incluía desde su origen el handler específico para `SaldoInsuficienteException → 400`. No requirió modificaciones.

---

## Archivos creados (6 archivos)

### Application Layer

| Archivo | Tipo | Descripción |
|---|---|---|
| `application/service/MovimientoService.java` | `@Service` | Implementa `RegistrarMovimientoUseCase` con algoritmo ACID y lock pesimista |

**Algoritmo de `MovimientoService.registrar()`:**
1. Valida `valor != 0` → `IllegalArgumentException`
2. Obtiene cuenta con `findByIdWithLock()` (lock pesimista `PESSIMISTIC_WRITE`) → 404 si no existe
3. Calcula `saldoResultante = saldo + valor`; si `< 0` → `SaldoInsuficienteException("Saldo no disponible")`
4a. Persiste `Movimiento` con `saldoAnterior` y `saldoActual` para auditoría
4b. Actualiza `cuenta.saldo = saldoActual` en la misma transacción
5. Llama `eventPublisherPort.publishMovimientoRegistrado(...)` (stub en Bloque 1; real en Bloque 2)

**Garantías ACID:** `@Transactional` — si falla cualquier paso, Hibernate hace rollback; el saldo no queda en estado inconsistente.

### Infrastructure — Persistence Adapter

| Archivo | Tipo | Descripción |
|---|---|---|
| `infrastructure/persistence/adapter/MovimientoPersistenceAdapter.java` | `@Component` | Implementa `MovimientoRepositoryPort`; delega en `MovimientoJpaRepository` + `MovimientoEntityMapper` |

### Infrastructure — Messaging (Stub)

| Archivo | Tipo | Descripción |
|---|---|---|
| `infrastructure/messaging/publisher/NoOpEventPublisher.java` | `@Component` | Implementa `EventPublisherPort` sin RabbitMQ; solo log DEBUG. Reemplazado por `MovimientoRegistradoPublisher` en Bloque 2 (TASK-16) |

### Infrastructure — Web Layer

| Archivo | Tipo | Descripción |
|---|---|---|
| `infrastructure/web/dto/request/RegistrarMovimientoRequest.java` | Record | `cuentaId` (UUID), `tipoMovimiento` (String), `valor` (BigDecimal), `descripcion` (nullable) |
| `infrastructure/web/dto/response/MovimientoResponse.java` | Record | Todos los campos de Movimiento incluyendo `saldoAnterior` y `saldoActual` |
| `infrastructure/web/mapper/MovimientoDtoMapper.java` | `@Component` | `toResponse(Movimiento)` |
| `infrastructure/web/controller/MovimientoController.java` | `@RestController` | POST + GET by ID + GET list + DELETE en `/api/movimientos` |

---

## Endpoints implementados

| Método | Ruta | HTTP Status | Descripción |
|---|---|---|---|
| `POST` | `/api/movimientos` | 201 | Registra movimiento (depósito o retiro) con validación de saldo |
| `GET` | `/api/movimientos/{id}` | 200 / 400 | Obtiene movimiento por ID |
| `GET` | `/api/movimientos?cuentaId={id}` | 200 | Lista movimientos de una cuenta (o todos) |
| `DELETE` | `/api/movimientos/{id}` | 204 / 400 | Elimina movimiento por ID |

---

## Validaciones implementadas

| Regla | Respuesta |
|---|---|
| Valor igual a cero | 400 `"El valor del movimiento no puede ser cero"` |
| Cuenta inexistente | 404 `"Cuenta no encontrada con id: {id}"` |
| Saldo insuficiente para retiro | 400 `"Saldo no disponible"` (mensaje exacto del ejercicio) |
| Retiro que deja saldo en 0 | 201 (válido — `saldo + valor = 0 ≥ 0`) |

---

## Decisiones de diseño

### NoOpEventPublisher como stub para Bloque 1

`MovimientoService` inyecta `EventPublisherPort`. Sin una implementación real, Spring fallaría al arrancar. Se crea `NoOpEventPublisher` como `@Component` para satisfacer el bean. En Bloque 2, `MovimientoRegistradoPublisher` (`@Primary`) lo reemplazará sin modificar `MovimientoService`.

### Lock pesimista solo en registrarMovimiento

`findByIdWithLock()` se usa únicamente en `MovimientoService`. Las operaciones CRUD de cuentas usan `findById()` regular. Esto evita contención innecesaria en operaciones de solo lectura/actualización de metadatos.

### Movimiento inmutable — sin PUT

`MovimientoEntity` no tiene `@PreUpdate` ni campo `updatedAt`; representa un registro de auditoría. Consecuentemente, `MovimientoController` no expone PUT — no tiene semántica válida para un movimiento bancario.

---

## Verificación funcional

```
POST /api/movimientos (depósito +600)       → 201, saldoActual = saldoAnterior + 600 ✓
POST /api/movimientos (retiro -575)         → 201, saldoActual = saldoAnterior - 575 ✓
POST /api/movimientos (retiro insuficiente) → 400 "Saldo no disponible" ✓
POST /api/movimientos (valor = 0)           → 400 ✓
POST /api/movimientos (cuenta inexistente)  → 404 ✓
Saldo no cambia tras retiro fallido         → verificado ✓
GET  /api/movimientos/{id}                  → 200 ✓
GET  /api/movimientos?cuentaId={id}         → 200 (lista filtrada) ✓
```

---

## Pendiente 

| Tarea | Descripción |
|---|---|
| TASK-15 | `ClienteCreadoConsumer` — consume evento de MS-Cliente y hace upsert en `cliente_ref` |
| TASK-16 | `MovimientoRegistradoPublisher` — publica evento real a RabbitMQ tras movimiento exitoso |
| Config | `RabbitMQConfig.java` + limpieza del Cloud Stream config en `application.yml` |
