# MS-Cuenta

Microservicio de gestión de cuentas bancarias y movimientos. Implementa **arquitectura hexagonal (DDD)** con Spring Boot 4.0.6 y Java 21.

**Puerto**: 8082  
**Base de datos**: PostgreSQL 16 (schema `public`, historial Flyway en `flyway_schema_history_cuenta`)  
**Mensajería**: RabbitMQ — consume `cliente-creado`, publica `movimiento-registrado`

---

## Endpoints

### Cuentas

| Método | Ruta | Descripción | Status |
|---|---|---|---|
| `GET` | `/api/cuentas` | Listar cuentas (filtrable con `?clienteId=`) | 200 |
| `GET` | `/api/cuentas/{id}` | Obtener cuenta | 200 / 404 |
| `POST` | `/api/cuentas` | Crear cuenta | 201 / 400 |
| `PUT` | `/api/cuentas/{id}` | Actualizar cuenta | 200 / 404 |
| `DELETE` | `/api/cuentas/{id}` | Eliminar cuenta | 204 / 400 / 404 |

### Movimientos

| Método | Ruta | Descripción | Status |
|---|---|---|---|
| `GET` | `/api/movimientos` | Listar movimientos | 200 |
| `GET` | `/api/movimientos/{id}` | Obtener movimiento | 200 / 404 |
| `POST` | `/api/movimientos` | **Registrar movimiento** (valida saldo) | 201 / 400 |
| `DELETE` | `/api/movimientos/{id}` | Eliminar movimiento | 204 / 404 |

### Reporte

| Método | Ruta | Descripción | Status |
|---|---|---|---|
| `GET` | `/api/reportes` | Reporte estado de cuenta | 200 / 400 / 404 |

---

## Casos de uso críticos

### POST /api/movimientos — Registrar movimiento

```json
{
  "cuentaId": "00000000-0000-0000-0003-000000000001",
  "tipoMovimiento": "Retiro",
  "valor": -575.00,
  "descripcion": "Retiro cajero automatico"
}
```

- `valor` positivo = depósito, negativo = retiro
- Si `saldo + valor < 0` → **400** `"Saldo no disponible"`
- Operación **ACID** con lock pesimista (`SELECT ... FOR UPDATE`) sobre la cuenta
- Publica evento `movimiento-registrado` en RabbitMQ tras éxito

### GET /api/reportes

```
GET /api/reportes?clienteId=00000000-0000-0000-0002-000000000002&desde=2024-01-01&hasta=2024-12-31
```

Parámetros `desde` y `hasta` son opcionales — sin ellos usa 1 enero del año actual y hoy.  
La respuesta incluye el nombre del cliente desde `cliente_ref` (sincronizado vía evento `cliente-creado`).

---

## Arquitectura hexagonal

```
com.ms_cuenta
├── application/
│   ├── port/in/          ← interfaces de casos de uso
│   │   ├── CreateCuentaUseCase.java
│   │   ├── GetCuentaUseCase.java
│   │   ├── ListCuentasUseCase.java
│   │   ├── UpdateCuentaUseCase.java
│   │   ├── DeleteCuentaUseCase.java
│   │   ├── RegistrarMovimientoUseCase.java
│   │   ├── GenerarReporteUseCase.java
│   │   ├── ReporteResult.java          ← record de retorno del reporte
│   │   └── CuentaConMovimientos.java   ← record auxiliar
│   ├── port/out/         ← interfaces de salida
│   │   ├── CuentaRepositoryPort.java
│   │   ├── MovimientoRepositoryPort.java
│   │   ├── ClienteRefRepositoryPort.java
│   │   └── EventPublisherPort.java
│   └── service/
│       ├── CuentaService.java          ← CRUD de cuentas
│       ├── MovimientoService.java      ← registro con validación de saldo (ACID)
│       └── ReporteService.java         ← reporte filtrado por cliente y fecha
│
├── domain/
│   ├── event/            ← ClienteCreadoEvent, MovimientoRegistradoEvent (records)
│   ├── exception/        ← SaldoInsuficienteException, CuentaNotFoundException, ClienteRefNotFoundException
│   ├── model/            ← Cuenta.java, Movimiento.java, ClienteRef.java
│   └── valueobject/      ← NumeroCuenta.java, Saldo.java, TipoCuenta.java (enum)
│
└── infrastructure/
    ├── config/           ← RabbitMQConfig.java
    ├── messaging/
    │   ├── publisher/    ← MovimientoRegistradoPublisher.java
    │   └── consumer/     ← ClienteCreadoConsumer.java (sincroniza cliente_ref)
    ├── persistence/
    │   ├── adapter/      ← CuentaPersistenceAdapter, MovimientoPersistenceAdapter, ClienteRefPersistenceAdapter
    │   ├── entity/       ← CuentaEntity, MovimientoEntity, ClienteRefEntity
    │   ├── mapper/       ← CuentaEntityMapper, MovimientoEntityMapper
    │   └── repository/   ← CuentaJpaRepository, MovimientoJpaRepository, ClienteRefJpaRepository
    └── web/
        ├── controller/   ← CuentaController, MovimientoController, ReporteController
        ├── dto/          ← request y response DTOs
        ├── exception/    ← GlobalExceptionHandler.java
        └── mapper/       ← CuentaDtoMapper, MovimientoDtoMapper
```

---

## Migraciones Flyway

| Versión | Script | Descripción |
|---|---|---|
| Baseline | `<< Flyway Baseline >>` | Punto de partida para ms-cuenta |
| V1 | `V1__schema_cuenta.sql` | Tablas `cuenta`, `movimiento`, `cliente_ref` |
| V2 | `V2__indexes_cuenta.sql` | Índice `idx_movimiento_cuenta_fecha` (clave para reportes) |
| V3 | `V3__test_data_cuenta.sql` | 5 cuentas y 4 movimientos del ejercicio + sincronización `cliente_ref` |

La tabla de historial usa `flyway_schema_history_cuenta` para coexistir con ms-cliente en la misma base de datos.

---

## Mensajería RabbitMQ

### Consume — `cliente-creado-exchange` (cola `ms-cuenta.cliente-creado`)

Al recibir el evento de creación de un cliente, persiste o actualiza `ClienteRef` de forma idempotente.  
Esta tabla local permite al reporte incluir el nombre del cliente sin llamar a MS-Cliente en tiempo real.

### Publica — `movimiento-registrado-exchange`

Se publica tras registrar un movimiento exitosamente. MS-Cliente lo consume para auditoría.

```json
{
  "movimientoId": "...",
  "cuentaId": "...",
  "valor": -575.00,
  "saldoActual": 1425.00,
  "fecha": "2024-02-10T10:00:00"
}
```

---

## Tests

```bash
./gradlew test
```

| Test | Tipo | Descripción |
|---|---|---|
| `MsCuentaApplicationTests` | Spring Boot Test | Carga del contexto con perfil `test` |
| `RegistrarMovimientoIntegrationTest` | Integración | 5 escenarios: depósito, retiro suficiente, retiro = 0 saldo, retiro insuficiente (400), múltiples depósitos |

Los tests usan perfil `test` con **H2 en memoria** — no requieren PostgreSQL ni RabbitMQ reales.

```bash
# Ver reporte HTML de tests
open build/reports/tests/test/index.html
```

---

## Levantar

### Con Docker Compose (recomendado)

```bash
# Desde la raíz del proyecto:
docker compose up ms-cuenta -d
```

MS-Cuenta espera a que ms-cliente esté `healthy` antes de arrancar (evita race condition de Flyway en la base de datos compartida).

### Local sin Docker

Requisitos: Java 21, PostgreSQL 16 en `localhost:5432`, RabbitMQ en `localhost:5672`.

```bash
./gradlew bootRun
```

### Build sin tests

```bash
./gradlew build -x test
```

---

## Variables de entorno (Docker)

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres:5432/banco_db` | URL de PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Usuario de BD |
| `SPRING_DATASOURCE_PASSWORD` | `password` | Contraseña de BD |
| `SPRING_RABBITMQ_HOST` | `rabbitmq` | Host de RabbitMQ |
| `SPRING_RABBITMQ_PORT` | `5672` | Puerto de RabbitMQ |
