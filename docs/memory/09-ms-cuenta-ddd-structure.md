# TASK-12 + TASK-13 — DDD Hexagonal Structure y Domain Models (MS-Cuenta)

**Fecha implementación**: 2026-05-11

---

## Archivos creados (30 archivos)

### Domain Layer — sin Spring ni JPA

| Archivo | Tipo | Descripción |
|---|---|---|
| `domain/model/ClienteRef.java` | POJO Lombok | Copia local del cliente (clienteId, nombre, identificacion) |
| `domain/model/Cuenta.java` | POJO Lombok | Cuenta bancaria con TipoCuenta enum |
| `domain/model/Movimiento.java` | POJO Lombok | Transacción bancaria (sin updatedAt — inmutable) |
| `domain/valueobject/TipoCuenta.java` | Enum | `Ahorro, Corriente, Tarjeta, Deposito` (casing exacto para BD) |
| `domain/valueobject/Saldo.java` | Record | Valida ≥ 0 |
| `domain/valueobject/NumeroCuenta.java` | Record | Valida no blank, longitud ≤ 20 |
| `domain/exception/SaldoInsuficienteException.java` | RuntimeException | Mensaje exacto `"Saldo no disponible"` |
| `domain/exception/CuentaNotFoundException.java` | RuntimeException | Mensaje `"Cuenta no encontrada con id: {id}"` |
| `domain/event/MovimientoRegistradoEvent.java` | Record | Lo que MS-Cuenta PUBLICA: movimientoId, cuentaId, valor, saldoActual, fecha |
| `domain/event/ClienteCreadoEvent.java` | Record | Lo que MS-Cuenta RECIBE de MS-Cliente: clienteId, nombre, identificacion |

### Application Layer — Interfaces

**port/in/** (8 interfaces):
| Interfaz | Método principal |
|---|---|
| `CreateCuentaUseCase` | `Cuenta create(Cuenta)` |
| `GetCuentaUseCase` | `Cuenta getById(UUID)` |
| `ListCuentasUseCase` | `listAll()` + `listByClienteId(UUID)` |
| `UpdateCuentaUseCase` | `Cuenta update(UUID, CuentaUpdateData)` |
| `DeleteCuentaUseCase` | `void deleteById(UUID)` |
| `RegistrarMovimientoUseCase` | `Movimiento registrar(UUID, String, BigDecimal, String)` — lógica ACID con lock pesimista (US-03) |
| `GenerarReporteUseCase` | `List<Cuenta> getCuentasConMovimientosPorCliente(UUID, LocalDate, LocalDate)` — (US-04) |
| `CuentaUpdateData` | Record: `tipoCuenta: String`, `estado: Boolean` |

**port/out/** (4 interfaces):
| Interfaz | Métodos clave |
|---|---|
| `CuentaRepositoryPort` | save, findById, **findByIdWithLock**, findAll, findByClienteId, deleteById, existsByNumeroCuenta, **existeMovimientoPorCuenta** |
| `MovimientoRepositoryPort` | save, findById, findByCuentaId, **findByCuentaIdAndFechaBetween**, deleteById, existsByCuentaId |
| `ClienteRefRepositoryPort` | save (upsert), findById |
| `EventPublisherPort` | `publishMovimientoRegistrado(MovimientoRegistradoEvent)` |

### Infrastructure — Persistence

**Entities (3):**
| Entidad | Tabla | Notas especiales |
|---|---|---|
| `ClienteRefEntity` | `cliente_ref` | SIN `@GeneratedValue` — UUID viene del evento cliente-creado |
| `CuentaEntity` | `cuenta` | `@Enumerated(STRING)` para TipoCuenta; `@PrePersist`/`@PreUpdate` para timestamps |
| `MovimientoEntity` | `movimiento` | SIN `updatedAt`, SIN `@PreUpdate` — registro inmutable |

**Repositories (3):**
- `ClienteRefJpaRepository` — JpaRepository básico
- `CuentaJpaRepository` — con `existsByNumeroCuenta`, `findByClienteId`, `findByIdWithLock` (@Lock PESSIMISTIC_WRITE + @Query)
- `MovimientoJpaRepository` — con `findByCuentaId`, `findByCuentaIdAndFechaBetween`, `existsByCuentaId`

**Mappers (2):**
- `CuentaEntityMapper` — bidireccional Entity ↔ Domain
- `MovimientoEntityMapper` — bidireccional Entity ↔ Domain

---

## Estructura de paquetes resultante

```
com.ms_cuenta/
├── MsCuentaApplication.java
│
├── application/
│   └── port/
│       ├── in/    (8 archivos: 7 interfaces + CuentaUpdateData record)
│       └── out/   (4 interfaces)
│
├── domain/
│   ├── event/     (ClienteCreadoEvent, MovimientoRegistradoEvent)
│   ├── exception/ (CuentaNotFoundException, SaldoInsuficienteException)
│   ├── model/     (ClienteRef, Cuenta, Movimiento)
│   └── valueobject/ (NumeroCuenta, Saldo, TipoCuenta)
│
└── infrastructure/
    └── persistence/
        ├── entity/     (ClienteRefEntity, CuentaEntity, MovimientoEntity)
        ├── mapper/     (CuentaEntityMapper, MovimientoEntityMapper)
        └── repository/ (ClienteRef, Cuenta, MovimientoJpaRepository)
```

---

## Decisiones de diseño

### TipoCuenta enum con casing exacto

```java
public enum TipoCuenta { Ahorro, Corriente, Tarjeta, Deposito }
```

Con `@Enumerated(EnumType.STRING)`, Hibernate almacena el nombre del enum tal cual. Los valores coinciden exactamente con el CHECK constraint de la BD (`'Ahorro','Corriente','Tarjeta','Deposito'`). Esta convención (mayúscula inicial, no UPPERCASE) es intencional para evitar un converter adicional.

### CuentaEntity: clienteId como UUID plano (sin @ManyToOne)

`CuentaEntity.clienteId` es un campo `UUID` con `@Column(name = "cliente_id")`, no una relación `@ManyToOne` a `ClienteRefEntity`. Razón: para CRUD de cuentas no se necesita el nombre del cliente; solo para reportes (US-04). Los reportes cargarán `ClienteRef` por separado vía `ClienteRefJpaRepository`. Esto evita joins innecesarios en operaciones CRUD.

### MovimientoEntity: inmutable, sin updatedAt

El movimiento bancario es un registro de auditoría — una vez creado, no se modifica. El campo `updated_at` no existe en la tabla `movimiento` del esquema. La entidad no tiene `@PreUpdate`, reforzando la inmutabilidad en la capa de persistencia.

### findByIdWithLock en CuentaJpaRepository

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT c FROM CuentaEntity c WHERE c.cuentaId = :cuentaId")
Optional<CuentaEntity> findByIdWithLock(@Param("cuentaId") UUID cuentaId);
```

Preparado para US-03 (RegistrarMovimiento). El lock pesimista previene race conditions en operaciones concurrentes de retiro/depósito sobre la misma cuenta (garantía ACID).

### SaldoInsuficienteException sin parámetros

El mensaje `"Saldo no disponible"` es el exacto requerido por el ejercicio (`US-03`, API_BACKEND.md). No se parametriza para garantizar consistencia en el GlobalExceptionHandler.

---

## Verificación funcional

```
ms-cuenta STATUS: healthy
JPA ddl-auto: validate → PASS (3 entidades mapeadas sin errores)
Flyway: V0 (baseline) + V1 + V2 + V3 aplicados correctamente
```

---

## Pendiente (Bloque 3 de la misma rama)

| Tarea | Descripción |
|---|---|
| US-02 (Bloque 3) | Ports, service, adapter, controller, DTOs, mapper para Cuenta (CRUD completo) |
