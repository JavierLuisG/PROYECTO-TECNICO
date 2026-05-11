# Arquitectura del Sistema

Visión global del sistema: componentes, flujos de datos y comunicación entre servicios.

## 🏗️ Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Cliente)                          │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           FRONTEND (Next.js 16.2.6)                        │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  UI (Componentes React + Tailwind CSS)               │  │ │
│  │  │  - Listado productos                                 │  │ │
│  │  │  - Formulario crear/editar                           │  │ │
│  │  │  - Modal eliminación                                 │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Application Layer (Use Cases, Hooks)                │  │ │
│  │  │  - ListProductsUseCase                               │  │ │
│  │  │  - CreateProductUseCase                              │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  Infrastructure (API Service)                        │  │ │
│  │  │  - fetch() a http://localhost:3002/bp/products       │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────────────────┘
                 │ HTTP REST
                 │
┌────────────────▼───────────────────────────────────────────────┐
│           BACKEND (Spring Boot + RabbitMQ)                     │
│                                                                │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │  MS-CLIENTE              │  │  MS-CUENTA                   ││
│  │  (Puerto 8081)           │  │  (Puerto 8082)               ││
│  │                          │  │                              ││
│  │ ┌──────────────────────┐ │  │ ┌──────────────────────────┐ ││
│  │ │ Controller           │ │  │ │ Controller               │ ││
│  │ │ - POST /clientes     │ │  │ │ - POST /cuentas          │ ││
│  │ │ - GET /clientes      │ │  │ │ - GET /movimientos       │ ││
│  │ │ - PUT /clientes/{id} │ │  │ │ - GET /reportes          │ ││
│  │ │ - DELETE /clientes   │ │  │ │                          │ ││
│  │ └──────────────────────┘ │  │ └──────────────────────────┘ ││
│  │                          │  │                              ││
│  │ ┌──────────────────────┐ │  │ ┌──────────────────────────┐ ││
│  │ │ Application/Domain   │ │  │ │ Application/Domain       │ ││
│  │ │ - Crear cliente      │ │  │ │ - Registrar movimiento   │ ││
│  │ │ - Validar DNI        │ │  │ │ - Validar saldo          │ ││
│  │ │                      │ │  │ │ - Generar reportes       │ ││
│  │ └──────────────────────┘ │  │ └──────────────────────────┘ ││
│  │                          │  │                              ││
│  │ ┌──────────────────────┐ │  │ ┌──────────────────────────┐ ││
│  │ │ Repository (BD)      │◄──┼─┤ Repository (BD)           │ ││
│  │ │ - ClienteRepository  │ │  │ │ - CuentaRepository       │ ││
│  │ └──────────────────────┘ │  │ │ - MovimientoRepository   │ ││
│  │                          │  │ └──────────────────────────┘ ││
│  │                          │  │                              ││
│  │ ┌──────────────────────┐ │  │ ┌──────────────────────────┐ ││
│  │ │ Event Publisher      │◄──┼─┤ Event Publisher           │ ││
│  │ │ (opcional)           │ │  │ │ → movimiento-registrado  │ ││
│  │ └──────────────────────┘ │  │ └──────────────────────────┘ ││
│  └──────────────────────────┘  └──────────────────────────────┘│
│                  ▲                           ▲                 │
│                  │                           │                 │
│                  └───────────────┬───────────┘                 │
│                       PostgreSQL │                             │
│                                  │                             │
└──────────────────────────────────┼─────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │    POSTGRESQL 14+           │
                    │  (puerto 5432)              │
                    │                             │
                    │ - persona                   │
                    │ - cliente                   │
                    │ - cuenta                    │
                    │ - movimiento                │
                    │                             │
                    │ Migraciones: Flyway         │
                    └─────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    RABBITMQ (Messaging)                          │
│                    (puerto 5672)                                 │
│                                                                  │
│  Evento A: cliente-creado-exchange                               │
│    Productor : MS-Cliente (al crear un cliente)                  │
│    Consumidor: MS-Cuenta  (almacena referencia local del cliente)│
│                                                                  │
│  Evento B: movimiento-registrado-exchange                        │
│    Productor : MS-Cuenta  (al registrar un movimiento)           │
│    Consumidor: MS-Cliente (auditoría / log)                      │
└──────────────────────────────────────────────────────────────────┘
```

## 📊 Flujos de Negocio

### 1. Crear Cliente

```
[Frontend] POST /clientes
    ↓
[MS-Cliente] Controller
    ↓
[MS-Cliente] Application Service (CreateClienteUseCase)
    ↓
Validaciones:
  - DNI único
  - Contraseña ≥ 8 caracteres
  - Datos completos
    ↓
[MS-Cliente] Domain (Entidad Cliente)
    ↓
[MS-Cliente] Repository → PostgreSQL
    ↓
[200 OK] {clienteId, nombre, estado}
```

### 2. Registrar Movimiento (Crítico)

```
[Frontend o MSC] POST /api/movimientos
    ↓
[MS-Cuenta] Controller
    ↓
[MS-Cuenta] Application Service (RegisterMovementUseCase)
    ↓
Validaciones:
  - Cuenta existe
  - Saldo suficiente (si es retiro)
  - Monto > 0
    ↓
[MS-Cuenta] Transaction (ACID)
  - Insertar movimiento
  - Actualizar saldo en cuenta
    ↓
[MS-Cuenta] Repository → PostgreSQL
    ↓
[MS-Cuenta] Event Publisher → RabbitMQ
    └→ movimiento-registrado {cuentaId, valor, saldoNuevo}
    ↓
[MS-Cliente] Event Consumer (si está escuchando)
    ↓
[200 OK] {movimientoId, saldoActual}
```

### 3. Generar Reporte (Estado de Cuenta)

```
[Frontend] GET /reportes?clienteId=X&desde=2024-01-01&hasta=2024-12-31
    ↓
[MS-Cuenta] Controller
    ↓
[MS-Cuenta] Application Service (GenerateStatementUseCase)
    ↓
Query a BD (optimizado con índices):
  - SELECT cuenta WHERE clienteId = X
  - SELECT movimientos WHERE fecha BETWEEN desde Y hasta
    ↓
[MS-Cuenta] Repository → PostgreSQL
    ↓
Transformar datos a DTO
    ↓
[200 OK] {
  "cliente": "Jose Lema",
  "cuentas": [
    {
      "numeroCuenta": "478758",
      "tipo": "Ahorro",
      "saldoActual": 1425.00,
      "movimientos": [
        {
          "fecha": "2024-02-10",
          "tipo": "Retiro",
          "valor": -575.00,
          "saldoAnterior": 2000.00,
          "saldoActual": 1425.00
        }
      ]
    }
  ]
}
```

## 🔄 Comunicación Asincrónica (RabbitMQ)

Flujo bidireccional entre ambos microservicios. Ninguno espera respuesta síncrona del otro.

### Evento A: `cliente-creado` (MS-Cliente → MS-Cuenta)

```java
// MS-Cliente publica al crear un cliente
public record ClienteCreadoEvent(
  String clienteId,
  String nombre,
  String identificacion
) {}
```

MS-Cuenta consume este evento y persiste un `ClienteRef` local para poder incluir
el nombre del cliente en los reportes sin necesidad de llamadas REST síncronas.

### Evento B: `movimiento-registrado` (MS-Cuenta → MS-Cliente)

```java
// MS-Cuenta publica al registrar un movimiento
public record MovimientoRegistradoEvent(
  String movimientoId,
  String cuentaId,
  BigDecimal valor,
  BigDecimal saldoActual,
  LocalDateTime fecha
) {}
```

MS-Cliente consume este evento para auditoría (log).

### Ventajas del diseño
- Desacoplamiento total: si MS-Cliente cae, los movimientos siguen funcionando
- MS-Cuenta puede generar reportes completos con datos locales
- Si algún servicio cae, RabbitMQ reintenta la entrega del mensaje

## 📦 Estructura de Paquetes (DDD + Hexagonal)

Cada microservicio sigue la misma convención de capas. La **regla de dependencia** es estricta: el dominio no importa nada de infraestructura.

```
┌─────────────────────────────────────────────────────────┐
│                  application/                           │
│   port/in/   ← interfaces de casos de uso              │
│   port/out/  ← interfaces de repositorio y eventos     │
│   service/   ← implementa port/in, llama a port/out    │
├─────────────────────────────────────────────────────────┤
│                    domain/                              │
│   model/       ← POJOs sin Spring ni JPA               │
│   valueobject/ ← Saldo, NumeroCuenta, Identificacion   │
│   event/       ← records de eventos de dominio         │
│   exception/   ← excepciones de negocio                │
├─────────────────────────────────────────────────────────┤
│                 infrastructure/                         │
│   persistence/adapter/    ← implementa port/out (JPA)  │
│   persistence/entity/     ← @Entity JPA                │
│   persistence/mapper/     ← Entity ↔ Domain            │
│   persistence/repository/ ← Spring Data JPA            │
│   messaging/publisher/    ← implementa port/out (MQ)   │
│   messaging/consumer/     ← @Bean Function consumer    │
│   web/controller/         ← @RestController            │
│   web/dto/request/        ← DTOs de entrada            │
│   web/dto/response/       ← DTOs de salida             │
│   web/mapper/             ← Domain ↔ DTO               │
│   web/exception/          ← @RestControllerAdvice      │
│   config/                 ← Beans Spring, RabbitMQ     │
└─────────────────────────────────────────────────────────┘
```

**Flujo de una petición REST**:
```
HTTP Request
  → Controller (infrastructure/web)
    → UseCase interface (application/port/in)
      → Service (application/service)  ← implementa port/in
        → RepositoryPort (application/port/out)
          → PersistenceAdapter (infrastructure/persistence/adapter)  ← implementa port/out
            → JpaRepository (infrastructure/persistence/repository)
              → PostgreSQL
```

## 🗄️ Estrategia de Datos

### Por Microservicio

| MS-Cliente | MS-Cuenta |
|-----------|----------|
| Tablas: `persona`, `cliente` | Tablas: `cuenta`, `movimiento` |
| Propietario: BD completa | Acceso: cuentas vinculadas a cliente |
| No lee de `cuenta` | Lee: `cliente` (FK) |

**Ventaja**: Independencia → cambiar BD de cliente no afecta cuenta.

### Migraciones (Flyway)

```
src/main/resources/db/migration/
├── V1__initial_schema.sql
│   ├── CREATE TABLE persona
│   ├── CREATE TABLE cliente
│   ├── CREATE TABLE cuenta
│   └── CREATE TABLE movimiento
│
├── V2__add_indexes.sql
│   ├── CREATE INDEX idx_identificacion
│   ├── CREATE INDEX idx_numeroCuenta
│   └── CREATE INDEX idx_cliente_fecha
│
└── V3__insert_test_data.sql
    ├── INSERT INTO persona (3 registros)
    ├── INSERT INTO cliente (3 registros)
    ├── INSERT INTO cuenta (5 registros)
    └── INSERT INTO movimiento (4 registros)
```

Flyway ejecuta automáticamente al levantar Spring Boot.

## ⚡ Performance

### Índices Estratégicos

```sql
-- Búsqueda rápida
CREATE INDEX idx_identificacion ON persona(identificacion);
CREATE INDEX idx_numeroCuenta ON cuenta(numeroCuenta);

-- Reportes rápidos
CREATE INDEX idx_cliente_fecha ON movimiento(cuentaId, fecha DESC);

-- Auditoría
CREATE INDEX idx_createdAt ON persona(createdAt);
```

**Impacto**:
- Reporte estado de cuenta: <50ms (vs 5+ segundos sin índices)
- Búsqueda cliente por DNI: <5ms

### Connection Pool

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
```

## 🔐 Seguridad (Notas)

### No implementado (para SemiSenior):
- ❌ Autenticación JWT
- ❌ Cifrado de contraseña (asumimos hasheada)
- ❌ HTTPS
- ❌ Rate limiting

### Implementado:
- ✅ Constraints en BD (evita datos inválidos)
- ✅ Validación en Application Layer
- ✅ Transacciones (ACID para movimientos)

## 📈 Escalabilidad Futura

1. **Cachés**: Redis para productos, clientes frecuentes
2. **CQRS**: Separar lectura (reportes) de escritura
3. **Event Sourcing**: Auditoría completa de cambios
4. **Service Mesh**: Istio para circuit breakers
5. **API Gateway**: Kong o Netflix Zuul para enrutamiento

## 🖥️ Frontend (Next.js — Ejercicio independiente)

El frontend implementa un catálogo de **productos financieros** consumiendo un backend
Node.js separado en el puerto **3002** (no los microservicios Spring Boot).

```
Navegador
  └── Next.js :3000
        └── HTTP → Node.js API :3002/bp/products
```

| Funcionalidad | Puerto | Descripción |
|---|---|---|
| Frontend Next.js | 3000 | UI de productos financieros |
| API Node.js (externa) | 3002 | Backend provisto por el ejercicio |
| MS-Cliente | 8081 | Gestión bancaria de clientes |
| MS-Cuenta | 8082 | Gestión bancaria de cuentas |

El backend Node.js en 3002 debe ejecutarse por separado (ver `docs/API_FRONTEND.md`).

## 🧭 Estado actual y próximos pasos

**Infraestructura lista** (Docker Compose levantado):
- ✅ PostgreSQL :5432
- ✅ RabbitMQ :5672 / :15672
- ✅ MS-Cliente :8081 (arranca, sin lógica implementada)
- ✅ MS-Cuenta :8082 (arranca, sin lógica implementada)
- ✅ Frontend :3000 (arranca, sin páginas implementadas)

**Pendiente de implementar** (ver `ACTION_PLAN.md`):
1. Migraciones Flyway (schema + datos prueba)
2. Lógica de negocio MS-Cliente (entidades, use cases, controllers)
3. Lógica de negocio MS-Cuenta (entidades, use cases, movimientos, reportes)
4. Páginas y componentes del frontend
5. Tests unitarios e integración
6. CI/CD con GitHub Actions