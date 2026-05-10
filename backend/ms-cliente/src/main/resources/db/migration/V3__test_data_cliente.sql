-- V3: Datos de prueba MS-Cliente
-- Datos del ejercicio: 3 personas + 3 clientes.
--
-- UUIDs fijos para facilitar referencias en tests y Postman:
--   Persona Jose     → 00000000-0000-0000-0001-000000000001
--   Persona Marianela→ 00000000-0000-0000-0001-000000000002
--   Persona Juan     → 00000000-0000-0000-0001-000000000003
--   Cliente Jose     → 00000000-0000-0000-0002-000000000001
--   Cliente Marianela→ 00000000-0000-0000-0002-000000000002
--   Cliente Juan     → 00000000-0000-0000-0002-000000000003
--
-- NOTA: contrasena almacenada en texto plano únicamente para seed de pruebas.
--       La capa de aplicación aplica bcrypt al crear clientes via API.

-- -------------------------------------------------------
-- PERSONAS
-- -------------------------------------------------------
INSERT INTO persona (id, nombre, genero, edad, identificacion, direccion, telefono, estado)
VALUES
    ('00000000-0000-0000-0001-000000000001',
     'Jose Lema', 'M', 30, '1234567890',
     'Otavalo sn/n y Los Ponticipes', '098254785', true),

    ('00000000-0000-0000-0001-000000000002',
     'Marianela Montalvo', 'F', 28, '1234567891',
     'Amazonas y NNUU', '097548965', true),

    ('00000000-0000-0000-0001-000000000003',
     'Juan Osorio', 'M', 35, '1234567892',
     '13 junio y Equinoccial', '098874587', true);

-- -------------------------------------------------------
-- CLIENTES
-- -------------------------------------------------------
INSERT INTO cliente (cliente_id, persona_id, contrasena, estado)
VALUES
    ('00000000-0000-0000-0002-000000000001',
     '00000000-0000-0000-0001-000000000001',
     'password123', true),

    ('00000000-0000-0000-0002-000000000002',
     '00000000-0000-0000-0001-000000000002',
     'password123', true),

    ('00000000-0000-0000-0002-000000000003',
     '00000000-0000-0000-0001-000000000003',
     'password123', true);
