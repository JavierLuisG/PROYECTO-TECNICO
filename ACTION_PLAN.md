# Plan de Acción — Sistema Bancario SemiSenior

Desarrollo paso a paso del backend (Spring Boot microservicios) y frontend (Next.js catálogo de productos).

**Perfil**: SemiSenior  
**Stack**: Java 21 + Spring Boot 4, Next.js 16, PostgreSQL, RabbitMQ, Docker  
**Requisitos cubiertos**: F1–F5 Backend + F1–F4 Frontend (F5 Frontend deseable)

**Nomenclatura**:
- `US-XX` — User Story funcional (spec completa en `docs/user-stories/`)
- `TASK-XX` — Tarea técnica de implementación o infraestructura

---

## Estado inicial

| Componente | Estado |
|---|---|
| Infraestructura Docker | ✅ Levantada |
| MS-Cliente (esqueleto) | ✅ Arranca, sin lógica |
| MS-Cuenta (esqueleto) | ✅ Arranca, sin lógica |
| Frontend (esqueleto) | ✅ Arranca, sin páginas |
| Base de datos | ❌ Sin schema ni datos |
| Tests | ❌ Sin implementar |
| CI/CD | ❌ Sin configurar |

---

## Fase 1 — Base de Datos (Flyway Migrations)

> **Prerequisito de todo el backend.** Sin schema no arranca JPA con `ddl-auto: validate`.

### TASK-01: Flyway migration V1 — Schema inicial

**Archivos a crear**:
- `backend/ms-cliente/src/main/resources/db/migration/V1__schema_cliente.sql`
- `backend/ms-cuenta/src/main/resources/db/migration/V1__schema_cuenta.sql`

**Criterios de aceptación**:
- [ ] Tabla `persona` con columnas: id (UUID PK), nombre, genero, edad, identificacion (UNIQUE), direccion, telefono, estado, created_at, updated_at
- [ ] Tabla `cliente` con columnas: cliente_id (UUID PK), persona_id (UUID FK UNIQUE), contrasena, estado, created_at, updated_at
- [ ] Tabla `cliente_ref` en MS-Cuenta: cliente_id (UUID PK), nombre, identificacion *(para reportes — sincronizada vía evento)*
- [ ] Tabla `cuenta` con columnas: cuenta_id (UUID PK), cliente_id (UUID FK), numero_cuenta (UNIQUE), tipo_cuenta, saldo_inicial, saldo, estado, created_at, updated_at
- [ ] Tabla `movimiento` con columnas: movimiento_id (UUID PK), cuenta_id (UUID FK), fecha, tipo_movimiento, valor, saldo_anterior, saldo_actual, descripcion, created_at
- [ ] `CHECK (valor != 0)` en movimiento

### TASK-02: Flyway migration V2 — Índices

**Archivos a crear**:
- `V2__indexes_cliente.sql` en ms-cliente
- `V2__indexes_cuenta.sql` en ms-cuenta

**Criterios de aceptación**:
- [ ] `idx_identificacion` en persona(identificacion)
- [ ] `idx_numero_cuenta` en cuenta(numero_cuenta)
- [ ] `idx_movimiento_cuenta_fecha` en movimiento(cuenta_id, fecha DESC) *(para reportes)*

### TASK-03: Flyway migration V3 — Datos de prueba

**Archivos a crear**:
- `V3__test_data_cliente.sql` en ms-cliente
- `V3__test_data_cuenta.sql` en ms-cuenta

**Criterios de aceptación** (datos del ejercicio):
- [ ] 3 personas + 3 clientes: Jose Lema, Marianela Montalvo, Juan Osorio
- [ ] 5 cuentas según tabla del ejercicio (478758, 225487, 495878, 496825, 585545)
- [ ] 4 movimientos según tabla del ejercicio
- [ ] `cliente_ref` sincronizados con los 3 clientes

### TASK-04: Reactivar Flyway en docker-compose

**Archivo a modificar**: `docker-compose.yml`

**Criterios de aceptación**:
- [ ] `SPRING_FLYWAY_ENABLED: "true"` en ms-cliente y ms-cuenta
- [ ] `SPRING_JPA_HIBERNATE_DDL_AUTO: validate` (restaurar desde `create`)
- [ ] Docker Compose levanta limpiamente con las migraciones aplicadas

---

## Fase 2 — MS-Cliente

> **Dependencias**: Fase 1 completa.

### TASK-05: Estructura DDD + Hexagonal MS-Cliente

**Paquetes a crear** bajo `com.ms_cliente`:

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

**Criterios de aceptación**:
- [ ] Paquetes creados y compilando
- [ ] Ninguna anotación JPA en `domain/`
- [ ] Ninguna referencia a infraestructura en `application/`
- [ ] Los adapters en `infrastructure/` implementan las interfaces de `application/port/out/`
- [ ] Los services en `application/service/` implementan las interfaces de `application/port/in/`

### TASK-06: Entidades de dominio y JPA — MS-Cliente

**Archivos a crear**:
- `domain/model/Persona.java` — POJO con campos del ejercicio
- `domain/model/Cliente.java` — POJO que contiene Persona
- `domain/valueobject/Identificacion.java`, `Contrasena.java`
- `infrastructure/persistence/entity/PersonaEntity.java` — `@Entity`
- `infrastructure/persistence/entity/ClienteEntity.java` — `@Entity`
- `infrastructure/persistence/repository/ClienteJpaRepository.java`
- `infrastructure/persistence/mapper/ClienteEntityMapper.java`

**Criterios de aceptación**:
- [ ] `Persona`: nombre, genero, edad, identificacion, direccion, telefono, estado
- [ ] `Cliente`: clienteId, contrasena, estado + referencia a Persona
- [ ] Mappers entre Entity ↔ Domain funcionando

### US-01: CRUD de Clientes (F1)

> Spec completa: [`docs/user-stories/US-01-gestion-clientes.md`](docs/user-stories/US-01-gestion-clientes.md)

**Como** administrador del banco  
**Quiero** crear, consultar, actualizar y eliminar clientes  
**Para** mantener actualizado el registro de personas que operan con el banco

**Use cases**: `CreateClienteUseCase`, `GetClienteUseCase`, `ListClientesUseCase`, `UpdateClienteUseCase`, `DeleteClienteUseCase`

**Criterios de aceptación**:
- [ ] Los 5 endpoints responden según `docs/API_BACKEND.md`
- [ ] POST valida: identificacion único, contraseña ≥ 8 chars, edad, nombre
- [ ] DELETE devuelve 400 si el cliente tiene cuentas
- [ ] Respuestas de error en formato estándar (timestamp, status, message, path)

### TASK-07: Global Exception Handler — MS-Cliente

**Archivo a crear**: `infrastructure/web/exception/GlobalExceptionHandler.java`

**Criterios de aceptación**:
- [ ] `EntityNotFoundException` → 404
- [ ] `BusinessException` → 400
- [ ] `MethodArgumentNotValidException` → 400 con lista de errores
- [ ] Formato estándar en todas las respuestas

### TASK-08: Test unitario — dominio Cliente (F5 Backend)

**Archivo a crear**: `src/test/java/.../domain/model/ClienteTest.java`

**Criterios de aceptación**:
- [ ] Test: contraseña < 8 caracteres lanza excepción de dominio
- [ ] Test: estado inicial `true` al crear un Cliente
- [ ] Test: value object `Contrasena` rechaza contraseñas vacías
- [ ] Sin Spring context — puro JUnit 5

### TASK-09: Evento `cliente-creado` — Publisher (MS-Cliente)

**Archivo a crear**: `infrastructure/messaging/publisher/ClienteCreadoPublisher.java`

**Criterios de aceptación**:
- [ ] Se publica al `cliente-creado-exchange` al crear exitosamente un cliente
- [ ] Payload: `{ clienteId, nombre, identificacion }`
- [ ] Si RabbitMQ no está disponible, el cliente igualmente se crea (degrade gracefully)

### TASK-10: Consumer `movimiento-registrado` — MS-Cliente

**Archivo a crear**: `infrastructure/messaging/consumer/MovimientoRegistradoConsumer.java`

**Criterios de aceptación**:
- [ ] Consume del exchange `movimiento-registrado-exchange`
- [ ] Registra un log INFO con los datos del evento

---

## Fase 3 — MS-Cuenta

> **Dependencias**: TASK-01, TASK-02 (schema en BD).

### TASK-11: Completar dependencias build.gradle — MS-Cuenta

**Archivo a modificar**: `backend/ms-cuenta/build.gradle`

**Criterios de aceptación**:
- [ ] Agregar: `spring-boot-starter-data-jpa`, `flyway-database-postgresql`, `spring-boot-starter-amqp`, `spring-cloud-stream`, `spring-cloud-stream-binder-rabbit`, `lombok`, `postgresql` (runtime)
- [ ] `./gradlew build -x test` sin errores
- [ ] `docker compose build ms-cuenta` exitoso

### TASK-12: Estructura DDD + Hexagonal MS-Cuenta

**Paquetes a crear** bajo `com.ms_cuenta`:

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

### TASK-13: Entidades de dominio y JPA — MS-Cuenta

**Archivos a crear**:
- `domain/model/Cuenta.java`, `Movimiento.java`, `ClienteRef.java`
- `domain/valueobject/Saldo.java`, `NumeroCuenta.java`, `TipoCuenta.java`
- `domain/exception/SaldoInsuficienteException.java`
- Entidades JPA: `CuentaEntity`, `MovimientoEntity`, `ClienteRefEntity`
- Mappers y repositorios JPA correspondientes

### US-02: CRUD de Cuentas (F1)

> Spec completa: [`docs/user-stories/US-02-gestion-cuentas.md`](docs/user-stories/US-02-gestion-cuentas.md)

**Como** administrador del banco  
**Quiero** crear, consultar, actualizar y eliminar cuentas bancarias  
**Para** administrar los productos bancarios asignados a cada cliente

**Criterios de aceptación**:
- [ ] POST valida: numeroCuenta único, tipoCuenta en lista válida, clienteId referenciado en `ClienteRef`
- [ ] DELETE devuelve 400 si la cuenta tiene movimientos
- [ ] Respuestas según `docs/API_BACKEND.md`

### TASK-14: Global Exception Handler — MS-Cuenta

Igual que TASK-07. Incluir handler específico para `SaldoInsuficienteException` → 400 con `"Saldo no disponible"`.

**Archivo a crear**: `infrastructure/web/exception/GlobalExceptionHandler.java`

> Se implementa en esta posición porque `SaldoInsuficienteException` es el handler diferencial
> que solo cobra sentido junto con US-03. Misma relación que TASK-07 con US-01.

### US-03: Registrar Movimiento (F2 + F3) ⭐

> Spec completa: [`docs/user-stories/US-03-registrar-movimiento.md`](docs/user-stories/US-03-registrar-movimiento.md)

**Como** sistema bancario  
**Quiero** registrar depósitos y retiros actualizando el saldo de forma atómica  
**Para** garantizar la trazabilidad y consistencia de todas las transacciones

**Algoritmo** (`RegistrarMovimientoUseCase`, `@Transactional`):
1. Obtener cuenta (lock pesimista)
2. Si retiro y `cuenta.saldo + valor < 0` → `SaldoInsuficienteException("Saldo no disponible")`
3. `saldoAnterior = cuenta.saldo`, `saldoActual = saldoAnterior + valor`
4. Insertar movimiento, actualizar `cuenta.saldo`
5. Publicar evento `movimiento-registrado`

**Criterios de aceptación**:
- [ ] Retiro con saldo insuficiente → 400 con mensaje exacto `"Saldo no disponible"`
- [ ] El saldo no cambia si el movimiento falla
- [ ] Depósito y retiro con saldo suficiente → 201 con saldos coherentes
- [ ] GET, PUT, DELETE `/api/movimientos/{id}` funcionan

### TASK-15: Consumer `cliente-creado` — MS-Cuenta

**Archivo a crear**: `infrastructure/messaging/consumer/ClienteCreadoConsumer.java`

**Criterios de aceptación**:
- [ ] Consume del exchange `cliente-creado-exchange`
- [ ] Persiste o actualiza `ClienteRef` con upsert idempotente

### TASK-16: Publisher `movimiento-registrado` — MS-Cuenta

**Archivo a crear**: `infrastructure/messaging/publisher/MovimientoRegistradoPublisher.java`

**Criterios de aceptación**:
- [ ] Publica al `movimiento-registrado-exchange` tras movimiento exitoso
- [ ] Payload: `{ movimientoId, cuentaId, valor, saldoActual, fecha }`

### US-04: Reporte Estado de Cuenta (F4) ⭐

> Spec completa: [`docs/user-stories/US-04-reporte-estado-cuenta.md`](docs/user-stories/US-04-reporte-estado-cuenta.md)

**Como** cliente del banco  
**Quiero** consultar el estado de mis cuentas y movimientos en un período  
**Para** revisar mi historial financiero

**Criterios de aceptación**:
- [ ] GET `/api/reportes?clienteId=X&desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
- [ ] Respuesta incluye nombre del cliente (de `ClienteRef`)
- [ ] Sin `desde`/`hasta` usa inicio de año y hoy como defaults
- [ ] Cuentas sin movimientos en el rango aparecen con lista vacía

### TASK-17: Test de integración — MS-Cuenta (F6 deseable)

**Archivo a crear**: `src/test/java/.../RegistrarMovimientoIntegrationTest.java`

**Criterios de aceptación**:
- [ ] Test: depósito actualiza saldo en BD
- [ ] Test: retiro con saldo insuficiente → 400 + `"Saldo no disponible"` y saldo sin cambio

---

## Fase 4 — Frontend Next.js

> **Dependencias**: Backend Node.js en puerto 3002 corriendo.

### TASK-18: Setup estructura y capa de servicios

**Estructura**:
```
src/
  domain/models/Product.ts
  application/usecases/   ← listProducts, createProduct, updateProduct, deleteProduct
  application/hooks/      ← useProducts, useProductForm, useSearch
  infrastructure/api/productService.ts
  presentation/components/
```

**Criterios de aceptación**:
- [ ] `productService.ts` implementa: `getAll`, `create`, `update`, `remove`, `verifyId`
- [ ] `NEXT_PUBLIC_API_BASE_URL=http://localhost:3002` configurado
- [ ] TypeScript estricto, sin `any`

### US-05: Listado + búsqueda + contador (F1, F2, F3)

> Spec completa: [`docs/user-stories/US-05-listado-busqueda-productos.md`](docs/user-stories/US-05-listado-busqueda-productos.md)

**Como** usuario del portal bancario  
**Quiero** ver, buscar y conocer la cantidad de productos financieros disponibles  
**Para** explorar fácilmente las opciones del banco

**Componentes**: `ProductList`, `ProductCard`, `SearchBar`, `RecordCount`

**Criterios de aceptación**:
- [ ] Lista completa al cargar, estado de carga y error visibles
- [ ] Búsqueda filtra en tiempo real, sin llamar al API
- [ ] Contador actualizado con el filtro activo
- [ ] CSS propio (sin frameworks de estilos)

### US-06: Formulario crear producto (F4)

> Spec completa: [`docs/user-stories/US-06-crear-producto.md`](docs/user-stories/US-06-crear-producto.md)

**Como** administrador del portal bancario  
**Quiero** agregar nuevos productos financieros con validaciones  
**Para** ampliar el catálogo del banco

**Criterios de aceptación**:
- [ ] Validaciones por campo según `docs/API_FRONTEND.md`
- [ ] ID verifica unicidad al perder foco (`/verification/:id`)
- [ ] Fecha Revisión auto-calculada (1 año después de Fecha Liberación)
- [ ] "Agregar" no envía si hay errores; "Reiniciar" limpia todo

### US-07: Editar producto (F5 — deseable)

> Spec completa: [`docs/user-stories/US-07-editar-producto.md`](docs/user-stories/US-07-editar-producto.md)

**Como** administrador del portal bancario  
**Quiero** editar productos financieros existentes  
**Para** mantener actualizado el catálogo sin perder el identificador original

**Criterios de aceptación**:
- [ ] Pre-carga valores actuales; campo ID deshabilitado
- [ ] Mismas validaciones que US-06 excepto verificación de unicidad de ID

### TASK-19: Tests unitarios Frontend (Jest)

**Criterios de aceptación**:
- [ ] `productService.test.ts`, `SearchBar.test.tsx`, `ProductForm.test.tsx`
- [ ] Cobertura ≥ 70%

---

## Fase 5 — CI/CD

### TASK-20: GitHub Actions — Pipeline CI

**Archivo a crear**: `.github/workflows/ci.yml`

**Jobs**: `backend-ms-cliente`, `backend-ms-cuenta`, `frontend`  
**Trigger**: push a `main`/`develop`, PR a `main`

**Criterios de aceptación**:
- [ ] Build y tests pasan en verde en GitHub Actions

---

## Fase 6 — Entregables finales

### TASK-21: Generar `BaseDatos.sql`

```bash
docker exec banco-postgres pg_dump -U postgres banco_db > backend/BaseDatos.sql
```

### TASK-22: Colección Postman

- Carpetas: "MS-Cliente" y "MS-Cuenta"
- Variables: `base_cliente`, `base_cuenta`
- Casos del ejercicio: 3 clientes, 5 cuentas, 4 movimientos, reporte Marianela

### TASK-23: Actualizar README.md

- Quick Start verificado y funcional
- Referencias a docs correctas
- Instrucciones para el backend Node.js de productos

---

## Orden de implementación

```
Fase 1: TASK-01 → TASK-02 → TASK-03 → TASK-04
                     ↓
Fase 2: TASK-05 → TASK-06 → US-01 → TASK-07 → TASK-08 → TASK-09 → TASK-10
                     ↓ (puede ir en paralelo con Fase 2)
Fase 3: TASK-11 → TASK-12 → TASK-13 → US-02 → US-03 → US-04 → TASK-14 → TASK-15 → TASK-16 → TASK-17
                     ↓ (puede ir en paralelo con Fases 2 y 3)
Fase 4: TASK-18 → US-05 → US-06 → US-07 → TASK-19
                     ↓ (en cualquier momento)
Fase 5: TASK-20
                     ↓ (al finalizar todo)
Fase 6: TASK-21 → TASK-22 → TASK-23
```

---

## Cobertura de requisitos

| Requisito ejercicio | Ítem | Estado |
|---|---|---|
| F1 Backend — CRUD Cliente | US-01 | Pendiente |
| F1 Backend — CRUD Cuenta | US-02 | Pendiente |
| F1 Backend — CRUD Movimiento | US-03 | Pendiente |
| F2 Backend — Registrar movimiento | US-03 | Pendiente |
| F3 Backend — Saldo no disponible | US-03 | Pendiente |
| F4 Backend — Reporte estado de cuenta | US-04 | Pendiente |
| F5 Backend — Test unitario Cliente | TASK-08 | Pendiente |
| F6 Backend — Test integración (deseable) | TASK-17 | Pendiente |
| Comunicación asincrónica | TASK-09, TASK-10, TASK-15, TASK-16 | Pendiente |
| F1 Frontend — Listado productos | US-05 | Pendiente |
| F2 Frontend — Búsqueda | US-05 | Pendiente |
| F3 Frontend — Contador | US-05 | Pendiente |
| F4 Frontend — Agregar producto | US-06 | Pendiente |
| F5 Frontend — Editar (deseable) | US-07 | Pendiente |
| Tests frontend ≥ 70% coverage | TASK-19 | Pendiente |
| CI/CD | TASK-20 | Pendiente |
| Docker Compose (F7) | ✅ Completo | Listo |
