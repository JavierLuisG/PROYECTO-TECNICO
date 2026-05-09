# API Backend - Endpoints

Documentación de todos los endpoints de ambos microservicios.

## 🌐 Base URLs

- **MS-Cliente**: `http://localhost:8081/api`
- **MS-Cuenta**: `http://localhost:8082/api`

## 📝 Convenciones

- Método HTTP: REST estándar (GET, POST, PUT, DELETE)
- Content-Type: `application/json`
- Status codes:
  - **200**: OK
  - **201**: Created
  - **400**: Bad Request
  - **404**: Not Found
  - **500**: Server Error

---

## 🧑‍💼 MS-CLIENTE (Puerto 8081)

### 1. Crear Cliente

**Endpoint**: `POST /api/clientes`

**Request**:
```json
{
  "nombre": "Jose Lema",
  "genero": "M",
  "edad": 35,
  "identificacion": "1234567890",
  "direccion": "Otavalo sn y principal",
  "telefono": "098254785",
  "contraseña": "miPassword123"
}
```

**Response (201)**:
```json
{
  "clienteId": "650e8400-e29b-41d4-a716-446655440001",
  "personaId": "550e8400-e29b-41d4-a716-446655440001",
  "nombre": "Jose Lema",
  "identificacion": "1234567890",
  "estado": true,
  "createdAt": "2024-02-10T10:30:00Z"
}
```

**Validaciones**:
- `nombre`: 1-100 caracteres
- `edad`: 18-120
- `identificacion`: Único, 1-20 caracteres
- `contraseña`: Mínimo 8 caracteres (hasheada en BD)

---

### 2. Listar Clientes

**Endpoint**: `GET /api/clientes`

**Query Params**:
- `page` (opcional): Número de página (default: 0)
- `size` (opcional): Registros por página (default: 10)

**Response (200)**:
```json
{
  "content": [
    {
      "clienteId": "650e8400-e29b-41d4-a716-446655440001",
      "nombre": "Jose Lema",
      "identificacion": "1234567890",
      "estado": true
    },
    {
      "clienteId": "650e8400-e29b-41d4-a716-446655440002",
      "nombre": "Marianela Montalvo",
      "identificacion": "1234567891",
      "estado": true
    }
  ],
  "totalElements": 3,
  "totalPages": 1
}
```

---

### 3. Obtener Cliente

**Endpoint**: `GET /api/clientes/{clienteId}`

**Response (200)**:
```json
{
  "clienteId": "650e8400-e29b-41d4-a716-446655440001",
  "personaId": "550e8400-e29b-41d4-a716-446655440001",
  "nombre": "Jose Lema",
  "genero": "M",
  "edad": 35,
  "identificacion": "1234567890",
  "direccion": "Otavalo sn y principal",
  "telefono": "098254785",
  "estado": true,
  "createdAt": "2024-02-10T10:30:00Z",
  "updatedAt": "2024-02-10T10:30:00Z"
}
```

**Response (404)**:
```json
{
  "error": "Cliente no encontrado",
  "timestamp": "2024-02-10T10:35:00Z"
}
```

---

### 4. Actualizar Cliente

**Endpoint**: `PUT /api/clientes/{clienteId}`

**Request**:
```json
{
  "nombre": "Jose Lema Actualizado",
  "edad": 36,
  "direccion": "Nueva dirección",
  "telefono": "098254786",
  "estado": true
}
```

**Response (200)**:
```json
{
  "clienteId": "650e8400-e29b-41d4-a716-446655440001",
  "nombre": "Jose Lema Actualizado",
  "estado": true,
  "updatedAt": "2024-02-10T11:00:00Z"
}
```

---

### 5. Eliminar Cliente

**Endpoint**: `DELETE /api/clientes/{clienteId}`

**Response (204)**: Sin contenido

**Response (400)**:
```json
{
  "error": "No se puede eliminar cliente con cuentas asociadas",
  "timestamp": "2024-02-10T11:05:00Z"
}
```

---

## 💰 MS-CUENTA (Puerto 8082)

### 1. Crear Cuenta

**Endpoint**: `POST /api/cuentas`

**Request**:
```json
{
  "clienteId": "650e8400-e29b-41d4-a716-446655440001",
  "numeroCuenta": "478758",
  "tipoCuenta": "Ahorro",
  "saldoInicial": 2000.00
}
```

**Response (201)**:
```json
{
  "cuentaId": "750e8400-e29b-41d4-a716-446655440001",
  "clienteId": "650e8400-e29b-41d4-a716-446655440001",
  "numeroCuenta": "478758",
  "tipoCuenta": "Ahorro",
  "saldoInicial": 2000.00,
  "saldo": 2000.00,
  "estado": true,
  "createdAt": "2024-02-10T10:30:00Z"
}
```

**Validaciones**:
- `numeroCuenta`: Único, 1-20 caracteres
- `tipoCuenta`: Ahorro, Corriente, Tarjeta, Depósito
- `saldoInicial`: ≥ 0
- `clienteId`: Debe existir

---

### 2. Listar Cuentas

**Endpoint**: `GET /api/cuentas`

**Query Params**:
- `clienteId` (opcional): Filtrar por cliente
- `estado` (opcional): true/false

**Response (200)**:
```json
{
  "content": [
    {
      "cuentaId": "750e8400-e29b-41d4-a716-446655440001",
      "numeroCuenta": "478758",
      "tipoCuenta": "Ahorro",
      "saldo": 1425.00,
      "estado": true
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

---

### 3. Obtener Cuenta

**Endpoint**: `GET /api/cuentas/{cuentaId}`

**Response (200)**:
```json
{
  "cuentaId": "750e8400-e29b-41d4-a716-446655440001",
  "clienteId": "650e8400-e29b-41d4-a716-446655440001",
  "numeroCuenta": "478758",
  "tipoCuenta": "Ahorro",
  "saldoInicial": 2000.00,
  "saldo": 1425.00,
  "estado": true,
  "createdAt": "2024-02-10T10:30:00Z"
}
```

---

### 4. Actualizar Cuenta

**Endpoint**: `PUT /api/cuentas/{cuentaId}`

**Request**:
```json
{
  "tipoCuenta": "Corriente",
  "estado": false
}
```

**Response (200)**:
```json
{
  "cuentaId": "750e8400-e29b-41d4-a716-446655440001",
  "tipoCuenta": "Corriente",
  "estado": false,
  "updatedAt": "2024-02-10T11:00:00Z"
}
```

---

### 5. Eliminar Cuenta

**Endpoint**: `DELETE /api/cuentas/{cuentaId}`

**Response (204)**: Sin contenido

**Response (400)**:
```json
{
  "error": "No se puede eliminar cuenta con movimientos",
  "timestamp": "2024-02-10T11:05:00Z"
}
```

---

### 6. Registrar Movimiento ⭐ (Crítico)

**Endpoint**: `POST /api/movimientos`

**Request**:
```json
{
  "cuentaId": "750e8400-e29b-41d4-a716-446655440001",
  "tipoMovimiento": "Retiro",
  "valor": -575.00,
  "descripcion": "Retiro en cajero"
}
```

**Response (201)**:
```json
{
  "movimientoId": "850e8400-e29b-41d4-a716-446655440001",
  "cuentaId": "750e8400-e29b-41d4-a716-446655440001",
  "fecha": "2024-02-10T10:30:00Z",
  "tipoMovimiento": "Retiro",
  "valor": -575.00,
  "saldoAnterior": 2000.00,
  "saldoActual": 1425.00,
  "descripcion": "Retiro en cajero"
}
```

**Response (400)** - Saldo insuficiente:
```json
{
  "error": "Saldo no disponible",
  "saldoActual": 100.00,
  "montoSolicitado": 575.00,
  "timestamp": "2024-02-10T11:10:00Z"
}
```

**Validaciones**:
- `cuentaId`: Debe existir
- `tipoMovimiento`: Depósito, Retiro, Transferencia, Pago, Ajuste
- `valor`: No puede ser 0
- Retiro: `saldoActual >= abs(valor)`

**Nota**: Publica evento RabbitMQ `movimiento-registrado`

---

### 7. Listar Movimientos

**Endpoint**: `GET /api/movimientos`

**Query Params**:
- `cuentaId` (opcional): Filtrar por cuenta
- `desde` (opcional): ISO date (YYYY-MM-DD)
- `hasta` (opcional): ISO date (YYYY-MM-DD)

**Response (200)**:
```json
{
  "content": [
    {
      "movimientoId": "850e8400-e29b-41d4-a716-446655440001",
      "cuentaId": "750e8400-e29b-41d4-a716-446655440001",
      "fecha": "2024-02-10T10:30:00Z",
      "tipoMovimiento": "Retiro",
      "valor": -575.00,
      "saldoAnterior": 2000.00,
      "saldoActual": 1425.00
    }
  ],
  "totalElements": 4,
  "totalPages": 1
}
```

---

### 8. Obtener Movimiento

**Endpoint**: `GET /api/movimientos/{movimientoId}`

**Response (200)**:
```json
{
  "movimientoId": "850e8400-e29b-41d4-a716-446655440001",
  "cuentaId": "750e8400-e29b-41d4-a716-446655440001",
  "fecha": "2024-02-10T10:30:00Z",
  "tipoMovimiento": "Retiro",
  "valor": -575.00,
  "saldoAnterior": 2000.00,
  "saldoActual": 1425.00,
  "descripcion": "Retiro en cajero",
  "createdAt": "2024-02-10T10:30:00Z"
}
```

---

### 9. Generar Reporte Estado de Cuenta ⭐

**Endpoint**: `GET /api/reportes`

**Query Params** (requeridos):
- `clienteId`: ID del cliente
- `desde` (opcional): ISO date (default: inicio de año)
- `hasta` (opcional): ISO date (default: hoy)

**Ejemplo**:
```
GET /api/reportes?clienteId=650e8400-e29b-41d4-a716-446655440002&desde=2024-01-01&hasta=2024-12-31
```

**Response (200)**:
```json
{
  "cliente": "Marianela Montalvo",
  "identificacion": "1234567891",
  "periodo": {
    "desde": "2024-01-01",
    "hasta": "2024-12-31"
  },
  "cuentas": [
    {
      "cuentaId": "750e8400-e29b-41d4-a716-446655440002",
      "numeroCuenta": "225487",
      "tipoCuenta": "Corriente",
      "saldoInicial": 100.00,
      "saldoActual": 700.00,
      "movimientos": [
        {
          "fecha": "2024-02-10T14:45:00Z",
          "tipoMovimiento": "Depósito",
          "valor": 600.00,
          "saldoAnterior": 100.00,
          "saldoActual": 700.00,
          "descripcion": "Depósito en ventanilla"
        }
      ]
    },
    {
      "cuentaId": "750e8400-e29b-41d4-a716-446655440004",
      "numeroCuenta": "496825",
      "tipoCuenta": "Ahorro",
      "saldoInicial": 540.00,
      "saldoActual": 0.00,
      "movimientos": [
        {
          "fecha": "2024-02-08T11:20:00Z",
          "tipoMovimiento": "Retiro",
          "valor": -540.00,
          "saldoAnterior": 540.00,
          "saldoActual": 0.00,
          "descripcion": "Retiro total"
        }
      ]
    }
  ],
  "resumen": {
    "totalCuentas": 2,
    "totalMovimientos": 2,
    "saldoTotal": 700.00
  }
}
```

**Performance**: <50ms (con índices)

---

### 10. Eliminar Movimiento

**Endpoint**: `DELETE /api/movimientos/{movimientoId}`

**Response (204)**: Sin contenido

**Response (400)**:
```json
{
  "error": "No se pueden eliminar movimientos, solo consultar",
  "timestamp": "2024-02-10T11:15:00Z"
}
```

---

## 🔄 Mensajes de Error Estándar

Todas las respuestas de error siguen este formato:

```json
{
  "timestamp": "2024-02-10T10:35:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Mensaje descriptivo del error",
  "path": "/api/clientes"
}
```

---

## 🧪 Testing con cURL

### Crear cliente

```bash
curl -X POST http://localhost:8081/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Jose Lema",
    "genero": "M",
    "edad": 35,
    "identificacion": "1234567890",
    "direccion": "Otavalo sn y principal",
    "telefono": "098254785",
    "contraseña": "password123"
  }'
```

### Listar cuentas

```bash
curl http://localhost:8082/api/cuentas
```

### Registrar movimiento

```bash
curl -X POST http://localhost:8082/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "cuentaId": "750e8400-e29b-41d4-a716-446655440001",
    "tipoMovimiento": "Retiro",
    "valor": -575.00,
    "descripcion": "Retiro cajero"
  }'
```

### Generar reporte

```bash
curl "http://localhost:8082/api/reportes?clienteId=650e8400-e29b-41d4-a716-446655440002&desde=2024-01-01&hasta=2024-12-31"
```

---

## 📚 Resumen por Servicio

| Servicio | Endpoints | Responsabilidades |
|----------|-----------|------------------|
| **MS-Cliente** | 5 | CRUD Clientes (personas + credenciales) |
| **MS-Cuenta** | 10 | CRUD Cuentas, Movimientos, Reportes |
| **Total** | **15** | Funcionalidades completas SemiSenior |

---

## 🔐 Notas Finales

- **Autenticación**: No implementada (para SemiSenior)
- **Paginación**: Por defecto 10 registros/página
- **Timestamps**: Siempre en ISO 8601 UTC (Z)
- **UUIDs**: Todos los IDs son UUID v4 (32 caracteres hexadecimales)
- **Números**: DECIMAL(12,2) - máximo $9,999,999.99