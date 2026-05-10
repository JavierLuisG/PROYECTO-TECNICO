# TASK-03 — Flyway Migrations: Datos de Prueba

**Fecha implementación**: 2026-05-10

---

## Archivos creados

| Archivo | Propósito |
|---|---|
| `backend/ms-cliente/src/main/resources/db/migration/V3__test_data_cliente.sql` | 3 personas + 3 clientes |
| `backend/ms-cuenta/src/main/resources/db/migration/V3__test_data_cuenta.sql` | 3 cliente_ref + 5 cuentas + 4 movimientos |

---

## UUIDs fijos — Tabla de referencia global

Estos UUIDs se usan en pruebas, Postman (TASK-22) y cualquier test de integración (TASK-17).

### Personas (ms-cliente)

| Persona | UUID |
|---|---|
| Jose Lema | `00000000-0000-0000-0001-000000000001` |
| Marianela Montalvo | `00000000-0000-0000-0001-000000000002` |
| Juan Osorio | `00000000-0000-0000-0001-000000000003` |

### Clientes (ms-cliente) / ClienteRef (ms-cuenta)

El mismo UUID identifica al `cliente` en ms-cliente y al `cliente_ref` en ms-cuenta.

| Cliente | UUID | Identificación |
|---|---|---|
| Jose Lema | `00000000-0000-0000-0002-000000000001` | 1234567890 |
| Marianela Montalvo | `00000000-0000-0000-0002-000000000002` | 1234567891 |
| Juan Osorio | `00000000-0000-0000-0002-000000000003` | 1234567892 |

### Cuentas (ms-cuenta)

| numeroCuenta | UUID | Tipo | Cliente | saldo_inicial | saldo |
|---|---|---|---|---|---|
| 478758 | `00000000-0000-0000-0003-000000000001` | Ahorro | Jose Lema | 2000.00 | 1425.00 |
| 585545 | `00000000-0000-0000-0003-000000000002` | Corriente | Jose Lema | 1000.00 | 1000.00 |
| 225487 | `00000000-0000-0000-0003-000000000003` | Corriente | Marianela | 100.00 | 700.00 |
| 496825 | `00000000-0000-0000-0003-000000000004` | Ahorro | Marianela | 540.00 | 0.00 |
| 495878 | `00000000-0000-0000-0003-000000000005` | Ahorro | Juan Osorio | 0.00 | 150.00 |

### Movimientos (ms-cuenta)

| UUID | Cuenta | Tipo | Valor | saldo_anterior | saldo_actual |
|---|---|---|---|---|---|
| `00000000-0000-0000-0004-000000000001` | 478758 | Retiro | -575.00 | 2000.00 | 1425.00 |
| `00000000-0000-0000-0004-000000000002` | 225487 | Deposito | +600.00 | 100.00 | 700.00 |
| `00000000-0000-0000-0004-000000000003` | 495878 | Deposito | +150.00 | 0.00 | 150.00 |
| `00000000-0000-0000-0004-000000000004` | 496825 | Retiro | -540.00 | 540.00 | 0.00 |

---

## Decisiones de diseño

### UUIDs fijos vs `gen_random_uuid()`

Se eligieron UUIDs fijos (hardcoded) en lugar de `gen_random_uuid()` porque:
- ms-cliente y ms-cuenta comparten la misma BD pero son migraciones independientes. El `cliente.cliente_id` de ms-cliente **debe coincidir** con `cliente_ref.cliente_id` de ms-cuenta.
- Con UUIDs aleatorios no habría forma de sincronizar ese vínculo en migraciones separadas.
- Los UUIDs fijos también facilitan tests de integración (TASK-17), Postman (TASK-22) y verificaciones manuales.

### Patrón de UUID para identificación visual

Los UUIDs usan el 4to grupo como discriminador de tipo:
```
00000000-0000-0000-{TIPO}-{SECUENCIA}
  0001 → persona
  0002 → cliente / cliente_ref
  0003 → cuenta
  0004 → movimiento
```

### `saldo_inicial` en cuentas con movimientos

`saldo_inicial` refleja el saldo en el momento de apertura de cuenta, no el saldo pre-movimiento de test. Se derivó del `saldo_anterior` del primer movimiento registrado para cada cuenta:
- 478758: `saldo_inicial = 2000.00` (saldo_anterior del retiro)
- 225487: `saldo_inicial = 100.00` (saldo_anterior del depósito)
- 496825: `saldo_inicial = 540.00` (saldo_anterior del retiro)
- 495878: `saldo_inicial = 0.00` (saldo_anterior del depósito)
- 585545: `saldo_inicial = saldo = 1000.00` (sin movimientos)

### Contraseña en texto plano para seed

`password123` se almacena en texto plano para simplificar el seed inicial. En producción, la capa de aplicación (`ClienteService`) aplica bcrypt antes de persistir. La constraint `CHECK (LENGTH(contrasena) >= 8)` se cumple (11 chars).

### Valores `tipo_movimiento` y `tipo_cuenta` sin tilde

Se usan `'Deposito'` y `'Deposito'` (sin acento) para evitar problemas de codificación. La presentación con acento (`'Depósito'`) es responsabilidad de la capa de presentación/DTO.

---

## Criterios de aceptación cubiertos (TASK-03)

- [x] 3 personas + 3 clientes: Jose Lema, Marianela Montalvo, Juan Osorio
- [x] 5 cuentas según tabla del ejercicio (478758, 585545, 225487, 496825, 495878)
- [x] 4 movimientos según tabla del ejercicio
- [x] `cliente_ref` sincronizados con los 3 clientes (mismos UUIDs)

---

## Verificación post-deploy (después de TASK-04)

```bash
# Verificar tablas
docker exec banco-postgres psql -U postgres -d banco_db -c "SELECT nombre, identificacion FROM persona;"
docker exec banco-postgres psql -U postgres -d banco_db -c "SELECT numero_cuenta, tipo_cuenta, saldo FROM cuenta ORDER BY numero_cuenta;"
docker exec banco-postgres psql -U postgres -d banco_db -c "SELECT tipo_movimiento, valor, saldo_anterior, saldo_actual FROM movimiento ORDER BY fecha;"
```

Resultado esperado:
- 3 filas en `persona`, 3 en `cliente`, 3 en `cliente_ref`
- 5 filas en `cuenta`
- 4 filas en `movimiento`

---

## Pendiente (próxima tarea)

| Tarea | Descripción |
|---|---|
| TASK-04 | Habilitar Flyway en `docker-compose.yml`: `SPRING_FLYWAY_ENABLED: "true"`, `ddl-auto: validate`, `SPRING_FLYWAY_TABLE` por servicio |
