-- V2: Índices de performance MS-Cliente

-- persona
CREATE INDEX IF NOT EXISTS idx_persona_identificacion ON persona(identificacion);
CREATE INDEX IF NOT EXISTS idx_persona_estado         ON persona(estado);
CREATE INDEX IF NOT EXISTS idx_persona_created_at     ON persona(created_at);

-- cliente
CREATE INDEX IF NOT EXISTS idx_cliente_persona_id  ON cliente(persona_id);
CREATE INDEX IF NOT EXISTS idx_cliente_estado      ON cliente(estado);
CREATE INDEX IF NOT EXISTS idx_cliente_created_at  ON cliente(created_at);
