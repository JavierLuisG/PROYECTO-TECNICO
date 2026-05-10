# Backend — Microservicios Bancarios

Dos microservicios en **Spring Boot 4.0.6** con **DDD + Arquitectura Hexagonal** y comunicación asincrónica vía **RabbitMQ + Spring Cloud Stream**.

---

## Arquitectura: DDD + Hexagonal

```
┌─────────────────────────────────────────────────────┐
│               infrastructure/web                    │
│  Controller → DTO (request) → port/in (interface)   │
└─────────────────────┬───────────────────────────────┘
                      │ llama a
┌─────────────────────▼───────────────────────────────┐
│              application/service                    │
│  Implementa port/in, orquesta lógica de aplicación  │
│  Llama a port/out (interfaces de salida)            │
└──────┬────────────────────────────────┬─────────────┘
       │ usa                            │ usa
┌──────▼────────────┐     ┌─────────────▼─────────────┐
│  domain/model     │     │   infrastructure/         │
│  domain/event     │     │   persistence/adapter     │
│  domain/vo        │     │   messaging/publisher     │
│  domain/exception │     │   (implementan port/out)  │
└───────────────────┘     └───────────────────────────┘
```

**Regla de dependencia**: el dominio no conoce nada de infraestructura. La infraestructura conoce el dominio y la aplicación, nunca al revés.

---

## Estructura de paquetes

### MS-Cliente — `com.ms_cliente`

```
application/
  port/in/           ← interfaces de casos de uso (CreateClienteUseCase, etc.)
  port/out/          ← interfaces de salida (ClienteRepositoryPort, EventPublisherPort)
  service/           ← implementaciones (ClienteService)

domain/
  event/             ← ClienteCreadoEvent (record puro)
  exception/         ← ClienteNotFoundException, ClienteConCuentasException
  model/             ← Persona, Cliente (POJOs sin Spring/JPA)
  valueobject/       ← Identificacion, Contrasena, NombreCompleto

infrastructure/
  config/            ← RabbitMQConfig
  messaging/
    publisher/       ← ClienteCreadoPublisher (implementa port/out)
    consumer/        ← MovimientoRegistradoConsumer (auditoría)
  persistence/
    adapter/         ← ClientePersistenceAdapter (implementa port/out)
    entity/          ← PersonaEntity, ClienteEntity (@Entity)
    mapper/          ← ClienteEntityMapper (Entity ↔ Domain)
    repository/      ← ClienteJpaRepository (Spring Data)
  web/
    controller/      ← ClienteController
    dto/request/     ← CreateClienteRequest, UpdateClienteRequest
    dto/response/    ← ClienteResponse, ClienteSummaryResponse
    exception/       ← GlobalExceptionHandler (@RestControllerAdvice)
    mapper/          ← ClienteDtoMapper (Domain ↔ DTO)
```

### MS-Cuenta — `com.ms_cuenta`

```
application/
  port/in/           ← CreateCuentaUseCase, RegistrarMovimientoUseCase, GenerarReporteUseCase, etc.
  port/out/          ← CuentaRepositoryPort, MovimientoRepositoryPort, EventPublisherPort
  service/           ← CuentaService, MovimientoService, ReporteService

domain/
  event/             ← MovimientoRegistradoEvent, ClienteCreadoEvent (records)
  exception/         ← SaldoInsuficienteException, CuentaNotFoundException
  model/             ← Cuenta, Movimiento, ClienteRef
  valueobject/       ← NumeroCuenta, Saldo, TipoCuenta (enum)

infrastructure/
  config/            ← RabbitMQConfig
  messaging/
    publisher/       ← MovimientoRegistradoPublisher (implementa port/out)
    consumer/        ← ClienteCreadoConsumer (sincroniza ClienteRef)
  persistence/
    adapter/         ← CuentaPersistenceAdapter, MovimientoPersistenceAdapter
    entity/          ← CuentaEntity, MovimientoEntity, ClienteRefEntity (@Entity)
    mapper/          ← CuentaEntityMapper, MovimientoEntityMapper
    repository/      ← CuentaJpaRepository, MovimientoJpaRepository, ClienteRefJpaRepository
  web/
    controller/      ← CuentaController, MovimientoController, ReporteController
    dto/request/     ← CreateCuentaRequest, RegistrarMovimientoRequest
    dto/response/    ← CuentaResponse, MovimientoResponse, ReporteResponse
    exception/       ← GlobalExceptionHandler (@RestControllerAdvice)
    mapper/          ← CuentaDtoMapper, MovimientoDtoMapper
```

---

## Comunicación asincrónica (RabbitMQ)

Flujo bidireccional — ningún microservicio espera respuesta síncrona del otro.

```
MS-Cliente ──── cliente-creado ────────────────► MS-Cuenta
             (clienteId, nombre, identificacion)    (guarda ClienteRef local para reportes)

MS-Cuenta  ──── movimiento-registrado ─────────► MS-Cliente
             (movimientoId, cuentaId, valor, saldo) (auditoría / log)
```

**Por qué ClienteRef**: MS-Cuenta necesita el nombre del cliente para los reportes. En lugar de llamar a MS-Cliente vía REST (acoplamiento síncrono), escucha el evento `cliente-creado` y persiste los datos mínimos localmente. Si MS-Cliente cae, los reportes siguen funcionando.

---

## Microservicios

### MS-Cliente (puerto 8081)

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/clientes` | Crear cliente |
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/clientes/{id}` | Obtener cliente |
| PUT | `/api/clientes/{id}` | Actualizar cliente |
| DELETE | `/api/clientes/{id}` | Eliminar cliente |

### MS-Cuenta (puerto 8082)

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/cuentas` | Crear cuenta |
| GET | `/api/cuentas` | Listar cuentas |
| GET | `/api/cuentas/{id}` | Obtener cuenta |
| PUT | `/api/cuentas/{id}` | Actualizar cuenta |
| DELETE | `/api/cuentas/{id}` | Eliminar cuenta |
| POST | `/api/movimientos` | Registrar movimiento |
| GET | `/api/movimientos` | Listar movimientos |
| GET | `/api/movimientos/{id}` | Obtener movimiento |
| PUT | `/api/movimientos/{id}` | Actualizar movimiento |
| DELETE | `/api/movimientos/{id}` | Eliminar movimiento |
| GET | `/api/reportes` | Estado de cuenta por fechas y cliente |

Ver spec completa en [`../docs/API_BACKEND.md`](../docs/API_BACKEND.md).

---

## Levantar el backend

### Con Docker Compose (recomendado)

```bash
# Desde raíz del proyecto:
docker compose up -d
```

Servicios que levanta: PostgreSQL :5432, RabbitMQ :5672/:15672, MS-Cliente :8081, MS-Cuenta :8082.

### Local sin Docker

**Requisitos**: Java 21+, PostgreSQL 16 corriendo, RabbitMQ 3.12+ corriendo.

```bash
# MS-Cliente
cd ms-cliente
./gradlew bootRun

# MS-Cuenta (en otra terminal)
cd ms-cuenta
./gradlew bootRun
```

---

## Base de datos

- **Motor**: PostgreSQL 16
- **Migraciones**: Flyway (ejecuta automáticamente en startup)

| Archivo | Contenido |
|---|---|
| `V1__schema.sql` | Tablas y constraints |
| `V2__indexes.sql` | Índices para performance |
| `V3__test_data.sql` | 3 clientes, 5 cuentas, 4 movimientos |

**Ubicación**: `src/main/resources/db/migration/` en cada microservicio.

---

## Tests

**Framework**: JUnit 5 + Mockito

```bash
# MS-Cliente
cd ms-cliente && ./gradlew test

# MS-Cuenta
cd ms-cuenta && ./gradlew test
```

| Tipo | Qué cubre | HU |
|---|---|---|
| Unitario | `domain/model/Cliente` — reglas de negocio puras | HU-09 |
| Integración | `RegistrarMovimientoUseCase` — saldo, ACID, error F3 | HU-21 |

---

## Verificar funcionamiento

```bash
# Listar clientes
curl http://localhost:8081/api/clientes

# Listar cuentas
curl http://localhost:8082/api/cuentas

# Logs en tiempo real
docker compose logs -f ms-cliente
docker compose logs -f ms-cuenta

# RabbitMQ admin
open http://localhost:15672  # guest / guest
```

---

## Troubleshooting

| Error | Causa | Solución |
|---|---|---|
| `Connection to localhost:5432 refused` | PostgreSQL no está corriendo | `docker compose up postgres -d` |
| `RabbitMQ connection refused` | RabbitMQ no está corriendo | `docker compose up rabbitmq -d` |
| `Flyway migration failed` | Schema inconsistente | `docker compose down -v && docker compose up -d` |
| `Port already in use :8081` | Puerto ocupado | `kill -9 $(lsof -t -i:8081)` |

---

## Documentación

- [API Endpoints](../docs/API_BACKEND.md)
- [Arquitectura del sistema](../docs/ARCHITECTURE.md)
- [Schema de base de datos](../docs/DB.md)
- [Plan de acción](../ACTION_PLAN.md)
