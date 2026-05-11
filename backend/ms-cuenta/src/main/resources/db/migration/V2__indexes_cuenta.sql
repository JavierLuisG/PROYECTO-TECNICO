-- V2: Índices de performance MS-Cuenta

-- cuenta
CREATE INDEX IF NOT EXISTS idx_cuenta_cliente_id   ON cuenta(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cuenta_numero_cuenta ON cuenta(numero_cuenta);
CREATE INDEX IF NOT EXISTS idx_cuenta_estado        ON cuenta(estado);
CREATE INDEX IF NOT EXISTS idx_cuenta_created_at    ON cuenta(created_at);

-- movimiento
CREATE INDEX IF NOT EXISTS idx_movimiento_cuenta_id    ON movimiento(cuenta_id);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha         ON movimiento(fecha);
CREATE INDEX IF NOT EXISTS idx_movimiento_cuenta_fecha  ON movimiento(cuenta_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_movimiento_created_at    ON movimiento(created_at);
