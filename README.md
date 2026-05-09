# Sistema Bancario - Prueba Técnica SemiSenior

Aplicación bancaria completa con arquitectura de microservicios (backend) y aplicación web moderna (frontend).

## 🏗️ Arquitectura

- **Backend**: Dos microservicios en Spring Boot 4.0.6 con arquitectura hexagonal
  - `ms-cliente`: Gestión de clientes y personas (puerto 8081)
  - `ms-cuenta`: Gestión de cuentas y movimientos (puerto 8082)
- **Frontend**: Next.js 16.2.6 con React 19.2.4 y TypeScript
- **Database**: PostgreSQL 14+ con migraciones Flyway
- **Messaging**: RabbitMQ con Spring Cloud Stream
- **Orquestación**: Docker Compose

## 📋 Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- (Opcional para desarrollo local sin Docker)
  - Java 21+
  - Node.js 20.x
  - PostgreSQL 14+
  - RabbitMQ 3.12+

## 🚀 Quick Start

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd proyecto-tecnico
```

### 2. Levantar todo con Docker Compose

```bash
docker-compose up -d
```

Esto inicia:
- PostgreSQL (puerto 5432)
- RabbitMQ (puerto 5672, admin 15672)
- MS-Cliente (puerto 8081)
- MS-Cuenta (puerto 8082)
- Frontend (puerto 3000)

### 3. Verificar que funciona

- Frontend: http://localhost:3000
- MS-Cliente: http://localhost:8081/api/clientes
- MS-Cuenta: http://localhost:8082/api/cuentas
- RabbitMQ Admin: http://localhost:15672 (guest/guest)

## 📁 Estructura del Proyecto

```
proyecto-tecnico/
├── backend/                    # Microservicios en Java
│   ├── ms-cliente/            # Servicio de clientes (puerto 8081)
│   ├── ms-cuenta/             # Servicio de cuentas (puerto 8082)
│   ├── BaseDatos.sql          # Script inicial (deprecated, usa Flyway)
│   └── README.md              # Detalles de backend
│
├── frontend/                   # Aplicación Next.js
│   ├── src/                   # Código fuente
│   ├── public/                # Archivos estáticos
│   ├── package.json
│   └── README.md              # Detalles de frontend
│
├── docs/                       # Documentación del proyecto
│   ├── ARQUITECTURA.md        # Diseño global y flujos
│   ├── DATABASE.md            # Schema y relaciones
│   └── API_BACKEND.md         # Endpoints disponibles
│
├── docker-compose.yml          # Orquestación de servicios
└── README.md                   # Este archivo

```

## 📖 Documentación Detallada

- **[Arquitectura](docs/ARQUITECTURA.md)**: Diagrama de componentes, flujos asincronos
- **[Base de Datos](docs/DATABASE.md)**: Schema, relaciones, constraints
- **[API Backend](docs/API_BACKEND.md)**: Endpoints de ambos microservicios

## 🔧 Desarrollo Local

### Backend

```bash
cd backend/ms-cliente
./gradlew bootRun
```

```bash
cd backend/ms-cuenta
./gradlew bootRun
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Accede en http://localhost:3000

## ✅ Testing

### Backend (JUnit + Mockito)

```bash
cd backend/ms-cliente
./gradlew test
```

### Frontend (Jest)

```bash
cd frontend
npm test
```

## 🔐 Variables de Entorno

Ver archivos `.env.example` en cada carpeta (backend/ms-cliente, backend/ms-cuenta, frontend).

## 📝 Próximos Pasos

1. Ejecutar migraciones de BD con Flyway
2. Configurar variables de entorno
3. Correr tests unitarios
4. Revisar endpoints en API_BACKEND.md

## 📞 Contacto

Prueba técnica - SemiSenior 2024