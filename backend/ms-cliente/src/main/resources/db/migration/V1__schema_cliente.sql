-- V1: Schema inicial MS-Cliente
-- Tablas: persona, cliente
-- Ambas tablas son propiedad exclusiva de este microservicio.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- PERSONA
-- Datos personales base. Reutilizable para futuros usuarios.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS persona (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          VARCHAR(100) NOT NULL,
    genero          CHAR(1)      NOT NULL CHECK (genero IN ('M', 'F', 'O')),
    edad            INT          NOT NULL CHECK (edad BETWEEN 18 AND 120),
    identificacion  VARCHAR(20)  NOT NULL UNIQUE,
    direccion       VARCHAR(255) NOT NULL,
    telefono        VARCHAR(20)  NOT NULL,
    estado          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_persona_updated_at
    BEFORE UPDATE ON persona
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- CLIENTE
-- Extensión de Persona con credenciales bancarias. Relación 1:1.
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS cliente (
    cliente_id  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id  UUID         NOT NULL UNIQUE
                             REFERENCES persona(id)
                             ON DELETE RESTRICT
                             ON UPDATE CASCADE,
    contrasena  VARCHAR(255) NOT NULL CHECK (LENGTH(contrasena) >= 8),
    estado      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_cliente_updated_at
    BEFORE UPDATE ON cliente
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
