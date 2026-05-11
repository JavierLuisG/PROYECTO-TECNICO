-- V3: Datos de prueba MS-Cuenta
-- Datos del ejercicio: 3 cliente_ref + 5 cuentas + 4 movimientos.
--
-- UUIDs fijos (espejo de ms-cliente V3 para integridad referencial):
--   Cliente Jose     → 00000000-0000-0000-0002-000000000001
--   Cliente Marianela→ 00000000-0000-0000-0002-000000000002
--   Cliente Juan     → 00000000-0000-0000-0002-000000000003
--
--   Cuenta 478758    → 00000000-0000-0000-0003-000000000001
--   Cuenta 585545    → 00000000-0000-0000-0003-000000000002
--   Cuenta 225487    → 00000000-0000-0000-0003-000000000003
--   Cuenta 496825    → 00000000-0000-0000-0003-000000000004
--   Cuenta 495878    → 00000000-0000-0000-0003-000000000005
--
--   Movimiento 1     → 00000000-0000-0000-0004-000000000001
--   Movimiento 2     → 00000000-0000-0000-0004-000000000002
--   Movimiento 3     → 00000000-0000-0000-0004-000000000003
--   Movimiento 4     → 00000000-0000-0000-0004-000000000004

-- -------------------------------------------------------
-- CLIENTE_REF
-- Copia local sincronizada desde ms-cliente vía evento cliente-creado.
-- En producción llegan por RabbitMQ; aquí se pre-cargan para dev/test.
-- -------------------------------------------------------
INSERT INTO cliente_ref (cliente_id, nombre, identificacion)
VALUES
    ('00000000-0000-0000-0002-000000000001', 'Jose Lema',           '1234567890'),
    ('00000000-0000-0000-0002-000000000002', 'Marianela Montalvo',  '1234567891'),
    ('00000000-0000-0000-0002-000000000003', 'Juan Osorio',         '1234567892');

-- -------------------------------------------------------
-- CUENTAS
-- saldo_inicial = saldo antes del primer movimiento registrado.
-- saldo         = saldo actual (post-movimientos de prueba).
-- -------------------------------------------------------
INSERT INTO cuenta (cuenta_id, cliente_id, numero_cuenta, tipo_cuenta, saldo_inicial, saldo, estado)
VALUES
    -- Jose Lema
    ('00000000-0000-0000-0003-000000000001',
     '00000000-0000-0000-0002-000000000001',
     '478758', 'Ahorro', 2000.00, 1425.00, true),

    ('00000000-0000-0000-0003-000000000002',
     '00000000-0000-0000-0002-000000000001',
     '585545', 'Corriente', 1000.00, 1000.00, true),

    -- Marianela Montalvo
    ('00000000-0000-0000-0003-000000000003',
     '00000000-0000-0000-0002-000000000002',
     '225487', 'Corriente', 100.00, 700.00, true),

    ('00000000-0000-0000-0003-000000000004',
     '00000000-0000-0000-0002-000000000002',
     '496825', 'Ahorro', 540.00, 0.00, true),

    -- Juan Osorio
    ('00000000-0000-0000-0003-000000000005',
     '00000000-0000-0000-0002-000000000003',
     '495878', 'Ahorro', 0.00, 150.00, true);

-- -------------------------------------------------------
-- MOVIMIENTOS
-- valor positivo = ingreso, negativo = egreso.
-- saldo_anterior + valor = saldo_actual (coherencia garantizada aquí y
-- también en RegistrarMovimientoUseCase en producción).
-- -------------------------------------------------------
INSERT INTO movimiento (movimiento_id, cuenta_id, fecha, tipo_movimiento, valor, saldo_anterior, saldo_actual, descripcion)
VALUES
    -- Cuenta 478758 (Jose, Ahorro): Retiro -575.00 → 2000 → 1425
    ('00000000-0000-0000-0004-000000000001',
     '00000000-0000-0000-0003-000000000001',
     '2024-02-10 10:00:00', 'Retiro', -575.00, 2000.00, 1425.00,
     'Retiro cajero automatico'),

    -- Cuenta 225487 (Marianela, Corriente): Deposito +600.00 → 100 → 700
    ('00000000-0000-0000-0004-000000000002',
     '00000000-0000-0000-0003-000000000003',
     '2024-02-10 11:00:00', 'Deposito', 600.00, 100.00, 700.00,
     'Deposito ventanilla'),

    -- Cuenta 495878 (Juan, Ahorro): Deposito +150.00 → 0 → 150
    ('00000000-0000-0000-0004-000000000003',
     '00000000-0000-0000-0003-000000000005',
     '2024-02-10 12:00:00', 'Deposito', 150.00, 0.00, 150.00,
     'Deposito apertura de cuenta'),

    -- Cuenta 496825 (Marianela, Ahorro): Retiro -540.00 → 540 → 0
    ('00000000-0000-0000-0004-000000000004',
     '00000000-0000-0000-0003-000000000004',
     '2024-02-10 13:00:00', 'Retiro', -540.00, 540.00, 0.00,
     'Retiro total');
