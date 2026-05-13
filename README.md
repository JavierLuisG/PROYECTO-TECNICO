# Sistema Bancario — Prueba Técnica SemiSenior

Aplicación bancaria completa con arquitectura de microservicios (backend Spring Boot) y catálogo de productos financieros (frontend Next.js + React Native/Expo).

## Mapa de puertos

| Servicio | Tecnología | Puerto | Modo de arranque |
|---|---|---|---|
| MS-Cliente | Spring Boot 4.0.6 + Java 21 | **8081** | Docker Compose |
| MS-Cuenta | Spring Boot 4.0.6 + Java 21 | **8082** | Docker Compose |
| Frontend Next.js | Next.js 16 + React 19 | **3000** | Docker Compose |
| PostgreSQL | PostgreSQL 16 | **5432** | Docker Compose |
| RabbitMQ AMQP | RabbitMQ 3.13 | **5672** | Docker Compose |
| RabbitMQ Management UI | RabbitMQ 3.13 | **15672** | Docker Compose |
| repo-interview-main | Node.js + TypeScript | **3002** | Local |
| Frontend React Native (Expo Metro) | React Native 0.81 + Expo SDK 54 | **8083** | Local |

> **Sin conflictos de puertos**: Expo Metro se configuró en el **8083** para evitar colisión con ms-cliente (8081).

Los dos microservicios backend siguen **arquitectura hexagonal (DDD)** y se comunican de forma asincrónica a través de RabbitMQ.

## Requisitos

- Docker 20.10+
- Docker Compose 2.0+

Para desarrollo local sin Docker: Java 21, Node.js 20, PostgreSQL 16, RabbitMQ 3.13.

## Quick Start

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd proyecto-tecnico
```

### 2. Levantar todos los servicios

```bash
docker compose up -d
```

Los contenedores levantan en este orden:
1. `banco-postgres` + `banco-rabbitmq` (infraestructura)
2. `ms-cliente` (espera a que postgres esté healthy)
3. `ms-cuenta` (espera a que ms-cliente esté healthy — evita race condition de Flyway)
4. `banco-frontend`

> `repo-interview-main` **no se dockeriza** — debe ejecutarse localmente antes de levantar el frontend (ver sección [API de Productos](#api-de-productos--repo-interview-main)).

Flyway ejecuta automáticamente las migraciones al iniciar cada microservicio.

### 3. Verificar que todo funciona

```bash
# Salud de los contenedores
docker compose ps

# Backend bancario
curl http://localhost:8081/api/clientes          # Lista los 3 clientes del ejercicio
curl http://localhost:8082/api/cuentas           # Lista las 5 cuentas del ejercicio

# Frontend + catálogo de productos
# Abrir http://localhost:3000

# RabbitMQ Management UI
# Abrir http://localhost:15672  (usuario: guest / contraseña: guest)
```

### 4. Datos de prueba precargados

Las migraciones Flyway V3 cargan el dataset del ejercicio:

| Tabla | Datos |
|---|---|
| `persona` + `cliente` | Jose Lema, Marianela Montalvo, Juan Osorio |
| `cuenta` | 478758 (Ahorro, $2000), 225487 (Corriente, $100), 495878 (Ahorro, $0), 496825 (Ahorro, $540), 585545 (Corriente, $1000) |
| `movimiento` | Retiro -575 en 478758, Depósito 600 en 225487, Depósito 150 en 495878, Retiro -540 en 496825 |

---

## Estructura del proyecto

```
proyecto-tecnico/
├── .github/workflows/
│   └── ci.yml                  # Pipeline CI — GitHub Actions
├── backend/
│   ├── ms-cliente/             # Microservicio de clientes       → :8081 (Docker)
│   ├── ms-cuenta/              # Microservicio de cuentas        → :8082 (Docker)
│   └── BaseDatos.sql           # Dump completo de PostgreSQL (schema + datos)
├── frontend/                   # Aplicación Next.js              → :3000 (Docker)
├── frontend-rn/                # Aplicación React Native/Expo    → :8083 metro (local)
├── repo-interview-main/        # API Node.js de productos        → :3002 (local)
├── docs/
│   ├── API_BACKEND.md          # Endpoints de MS-Cliente y MS-Cuenta
│   ├── API_FRONTEND.md         # Endpoints de la API repo-interview-main de productos
│   ├── ARCHITECTURE.md         # Arquitectura hexagonal, flujos async
│   ├── DB.md                   # Schema de base de datos
│   └── user-stories/           # Especificaciones US-01 a US-08
├── postman_collection.json     # Colección Postman con todos los casos del ejercicio
└── docker-compose.yml
```

---

## API Backend

### MS-Cliente — Puerto 8081

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/clientes` | Listar todos los clientes |
| `GET` | `/api/clientes/{id}` | Obtener cliente por ID |
| `POST` | `/api/clientes` | Crear cliente |
| `PUT` | `/api/clientes/{id}` | Actualizar cliente |
| `DELETE` | `/api/clientes/{id}` | Eliminar cliente |

### MS-Cuenta — Puerto 8082

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/cuentas` | Listar cuentas (filtrable por `?clienteId=`) |
| `GET` | `/api/cuentas/{id}` | Obtener cuenta |
| `POST` | `/api/cuentas` | Crear cuenta |
| `PUT` | `/api/cuentas/{id}` | Actualizar cuenta |
| `DELETE` | `/api/cuentas/{id}` | Eliminar cuenta |
| `GET` | `/api/movimientos` | Listar movimientos |
| `GET` | `/api/movimientos/{id}` | Obtener movimiento |
| `POST` | `/api/movimientos` | **Registrar movimiento** (valida saldo) |
| `DELETE` | `/api/movimientos/{id}` | Eliminar movimiento |
| `GET` | `/api/reportes` | **Reporte estado de cuenta** (`?clienteId=&desde=&hasta=`) |

Ver documentación completa en [docs/API_BACKEND.md](docs/API_BACKEND.md).

### Casos de error relevantes

| Caso | Status | Mensaje |
|---|---|---|
| Retiro con saldo insuficiente | 400 | `"Saldo no disponible"` |
| Eliminar cliente con cuentas | 400 | Business exception |
| Eliminar cuenta con movimientos | 400 | Business exception |
| Recurso no encontrado | 404 | Not found |

---

## Colección Postman

El archivo `postman_collection.json` contiene todos los requests organizados en dos carpetas:

- **MS-Cliente**: Listar, obtener (Jose, Marianela, Juan), crear, actualizar, errores
- **MS-Cuenta / Cuentas**: Listar, obtener, filtrar por cliente, crear, actualizar, error con movimientos
- **MS-Cuenta / Movimientos**: Listar, obtener, depósito, retiro, saldo insuficiente, valor cero
- **MS-Cuenta / Reporte**: Reporte Marianela 2024, Jose Lema 2024, defaults sin fechas, cliente inexistente

### Importar en Postman

1. Abrir Postman → **Import**
2. Seleccionar `postman_collection.json`
3. Las variables de colección (`base_cliente`, `base_cuenta`, UUIDs de clientes y cuentas) se cargan automáticamente

---

## API de Productos — repo-interview-main

El ejercicio técnico del frontend requiere un backend Node.js que sirva el catálogo de productos financieros. Este servidor está provisto por el ejercicio en la carpeta `repo-interview-main` y se ejecuta **localmente** en el puerto **3002** — no se incluye en Docker Compose.

```bash
cd repo-interview-main
npm install
npm run start:dev   # http://localhost:3002
```

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/bp/products` | Listar productos |
| `GET` | `/bp/products/:id` | Obtener producto |
| `POST` | `/bp/products` | Crear producto |
| `PUT` | `/bp/products/:id` | Actualizar producto |
| `DELETE` | `/bp/products/:id` | Eliminar producto |
| `GET` | `/bp/products/verification/:id` | Verificar si el ID existe |

El frontend en `http://localhost:3000` consume este servicio automáticamente.

---

## Tests

### Backend (JUnit 5 + Spring Boot Test)

```bash
# MS-Cliente: tests unitarios de dominio + context load
cd backend/ms-cliente && ./gradlew test

# MS-Cuenta: tests unitarios + test de integración de movimientos
cd backend/ms-cuenta && ./gradlew test
```

Los tests de backend usan **H2 en memoria** (perfil `test`) — no requieren PostgreSQL ni RabbitMQ.

### Frontend Next.js (Jest + React Testing Library)

```bash
cd frontend
npm test                  # 74 tests
npm run test:coverage     # Cobertura ≥ 70%
```

Cobertura actual: **94%** statements · **92%** branches.

### Frontend React Native (Jest + React Native Testing Library)

```bash
cd frontend-rn
npm test                  # 57 tests
npm run test:coverage     # Cobertura ≥ 70%
```

Cobertura actual: **86%** statements · **76%** branches · **80%** functions.

---

## CI/CD

El pipeline de GitHub Actions (`.github/workflows/ci.yml`) se activa en:
- Push a `main` o `develop`
- Pull Request a `main`

**Jobs:**
| Job | Pasos |
|---|---|
| `backend-ms-cliente` | Java 21, `./gradlew build` (compila + tests) |
| `backend-ms-cuenta` | Java 21, `./gradlew build` (compila + tests) |
| `frontend` | Node.js 20, `npm ci` → `npm run build` → `npm run test:coverage` |

---

## Restaurar la base de datos desde cero

El archivo `backend/BaseDatos.sql` contiene el schema completo más los datos de prueba. Para restaurarlo en una BD vacía:

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE banco_db;"

# Restaurar
psql -U postgres -d banco_db -f backend/BaseDatos.sql
```

O usando Docker:

```bash
docker exec -i banco-postgres psql -U postgres banco_db < backend/BaseDatos.sql
```

---

## Desarrollo local sin Docker

### Backend

```bash
# Requisitos: Java 21, PostgreSQL 16 en localhost:5432, RabbitMQ en localhost:5672

cd backend/ms-cliente && ./gradlew bootRun   # → :8081
cd backend/ms-cuenta  && ./gradlew bootRun   # → :8082
```

### Frontend Next.js

```bash
# Requisitos: Node.js 20, repo-interview-main corriendo en localhost:3002

cd frontend
npm install
npm run dev         # → http://localhost:3000
```

### Frontend React Native (Expo)

```bash
# Requisitos: Node.js 20, repo-interview-main corriendo en localhost:3002
# Puerto 8083 (Metro) — no colisiona con ms-cliente (:8081)

cd frontend-rn
npm install
npm start           # → Metro en :8083 — presionar i (iOS) o a (Android)
```

---

## Documentación

| Archivo | Contenido |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura hexagonal, flujos async RabbitMQ, decisiones de diseño |
| [docs/DB.md](docs/DB.md) | Schema de tablas, relaciones, índices |
| [docs/API_BACKEND.md](docs/API_BACKEND.md) | Endpoints completos con ejemplos de request/response |
| [docs/API_FRONTEND.md](docs/API_FRONTEND.md) | Endpoints de la API repo-interview-main de productos |
| [docs/user-stories/](docs/user-stories/) | Especificaciones US-01 a US-07 con criterios Gherkin |
