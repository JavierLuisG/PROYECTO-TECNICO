# GitHub Issues — Copia/Pega para GitHub Projects

> Archivo temporal. Eliminar después de crear los issues en GitHub.  
> Crear primero los Milestones y Labels antes de los issues.

---

## Setup previo en GitHub

### Milestones

| Nombre | Descripción |
|---|---|
| `Milestone 1 — Base de Datos` | Schema, índices y datos de prueba con Flyway |
| `Milestone 2 — MS-Cliente` | Microservicio de gestión de clientes |
| `Milestone 3 — MS-Cuenta` | Microservicio de cuentas, movimientos y reportes |
| `Milestone 4 — Frontend` | Catálogo de productos financieros (Next.js) |
| `Milestone 5 — CI/CD` | Pipeline de integración continua |
| `Milestone 6 — Entregables` | Artefactos finales para entrega |

### Labels

| Label | Color sugerido | Descripción |
|---|---|---|
| `user-story` | `#0075ca` | Historia de usuario con criterios funcionales |
| `technical-task` | `#e4e669` | Tarea técnica de implementación |
| `backend` | `#d93f0b` | Trabajo en microservicios Spring Boot |
| `frontend` | `#0e8a16` | Trabajo en Next.js |
| `database` | `#5319e7` | Migraciones y schema de BD |
| `infrastructure` | `#1d76db` | Docker, CI/CD, configuración |
| `messaging` | `#f9d0c4` | RabbitMQ y eventos |
| `test` | `#c5def5` | Tests unitarios e integración |
| `critical` | `#b60205` | Lógica crítica de negocio |
| `deseable` | `#bfd4f2` | Funcionalidad deseable (no bloqueante) |

---

## MILESTONE 1 — Base de Datos

---

### Issue #1

**Título:** `[TASK] Crear schema inicial de base de datos con Flyway (V1)`  
**Labels:** `technical-task` `backend` `database`  
**Milestone:** Milestone 1 — Base de Datos  
**Referencia:** TASK-01

**Descripción:**
Crear los scripts de migración Flyway V1 con el schema completo de la base de datos bancaria. Ambos microservicios necesitan este schema para que JPA pueda validar las entidades al iniciar.

**Tareas:**
- [ ] Crear `V1__schema_cliente.sql` en `ms-cliente/src/main/resources/db/migration/`
  - Tabla `persona` (id UUID PK, nombre, genero, edad, identificacion UNIQUE, direccion, telefono, estado, created_at, updated_at)
  - Tabla `cliente` (cliente_id UUID PK, persona_id UUID FK UNIQUE, contrasena, estado, created_at, updated_at)
- [ ] Crear `V1__schema_cuenta.sql` en `ms-cuenta/src/main/resources/db/migration/`
  - Tabla `cliente_ref` (cliente_id UUID PK, nombre, identificacion)
  - Tabla `cuenta` (cuenta_id UUID PK, cliente_id UUID, numero_cuenta UNIQUE, tipo_cuenta, saldo_inicial, saldo, estado, created_at, updated_at)
  - Tabla `movimiento` (movimiento_id UUID PK, cuenta_id UUID FK, fecha, tipo_movimiento, valor CHECK != 0, saldo_anterior, saldo_actual, descripcion, created_at)
- [ ] Verificar que Spring Boot levanta sin errores de Flyway

**Dependencias:** Ninguna

---

### Issue #2

**Título:** `[TASK] Añadir índices de performance con Flyway (V2)`  
**Labels:** `technical-task` `backend` `database`  
**Milestone:** Milestone 1 — Base de Datos  
**Referencia:** TASK-02

**Descripción:**
Crear índices estratégicos para optimizar las consultas más frecuentes, especialmente el reporte de estado de cuenta.

**Tareas:**
- [ ] Crear `V2__indexes_cliente.sql`: índices en `persona(identificacion)`, `cliente(persona_id)`, `cliente(estado)`
- [ ] Crear `V2__indexes_cuenta.sql`: índices en `cuenta(cliente_id)`, `cuenta(numero_cuenta)`, `movimiento(cuenta_id, fecha DESC)` (índice compuesto para reportes)
- [ ] Verificar que los índices se aplican correctamente en el contenedor PostgreSQL

**Dependencias:** Issue #1

---

### Issue #3

**Título:** `[TASK] Insertar datos de prueba del ejercicio con Flyway (V3)`  
**Labels:** `technical-task` `backend` `database`  
**Milestone:** Milestone 1 — Base de Datos  
**Referencia:** TASK-03

**Descripción:**
Poblar la base de datos con los datos del ejercicio para poder verificar los casos de uso sin tener que crear datos manualmente.

**Tareas:**
- [ ] Crear `V3__test_data_cliente.sql`:
  - 3 personas: Jose Lema, Marianela Montalvo, Juan Osorio
  - 3 clientes con contraseña hasheada
- [ ] Crear `V3__test_data_cuenta.sql`:
  - 3 registros en `cliente_ref` (sincronizados con los clientes)
  - 5 cuentas (478758 Ahorro/JL, 585545 Corriente/JL, 225487 Corriente/MM, 496825 Ahorro/MM, 495878 Ahorro/JO)
  - 4 movimientos según el ejercicio (retiro 478758, depósito 225487, depósito 495878, retiro 496825)
- [ ] Verificar saldos finales contra los del ejercicio

**Dependencias:** Issue #1

---

### Issue #4

**Título:** `[TASK] Reactivar Flyway y ddl-auto:validate en docker-compose`  
**Labels:** `technical-task` `infrastructure` `database`  
**Milestone:** Milestone 1 — Base de Datos  
**Referencia:** TASK-04

**Descripción:**
Actualmente docker-compose tiene Flyway deshabilitado y ddl-auto en `create` (estado temporal del setup inicial). Restaurar la configuración correcta una vez los scripts de migración estén listos.

**Tareas:**
- [ ] Cambiar `SPRING_FLYWAY_ENABLED` de `"false"` a `"true"` en ambos servicios
- [ ] Cambiar `SPRING_JPA_HIBERNATE_DDL_AUTO` de `create` a `validate` en ambos servicios
- [ ] Verificar que `docker compose down -v && docker compose up -d` levanta limpiamente con las migraciones
- [ ] Verificar datos de prueba cargados consultando PostgreSQL

**Dependencias:** Issues #1, #2, #3

---

## MILESTONE 2 — MS-Cliente

---

### Issue #5

**Título:** `[TASK] Setup estructura DDD + Hexagonal en MS-Cliente`  
**Labels:** `technical-task` `backend`  
**Milestone:** Milestone 2 — MS-Cliente  
**Referencia:** TASK-05

**Descripción:**
Crear la estructura de paquetes DDD + Hexagonal en MS-Cliente. Sin esta base no se puede implementar ninguna lógica de negocio.

**Tareas:**
- [ ] Crear paquetes bajo `com.ms_cliente`:
  - `application/port/in/`, `application/port/out/`, `application/service/`
  - `domain/event/`, `domain/exception/`, `domain/model/`, `domain/valueobject/`
  - `infrastructure/config/`, `infrastructure/messaging/publisher/`, `infrastructure/messaging/consumer/`
  - `infrastructure/persistence/adapter/`, `infrastructure/persistence/entity/`, `infrastructure/persistence/mapper/`, `infrastructure/persistence/repository/`
  - `infrastructure/web/controller/`, `infrastructure/web/dto/request/`, `infrastructure/web/dto/response/`, `infrastructure/web/exception/`, `infrastructure/web/mapper/`
- [ ] Verificar que el proyecto compila con la nueva estructura (paquetes vacíos son válidos)

**Dependencias:** Issue #4

---

### Issue #6

**Título:** `[TASK] Implementar modelos de dominio y entidades JPA — Persona/Cliente`  
**Labels:** `technical-task` `backend`  
**Milestone:** Milestone 2 — MS-Cliente  
**Referencia:** TASK-06

**Descripción:**
Implementar las clases de dominio puras (sin Spring ni JPA) y sus correspondientes entidades JPA con mappers.

**Tareas:**
- [ ] `domain/model/Persona.java` — POJO con: nombre, genero, edad, identificacion, direccion, telefono, estado
- [ ] `domain/model/Cliente.java` — POJO con: clienteId, persona (embedded), contrasena, estado
- [ ] `domain/valueobject/Identificacion.java` — wrapper con validación de formato
- [ ] `domain/valueobject/Contrasena.java` — wrapper con validación de longitud mínima (≥ 8)
- [ ] `infrastructure/persistence/entity/PersonaEntity.java` — `@Entity @Table("persona")`
- [ ] `infrastructure/persistence/entity/ClienteEntity.java` — `@Entity @Table("cliente")`
- [ ] `infrastructure/persistence/mapper/ClienteEntityMapper.java` — Entity ↔ Domain
- [ ] `infrastructure/persistence/repository/ClienteJpaRepository.java` — Spring Data JPA

**Dependencias:** Issue #5

---

### Issue #7 — USER STORY

**Título:** `[US] Gestión de clientes - CRUD completo`  
**Labels:** `user-story` `backend`  
**Milestone:** Milestone 2 — MS-Cliente  
**Referencia:** US-01 · Spec: `docs/user-stories/US-01-gestion-clientes.md`

**Historia de usuario:**
> **Como** administrador del banco  
> **Quiero** crear, consultar, actualizar y eliminar clientes  
> **Para** mantener actualizado el registro de personas que operan con el banco

**Criterios de aceptación:**
- [ ] POST `/api/clientes` crea cliente (201) — valida identificacion única, contraseña ≥ 8 chars
- [ ] GET `/api/clientes` lista todos los clientes (200)
- [ ] GET `/api/clientes/{id}` retorna cliente (200) o 404 si no existe
- [ ] PUT `/api/clientes/{id}` actualiza datos permitidos (200)
- [ ] DELETE `/api/clientes/{id}` elimina si no tiene cuentas (204) o 400 si tiene cuentas
- [ ] Todos los errores siguen el formato estándar `{ timestamp, status, message, path }`

**Clases involucradas:**
- Ports: `CreateClienteUseCase`, `GetClienteUseCase`, `ListClientesUseCase`, `UpdateClienteUseCase`, `DeleteClienteUseCase`
- Service: `ClienteService`
- Adapter: `ClientePersistenceAdapter`
- Controller: `ClienteController`
- DTOs: `CreateClienteRequest`, `UpdateClienteRequest`, `ClienteResponse`, `ClienteSummaryResponse`

**Dependencias:** Issues #5, #6

---

### Issue #8

**Título:** `[TASK] Manejo global de excepciones REST en MS-Cliente`  
**Labels:** `technical-task` `backend`  
**Milestone:** Milestone 2 — MS-Cliente  
**Referencia:** TASK-07

**Descripción:**
Centralizar el manejo de errores para que todas las respuestas de error tengan formato consistente.

**Tareas:**
- [ ] Crear `infrastructure/web/exception/GlobalExceptionHandler.java` con `@RestControllerAdvice`
- [ ] Handler para `EntityNotFoundException` → 404
- [ ] Handler para `BusinessException` (y subclases como `ClienteConCuentasException`) → 400
- [ ] Handler para `MethodArgumentNotValidException` (Bean Validation) → 400 con lista de errores por campo
- [ ] Handler genérico para `Exception` → 500
- [ ] Formato de respuesta: `{ timestamp, status, error, message, path }`

**Dependencias:** Issue #5

---

### Issue #9

**Título:** `[TASK] Test unitario del modelo de dominio Cliente (F5 Backend)`  
**Labels:** `technical-task` `backend` `test`  
**Milestone:** Milestone 2 — MS-Cliente  
**Referencia:** TASK-08

**Descripción:**
Implementar el test unitario requerido por F5 del ejercicio sobre la entidad de dominio Cliente. Sin dependencias de Spring ni BD.

**Tareas:**
- [ ] Crear `ClienteTest.java` en `src/test/java/.../domain/model/`
- [ ] Test: cliente con contraseña menor a 8 caracteres lanza excepción de dominio
- [ ] Test: cliente recién creado tiene estado `true` por defecto
- [ ] Test: el value object `Contrasena` rechaza contraseñas vacías
- [ ] Usar solo JUnit 5 (`@ExtendWith(MockitoExtension.class)` o puro JUnit) — sin Spring context

**Dependencias:** Issue #6

---

### Issue #10

**Título:** `[TASK] Publicar evento cliente-creado via RabbitMQ`  
**Labels:** `technical-task` `backend` `messaging`  
**Milestone:** Milestone 2 — MS-Cliente  
**Referencia:** TASK-09

**Descripción:**
Publicar el evento `cliente-creado` al crear un cliente exitosamente. MS-Cuenta lo consumirá para sincronizar su `ClienteRef` local y poder incluir el nombre del cliente en reportes.

**Tareas:**
- [ ] Crear `domain/event/ClienteCreadoEvent.java` (record con: clienteId, nombre, identificacion)
- [ ] Crear `infrastructure/messaging/publisher/ClienteCreadoPublisher.java` (implementa port/out)
- [ ] Configurar binding en `infrastructure/config/RabbitMQConfig.java` para `cliente-creado-out-0`
- [ ] Invocar el publisher desde `ClienteService` después de persistir el cliente
- [ ] Verificar publicación en la UI de RabbitMQ (http://localhost:15672)

**Dependencias:** Issue #7

---

### Issue #11

**Título:** `[TASK] Consumir evento movimiento-registrado en MS-Cliente`  
**Labels:** `technical-task` `backend` `messaging`  
**Milestone:** Milestone 2 — MS-Cliente  
**Referencia:** TASK-10

**Descripción:**
MS-Cliente escucha el evento `movimiento-registrado` publicado por MS-Cuenta para registrar auditoría en logs.

**Tareas:**
- [ ] Crear `infrastructure/messaging/consumer/MovimientoRegistradoConsumer.java`
- [ ] Implementar `@Bean` de tipo `Consumer<MovimientoRegistradoEvent>` con Spring Cloud Stream
- [ ] Registrar log con nivel INFO con los datos del evento
- [ ] Verificar que el consumer se activa cuando MS-Cuenta publica un movimiento

**Dependencias:** Issue #10

---

## MILESTONE 3 — MS-Cuenta

---

### Issue #12

**Título:** `[TASK] Completar dependencias Gradle para MS-Cuenta`  
**Labels:** `technical-task` `backend` `infrastructure`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** TASK-11

**Descripción:**
MS-Cuenta solo tiene `spring-boot-starter-web`. Agregar todas las dependencias necesarias para implementar la lógica de negocio.

**Tareas:**
- [ ] Agregar a `build.gradle`: `spring-boot-starter-data-jpa`, `spring-boot-starter-amqp`, `flyway-database-postgresql`, `spring-cloud-stream`, `spring-cloud-stream-binder-rabbit`, `lombok`, `postgresql` (runtime)
- [ ] Agregar dependencias de test: `spring-boot-starter-test`, `h2` (testRuntime) o Testcontainers
- [ ] Agregar `dependencyManagement` para Spring Cloud BOM
- [ ] Verificar `./gradlew build -x test` sin errores
- [ ] Reconstruir imagen Docker: `docker compose build ms-cuenta`

**Dependencias:** Ninguna (puede hacerse en paralelo con Milestone 2)

---

### Issue #13

**Título:** `[TASK] Setup estructura DDD + Hexagonal en MS-Cuenta`  
**Labels:** `technical-task` `backend`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** TASK-12

**Descripción:**
Misma estructura DDD + Hexagonal que MS-Cliente pero adaptada al dominio de cuentas y movimientos.

**Tareas:**
- [ ] Crear paquetes bajo `com.ms_cuenta`:
  - `application/port/in/`, `application/port/out/`, `application/service/`
  - `domain/event/`, `domain/exception/`, `domain/model/`, `domain/valueobject/`
  - `infrastructure/config/`, `infrastructure/messaging/publisher/`, `infrastructure/messaging/consumer/`
  - `infrastructure/persistence/adapter/`, `infrastructure/persistence/entity/`, `infrastructure/persistence/mapper/`, `infrastructure/persistence/repository/`
  - `infrastructure/web/controller/`, `infrastructure/web/dto/request/`, `infrastructure/web/dto/response/`, `infrastructure/web/exception/`, `infrastructure/web/mapper/`
- [ ] Verificar compilación

**Dependencias:** Issue #12

---

### Issue #14

**Título:** `[TASK] Implementar modelos de dominio y entidades JPA — Cuenta/Movimiento`  
**Labels:** `technical-task` `backend`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** TASK-13

**Descripción:**
Implementar las clases de dominio y sus entidades JPA para Cuenta, Movimiento y ClienteRef.

**Tareas:**
- [ ] `domain/model/Cuenta.java` — POJO: cuentaId, clienteId, numeroCuenta, tipoCuenta, saldoInicial, saldo, estado
- [ ] `domain/model/Movimiento.java` — POJO: movimientoId, cuentaId, fecha, tipoMovimiento, valor, saldoAnterior, saldoActual, descripcion
- [ ] `domain/model/ClienteRef.java` — POJO: clienteId, nombre, identificacion
- [ ] `domain/valueobject/Saldo.java` — wrapper BigDecimal con validación `>= 0`
- [ ] `domain/valueobject/NumeroCuenta.java` — wrapper String con validación
- [ ] `domain/valueobject/TipoCuenta.java` — enum: AHORRO, CORRIENTE, TARJETA, DEPOSITO
- [ ] `domain/exception/SaldoInsuficienteException.java`
- [ ] Entidades JPA: `CuentaEntity`, `MovimientoEntity`, `ClienteRefEntity`
- [ ] Mappers y repositorios JPA correspondientes

**Dependencias:** Issue #13

---

### Issue #15 — USER STORY

**Título:** `[US] Gestión de cuentas bancarias - CRUD completo`  
**Labels:** `user-story` `backend`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** US-02 · Spec: `docs/user-stories/US-02-gestion-cuentas.md`

**Historia de usuario:**
> **Como** administrador del banco  
> **Quiero** crear, consultar, actualizar y eliminar cuentas bancarias  
> **Para** administrar los productos bancarios asignados a cada cliente

**Criterios de aceptación:**
- [ ] POST `/api/cuentas` crea cuenta (201) — valida: número único, tipo válido, cliente existente en `ClienteRef`
- [ ] GET `/api/cuentas` lista cuentas, filtrable por `clienteId` y `estado`
- [ ] GET `/api/cuentas/{id}` retorna cuenta (200) o 404
- [ ] PUT `/api/cuentas/{id}` actualiza tipo y estado (200)
- [ ] DELETE `/api/cuentas/{id}` elimina si no tiene movimientos (204) o 400 si tiene

**Dependencias:** Issues #13, #14

---

### Issue #16 — USER STORY ⭐ CRÍTICO

**Título:** `[US] Registro de movimientos con validación de saldo`  
**Labels:** `user-story` `backend` `critical`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** US-03 · Spec: `docs/user-stories/US-03-registrar-movimiento.md`

**Historia de usuario:**
> **Como** sistema bancario  
> **Quiero** registrar depósitos y retiros actualizando el saldo de forma atómica  
> **Para** garantizar la trazabilidad y consistencia de todas las transacciones

**Criterios de aceptación:**
- [ ] POST `/api/movimientos` registra el movimiento y actualiza saldo en una sola transacción (201)
- [ ] Retiro con saldo insuficiente retorna 400 con mensaje exacto `"Saldo no disponible"`
- [ ] El saldo no se modifica si el movimiento falla
- [ ] `saldoAnterior` y `saldoActual` quedan registrados en el movimiento
- [ ] Valor igual a cero retorna 400
- [ ] GET, PUT, DELETE `/api/movimientos/{id}` funcionan correctamente
- [ ] Se publica evento `movimiento-registrado` en RabbitMQ tras éxito

**Algoritmo del use case (referencia para implementación):**
1. Obtener cuenta con lock pesimista (`@Lock(PESSIMISTIC_WRITE)`)
2. Si valor < 0 y `cuenta.saldo + valor < 0` → lanzar `SaldoInsuficienteException`
3. `saldoAnterior = cuenta.saldo`
4. Insertar movimiento con `saldoActual = saldoAnterior + valor`
5. Actualizar `cuenta.saldo = saldoActual`
6. Publicar evento

**Dependencias:** Issues #14, #15

---

### Issue #17 — USER STORY ⭐

**Título:** `[US] Reporte de estado de cuenta por cliente y rango de fechas`  
**Labels:** `user-story` `backend`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** US-04 · Spec: `docs/user-stories/US-04-reporte-estado-cuenta.md`

**Historia de usuario:**
> **Como** cliente del banco  
> **Quiero** consultar el estado de mis cuentas y movimientos en un período  
> **Para** revisar mi historial financiero

**Criterios de aceptación:**
- [ ] GET `/api/reportes?clienteId=X&desde=YYYY-MM-DD&hasta=YYYY-MM-DD` retorna reporte (200)
- [ ] Sin `desde`/`hasta` usa inicio del año actual y hoy como defaults
- [ ] Incluye nombre del cliente (obtenido de `ClienteRef`)
- [ ] Incluye todas las cuentas del cliente con sus movimientos en el rango
- [ ] Cuentas sin movimientos en el rango aparecen con lista vacía
- [ ] Cliente inexistente retorna 404

**Dependencias:** Issues #14, #15, #19

---

### Issue #18

**Título:** `[TASK] Manejo global de excepciones REST en MS-Cuenta`  
**Labels:** `technical-task` `backend`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** TASK-14

**Descripción:**
Mismo patrón que MS-Cliente. Incluir el manejo específico de `SaldoInsuficienteException`.

**Tareas:**
- [ ] Crear `GlobalExceptionHandler.java` con `@RestControllerAdvice`
- [ ] Handler para `SaldoInsuficienteException` → 400 con mensaje `"Saldo no disponible"`
- [ ] Handler para `EntityNotFoundException` → 404
- [ ] Handler para `BusinessException` → 400
- [ ] Handler para `MethodArgumentNotValidException` → 400
- [ ] Handler genérico → 500

**Dependencias:** Issue #13

---

### Issue #19

**Título:** `[TASK] Consumir evento cliente-creado y sincronizar ClienteRef`  
**Labels:** `technical-task` `backend` `messaging`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** TASK-15

**Descripción:**
MS-Cuenta necesita el nombre del cliente para generar reportes. En lugar de llamar a MS-Cliente vía REST, escucha el evento `cliente-creado` y persiste una referencia local (`ClienteRef`). Esto desacopla los servicios.

**Tareas:**
- [ ] Crear `infrastructure/messaging/consumer/ClienteCreadoConsumer.java`
- [ ] Persistir o actualizar `ClienteRef` (upsert) con los datos del evento
- [ ] La operación debe ser idempotente (si llega el mismo evento dos veces, no falla)
- [ ] Verificar que al crear un cliente en MS-Cliente, aparece el registro en `cliente_ref` de la BD

**Dependencias:** Issues #13, #14

---

### Issue #20

**Título:** `[TASK] Publicar evento movimiento-registrado via RabbitMQ`  
**Labels:** `technical-task` `backend` `messaging`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** TASK-16

**Descripción:**
Publicar el evento `movimiento-registrado` tras registrar un movimiento exitosamente. MS-Cliente lo consume para auditoría.

**Tareas:**
- [ ] Crear `domain/event/MovimientoRegistradoEvent.java` (record: movimientoId, cuentaId, valor, saldoActual, fecha)
- [ ] Crear `infrastructure/messaging/publisher/MovimientoRegistradoPublisher.java`
- [ ] Configurar binding en `RabbitMQConfig.java` para `movimiento-registrado-out-0`
- [ ] Invocar publisher desde el use case `RegistrarMovimientoUseCase` tras persistir el movimiento
- [ ] Verificar en RabbitMQ UI que el evento llega al exchange correcto

**Dependencias:** Issue #16

---

### Issue #21

**Título:** `[TASK] Test de integración — flujo registrar movimiento (F6 deseable)`  
**Labels:** `technical-task` `backend` `test` `deseable`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Referencia:** TASK-17

**Descripción:**
Test de integración que verifica el flujo completo de registro de movimiento con base de datos real (H2 o Testcontainers).

**Tareas:**
- [ ] Crear `RegistrarMovimientoIntegrationTest.java` con `@SpringBootTest`
- [ ] Test 1: depósito actualiza saldo correctamente en BD
- [ ] Test 2: retiro con saldo suficiente actualiza saldo correctamente
- [ ] Test 3: retiro con saldo insuficiente retorna 400 + `"Saldo no disponible"` y NO modifica el saldo
- [ ] Usar `@Transactional` + rollback o truncar tablas entre tests para aislamiento

**Dependencias:** Issue #16

---

## MILESTONE 4 — Frontend

---

### Issue #22

**Título:** `[TASK] Setup estructura por capas y servicio API en frontend`  
**Labels:** `technical-task` `frontend`  
**Milestone:** Milestone 4 — Frontend  
**Referencia:** TASK-18

**Descripción:**
Crear la estructura de carpetas por capas y el servicio de API que centraliza todas las llamadas al backend Node.js en :3002.

**Tareas:**
- [ ] Crear estructura: `domain/models/`, `application/usecases/`, `application/hooks/`, `infrastructure/api/`, `presentation/components/`
- [ ] Crear `domain/models/Product.ts` (interfaz TypeScript)
- [ ] Crear `infrastructure/api/productService.ts` con funciones: `getAll()`, `create()`, `update()`, `remove()`, `verifyId()`
- [ ] Configurar variable de entorno `NEXT_PUBLIC_API_BASE_URL` en `.env.local`
- [ ] Verificar que `npm run build` compila sin errores

**Dependencias:** Ninguna (puede empezar en paralelo con Milestone 2)

---

### Issue #23 — USER STORY

**Título:** `[US] Listado, búsqueda y contador de productos financieros`  
**Labels:** `user-story` `frontend`  
**Milestone:** Milestone 4 — Frontend  
**Referencia:** US-05 · Spec: `docs/user-stories/US-05-listado-busqueda-productos.md`

**Historia de usuario:**
> **Como** usuario del portal bancario  
> **Quiero** ver, buscar y conocer la cantidad de productos financieros disponibles  
> **Para** explorar fácilmente las opciones que ofrece el banco

**Criterios de aceptación:**
- [ ] La página principal muestra la lista completa de productos al cargar
- [ ] Se muestra estado de carga mientras se obtienen los datos
- [ ] Se muestra error visible si el API falla
- [ ] El campo de búsqueda filtra en tiempo real por nombre o descripción (sin llamar al API)
- [ ] El contador muestra siempre la cantidad de productos visibles
- [ ] Búsqueda sin resultados muestra mensaje informativo
- [ ] Limpiar búsqueda restaura el listado completo
- [ ] CSS propio sin frameworks de estilos

**Componentes a crear:** `ProductList`, `ProductCard`, `SearchBar`, `RecordCount`

**Dependencias:** Issue #22

---

### Issue #24 — USER STORY

**Título:** `[US] Formulario de creación de producto financiero con validaciones`  
**Labels:** `user-story` `frontend`  
**Milestone:** Milestone 4 — Frontend  
**Referencia:** US-06 · Spec: `docs/user-stories/US-06-crear-producto.md`

**Historia de usuario:**
> **Como** administrador del portal bancario  
> **Quiero** agregar nuevos productos financieros mediante un formulario con validaciones  
> **Para** ampliar el catálogo de productos del banco

**Criterios de aceptación:**
- [ ] Campos: ID, Nombre, Descripción, Logo, Fecha Liberación, Fecha Revisión
- [ ] Errores de validación visibles bajo cada campo individualmente
- [ ] ID verifica unicidad al perder el foco (llama a `/verification/:id`)
- [ ] Fecha Revisión se calcula automáticamente como 1 año después de Fecha Liberación
- [ ] Botón "Agregar" no envía si hay errores
- [ ] Creación exitosa → redirige al listado
- [ ] Botón "Reiniciar" limpia campos y errores

**Componentes a crear:** `ProductForm` (modo creación)

**Dependencias:** Issues #22, #23

---

### Issue #25 — USER STORY

**Título:** `[US] Formulario de edición de producto financiero`  
**Labels:** `user-story` `frontend` `deseable`  
**Milestone:** Milestone 4 — Frontend  
**Referencia:** US-07 · Spec: `docs/user-stories/US-07-editar-producto.md`

**Historia de usuario:**
> **Como** administrador del portal bancario  
> **Quiero** editar los datos de un producto financiero existente  
> **Para** mantener actualizada la información del catálogo sin perder el identificador

**Criterios de aceptación:**
- [ ] El formulario pre-carga los valores actuales del producto
- [ ] El campo ID está deshabilitado
- [ ] Mismas validaciones que creación (excepto verificación de unicidad de ID)
- [ ] Actualización exitosa → redirige al listado
- [ ] Producto inexistente → mensaje de error claro

**Componentes:** Reutilizar `ProductForm` (modo edición)

**Dependencias:** Issue #24

---

### Issue #26

**Título:** `[TASK] Tests unitarios frontend con Jest`  
**Labels:** `technical-task` `frontend` `test`  
**Milestone:** Milestone 4 — Frontend  
**Referencia:** TASK-19

**Descripción:**
Tests unitarios con Jest + React Testing Library. Objetivo: ≥ 70% de cobertura en componentes y hooks principales.

**Tareas:**
- [ ] `productService.test.ts` — mock de fetch, verifica llamadas correctas al API (getAll, create, verifyId)
- [ ] `SearchBar.test.tsx` — verifica filtrado en tiempo real, insensibilidad a mayúsculas
- [ ] `ProductForm.test.tsx` — validaciones: ID vacío, ID corto, fecha pasada, fecha revisión auto-calculada
- [ ] `useProducts.test.ts` — estado de carga, error handling
- [ ] Ejecutar `npm test -- --coverage` y verificar cobertura ≥ 70%

**Dependencias:** Issues #23, #24

---

## MILESTONE 5 — CI/CD

---

### Issue #27

**Título:** `[TASK] Pipeline CI con GitHub Actions`  
**Labels:** `technical-task` `infrastructure`  
**Milestone:** Milestone 5 — CI/CD  
**Referencia:** TASK-20

**Descripción:**
Configurar el pipeline de integración continua para que build y tests corran automáticamente en cada push y PR.

**Tareas:**
- [ ] Crear `.github/workflows/ci.yml`
- [ ] Job `backend-ms-cliente`: checkout → Java 21 → `./gradlew build` → `./gradlew test`
- [ ] Job `backend-ms-cuenta`: checkout → Java 21 → `./gradlew build` → `./gradlew test`
- [ ] Job `frontend`: checkout → Node 20 → `npm ci` → `npm run build` → `npm test -- --coverage`
- [ ] Trigger: push a `main` y `develop`, PR a `main`
- [ ] Verificar que el pipeline pasa en verde en GitHub Actions

**Dependencias:** Issues #9, #21, #26

---

## MILESTONE 6 — Entregables

---

### Issue #28

**Título:** `[TASK] Generar script BaseDatos.sql`  
**Labels:** `technical-task` `database`  
**Milestone:** Milestone 6 — Entregables  
**Referencia:** TASK-21

**Descripción:**
El ejercicio requiere entregar un archivo `BaseDatos.sql` con el schema y datos completos.

**Tareas:**
- [ ] Exportar schema y datos desde el contenedor PostgreSQL:
  ```bash
  docker exec banco-postgres pg_dump -U postgres banco_db > backend/BaseDatos.sql
  ```
- [ ] Verificar que el script es ejecutable desde cero en una BD vacía
- [ ] Subir `backend/BaseDatos.sql` al repositorio

**Dependencias:** Issues #1, #2, #3

---

### Issue #29

**Título:** `[TASK] Crear colección Postman`  
**Labels:** `technical-task` `backend`  
**Milestone:** Milestone 6 — Entregables  
**Referencia:** TASK-22

**Descripción:**
Colección Postman con todos los endpoints y variables de entorno para facilitar la validación durante la entrevista técnica.

**Tareas:**
- [ ] Crear colección con carpetas: "MS-Cliente" y "MS-Cuenta"
- [ ] Variables de entorno: `base_cliente=http://localhost:8081`, `base_cuenta=http://localhost:8082`
- [ ] Requests de los casos del ejercicio: crear los 3 clientes, crear las 5 cuentas, realizar los 4 movimientos, generar reporte de Marianela Montalvo
- [ ] Exportar como `postman_collection.json` y subir al repositorio

**Dependencias:** Issues #7, #15, #16, #17

---

### Issue #30

**Título:** `[TASK] Actualizar README raíz del proyecto`  
**Labels:** `technical-task` `infrastructure`  
**Milestone:** Milestone 6 — Entregables  
**Referencia:** TASK-23

**Descripción:**
Actualizar el README principal con las instrucciones correctas y verificadas para que el evaluador pueda levantar y usar el sistema sin fricción.

**Tareas:**
- [ ] Verificar que el Quick Start es ejecutable paso a paso
- [ ] Corregir referencias a docs (nombres de archivos actualizados)
- [ ] Agregar instrucciones para iniciar el backend Node.js de productos financieros
- [ ] Agregar sección de URLs disponibles al levantar el sistema
- [ ] Agregar sección de cómo importar y usar la colección Postman

**Dependencias:** Todos los issues anteriores completados

---

> **Total issues:** 30 (7 User Stories + 23 Technical Tasks)  
> Eliminar este archivo después de crear los issues en GitHub Projects.
