# Plan de Acción — Sistema Bancario SemiSenior

Desarrollo paso a paso del backend (Spring Boot microservicios) y frontend (Next.js catálogo de productos).

**Perfil**: SemiSenior  
**Stack**: Java 21 + Spring Boot 4, Next.js 16, PostgreSQL, RabbitMQ, Docker  
**Requisitos cubiertos**: F1–F5 Backend + F1–F4 Frontend (F5 Frontend deseable)

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

### HU-01: Flyway migration V1 — Schema inicial

**Como** desarrollador  
**Quiero** crear el schema de BD con Flyway  
**Para** que ambos microservicios puedan persistir sus entidades

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

### HU-02: Flyway migration V2 — Índices

**Archivos a crear**:
- `V2__indexes_cliente.sql` en ms-cliente
- `V2__indexes_cuenta.sql` en ms-cuenta

**Criterios de aceptación**:
- [ ] `idx_identificacion` en persona(identificacion)
- [ ] `idx_numero_cuenta` en cuenta(numero_cuenta)
- [ ] `idx_movimiento_cuenta_fecha` en movimiento(cuenta_id, fecha DESC) *(para reportes)*

### HU-03: Flyway migration V3 — Datos de prueba

**Archivos a crear**:
- `V3__test_data_cliente.sql` en ms-cliente
- `V3__test_data_cuenta.sql` en ms-cuenta

**Criterios de aceptación** (datos del ejercicio):
- [ ] 3 personas + 3 clientes: Jose Lema, Marianela Montalvo, Juan Osorio
- [ ] 5 cuentas según tabla del ejercicio (478758, 225487, 495878, 496825, 585545)
- [ ] 4 movimientos según tabla del ejercicio
- [ ] `cliente_ref` sincronizados con los 3 clientes

### HU-04: Reactivar Flyway en docker-compose

**Archivo a modificar**: `docker-compose.yml`

**Criterios de aceptación**:
- [ ] `SPRING_FLYWAY_ENABLED: "true"` en ms-cliente y ms-cuenta
- [ ] `SPRING_JPA_HIBERNATE_DDL_AUTO: validate` (restaurar desde `create`)
- [ ] Docker Compose levanta limpiamente con las migraciones aplicadas

---

## Fase 2 — MS-Cliente

> **Dependencias**: Fase 1 completa.

### HU-05: Estructura DDD + Hexagonal MS-Cliente

**Paquetes a crear** bajo `com.ms_cliente`:

```
application/
  port/
    in/          ← interfaces de casos de uso (puertos de entrada)
    out/         ← interfaces de repositorio/eventos (puertos de salida)
  service/       ← implementaciones de los puertos in (lógica de aplicación)

domain/
  event/         ← ClienteCreadoEvent.java (record puro, sin Spring)
  exception/     ← ClienteNotFoundException.java, ClienteConCuentasException.java
  model/         ← Persona.java, Cliente.java (POJO sin anotaciones JPA)
  valueobject/   ← Identificacion.java, Contrasena.java, NombreCompleto.java

infrastructure/
  config/        ← RabbitMQConfig.java, beans de Spring Cloud Stream
  messaging/
    publisher/   ← ClienteCreadoPublisher.java (implementa port/out)
    consumer/    ← MovimientoRegistradoConsumer.java
  persistence/
    adapter/     ← ClientePersistenceAdapter.java (implementa port/out)
    entity/      ← PersonaEntity.java, ClienteEntity.java (@Entity JPA)
    mapper/      ← ClienteEntityMapper.java (Entity ↔ Domain)
    repository/  ← ClienteJpaRepository.java (Spring Data JPA)
  web/
    controller/  ← ClienteController.java
    dto/
      request/   ← CreateClienteRequest.java, UpdateClienteRequest.java
      response/  ← ClienteResponse.java, ClienteSummaryResponse.java
    exception/   ← GlobalExceptionHandler.java (@RestControllerAdvice)
    mapper/      ← ClienteDtoMapper.java (Domain ↔ DTO)
```

**Criterios de aceptación**:
- [ ] Paquetes creados y compilando
- [ ] Ninguna anotación JPA ni Spring en `domain/`
- [ ] Ninguna referencia a infraestructura en `application/`
- [ ] Los adapters en `infrastructure/` implementan las interfaces de `application/port/out/`
- [ ] Los services en `application/service/` implementan las interfaces de `application/port/in/`

### HU-06: Entidades de dominio y JPA — MS-Cliente

**Archivos a crear**:
- `domain/model/Persona.java` — POJO con campos del ejercicio
- `domain/model/Cliente.java` — POJO que contiene Persona
- `infrastructure/persistence/entity/PersonaEntity.java` — `@Entity`
- `infrastructure/persistence/entity/ClienteEntity.java` — `@Entity`, herencia/composición
- `infrastructure/persistence/repository/PersonaJpaRepository.java`
- `infrastructure/persistence/repository/ClienteJpaRepository.java`

**Criterios de aceptación**:
- [ ] `Persona`: nombre, genero, edad, identificacion, direccion, telefono, estado
- [ ] `Cliente`: clienteId, contrasena, estado + referencia a Persona
- [ ] Mappers entre Entity ↔ Domain funcionando

### HU-07: CRUD de Clientes (F1)

**Use cases a implementar**:
- `CreateClienteUseCase` — crea Persona + Cliente en transacción
- `GetClienteUseCase` — obtiene por clienteId
- `ListClientesUseCase` — lista todos
- `UpdateClienteUseCase` — actualiza campos permitidos
- `DeleteClienteUseCase` — elimina (RESTRICT si tiene cuentas → 400)

**Controller**: `ClienteController.java`

| Método | Endpoint | Use case |
|---|---|---|
| POST | `/api/clientes` | CreateCliente |
| GET | `/api/clientes` | ListClientes |
| GET | `/api/clientes/{id}` | GetCliente |
| PUT | `/api/clientes/{id}` | UpdateCliente |
| DELETE | `/api/clientes/{id}` | DeleteCliente |

**Criterios de aceptación**:
- [ ] Los 5 endpoints responden según `docs/API_BACKEND.md`
- [ ] POST valida: identificacion único, contraseña ≥ 8 chars, edad, nombre
- [ ] DELETE devuelve 400 si el cliente tiene cuentas (regla de negocio)
- [ ] Respuestas de error en formato estándar (timestamp, status, message, path)

### HU-08: Global Exception Handler — MS-Cliente

**Archivo a crear**: `infrastructure/web/GlobalExceptionHandler.java` (`@RestControllerAdvice`)

**Criterios de aceptación**:
- [ ] `EntityNotFoundException` → 404
- [ ] `BusinessException` ("Saldo no disponible", "Cliente con cuentas") → 400
- [ ] `MethodArgumentNotValidException` (Bean Validation) → 400 con lista de errores
- [ ] Formato estándar de error en todas las respuestas

### HU-09: Test unitario — dominio Cliente (F5 Backend)

**Archivo a crear**: `src/test/java/.../domain/model/ClienteTest.java`

**Criterios de aceptación**:
- [ ] Test que verifica que no se puede crear un Cliente con contraseña < 8 chars
- [ ] Test que verifica el estado inicial (activo = true) al crear un Cliente
- [ ] Sin Spring context (`@ExtendWith(MockitoExtension.class)` o puro JUnit)

### HU-10: Evento `cliente-creado` — Publisher (MS-Cliente)

**Archivo a crear**: `infrastructure/messaging/publisher/ClienteCreadoPublisher.java`

**Criterios de aceptación**:
- [ ] Se publica al `cliente-creado-exchange` al crear exitosamente un cliente
- [ ] Payload: `{ clienteId, nombre, identificacion }`
- [ ] Publish dentro del mismo `@Transactional` del use case (o en `@TransactionalEventListener`)
- [ ] Si RabbitMQ no está disponible, el cliente igualmente se crea (degrade gracefully)

### HU-11: Consumer `movimiento-registrado` — MS-Cliente

**Archivo a crear**: `infrastructure/messaging/consumer/MovimientoConsumer.java`

**Criterios de aceptación**:
- [ ] Consume del exchange `movimiento-registrado-exchange`
- [ ] Registra un log con los datos del evento (auditoría)

---

## Fase 3 — MS-Cuenta

> **Dependencias**: HU-01, HU-02 (schema en BD).  
> MS-Cuenta es independiente de MS-Cliente en tiempo de ejecución.

### HU-12: Completar dependencias build.gradle — MS-Cuenta

**Archivo a modificar**: `backend/ms-cuenta/build.gradle`

**Criterios de aceptación**:
- [ ] Agregar: `spring-boot-starter-data-jpa`, `flyway-database-postgresql`, `spring-boot-starter-amqp`, `spring-cloud-stream`, `spring-cloud-stream-binder-rabbit`, `lombok`, `postgresql` (runtime)
- [ ] Reconstruir imagen Docker sin errores
- [ ] Ajustar `settings.gradle` si es necesario

### HU-13: Estructura DDD + Hexagonal MS-Cuenta

**Paquetes a crear** bajo `com.ms_cuenta`:

```
application/
  port/
    in/          ← CreateCuentaUseCase.java, RegistrarMovimientoUseCase.java, etc.
    out/         ← CuentaRepositoryPort.java, MovimientoRepositoryPort.java, etc.
  service/       ← CuentaService.java, MovimientoService.java, ReporteService.java

domain/
  event/         ← MovimientoRegistradoEvent.java, ClienteCreadoEvent.java (records)
  exception/     ← SaldoInsuficienteException.java, CuentaNotFoundException.java
  model/         ← Cuenta.java, Movimiento.java, ClienteRef.java
  valueobject/   ← NumeroCuenta.java, Saldo.java, TipoCuenta.java (enum/VO)

infrastructure/
  config/        ← RabbitMQConfig.java
  messaging/
    publisher/   ← MovimientoRegistradoPublisher.java (implementa port/out)
    consumer/    ← ClienteCreadoConsumer.java
  persistence/
    adapter/     ← CuentaPersistenceAdapter.java, MovimientoPersistenceAdapter.java
    entity/      ← CuentaEntity.java, MovimientoEntity.java, ClienteRefEntity.java
    mapper/      ← CuentaEntityMapper.java, MovimientoEntityMapper.java
    repository/  ← CuentaJpaRepository.java, MovimientoJpaRepository.java, ClienteRefJpaRepository.java
  web/
    controller/  ← CuentaController.java, MovimientoController.java, ReporteController.java
    dto/
      request/   ← CreateCuentaRequest.java, RegistrarMovimientoRequest.java
      response/  ← CuentaResponse.java, MovimientoResponse.java, ReporteResponse.java
    exception/   ← GlobalExceptionHandler.java (@RestControllerAdvice)
    mapper/      ← CuentaDtoMapper.java, MovimientoDtoMapper.java
```

### HU-14: Entidades de dominio y JPA — MS-Cuenta

**Archivos a crear**:
- `domain/model/Cuenta.java`, `Movimiento.java`, `ClienteRef.java`
- `infrastructure/persistence/entity/CuentaEntity.java`, `MovimientoEntity.java`, `ClienteRefEntity.java`
- JPA repositories correspondientes

**Criterios de aceptación**:
- [ ] `ClienteRef` tiene: clienteId, nombre, identificacion
- [ ] `Cuenta` tiene: cuentaId, clienteId, numeroCuenta, tipoCuenta, saldoInicial, saldo, estado
- [ ] `Movimiento` tiene: movimientoId, cuentaId, fecha, tipoMovimiento, valor, saldoAnterior, saldoActual, descripcion

### HU-15: CRUD de Cuentas (F1)

**Use cases**: CreateCuenta, GetCuenta, ListCuentas, UpdateCuenta, DeleteCuenta

| Método | Endpoint |
|---|---|
| POST | `/api/cuentas` |
| GET | `/api/cuentas` |
| GET | `/api/cuentas/{id}` |
| PUT | `/api/cuentas/{id}` |
| DELETE | `/api/cuentas/{id}` |

**Criterios de aceptación**:
- [ ] POST valida: numeroCuenta único, tipoCuenta en lista válida, clienteId referenciado en `ClienteRef`
- [ ] DELETE devuelve 400 si la cuenta tiene movimientos
- [ ] Respuestas según `docs/API_BACKEND.md`

### HU-16: Registrar Movimiento (F2 + F3) ⭐

**Use case**: `RegistrarMovimientoUseCase` — lógica crítica con `@Transactional`

**Algoritmo**:
1. Obtener cuenta (FOR UPDATE / lock pesimista)
2. Si es retiro (`valor < 0`): verificar `cuenta.saldo + valor >= 0`  
   → Si falla: lanzar `SaldoInsuficienteException("Saldo no disponible")`
3. Insertar movimiento con `saldoAnterior = cuenta.saldo`, `saldoActual = cuenta.saldo + valor`
4. Actualizar `cuenta.saldo += valor`
5. Publicar evento `movimiento-registrado`

**Criterios de aceptación**:
- [ ] POST `/api/movimientos` crea el movimiento y actualiza saldo en una sola transacción
- [ ] Retiro con saldo insuficiente → 400 con mensaje `"Saldo no disponible"`
- [ ] Depósito y retiro con saldo suficiente → 201 con saldos coherentes
- [ ] GET, PUT, DELETE `/api/movimientos/{id}` funcionan correctamente

### HU-17: Reporte Estado de Cuenta (F4) ⭐

**Use case**: `GenerarReporteUseCase`

**Query**: JOIN cuenta + movimiento + cliente_ref WHERE clienteId = ? AND fecha BETWEEN ? AND ?

**Criterios de aceptación**:
- [ ] GET `/api/reportes?clienteId=X&desde=YYYY-MM-DD&hasta=YYYY-MM-DD`
- [ ] Respuesta incluye nombre del cliente (de `ClienteRef`)
- [ ] Respuesta incluye lista de cuentas con sus movimientos en el rango
- [ ] Si `desde`/`hasta` no se pasan, usa inicio de año y hoy
- [ ] Respuesta formato según `docs/API_BACKEND.md`

### HU-18: Global Exception Handler — MS-Cuenta

Igual que HU-08 pero para MS-Cuenta. Incluir `SaldoInsuficienteException`.

### HU-19: Evento `cliente-creado` — Consumer (MS-Cuenta)

**Archivo a crear**: `infrastructure/messaging/consumer/ClienteCreadoConsumer.java`

**Criterios de aceptación**:
- [ ] Consume del exchange `cliente-creado-exchange`
- [ ] Persiste o actualiza `ClienteRef` con los datos recibidos
- [ ] Operación idempotente (upsert)

### HU-20: Evento `movimiento-registrado` — Publisher (MS-Cuenta)

**Archivo a crear**: `infrastructure/messaging/publisher/MovimientoRegistradoPublisher.java`

**Criterios de aceptación**:
- [ ] Publica al `movimiento-registrado-exchange` tras registrar movimiento exitosamente
- [ ] Payload: `{ movimientoId, cuentaId, valor, saldoActual, fecha }`

### HU-21: Test de integración — MS-Cuenta (F6 deseable)

**Archivo a crear**: `src/test/java/.../RegistrarMovimientoIntegrationTest.java`

**Criterios de aceptación**:
- [ ] Usa `@SpringBootTest` con base H2 o Testcontainers (PostgreSQL)
- [ ] Test: depósito actualiza saldo correctamente
- [ ] Test: retiro con saldo insuficiente devuelve 400 + `"Saldo no disponible"`

---

## Fase 4 — Frontend Next.js

> **Dependencias**: El backend Node.js en puerto 3002 debe estar corriendo.

### HU-22: Setup estructura y capa de servicios

**Estructura de carpetas**:
```
src/
  domain/
    models/       ← Product.ts (interfaz de dominio)
  application/
    usecases/     ← listProducts.ts, createProduct.ts, etc.
  infrastructure/
    api/          ← productService.ts (fetch al API :3002)
  presentation/
    components/   ← ProductCard, ProductList, SearchBar, etc.
    pages/ (app/) ← page.tsx, products/new/page.tsx, products/[id]/edit/page.tsx
    hooks/        ← useProducts.ts
```

**Criterios de aceptación**:
- [ ] `NEXT_PUBLIC_API_BASE_URL=http://localhost:3002` configurado
- [ ] `productService.ts` implementa: getAll, create, update, delete, verifyId
- [ ] TypeScript estricto, sin `any`

### HU-23: Listado de productos + búsqueda + contador (F1, F2, F3)

**Componentes a crear**:
- `ProductList` — lista todos los productos del API
- `SearchBar` — filtra la lista por nombre/descripción en el cliente
- `RecordCount` — muestra `N resultados`

**Criterios de aceptación**:
- [ ] Al cargar la página se muestra la lista completa de productos
- [ ] El buscador filtra en tiempo real (sin llamada al API)
- [ ] Se muestra el contador de registros actualizándose con el filtro
- [ ] Estado de carga (loading) y estado de error visibles
- [ ] Sin frameworks de estilos (CSS propio / CSS Modules)

### HU-24: Formulario crear producto (F4)

**Página**: `/products/new`

**Criterios de aceptación**:
- [ ] Campos: id, name, description, logo, date_release, date_revision
- [ ] Validaciones client-side antes de enviar:
  - id: requerido, 3-10 chars, ID no existente (llama `/verification/:id`)
  - name: requerido, 5-100 chars
  - description: requerido, 10-200 chars
  - logo: requerido
  - date_release: requerido, ≥ hoy
  - date_revision: requerido, exactamente 1 año después de date_release (auto-calculado)
- [ ] Errores mostrados bajo cada campo
- [ ] Botón "Agregar" envía al API, redirige al listado en éxito
- [ ] Botón "Reiniciar" limpia todos los campos

### HU-25: Editar producto (F5 — deseable)

**Página**: `/products/[id]/edit`

**Criterios de aceptación**:
- [ ] Pre-carga los valores actuales del producto
- [ ] Campo `id` deshabilitado (no editable)
- [ ] Mismas validaciones de F4 (excepto verificación de unicidad de ID)
- [ ] Botón "Actualizar" llama PUT al API
- [ ] Redirige al listado en éxito

### HU-26: Tests unitarios Frontend (Jest)

**Criterios de aceptación**:
- [ ] `productService.test.ts` — mock de fetch, verifica llamadas al API
- [ ] `SearchBar.test.tsx` — verifica filtrado correcto
- [ ] `ProductForm.test.tsx` — verifica validaciones (mínimo: id vacío, date_release pasada)
- [ ] Cobertura ≥ 70% en componentes principales

---

## Fase 5 — CI/CD

> Configurable en paralelo con las fases anteriores.

### HU-27: GitHub Actions — Pipeline CI

**Archivo a crear**: `.github/workflows/ci.yml`

**Jobs**:

```
backend-ms-cliente:
  - Checkout
  - Setup Java 21
  - ./gradlew build -x test
  - ./gradlew test

backend-ms-cuenta:
  - Checkout
  - Setup Java 21
  - ./gradlew build -x test
  - ./gradlew test

frontend:
  - Checkout
  - Setup Node 20
  - npm ci
  - npm run build
  - npm test -- --coverage
```

**Criterios de aceptación**:
- [ ] Pipeline ejecuta en push a `main` y `develop`
- [ ] Pipeline ejecuta en Pull Requests a `main`
- [ ] Tests de backend y frontend pasan en CI
- [ ] Build de Docker no falla (puede ser job adicional opcional)

---

## Fase 6 — Entregables finales

### HU-28: Generar `BaseDatos.sql`

El ejercicio pide un script de BD con el nombre `BaseDatos.sql`.

```bash
# Exportar desde el contenedor PostgreSQL:
docker exec banco-postgres pg_dump -U postgres banco_db > backend/BaseDatos.sql
```

**Criterios de aceptación**:
- [ ] `backend/BaseDatos.sql` contiene schema completo + datos de prueba
- [ ] El archivo es ejecutable desde cero (CREATE TABLE, INSERT)

### HU-29: Colección Postman

**Criterios de aceptación**:
- [ ] Colección con todos los endpoints de MS-Cliente y MS-Cuenta
- [ ] Variables de entorno: `{{base_cliente}}=http://localhost:8081`, `{{base_cuenta}}=http://localhost:8082`
- [ ] Requests de los casos de uso del ejercicio: crear clientes, cuentas, movimientos, reporte

### HU-30: Actualizar README.md

**Criterios de aceptación**:
- [ ] Quick Start funcional y verificado
- [ ] Referencias correctas a los docs (`ARCHITECTURE.md`, no `ARQUITECTURA.md`)
- [ ] Instrucciones para correr el backend Node.js de productos

---

## Orden de implementación recomendado

```
Fase 1 (BD)        → HU-01 → HU-02 → HU-03 → HU-04
                               ↓
Fase 2 (MS-Cliente) → HU-05 → HU-06 → HU-07 → HU-08 → HU-09 → HU-10 → HU-11
                               ↓ (paralelo)
Fase 3 (MS-Cuenta)  → HU-12 → HU-13 → HU-14 → HU-15 → HU-16 → HU-17 → HU-18 → HU-19 → HU-20 → HU-21
                               ↓ (paralelo)
Fase 4 (Frontend)   → HU-22 → HU-23 → HU-24 → HU-25 → HU-26
                               ↓ (cualquier momento)
Fase 5 (CI/CD)      → HU-27
                               ↓ (al final)
Fase 6 (Entregables) → HU-28 → HU-29 → HU-30
```

Fases 2, 3 y 4 pueden ejecutarse en paralelo una vez que la Fase 1 está completa.

---

## Resumen de cobertura por requisito

| Requisito | HU | Estado |
|---|---|---|
| F1 Backend — CRUD Cliente | HU-07 | Pendiente |
| F1 Backend — CRUD Cuenta | HU-15 | Pendiente |
| F1 Backend — CRUD Movimiento | HU-16 | Pendiente |
| F2 Backend — Registrar movimiento con saldo | HU-16 | Pendiente |
| F3 Backend — Saldo no disponible | HU-16 | Pendiente |
| F4 Backend — Reporte estado de cuenta | HU-17 | Pendiente |
| F5 Backend — Test unitario Cliente | HU-09 | Pendiente |
| F6 Backend — Test integración (deseable) | HU-21 | Pendiente |
| Comunicación asincrónica | HU-10, HU-11, HU-19, HU-20 | Pendiente |
| F1 Frontend — Listado productos | HU-23 | Pendiente |
| F2 Frontend — Búsqueda | HU-23 | Pendiente |
| F3 Frontend — Contador | HU-23 | Pendiente |
| F4 Frontend — Agregar producto | HU-24 | Pendiente |
| F5 Frontend — Editar (deseable) | HU-25 | Pendiente |
| Tests frontend ≥ 70% coverage | HU-26 | Pendiente |
| CI/CD | HU-27 | Pendiente |
| Docker Compose (F7) | ✅ Completo | Listo |
