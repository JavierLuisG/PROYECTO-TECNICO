# Implementation Workflow

Guía paso a paso para la implementación del proyecto. Define ramas, commits y PRs en orden.

**Tú** → acciones de git (crear rama, commit, abrir PR)  
**Claude** → implementa el código y entrega el mensaje de commit al terminar cada bloque

---

## Configuración base

### Merge strategy
**Merge commit** en todos los PRs a `develop`.  
Preserva el historial de commits individuales dentro de cada PR para trazabilidad completa.

### Formato de commit
```
<tipo>(<scope>): <descripción en imperativo, inglés>

Tipos  : feat | chore | build | test | ci | docs | fix
Scopes : ms-cliente | ms-cuenta | frontend | database | docker | ci
```

### Scopes válidos por rama

| Rama | Scopes usados |
|---|---|
| `feat/database-setup` | `database`, `docker` |
| `feat/US-01-gestion-clientes` | `ms-cliente` |
| `feat/US-02-gestion-cuentas` | `ms-cuenta` |
| `feat/US-03-registrar-movimiento` | `ms-cuenta` |
| `feat/US-04-reporte-cuenta` | `ms-cuenta` |
| `feat/US-05-listado-productos` | `frontend` |
| `feat/US-06-crear-producto` | `frontend` |
| `feat/US-07-editar-producto` | `frontend` |
| `feat/ci-cd` | `ci` |
| `feat/entregables` | `database`, `docs` |

---

## Rama 1 — `feat/database-setup`

```bash
# Tú
git checkout develop
git checkout -b feat/database-setup
```

### Bloque 1 — Schema e índices → TASK-01, TASK-02

**Claude implementa:**
- `ms-cliente/src/main/resources/db/migration/V1__schema_cliente.sql`
- `ms-cliente/src/main/resources/db/migration/V2__indexes_cliente.sql`
- `ms-cuenta/src/main/resources/db/migration/V1__schema_cuenta.sql`
- `ms-cuenta/src/main/resources/db/migration/V2__indexes_cuenta.sql`

**Commit:**
```
chore(database): add Flyway schema and performance indexes
```

---

### Bloque 2 — Datos de prueba → TASK-03

**Claude implementa:**
- `ms-cliente/src/main/resources/db/migration/V3__test_data_cliente.sql`
- `ms-cuenta/src/main/resources/db/migration/V3__test_data_cuenta.sql`

**Commit:**
```
chore(database): add test data migrations with exercise dataset
```

---

### Bloque 3 — Reactivar Flyway → TASK-04

**Claude implementa:**
- `docker-compose.yml` — `SPRING_FLYWAY_ENABLED: "true"` y `ddl-auto: validate`

**Commit:**
```
chore(docker): enable Flyway and restore ddl-auto validate
```

---

### PR — `feat/database-setup` → `develop`

```
Título: feat(database): setup Flyway migrations and test data
```

```
## ¿Qué hace este PR?
Crea el schema completo de la base de datos bancaria mediante migraciones Flyway,
agrega índices de performance y carga los datos de prueba del ejercicio.

## Cambios incluidos
- Closes #1 — TASK-01: Flyway schema inicial (persona, cliente, cliente_ref, cuenta, movimiento)
- Closes #2 — TASK-02: Índices de performance (identificacion, numero_cuenta, cuenta_id+fecha)
- Closes #3 — TASK-03: Datos de prueba (3 clientes, 5 cuentas, 4 movimientos del ejercicio)
- Closes #4 — TASK-04: Flyway y ddl-auto:validate reactivados en docker-compose

## Cómo probar
```bash
docker compose down -v && docker compose up -d
docker exec banco-postgres psql -U postgres -d banco_db -c "\dt"
docker exec banco-postgres psql -U postgres -d banco_db -c "SELECT * FROM cliente;"

## Criterios de aceptación
- [ ] Todos los contenedores levantan sin errores de Flyway
- [ ] Las 5 tablas existen con sus constraints
- [ ] Los 3 clientes y 5 cuentas del ejercicio están cargados
- [ ] Los índices aparecen en `\di`
```

---

## Rama 2 — `feat/US-01-gestion-clientes`

```bash
# Tú
git checkout develop
git checkout -b feat/US-01-gestion-clientes
```

### Bloque 1 — Estructura DDD + modelos de dominio → TASK-05, TASK-06

**Claude implementa:**
- Estructura de paquetes `application/`, `domain/`, `infrastructure/` en `ms-cliente`
- `domain/model/Persona.java`, `domain/model/Cliente.java`
- `domain/valueobject/Identificacion.java`, `domain/valueobject/Contrasena.java`
- `domain/exception/ClienteNotFoundException.java`, `domain/exception/ClienteConCuentasException.java`
- `infrastructure/persistence/entity/PersonaEntity.java`, `ClienteEntity.java`
- `infrastructure/persistence/mapper/ClienteEntityMapper.java`
- `infrastructure/persistence/repository/ClienteJpaRepository.java`

**Commit:**
```
chore(ms-cliente): setup DDD hexagonal structure and domain models
```

---

### Bloque 2 — CRUD clientes + exception handler → US-01, TASK-07

**Claude implementa:**
- `application/port/in/` — interfaces de casos de uso
- `application/port/out/ClienteRepositoryPort.java`
- `application/service/ClienteService.java`
- `infrastructure/persistence/adapter/ClientePersistenceAdapter.java`
- `infrastructure/web/controller/ClienteController.java`
- `infrastructure/web/dto/request/`, `infrastructure/web/dto/response/`
- `infrastructure/web/mapper/ClienteDtoMapper.java`
- `infrastructure/web/exception/GlobalExceptionHandler.java`

**Commit:**
```
feat(ms-cliente): add cliente CRUD endpoints with global exception handler
```

---

### Bloque 3 — Test unitario → TASK-08

**Claude implementa:**
- `src/test/java/.../domain/model/ClienteTest.java`

**Commit:**
```
test(ms-cliente): add unit tests for Cliente domain model
```

---

### Bloque 4 — Mensajería RabbitMQ → TASK-09, TASK-10

**Claude implementa:**
- `domain/event/ClienteCreadoEvent.java`
- `infrastructure/config/RabbitMQConfig.java`
- `infrastructure/messaging/publisher/ClienteCreadoPublisher.java`
- `infrastructure/messaging/consumer/MovimientoRegistradoConsumer.java`

**Commit:**
```
feat(ms-cliente): add rabbitmq publisher for cliente-creado and consumer for movimiento-registrado
```

---

### PR — `feat/US-01-gestion-clientes` → `develop`

```
Título: feat(ms-cliente): US-01 client management CRUD with DDD and messaging
```

```
## ¿Qué hace este PR?
Implementa la gestión completa de clientes en MS-Cliente con arquitectura DDD +
Hexagonal. Incluye CRUD REST, validaciones de dominio, manejo de errores y
comunicación asincrónica vía RabbitMQ.

## Cambios incluidos
- Closes #5  — TASK-05: Estructura DDD + Hexagonal MS-Cliente
- Closes #6  — TASK-06: Modelos de dominio y entidades JPA Persona/Cliente
- Closes #7  — US-01:   CRUD de clientes (POST, GET, PUT, DELETE /api/clientes)
- Closes #8  — TASK-07: Global exception handler REST
- Closes #9  — TASK-08: Test unitario del modelo de dominio Cliente
- Closes #10 — TASK-09: Publisher evento cliente-creado via RabbitMQ
- Closes #11 — TASK-10: Consumer evento movimiento-registrado (auditoría)

## Cómo probar
```bash
# Crear cliente
curl -X POST http://localhost:8081/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Jose Lema","genero":"M","edad":35,"identificacion":"1234567890","direccion":"Otavalo sn","telefono":"098254785","contrasena":"password123"}'

# Listar clientes
curl http://localhost:8081/api/clientes

# Test unitario
cd backend/ms-cliente && ./gradlew test

## Criterios de aceptación
- [ ] POST /api/clientes retorna 201 con clienteId
- [ ] Identificación duplicada retorna 400
- [ ] Contraseña < 8 chars retorna 400
- [ ] DELETE con cuentas asociadas retorna 400
- [ ] Evento cliente-creado visible en RabbitMQ UI (http://localhost:15672)
- [ ] Tests unitarios pasan (`./gradlew test`)
```

---

## Rama 3 — `feat/US-02-gestion-cuentas`

```bash
# Tú
git checkout develop
git checkout -b feat/US-02-gestion-cuentas
```

### Bloque 1 — Dependencias Gradle → TASK-11

**Claude implementa:**
- `backend/ms-cuenta/build.gradle` — agrega JPA, Flyway, RabbitMQ, Cloud Stream, Lombok

**Commit:**
```
build(ms-cuenta): add JPA, RabbitMQ, Flyway and Lombok dependencies
```

---

### Bloque 2 — Estructura DDD + modelos → TASK-12, TASK-13

**Claude implementa:**
- Estructura de paquetes completa en `ms-cuenta`
- `domain/model/Cuenta.java`, `Movimiento.java`, `ClienteRef.java`
- `domain/valueobject/Saldo.java`, `NumeroCuenta.java`, `TipoCuenta.java`
- `domain/exception/SaldoInsuficienteException.java`, `CuentaNotFoundException.java`
- Entidades JPA, mappers, repositorios

**Commit:**
```
chore(ms-cuenta): setup DDD hexagonal structure and domain models
```

---

### Bloque 3 — CRUD cuentas → US-02

**Claude implementa:**
- Ports, service, adapter, controller, DTOs, mapper para Cuenta

**Commit:**
```
feat(ms-cuenta): add cuenta CRUD endpoints
```

---

### PR — `feat/US-02-gestion-cuentas` → `develop`

```
Título: feat(ms-cuenta): US-02 account management CRUD with DDD setup
```

```
## ¿Qué hace este PR?
Implementa la gestión de cuentas bancarias en MS-Cuenta. Incluye la configuración
completa de dependencias, estructura DDD + Hexagonal y el CRUD REST de cuentas.

## Cambios incluidos
- Closes #12 — TASK-11: Dependencias Gradle completas para MS-Cuenta
- Closes #13 — TASK-12: Estructura DDD + Hexagonal MS-Cuenta
- Closes #14 — TASK-13: Modelos de dominio y entidades JPA Cuenta/Movimiento/ClienteRef
- Closes #15 — US-02:   CRUD de cuentas (POST, GET, PUT, DELETE /api/cuentas)

## Cómo probar
```bash
# Crear cuenta (requiere que el cliente exista en cliente_ref via V3 migration)
curl -X POST http://localhost:8082/api/cuentas \
  -H "Content-Type: application/json" \
  -d '{"clienteId":"<uuid>","numeroCuenta":"999001","tipoCuenta":"AHORRO","saldoInicial":1000.00}'

# Listar cuentas
curl http://localhost:8082/api/cuentas

## Criterios de aceptación
- [ ] POST /api/cuentas retorna 201 con saldoInicial = saldo
- [ ] Número de cuenta duplicado retorna 400
- [ ] DELETE con movimientos retorna 400
- [ ] `docker compose build ms-cuenta` sin errores
```

---

## Rama 4 — `feat/US-03-registrar-movimiento`

```bash
# Tú
git checkout develop
git checkout -b feat/US-03-registrar-movimiento
```

### Bloque 1 — Exception handler + Registrar movimiento → TASK-14, US-03

**Claude implementa:**
- `infrastructure/web/exception/GlobalExceptionHandler.java` — handlers para `SaldoInsuficienteException` (400 "Saldo no disponible"), `EntityNotFoundException` (404), `BusinessException` (400), `MethodArgumentNotValidException` (400)
- `application/port/in/RegistrarMovimientoUseCase.java`
- `application/service/MovimientoService.java` — lógica transaccional ACID con lock pesimista
- `infrastructure/web/controller/MovimientoController.java`
- DTOs y mappers de Movimiento

**Commit:**
```
feat(ms-cuenta): add global exception handler and movement registration with balance validation
```

---

### Bloque 2 — Integración RabbitMQ bidireccional → TASK-15, TASK-16

**Claude implementa:**
- `domain/event/MovimientoRegistradoEvent.java`
- `infrastructure/messaging/publisher/MovimientoRegistradoPublisher.java`
- `infrastructure/messaging/consumer/ClienteCreadoConsumer.java`
- `infrastructure/config/RabbitMQConfig.java`

**Commit:**
```
feat(ms-cuenta): add bidirectional RabbitMQ integration for cliente-creado and movimiento-registrado
```

---

### PR — `feat/US-03-registrar-movimiento` → `develop`

```
Título: feat(ms-cuenta): US-03 movement registration with balance validation and RabbitMQ
```

```
## ¿Qué hace este PR?
Implementa el registro de movimientos bancarios con validación de saldo (F2 + F3)
y la integración asincrónica bidireccional con RabbitMQ. Lógica crítica con
transacción ACID y lock pesimista para garantizar consistencia.

## Cambios incluidos
- Closes #18 — TASK-14: Global exception handler REST con SaldoInsuficienteException
- Closes #16 — US-03:   Registrar movimiento con validación de saldo ("Saldo no disponible")
- Closes #19 — TASK-15: Consumer evento cliente-creado → sincroniza ClienteRef
- Closes #20 — TASK-16: Publisher evento movimiento-registrado

## Cómo probar
```bash
# Depósito
curl -X POST http://localhost:8082/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{"cuentaId":"<uuid>","tipoMovimiento":"DEPOSITO","valor":600.00}'

# Retiro con saldo insuficiente (debe retornar 400 + "Saldo no disponible")
curl -X POST http://localhost:8082/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{"cuentaId":"<uuid>","tipoMovimiento":"RETIRO","valor":-99999.00}'

## Criterios de aceptación
- [ ] Depósito actualiza saldo correctamente (saldoAnterior + valor = saldoActual)
- [ ] Retiro con saldo insuficiente retorna 400 con mensaje exacto "Saldo no disponible"
- [ ] El saldo no cambia cuando el retiro falla
- [ ] Evento movimiento-registrado aparece en RabbitMQ UI tras movimiento exitoso
- [ ] ClienteRef se crea al llegar evento cliente-creado (verificar en BD)
```

---

## Rama 5 — `feat/US-04-reporte-cuenta`

```bash
# Tú
git checkout develop
git checkout -b feat/US-04-reporte-cuenta
```

### Bloque 1 — Reporte estado de cuenta → US-04

**Claude implementa:**
- `application/port/in/GenerarReporteUseCase.java`
- `application/service/ReporteService.java`
- `infrastructure/web/controller/ReporteController.java`
- `infrastructure/web/dto/response/ReporteResponse.java`

**Commit:**
```
feat(ms-cuenta): add account statement report by client and date range
```

---

### Bloque 2 — Test de integración → TASK-17

**Claude implementa:**
- `src/test/java/.../RegistrarMovimientoIntegrationTest.java`

**Commit:**
```
test(ms-cuenta): add integration tests for movement registration flow
```

---

### PR — `feat/US-04-reporte-cuenta` → `develop`

```
Título: feat(ms-cuenta): US-04 account statement report with integration tests
```

```
## ¿Qué hace este PR?
Implementa el reporte de estado de cuenta (F4) filtrable por cliente y rango de fechas,
y agrega el test de integración que verifica el flujo completo de registro de movimiento.

## Cambios incluidos
- Closes #17 — US-04:   Reporte estado de cuenta (/api/reportes?clienteId&desde&hasta)
- Closes #21 — TASK-17: Test de integración registro de movimiento (F6 deseable)

## Cómo probar
```bash
curl "http://localhost:8082/api/reportes?clienteId=<uuid>&desde=2024-01-01&hasta=2024-12-31"

# Test de integración
cd backend/ms-cuenta && ./gradlew test

## Criterios de aceptación
- [ ] Reporte incluye nombre del cliente (de ClienteRef), cuentas y movimientos en el rango
- [ ] Sin fechas usa inicio de año - hoy como defaults
- [ ] Cliente inexistente retorna 404
- [ ] Test de integración: depósito actualiza saldo ✓, retiro insuficiente → 400 + saldo sin cambio ✓
```

---

## Rama 6 — `feat/US-05-listado-productos`

```bash
# Tú
git checkout develop
git checkout -b feat/US-05-listado-productos
```

### Bloque 1 — Setup estructura y servicio API → TASK-18

**Claude implementa:**
- Estructura de carpetas: `domain/models/`, `application/usecases/`, `application/hooks/`, `infrastructure/api/`, `presentation/components/`
- `domain/models/Product.ts`
- `infrastructure/api/productService.ts`
- `.env.local` con `NEXT_PUBLIC_API_BASE_URL=http://localhost:3002`

**Commit:**
```
chore(frontend): setup layered architecture and product API service
```

---

### Bloque 2 — Listado + búsqueda + contador → US-05

**Claude implementa:**
- `presentation/components/ProductList/`, `ProductCard/`, `SearchBar/`, `RecordCount/`
- `application/hooks/useProducts.ts`, `useSearch.ts`
- `src/app/page.tsx` — página principal

**Commit:**
```
feat(frontend): add product list with real-time search and record count
```

---

### PR — `feat/US-05-listado-productos` → `develop`

```
Título: feat(frontend): US-05 product list with search and record count
```

```
## ¿Qué hace este PR?
Implementa F1, F2 y F3 del ejercicio frontend: listado de productos financieros,
búsqueda en tiempo real por nombre/descripción y contador de registros actualizado.
CSS propio sin frameworks de estilos.

## Cambios incluidos
- Closes #22 — TASK-18: Setup estructura por capas y servicio API frontend
- Closes #23 — US-05:   Listado, búsqueda y contador de productos (F1, F2, F3)

## Cómo probar
```bash
# 1. Iniciar backend Node.js del ejercicio en puerto 3002
# 2. Iniciar frontend
cd frontend && npm run dev
# 3. Abrir http://localhost:3000

## Criterios de aceptación
- [ ] Lista completa de productos visible al cargar
- [ ] Estado de carga visible durante fetch
- [ ] Búsqueda filtra sin llamar al API
- [ ] Contador actualizado con filtro activo
- [ ] Sin referencias a Tailwind u otros frameworks de estilos en componentes
```

---

## Rama 7 — `feat/US-06-crear-producto`

```bash
# Tú
git checkout develop
git checkout -b feat/US-06-crear-producto
```

### Bloque 1 — Formulario crear producto → US-06

**Claude implementa:**
- `presentation/components/ProductForm/` (modo creación)
- `application/usecases/createProduct.ts`
- `application/hooks/useProductForm.ts`
- `src/app/products/new/page.tsx`

**Commit:**
```
feat(frontend): add product creation form with field validations and ID verification
```

---

### PR — `feat/US-06-crear-producto` → `develop`

```
Título: feat(frontend): US-06 product creation form with validations
```

```
## ¿Qué hace este PR?
Implementa F4 del ejercicio frontend: formulario de creación de producto con
validaciones por campo, verificación de ID único vía API, cálculo automático
de fecha de revisión y botón de reinicio.

## Cambios incluidos
- Closes #24 — US-06: Formulario de creación de producto financiero (F4)

## Cómo probar
```bash
# http://localhost:3000/products/new
# 1. Intentar crear con ID ya existente → error bajo campo ID
# 2. Crear con datos válidos → redirige al listado
# 3. Seleccionar fecha de liberación → fecha revisión se auto-calcula
# 4. Botón Reiniciar → limpia campos y errores

## Criterios de aceptación
- [ ] Errores de validación visibles bajo cada campo individualmente
- [ ] ID verifica unicidad al perder foco
- [ ] Fecha Revisión = Fecha Liberación + 1 año (auto-calculado, no editable)
- [ ] Botón "Agregar" no envía si hay errores
- [ ] Creación exitosa redirige al listado
```

---

## Rama 8 — `feat/US-07-editar-producto`

```bash
# Tú
git checkout develop
git checkout -b feat/US-07-editar-producto
```

### Bloque 1 — Formulario editar producto → US-07

**Claude implementa:**
- `presentation/components/ProductForm/` modo edición (reutiliza el de US-06)
- `application/usecases/updateProduct.ts`
- `src/app/products/[id]/edit/page.tsx`

**Commit:**
```
feat(frontend): add product edit form with pre-loaded values and disabled ID field
```

---

### Bloque 2 — Tests unitarios → TASK-19

**Claude implementa:**
- `__tests__/infrastructure/api/productService.test.ts`
- `__tests__/presentation/components/SearchBar.test.tsx`
- `__tests__/presentation/components/ProductForm.test.tsx`
- `__tests__/application/hooks/useProducts.test.ts`

**Commit:**
```
test(frontend): add unit tests for components, hooks and API service
```

---

### PR — `feat/US-07-editar-producto` → `develop`

```
Título: feat(frontend): US-07 product edit form and unit tests
```

```
## ¿Qué hace este PR?
Implementa F5 del ejercicio (deseable): formulario de edición con pre-carga de
datos y campo ID deshabilitado. Agrega tests unitarios con Jest alcanzando
cobertura ≥ 70%.

## Cambios incluidos
- Closes #25 — US-07:   Formulario de edición de producto (F5 deseable)
- Closes #26 — TASK-19: Tests unitarios frontend (Jest, cobertura ≥ 70%)

## Cómo probar
```bash
# http://localhost:3000 → clic en producto → editar

# Tests
cd frontend && npm test -- --coverage

## Criterios de aceptación
- [ ] Formulario pre-carga los valores actuales del producto
- [ ] Campo ID deshabilitado y no editable
- [ ] Mismas validaciones que creación (excepto verificación de unicidad)
- [ ] `npm test -- --coverage` muestra cobertura ≥ 70%
```

---

## Rama 9 — `feat/ci-cd`

```bash
# Tú
git checkout develop
git checkout -b feat/ci-cd
```

### Bloque 1 — GitHub Actions → TASK-20

**Claude implementa:**
- `.github/workflows/ci.yml`

**Commit:**
```
ci: add GitHub Actions pipeline for backend and frontend builds and tests
```

---

### PR — `feat/ci-cd` → `develop`

```
Título: ci: add GitHub Actions CI pipeline
```

```
## ¿Qué hace este PR?
Configura el pipeline de integración continua en GitHub Actions. Ejecuta build
y tests de ambos microservicios backend y del frontend en cada push y PR.

## Cambios incluidos
- Closes #27 — TASK-20: Pipeline CI con GitHub Actions

## Cómo probar
Hacer push de la rama a GitHub y verificar que el workflow pasa en verde en
la pestaña Actions del repositorio.

## Criterios de aceptación
- [ ] Job `backend-ms-cliente`: build + tests pasan
- [ ] Job `backend-ms-cuenta`: build + tests pasan
- [ ] Job `frontend`: build + tests + coverage pasan
- [ ] Trigger activo en push a `main`/`develop` y PR a `main`
```

---

## Rama 10 — `feat/entregables`

```bash
# Tú
git checkout develop
git checkout -b feat/entregables
```

### Bloque 1 — Script SQL → TASK-21

**Claude implementa:**
- Instrucción para generar `backend/BaseDatos.sql`

**Tú ejecutas:**
```bash
docker exec banco-postgres pg_dump -U postgres banco_db > backend/BaseDatos.sql
```

**Commit:**
```
chore(database): add BaseDatos.sql export with full schema and test data
```

---

### Bloque 2 — Postman + README → TASK-22, TASK-23

**Claude implementa:**
- `postman_collection.json`
- Actualización de `README.md`

**Commit:**
```
docs: add Postman collection and update README with final instructions
```

---

### PR — `feat/entregables` → `develop`

```
Título: chore: add final deliverables - BaseDatos.sql, Postman collection and README
```

```
## ¿Qué hace este PR?
Agrega los entregables finales requeridos por el ejercicio: script SQL completo
de la base de datos, colección Postman con todos los casos de uso y README
actualizado con instrucciones de despliegue verificadas.

## Cambios incluidos
- Closes #28 — TASK-21: Script BaseDatos.sql
- Closes #29 — TASK-22: Colección Postman con casos del ejercicio
- Closes #30 — TASK-23: README actualizado

## Cómo probar
```bash
# Verificar BaseDatos.sql ejecutable desde cero
psql -U postgres -d postgres -c "CREATE DATABASE banco_test;"
psql -U postgres -d banco_test -f backend/BaseDatos.sql

# Importar postman_collection.json en Postman y ejecutar los requests

## Criterios de aceptación
- [ ] `BaseDatos.sql` crea schema y carga datos sin errores en BD vacía
- [ ] Colección Postman contiene los 4 casos del ejercicio (crear clientes, cuentas, movimientos, reporte)
- [ ] README Quick Start ejecutable de principio a fin
```

---

## Resumen de ramas y commits

| Rama | Commits | Issues cerrados |
|---|---|---|
| `feat/database-setup` | 3 | #1, #2, #3, #4 |
| `feat/US-01-gestion-clientes` | 4 | #5, #6, #7, #8, #9, #10, #11 |
| `feat/US-02-gestion-cuentas` | 3 | #12, #13, #14, #15 |
| `feat/US-03-registrar-movimiento` | 2 | #18, #16, #19, #20 |
| `feat/US-04-reporte-cuenta` | 2 | #17, #21 |
| `feat/US-05-listado-productos` | 2 | #22, #23 |
| `feat/US-06-crear-producto` | 1 | #24 |
| `feat/US-07-editar-producto` | 2 | #25, #26 |
| `feat/ci-cd` | 1 | #27 |
| `feat/entregables` | 2 | #28, #29, #30 |
| **Total** | **22 commits · 10 PRs** | |
