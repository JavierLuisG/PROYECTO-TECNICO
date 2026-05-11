# US-03 — Registro de movimientos con validación de saldo

**Referencia ACTION_PLAN:** US-03  
**Issue GitHub:** `[US-03] Registro de movimientos con validación de saldo`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Labels:** `user-story` `backend` `ms-cuenta` `critical`

---

## Historia de usuario

**Como** sistema bancario  
**Quiero** registrar depósitos y retiros actualizando el saldo de forma atómica  
**Para** garantizar la trazabilidad y consistencia de todas las transacciones

---

## Criterios de aceptación

- [ ] Un depósito (valor positivo) incrementa el saldo y registra el movimiento
- [ ] Un retiro (valor negativo) decrementa el saldo y registra el movimiento
- [ ] Un retiro que deja el saldo en cero es válido
- [ ] Un retiro que dejaría el saldo negativo retorna error con el mensaje exacto `"Saldo no disponible"`
- [ ] El saldo de la cuenta no se modifica cuando un movimiento falla
- [ ] Cada movimiento registra `saldoAnterior` y `saldoActual` para auditoría
- [ ] No se puede registrar un movimiento con valor igual a cero
- [ ] La operación es transaccional (ACID): si falla algo, no queda en estado inconsistente
- [ ] Tras un movimiento exitoso se publica el evento `movimiento-registrado` en RabbitMQ

---

## Escenarios Gherkin

```gherkin
Feature: Registro de movimientos bancarios
  Como sistema bancario
  Quiero registrar depósitos y retiros de forma segura y atómica
  Para garantizar la consistencia de los saldos y la trazabilidad de transacciones

  Background:
    Given el microservicio MS-Cuenta está disponible en el puerto 8082
    And existe una cuenta con cuentaId "cuenta-001" y saldo 2000.00

  # ─── Depósito ───────────────────────────────────────────────────

  Scenario: Registrar un depósito exitosamente
    When envío POST /api/movimientos con los datos:
      | cuentaId      | cuenta-001 |
      | tipoMovimiento| Depósito   |
      | valor         | 600.00     |
    Then la respuesta HTTP es 201
    And el campo saldoAnterior es 2000.00
    And el campo saldoActual es 2600.00
    And el saldo de la cuenta "cuenta-001" es 2600.00

  # ─── Retiro ─────────────────────────────────────────────────────

  Scenario: Registrar un retiro exitosamente con saldo suficiente
    When envío POST /api/movimientos con los datos:
      | cuentaId      | cuenta-001 |
      | tipoMovimiento| Retiro     |
      | valor         | -575.00    |
    Then la respuesta HTTP es 201
    And el campo saldoAnterior es 2000.00
    And el campo saldoActual es 1425.00
    And el saldo de la cuenta "cuenta-001" es 1425.00

  Scenario: Retiro que deja el saldo exactamente en cero es válido
    Given la cuenta "cuenta-001" tiene saldo 540.00
    When envío POST /api/movimientos con valor -540.00 sobre la cuenta "cuenta-001"
    Then la respuesta HTTP es 201
    And el campo saldoActual es 0.00

  # ─── Saldo insuficiente (F3) ────────────────────────────────────

  Scenario: Retiro con saldo insuficiente retorna error con mensaje exacto
    Given la cuenta "cuenta-001" tiene saldo 100.00
    When envío POST /api/movimientos con los datos:
      | cuentaId      | cuenta-001 |
      | tipoMovimiento| Retiro     |
      | valor         | -575.00    |
    Then la respuesta HTTP es 400
    And el mensaje de error es exactamente "Saldo no disponible"
    And el saldo de la cuenta "cuenta-001" permanece en 100.00

  Scenario: El saldo no se modifica cuando un retiro falla por saldo insuficiente
    Given la cuenta "cuenta-001" tiene saldo 50.00
    And existen 2 movimientos previos registrados
    When envío POST /api/movimientos con valor -100.00 sobre la cuenta "cuenta-001"
    Then la respuesta HTTP es 400
    And el total de movimientos de la cuenta "cuenta-001" sigue siendo 2

  # ─── Validaciones ───────────────────────────────────────────────

  Scenario: No se puede registrar un movimiento con valor cero
    When envío POST /api/movimientos con valor 0.00
    Then la respuesta HTTP es 400
    And el mensaje de error indica que el valor no puede ser cero

  Scenario: No se puede registrar un movimiento en una cuenta inexistente
    When envío POST /api/movimientos con cuentaId "no-existe"
    Then la respuesta HTTP es 404
    And el mensaje de error indica "cuenta no encontrada"
```
