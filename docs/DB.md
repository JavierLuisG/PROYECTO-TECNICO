# Base de Datos - Schema y Relaciones

PostgreSQL 14+ con migraciones automáticas vía **Flyway**.

## 📋 Tablas

### 1. PERSONA

**Propósito**: Datos personales base (reutilizable para futuros usuarios).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | UUID | PK | Identificador único |
| `nombre` | VARCHAR(100) | NOT NULL | Nombre completo |
| `genero` | CHAR(1) | NOT NULL, CHECK IN ('M','F','O') | Género |
| `edad` | INT | NOT NULL, CHECK (18-120) | Edad en años |
| `identificacion` | VARCHAR(20) | UNIQUE, NOT NULL | DNI/Cédula único |
| `direccion` | VARCHAR(255) | NOT NULL | Dirección física |
| `telefono` | VARCHAR(20) | NOT NULL | Teléfono contacto |
| `estado` | BOOLEAN | DEFAULT TRUE | Activo/Inactivo |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha creación |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Fecha actualización |

**Índices**:
```sql
CREATE INDEX idx_identificacion ON persona(identificacion);
CREATE INDEX idx_estado ON persona(estado);
CREATE INDEX idx_createdAt ON persona(createdAt);
```

**Datos de Prueba**:
- Jose Lema (1234567890)
- Marianela Montalvo (1234567891)
- Juan Osorio (1234567892)

---

### 2. CLIENTE

**Propósito**: Extensión de Persona con credenciales bancarias. Relación 1:1 única.

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `clienteId` | UUID | PK | Identificador único cliente |
| `personaId` | UUID | FK (PERSONA.id), UNIQUE | Vinculación 1:1 con persona |
| `contraseña` | VARCHAR(255) | NOT NULL, CHECK (len ≥ 8) | Hasheada (bcrypt) |
| `estado` | BOOLEAN | DEFAULT TRUE | Cliente activo/inactivo |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha creación |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Fecha actualización |

**Relación**:
```
1 Persona = 1 Cliente (identificación única)
ON DELETE RESTRICT → No eliminar persona si tiene cliente
ON UPDATE CASCADE → Si cambia personaId, se actualiza aquí
```

**Índices**:
```sql
CREATE INDEX idx_personaId ON cliente(personaId);
CREATE INDEX idx_estado ON cliente(estado);
CREATE INDEX idx_createdAt ON cliente(createdAt);
```

---

### 3. CUENTA

**Propósito**: Cuentas bancarias del cliente (múltiples por cliente).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `cuentaId` | UUID | PK | Identificador único |
| `clienteId` | UUID | FK (CLIENTE.clienteId) | Cliente propietario |
| `numeroCuenta` | VARCHAR(20) | UNIQUE, NOT NULL | Número de cuenta |
| `tipoCuenta` | VARCHAR(20) | NOT NULL, CHECK ('Ahorro','Corriente','Tarjeta','Depósito') | Tipo de cuenta |
| `saldoInicial` | DECIMAL(12,2) | NOT NULL, DEFAULT 0.00, CHECK ≥ 0 | Saldo inicial |
| `saldo` | DECIMAL(12,2) | NOT NULL, DEFAULT 0.00, CHECK ≥ 0 | Saldo actual |
| `estado` | BOOLEAN | DEFAULT TRUE | Cuenta activa/inactiva |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha apertura |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Fecha actualización |

**Relación**:
```
1 Cliente = N Cuentas
ON DELETE RESTRICT → No eliminar cliente si tiene cuentas
```

**Índices**:
```sql
CREATE INDEX idx_clienteId ON cuenta(clienteId);
CREATE INDEX idx_numeroCuenta ON cuenta(numeroCuenta);
CREATE INDEX idx_estado ON cuenta(estado);
CREATE INDEX idx_createdAt ON cuenta(createdAt);
```

**Datos de Prueba**:
| numeroCuenta | tipo | cliente | saldo |
|---|---|---|---|
| 478758 | Ahorro | Jose Lema | 1425.00 |
| 585545 | Corriente | Jose Lema | 1000.00 |
| 225487 | Corriente | Marianela | 700.00 |
| 496825 | Ahorro | Marianela | 0.00 |
| 495878 | Ahorro | Juan Osorio | 150.00 |

---

### 4. MOVIMIENTO

**Propósito**: Registro de todas las transacciones (auditoría completa).

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `movimientoId` | UUID | PK | Identificador único |
| `cuentaId` | UUID | FK (CUENTA.cuentaId) | Cuenta vinculada |
| `fecha` | TIMESTAMP | DEFAULT NOW() | Fecha del movimiento |
| `tipoMovimiento` | VARCHAR(20) | NOT NULL, CHECK ('Depósito','Retiro','Transferencia','Pago','Ajuste') | Tipo |
| `valor` | DECIMAL(12,2) | NOT NULL, CHECK ≠ 0 | Monto (+ o -) |
| `saldoAnterior` | DECIMAL(12,2) | NOT NULL | Saldo previo (auditoría) |
| `saldoActual` | DECIMAL(12,2) | NOT NULL | Saldo nuevo (auditoría) |
| `descripcion` | VARCHAR(255) | NULLABLE | Contexto del movimiento |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Fecha registro |

**Constraints en BD**:
```sql
-- Evitar movimientos de $0
CHECK (valor != 0)

-- FK
FOREIGN KEY (cuentaId) REFERENCES cuenta(cuentaId) 
  ON DELETE RESTRICT
```

> La coherencia aritmética `saldoActual = saldoAnterior + valor` se garantiza en la
> capa de aplicación (use case `RegistrarMovimientoUseCase`), no como CHECK de BD,
> ya que PostgreSQL evalúa CHECK sobre los valores finales de la fila sin contexto
> de la transacción previa.

**Índices** (para reportes rápidos):
```sql
CREATE INDEX idx_cuentaId ON movimiento(cuentaId);
CREATE INDEX idx_fecha ON movimiento(fecha);
CREATE INDEX idx_cliente_fecha ON movimiento(cuentaId, fecha DESC);
CREATE INDEX idx_createdAt ON movimiento(createdAt);
```

**Datos de Prueba**:
| Cuenta | Tipo | Valor | saldoAnterior | saldoActual |
|--------|------|-------|---|---|
| 478758 | Retiro | -575.00 | 2000.00 | 1425.00 |
| 225487 | Depósito | +600.00 | 100.00 | 700.00 |
| 495878 | Depósito | +150.00 | 0.00 | 150.00 |
| 496825 | Retiro | -540.00 | 540.00 | 0.00 |

---

## 🔗 Relaciones (Diagrama)

```
┌─────────────────┐
│    PERSONA      │  3 registros
│  (id, nombre)   │
└────────┬────────┘
         │ 1:1 (UNIQUE)
         │
┌────────▼────────┐
│    CLIENTE      │  3 registros
│  (clienteId)    │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────┐
│     CUENTA      │  5 registros
│  (numeroCuenta) │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────┐
│   MOVIMIENTO    │  4 registros
│   (tipoMov)     │
└─────────────────┘

ON DELETE: RESTRICT en todas las FK
→ No permite eliminar si tiene dependencias (auditoría perfecta)
```

---

## ✅ Constraints de Negocio

| Constraint | Tabla | Impacto |
|-----------|-------|--------|
| `edad BETWEEN 18 AND 120` | PERSONA | Valida mayores de edad |
| `genero IN ('M','F','O')` | PERSONA | Estandariza género |
| `identificacion UNIQUE` | PERSONA | Evita duplicados |
| `personaId UNIQUE` | CLIENTE | 1 persona = 1 cliente |
| `contraseña length ≥ 8` | CLIENTE | Seguridad mínima |
| `saldo ≥ 0` | CUENTA | Nunca saldo negativo |
| `tipoCuenta IN (...)` | CUENTA | Tipos válidos |
| `valor ≠ 0` | MOVIMIENTO | No movimientos de $0 |
| `saldoActual = saldoAnterior + valor` | MOVIMIENTO | Coherencia matemática |
| `tipoMovimiento IN (...)` | MOVIMIENTO | Tipos válidos |

---

## 🏃 Migraciones Flyway

Ubicación: `src/main/resources/db/migration/`

### V1__initial_schema.sql
Crea tablas base: PERSONA, CLIENTE, CUENTA, MOVIMIENTO.

### V2__add_indexes.sql
Crea índices para performance.

### V3__insert_test_data.sql
Inserta 3 clientes, 5 cuentas, 4 movimientos (casos de uso).

**Ejecución automática**: Spring Boot levanta Flyway en `@PostConstruct` del datasource.

```yaml
# application.yml
spring:
  flyway:
    locations: classpath:db/migration
    baseline-on-migrate: true
    validate-on-migrate: true
```

---

## 🔍 Queries Frecuentes (Optimizadas)

### Obtener cliente con todas sus cuentas

```sql
SELECT 
  p.nombre, 
  c.tipoCuenta, 
  c.saldo
FROM persona p
INNER JOIN cliente cl ON p.id = cl.personaId
LEFT JOIN cuenta c ON cl.clienteId = c.clienteId
WHERE p.identificacion = '1234567890'
ORDER BY c.createdAt;
```
**Índices**: `persona.identificacion`, `cliente.personaId`, `cuenta.clienteId`

### Reporte estado de cuenta

```sql
SELECT 
  p.nombre,
  c.numeroCuenta,
  c.tipoCuenta,
  c.saldoInicial,
  c.saldo,
  m.fecha,
  m.tipoMovimiento,
  m.valor,
  m.saldoAnterior,
  m.saldoActual
FROM cuenta c
INNER JOIN cliente cl ON c.clienteId = cl.clienteId
INNER JOIN persona p ON cl.personaId = p.id
LEFT JOIN movimiento m ON c.cuentaId = m.cuentaId
WHERE cl.clienteId = '650e8400-...'
  AND m.fecha BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY m.fecha DESC;
```
**Índice crítico**: `movimiento(cuentaId, fecha DESC)` → <50ms

### Validar saldo antes de retiro

```sql
SELECT saldo FROM cuenta 
WHERE cuentaId = '750e8400-...'
FOR UPDATE;  -- Lock para evitar race condition
```

---

## 📊 Tipos de Datos

### UUID vs Integer
- ✅ Usamos **UUID** (VARCHAR(36))
- ❌ No usamos auto-increment (impredecible, mejor seguridad en URLs)

### Dinero
- ✅ Usamos **DECIMAL(12,2)** (exacto, 2 decimales)
- ❌ Nunca FLOAT/DOUBLE (errores de redondeo)
- ❌ Nunca VARCHAR (no es número)

### Timestamps
- `createdAt` TIMESTAMP DEFAULT NOW()
- `updatedAt` TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
- Auditoría automática de cambios

---

## 🔐 Transacciones Críticas

### Registrar Movimiento (ACID)

```sql
BEGIN TRANSACTION;

-- 1. Lock la cuenta
SELECT * FROM cuenta WHERE cuentaId = ? FOR UPDATE;

-- 2. Validar saldo
IF (saldoActual + valor >= 0) THEN
  -- 3. Insertar movimiento
  INSERT INTO movimiento (...) VALUES (...);
  
  -- 4. Actualizar saldo
  UPDATE cuenta SET saldo = saldo + valor WHERE cuentaId = ?;
  
  COMMIT;
ELSE
  ROLLBACK;
  RAISE 'Saldo no disponible';
END IF;
```

**Garantiza**:
- ✅ Atomicidad: todo o nada
- ✅ Consistencia: saldos siempre coherentes
- ✅ Aislamiento: no lecturas sucias
- ✅ Durabilidad: recuperable tras crash

---

## 📈 Números Esperados

| Métrica | Valor | Nota |
|---------|-------|------|
| Registros PERSONA | 3 | Datos prueba |
| Registros CLIENTE | 3 | Datos prueba |
| Registros CUENTA | 5 | Datos prueba |
| Registros MOVIMIENTO | 4 | Datos prueba |
| Tamaño BD (inicial) | ~1 MB | Con índices |
| Tiempo SELECT cliente | <5ms | Con índice |
| Tiempo SELECT reporte | <50ms | Con índice compuesto |
| Conexiones pool | 10 max | Configurable |

---

## 🛠️ Troubleshooting

**Error: "duplicate key value violates unique constraint"**
- Tabla PERSONA: Verificar `identificacion` único
- Tabla CLIENTE: Verificar `personaId` único
- Tabla CUENTA: Verificar `numeroCuenta` único

**Error: "violates foreign key constraint"**
- Eliminar hijo antes que padre
- Revisar orden de inserts en V3

**Error: "value out of range"**
- DECIMAL(12,2): máximo $9,999,999.99
- Aumentar a DECIMAL(14,2) si es necesario

---

## 📚 Referencias

- Script SQL entregable: `backend/BaseDatos.sql` *(generado al finalizar el desarrollo a partir de las migraciones Flyway)*
- Migraciones MS-Cliente: `backend/ms-cliente/src/main/resources/db/migration/`
- Migraciones MS-Cuenta: `backend/ms-cuenta/src/main/resources/db/migration/`
- Documentación Flyway: https://flywaydb.org/
- Documentación PostgreSQL: https://www.postgresql.org/docs/