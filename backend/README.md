# Backend - Microservicios Bancarios

Dos microservicios independientes en **Spring Boot 4.0.6** con **arquitectura hexagonal** y gestión de eventos vía **RabbitMQ + Spring Cloud Stream**.

## 🏛️ Arquitectura Hexagonal

Cada microservicio sigue el patrón hexagonal:

```
┌─────────────────────────────────────┐
│         Controller (API REST)       │ ← Puerta de entrada
├─────────────────────────────────────┤
│    Use Case / Application Service   │ ← Lógica de negocio
├─────────────────────────────────────┤
│      Domain (Entities, Rules)       │ ← Reglas de dominio
├─────────────────────────────────────┤
│   Repository (BD) / Event Publisher │ ← Puerta de salida
└─────────────────────────────────────┘
```

**Ventajas**:
- Bajo acoplamiento (cambiar BD o messaging no afecta lógica)
- Testeable (mockear puertos)
- Independencia entre servicios

## 📋 Microservicios

### **MS-Cliente** (puerto 8081)

Responsabilidades:
- CRUD de clientes
- CRUD de personas
- Datos personales y credenciales

Estructura:
```
ms-cliente/
├── src/main/java/com/msclient/
│   ├── controller/        # REST endpoints
│   ├── application/       # Use cases / Application services
│   ├── domain/           # Entities, rules, exceptions
│   ├── infrastructure/   # Repositories, BD, messaging
│   └── config/          # Spring configuration
├── src/test/            # JUnit + Mockito tests
├── build.gradle         # Dependencias
└── Dockerfile          # Imagen Docker
```

**Endpoints**:
- `POST /api/clientes` - Crear cliente
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/{id}` - Obtener cliente
- `PUT /api/clientes/{id}` - Actualizar cliente
- `DELETE /api/clientes/{id}` - Eliminar cliente

### **MS-Cuenta** (puerto 8082)

Responsabilidades:
- CRUD de cuentas
- CRUD de movimientos
- Generación de reportes
- Validación de saldos

Estructura:
```
ms-cuenta/
├── src/main/java/com/mscuenta/
│   ├── controller/        # REST endpoints
│   ├── application/       # Use cases / Application services
│   ├── domain/           # Entities, rules, exceptions
│   ├── infrastructure/   # Repositories, BD, messaging
│   └── config/          # Spring configuration
├── src/test/            # JUnit + Mockito tests
├── build.gradle         # Dependencias
└── Dockerfile          # Imagen Docker
```

**Endpoints**:
- `POST /api/cuentas` - Crear cuenta
- `GET /api/cuentas` - Listar cuentas
- `GET /api/cuentas/{id}` - Obtener cuenta
- `PUT /api/cuentas/{id}` - Actualizar cuenta
- `DELETE /api/cuentas/{id}` - Eliminar cuenta
- `POST /api/movimientos` - Registrar movimiento
- `GET /api/movimientos` - Listar movimientos
- `GET /api/reportes?clienteId=X&desde=Y&hasta=Z` - Estado de cuenta

## 🚀 Levantar Backend

### Con Docker Compose (recomendado)

```bash
cd ../  # Ir a raíz del proyecto
docker-compose up -d
```

### Local sin Docker

**Requisitos**:
- Java 21+
- PostgreSQL 14+ corriendo localmente
- RabbitMQ corriendo localmente

**MS-Cliente**:
```bash
cd ms-cliente
./gradlew bootRun
```

**MS-Cuenta**:
```bash
cd ms-cuenta
./gradlew bootRun
```

## 🗄️ Base de Datos

- **Motor**: PostgreSQL 14+
- **Migraciones**: Flyway (automáticas en startup)
- **Ubicación scripts**: `src/main/resources/db/migration/`

Flyway ejecuta automáticamente:
1. `V1__initial_schema.sql` - Tablas y constraints
2. `V2__add_indexes.sql` - Índices
3. `V3__insert_test_data.sql` - Datos de prueba

## 📨 Comunicación Asincrónica

**RabbitMQ + Spring Cloud Stream**

Flujo:
1. MS-Cuenta publica evento: `movimiento-registrado`
2. MS-Cliente consume evento (opcional, para auditoría)

**Ventajas**:
- Desacoplamiento temporal (no bloquea request)
- Resiliencia (reintenta si falla)
- Escalabilidad (múltiples consumidores)

## ✅ Testing

**Framework**: JUnit 5 + Mockito

### Ejecutar tests

```bash
cd ms-cliente
./gradlew test
```

**Cobertura esperada**: 70%+

**Tipos de tests**:
- **Unitarios**: Dominio, use cases (sin BD)
- **Integración**: Controllers, repositories (con BD en memoria H2)

## 📊 Configuración

Cada microservicio tiene variables de entorno en `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/banco_db
    username: postgres
    password: password
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

## 🔍 Verificar que funciona

```bash
# MS-Cliente
curl http://localhost:8081/api/clientes

# MS-Cuenta
curl http://localhost:8082/api/cuentas

# Logs
docker-compose logs -f ms-cliente
docker-compose logs -f ms-cuenta
```

## 📚 Documentación Adicional

- [API Endpoints](../docs/API_BACKEND.md)
- [Architecture Overview](../docs/ARQUITECTURA.md)
- [Database Schema](../docs/DATABASE.md)

## 🛠️ Troubleshooting

**Error: "No database connection"**
- Verificar PostgreSQL está corriendo: `docker-compose ps`
- Verificar credenciales en `application.yml`

**Error: "RabbitMQ connection refused"**
- Verificar RabbitMQ está corriendo: `docker-compose ps`
- Admin panel: http://localhost:15672

**Port already in use**
- Cambiar puerto en `application.yml`
- O: `kill -9 $(lsof -t -i:8081)`