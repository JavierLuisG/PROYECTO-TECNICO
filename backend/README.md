# Backend — Microservicios Bancarios

Dos microservicios en **Spring Boot 4.0.6 + Java 21** con **DDD + Arquitectura Hexagonal** y comunicación asincrónica vía **RabbitMQ** (Spring AMQP).

| Servicio | Puerto | README |
|---|---|---|
| MS-Cliente | 8081 | [ms-cliente/README.md](ms-cliente/README.md) |
| MS-Cuenta | 8082 | [ms-cuenta/README.md](ms-cuenta/README.md) |

---

## Arquitectura hexagonal

```
┌─────────────────────────────────────────────────────┐
│               infrastructure/web                    │
│  Controller → DTO (request) → port/in (interface)   │
└─────────────────────┬───────────────────────────────┘
                      │ implementa
┌─────────────────────▼───────────────────────────────┐
│              application/service                    │
│  Implementa port/in · orquesta lógica               │
│  Llama a port/out (interfaces de salida)            │
└──────┬────────────────────────────────┬─────────────┘
       │ usa                            │ implementan
┌──────▼────────────┐     ┌─────────────▼─────────────┐
│  domain/          │     │   infrastructure/         │
│    model/         │     │   persistence/adapter     │
│    event/         │     │   messaging/publisher     │
│    valueobject/   │     │   messaging/consumer      │
│    exception/     │     │   (implementan port/out)  │
└───────────────────┘     └───────────────────────────┘
```

**Regla de dependencia**: el dominio no conoce nada de infraestructura. La infraestructura conoce el dominio y la aplicación, nunca al revés.

---

## Endpoints

### MS-Cliente (puerto 8081)

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| `GET` | `/api/clientes` | Listar todos los clientes | 200 |
| `GET` | `/api/clientes/{id}` | Obtener cliente por ID | 200 / 404 |
| `POST` | `/api/clientes` | Crear cliente | 201 / 400 |
| `PUT` | `/api/clientes/{id}` | Actualizar cliente | 200 / 404 |
| `DELETE` | `/api/clientes/{id}` | Eliminar cliente | 204 / 400 / 404 |

### MS-Cuenta (puerto 8082)

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| `GET` | `/api/cuentas` | Listar cuentas (filtrable `?clienteId=`) | 200 |
| `GET` | `/api/cuentas/{id}` | Obtener cuenta | 200 / 404 |
| `POST` | `/api/cuentas` | Crear cuenta | 201 / 400 |
| `PUT` | `/api/cuentas/{id}` | Actualizar cuenta | 200 / 404 |
| `DELETE` | `/api/cuentas/{id}` | Eliminar cuenta | 204 / 400 / 404 |
| `GET` | `/api/movimientos` | Listar movimientos | 200 |
| `GET` | `/api/movimientos/{id}` | Obtener movimiento | 200 / 404 |
| `POST` | `/api/movimientos` | **Registrar movimiento** (valida saldo) | 201 / 400 |
| `DELETE` | `/api/movimientos/{id}` | Eliminar movimiento | 204 / 404 |
| `GET` | `/api/reportes` | **Reporte estado de cuenta** (`?clienteId=&desde=&hasta=`) | 200 / 404 |

Ver spec completa con ejemplos en [`../docs/API_BACKEND.md`](../docs/API_BACKEND.md).

---

## Comunicación asincrónica (RabbitMQ)

Flujo bidireccional — ningún microservicio llama al otro de forma síncrona.

```
MS-Cliente ──── cliente-creado ────────────────► MS-Cuenta
             (clienteId, nombre, identificacion)    sincroniza ClienteRef local

MS-Cuenta  ──── movimiento-registrado ─────────► MS-Cliente
             (movimientoId, cuentaId, valor, saldo) log de auditoría
```

**Por qué `ClienteRef`**: los reportes de MS-Cuenta necesitan el nombre del cliente. En lugar de llamar a MS-Cliente en tiempo real (acoplamiento síncrono), MS-Cuenta escucha `cliente-creado` y persiste los datos mínimos localmente. Si MS-Cliente cae, los reportes siguen funcionando.

---

## Base de datos

**Motor**: PostgreSQL 16 compartida · **Migraciones**: Flyway (se aplican automáticamente en startup).

Cada microservicio usa su propia tabla de historial para coexistir en la misma BD:

| Servicio | Tabla historial | Migraciones |
|---|---|---|
| MS-Cliente | `flyway_schema_history_cliente` | V1 schema · V2 índices · V3 datos · V4 fix columna |
| MS-Cuenta | `flyway_schema_history_cuenta` | Baseline · V1 schema · V2 índices · V3 datos |

**Dump completo**: `BaseDatos.sql` en esta carpeta — schema + datos del ejercicio exportados con `pg_dump`.

---

## Tests

**Framework**: JUnit 5 + Spring Boot Test

```bash
cd ms-cliente && ./gradlew test   # unitarios de dominio + context load
cd ms-cuenta  && ./gradlew test   # context load + 5 tests de integración
```

Los tests usan perfil `test` con **H2 en memoria** (`src/test/resources/application-test.yml`).  
No requieren PostgreSQL ni RabbitMQ reales.

| Test | Servicio | Tipo | Descripción |
|---|---|---|---|
| `ClienteTest` | ms-cliente | Unitario | Value objects `Contrasena`, `Identificacion` y modelo `Cliente` |
| `MsClienteApplicationTests` | ms-cliente | Spring Boot Test | Carga del contexto |
| `RegistrarMovimientoIntegrationTest` | ms-cuenta | Integración | Depósito, retiro suficiente, retiro = 0 saldo, saldo insuficiente (400), múltiples depósitos |
| `MsCuentaApplicationTests` | ms-cuenta | Spring Boot Test | Carga del contexto |

---

## Levantar

### Con Docker Compose (recomendado)

```bash
# Desde la raíz del proyecto:
docker compose up -d
```

Orden de arranque con healthchecks: `postgres` + `rabbitmq` → `ms-cliente` → `ms-cuenta`.  
Flyway ejecuta las migraciones automáticamente en cada arranque.

### Local sin Docker

**Requisitos**: Java 21, PostgreSQL 16 en `localhost:5432`, RabbitMQ 3.13 en `localhost:5672`.

```bash
cd ms-cliente && ./gradlew bootRun   # terminal 1
cd ms-cuenta  && ./gradlew bootRun   # terminal 2
```

### Build sin tests

```bash
./gradlew build -x test
```

---

## Verificar funcionamiento

```bash
# Clientes y cuentas del ejercicio
curl http://localhost:8081/api/clientes
curl http://localhost:8082/api/cuentas

# Reporte Marianela Montalvo (caso del ejercicio)
curl "http://localhost:8082/api/reportes?clienteId=00000000-0000-0000-0002-000000000002&desde=2024-01-01&hasta=2024-12-31"

# Logs en tiempo real
docker compose logs -f ms-cliente
docker compose logs -f ms-cuenta

# RabbitMQ Management UI
open http://localhost:15672   # usuario: guest / contraseña: guest
```

---

## Troubleshooting

| Error | Causa | Solución |
|---|---|---|
| `Connection to localhost:5432 refused` | PostgreSQL no corre | `docker compose up banco-postgres -d` |
| `RabbitMQ connection refused` | RabbitMQ no corre | `docker compose up banco-rabbitmq -d` |
| `Flyway migration failed` | Schema inconsistente | `docker compose down -v && docker compose up -d` |
| `Port already in use :8081/8082` | Puerto ocupado | `lsof -ti:8081 | xargs kill` |

---

## Documentación

- [ms-cliente/README.md](ms-cliente/README.md) — endpoints, arquitectura, migraciones, mensajería
- [ms-cuenta/README.md](ms-cuenta/README.md) — endpoints, arquitectura, migraciones, mensajería
- [../docs/API_BACKEND.md](../docs/API_BACKEND.md) — spec completa con request/response
- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) — arquitectura del sistema y flujos
- [../docs/DB.md](../docs/DB.md) — schema de base de datos
