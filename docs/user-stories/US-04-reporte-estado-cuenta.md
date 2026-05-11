# US-04 — Reporte de estado de cuenta

**Referencia ACTION_PLAN:** US-04  
**Issue GitHub:** `[US-04] Reporte de estado de cuenta por cliente y rango de fechas`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Labels:** `user-story` `backend` `ms-cuenta`

---

## Historia de usuario

**Como** cliente del banco  
**Quiero** consultar el estado de mis cuentas y el detalle de movimientos en un período  
**Para** revisar mi historial de transacciones y verificar mis saldos

---

## Criterios de aceptación

- [ ] El reporte se filtra por clienteId y rango de fechas (`desde` / `hasta`)
- [ ] Si no se pasan fechas, el período por defecto es inicio del año actual hasta hoy
- [ ] El reporte incluye el nombre del cliente
- [ ] El reporte incluye todas las cuentas del cliente con su saldo actual
- [ ] Cada cuenta incluye el detalle de movimientos dentro del rango solicitado
- [ ] Si no hay movimientos en el rango, la cuenta aparece con lista de movimientos vacía
- [ ] El reporte de un cliente inexistente retorna 404

---

## Escenarios Gherkin

```gherkin
Feature: Reporte de estado de cuenta
  Como cliente del banco
  Quiero consultar el estado de mis cuentas y movimientos en un período específico
  Para revisar mi historial financiero

  Background:
    Given el microservicio MS-Cuenta está disponible en el puerto 8082
    And existe un cliente con clienteId "cliente-001" y nombre "Marianela Montalvo"
    And el cliente tiene las siguientes cuentas:
      | cuentaId   | numeroCuenta | tipoCuenta | saldoInicial | saldo  |
      | cuenta-002 | 225487       | Corriente  | 100.00       | 700.00 |
      | cuenta-004 | 496825       | Ahorro     | 540.00       | 0.00   |
    And la cuenta "225487" tiene un depósito de 600.00 el 10/02/2024
    And la cuenta "496825" tiene un retiro de -540.00 el 08/02/2024

  # ─── Reporte con movimientos ────────────────────────────────────

  Scenario: Generar reporte con movimientos en el rango de fechas
    When envío GET /api/reportes?clienteId=cliente-001&desde=2024-02-01&hasta=2024-02-28
    Then la respuesta HTTP es 200
    And el campo cliente es "Marianela Montalvo"
    And el reporte contiene 2 cuentas
    And la cuenta "225487" tiene 1 movimiento con valor 600.00
    And la cuenta "496825" tiene 1 movimiento con valor -540.00
    And el campo saldoActual de la cuenta "225487" es 700.00

  # ─── Reporte sin movimientos en rango ───────────────────────────

  Scenario: Reporte con rango de fechas sin movimientos muestra cuentas con lista vacía
    When envío GET /api/reportes?clienteId=cliente-001&desde=2023-01-01&hasta=2023-12-31
    Then la respuesta HTTP es 200
    And el campo cliente es "Marianela Montalvo"
    And la lista de movimientos de cada cuenta está vacía

  # ─── Defaults de fecha ──────────────────────────────────────────

  Scenario: Generar reporte sin parámetros de fecha usa valores por defecto
    When envío GET /api/reportes?clienteId=cliente-001
    Then la respuesta HTTP es 200
    And el periodo.desde es el primer día del año en curso
    And el periodo.hasta es la fecha de hoy

  # ─── Errores ────────────────────────────────────────────────────

  Scenario: Reporte de cliente inexistente retorna 404
    When envío GET /api/reportes?clienteId=no-existe
    Then la respuesta HTTP es 404
    And el mensaje de error indica "cliente no encontrado"

  Scenario: El parámetro clienteId es obligatorio
    When envío GET /api/reportes sin el parámetro clienteId
    Then la respuesta HTTP es 400
    And el mensaje de error indica que clienteId es requerido
```
