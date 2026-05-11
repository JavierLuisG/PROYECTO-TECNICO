# MS-Cliente

Microservicio de gestión de clientes bancarios. Implementa **arquitectura hexagonal (DDD)** con Spring Boot 4.0.6 y Java 21.

**Puerto**: 8081  
**Base de datos**: PostgreSQL 16 (schema `public`, historial Flyway en `flyway_schema_history_cliente`)  
**Mensajería**: RabbitMQ — publica `cliente-creado`, consume `movimiento-registrado`

---

## Endpoints

| Método | Ruta | Descripción | Status |
|---|---|---|---|
| `GET` | `/api/clientes` | Listar todos los clientes | 200 |
| `GET` | `/api/clientes/{id}` | Obtener cliente por ID | 200 / 404 |
| `POST` | `/api/clientes` | Crear cliente | 201 / 400 |
| `PUT` | `/api/clientes/{id}` | Actualizar cliente | 200 / 404 |
| `DELETE` | `/api/clientes/{id}` | Eliminar cliente | 204 / 400 / 404 |

### POST /api/clientes — body

```json
{
  "nombre": "Jose Lema",
  "genero": "M",
  "edad": 30,
  "identificacion": "1234567890",
  "direccion": "Otavalo sn/n y Los Ponticipes",
  "telefono": "098254785",
  "contrasena": "password123"
}
```

Reglas de validación: `contrasena` ≥ 8 caracteres · `identificacion` única · `edad` entre 18 y 120.

### DELETE /api/clientes/{id} — 400 si tiene cuentas

```json
{
  "timestamp": "...",
  "status": 400,
  "error": "Bad Request",
  "message": "El cliente tiene cuentas asociadas y no puede ser eliminado",
  "path": "/api/clientes/..."
}
```

---

## Arquitectura hexagonal

```
com.ms_cliente
├── application/
│   ├── port/in/          ← interfaces de casos de uso
│   │   ├── CreateClienteUseCase.java
│   │   ├── GetClienteUseCase.java
│   │   ├── ListClientesUseCase.java
│   │   ├── UpdateClienteUseCase.java
│   │   └── DeleteClienteUseCase.java
│   ├── port/out/         ← interfaces de salida
│   │   ├── ClienteRepositoryPort.java
│   │   ├── CuentaQueryPort.java
│   │   └── EventPublisherPort.java
│   └── service/
│       └── ClienteService.java   ← implementa los 5 casos de uso
│
├── domain/
│   ├── event/            ← ClienteCreadoEvent (record)
│   ├── exception/        ← ClienteNotFoundException, ClienteConCuentasException
│   ├── model/            ← Persona.java, Cliente.java  (POJOs sin Spring/JPA)
│   └── valueobject/      ← Contrasena.java, Identificacion.java
│
└── infrastructure/
    ├── config/           ← RabbitMQConfig.java, RestClientConfig.java
    ├── messaging/
    │   ├── publisher/    ← ClienteCreadoPublisher.java
    │   └── consumer/     ← MovimientoRegistradoConsumer.java
    ├── persistence/
    │   ├── adapter/      ← ClientePersistenceAdapter.java
    │   ├── entity/       ← PersonaEntity.java, ClienteEntity.java
    │   ├── mapper/       ← ClienteEntityMapper.java
    │   └── repository/   ← ClienteJpaRepository.java, PersonaJpaRepository.java
    └── web/
        ├── client/       ← CuentaRestClient.java (consulta cuentas a ms-cuenta)
        ├── controller/   ← ClienteController.java
        ├── dto/          ← CreateClienteRequest, UpdateClienteRequest, ClienteResponse
        ├── exception/    ← GlobalExceptionHandler.java
        └── mapper/       ← ClienteDtoMapper.java
```

---

## Migraciones Flyway

| Versión | Script | Descripción |
|---|---|---|
| V1 | `V1__schema_cliente.sql` | Tablas `persona` y `cliente` con constraints |
| V2 | `V2__indexes_cliente.sql` | Índices de performance |
| V3 | `V3__test_data_cliente.sql` | 3 clientes del ejercicio (Jose Lema, Marianela Montalvo, Juan Osorio) |
| V4 | `V4__fix_genero_column_type.sql` | Corrección de tipo de columna `genero` |

La tabla de historial usa `flyway_schema_history_cliente` para coexistir con ms-cuenta en la misma base de datos.

---

## Mensajería RabbitMQ

### Publica — `cliente-creado-exchange`

Se publica al crear un cliente exitosamente. MS-Cuenta consume este evento para sincronizar su tabla `cliente_ref`.

```json
{ "clienteId": "...", "nombre": "Jose Lema", "identificacion": "1234567890" }
```

### Consume — `movimiento-registrado-exchange` (cola `ms-cliente.movimiento-registrado`)

Registra un log `INFO` con los datos del movimiento (auditoría).

---

## Tests

```bash
./gradlew test
```

| Test | Tipo | Descripción |
|---|---|---|
| `ClienteTest` | Unitario (JUnit 5) | Value objects `Contrasena` e `Identificacion`, estado inicial de `Cliente` |
| `MsClienteApplicationTests` | Spring Boot Test | Carga del contexto con perfil `test` (H2 + RabbitMQ mock) |

Los tests usan perfil `test` con H2 en memoria — no requieren PostgreSQL ni RabbitMQ reales.

---

## Levantar

### Con Docker Compose (recomendado)

```bash
# Desde la raíz del proyecto:
docker compose up ms-cliente -d
```

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
| `MS_CUENTA_URL` | `http://ms-cuenta:8082` | URL de MS-Cuenta (para verificar cuentas antes de DELETE) |
