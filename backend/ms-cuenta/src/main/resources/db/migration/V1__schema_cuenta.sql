-- V1: Schema inicial MS-Cuenta
-- Tablas: cliente_ref, cuenta, movimiento
-- cliente_ref: copia local del cliente sincronizada vía evento cliente-creado.
-- cuenta y movimiento son propiedad exclusiva de este microservicio.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- CLIENTE_REF
-- Copia local del cliente recibida vía evento RabbitMQ (cliente-creado).
-- Permite generar reportes sin llamadas REST síncronas a MS-Cliente.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS cliente_ref (
    cliente_id     UUID         PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    identificacion VARCHAR(20)  NOT NULL
);

-- -------------------------------------------------------
-- CUENTA
-- Cuentas bancarias del cliente (múltiples por cliente).
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS cuenta (
    cuenta_id     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id    UUID           NOT NULL
                                 REFERENCES cliente_ref(cliente_id)
                                 ON DELETE RESTRICT,
    numero_cuenta VARCHAR(20)    NOT NULL UNIQUE,
    tipo_cuenta   VARCHAR(20)    NOT NULL
                                 CHECK (tipo_cuenta IN ('Ahorro', 'Corriente', 'Tarjeta', 'Deposito')),
    saldo_inicial DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (saldo_inicial >= 0),
    saldo         DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (saldo >= 0),
    estado        BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_cuenta_updated_at
    BEFORE UPDATE ON cuenta
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- MOVIMIENTO
-- Registro de todas las transacciones (auditoría completa).
-- La coherencia saldo_actual = saldo_anterior + valor se garantiza
-- en la capa de aplicación (RegistrarMovimientoUseCase), no como CHECK de BD.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimiento (
    movimiento_id  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    cuenta_id      UUID           NOT NULL
                                  REFERENCES cuenta(cuenta_id)
                                  ON DELETE RESTRICT,
    fecha          TIMESTAMP      NOT NULL DEFAULT NOW(),
    tipo_movimiento VARCHAR(20)   NOT NULL
                                  CHECK (tipo_movimiento IN ('Deposito', 'Retiro', 'Transferencia', 'Pago', 'Ajuste')),
    valor          DECIMAL(12, 2) NOT NULL CHECK (valor != 0),
    saldo_anterior DECIMAL(12, 2) NOT NULL,
    saldo_actual   DECIMAL(12, 2) NOT NULL,
    descripcion    VARCHAR(255),
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);
