# US-02 — Gestión de cuentas bancarias (CRUD)

**Referencia ACTION_PLAN:** US-02  
**Issue GitHub:** `[US-02] Gestión de cuentas bancarias - CRUD completo`  
**Milestone:** Milestone 3 — MS-Cuenta  
**Labels:** `user-story` `backend` `ms-cuenta`

---

## Historia de usuario

**Como** administrador del banco  
**Quiero** crear, consultar, actualizar y eliminar cuentas bancarias  
**Para** administrar los productos bancarios asignados a cada cliente

---

## Criterios de aceptación

- [ ] Se puede crear una cuenta vinculada a un cliente existente
- [ ] No se permite registrar dos cuentas con el mismo número
- [ ] No se puede crear una cuenta para un cliente que no exista en el sistema
- [ ] El saldo inicial y el saldo actual coinciden al momento de crear la cuenta
- [ ] Se puede obtener una cuenta por su ID
- [ ] Se puede listar cuentas, opcionalmente filtrando por cliente
- [ ] Se pueden actualizar tipo de cuenta y estado
- [ ] No se puede eliminar una cuenta que tenga movimientos registrados

---

## Escenarios Gherkin

```gherkin
Feature: Gestión de cuentas bancarias
  Como administrador del banco
  Quiero gestionar las cuentas bancarias de los clientes
  Para administrar los productos bancarios del banco

  Background:
    Given el microservicio MS-Cuenta está disponible en el puerto 8082
    And existe un cliente registrado con clienteId "cliente-001" y nombre "Jose Lema"

  # ─── Crear cuenta ───────────────────────────────────────────────

  Scenario: Crear una cuenta exitosamente
    Given no existe ninguna cuenta con número "478758"
    When envío POST /api/cuentas con los datos:
      | clienteId    | cliente-001 |
      | numeroCuenta | 478758      |
      | tipoCuenta   | Ahorro      |
      | saldoInicial | 2000.00     |
    Then la respuesta HTTP es 201
    And el campo saldoInicial es 2000.00
    And el campo saldo es 2000.00
    And el campo estado es true

  Scenario: No se puede crear una cuenta con número de cuenta duplicado
    Given ya existe una cuenta con número "478758"
    When envío POST /api/cuentas con numeroCuenta "478758"
    Then la respuesta HTTP es 400
    And el mensaje de error indica "número de cuenta ya registrado"

  Scenario: No se puede crear una cuenta para un cliente inexistente
    Given no existe ningún registro de cliente con clienteId "no-existe"
    When envío POST /api/cuentas con clienteId "no-existe"
    Then la respuesta HTTP es 400
    And el mensaje de error indica "cliente no encontrado"

  Scenario: No se puede crear una cuenta con tipo inválido
    When envío POST /api/cuentas con tipoCuenta "Invalido"
    Then la respuesta HTTP es 400
    And el mensaje de error indica tipos de cuenta válidos

  # ─── Consultar cuenta ───────────────────────────────────────────

  Scenario: Obtener una cuenta existente por ID
    Given existe una cuenta con cuentaId "cuenta-001" y número "478758"
    When envío GET /api/cuentas/cuenta-001
    Then la respuesta HTTP es 200
    And el cuerpo contiene numeroCuenta "478758" y tipoCuenta

  Scenario: Listar cuentas de un cliente específico
    Given el cliente "cliente-001" tiene 2 cuentas registradas
    When envío GET /api/cuentas?clienteId=cliente-001
    Then la respuesta HTTP es 200
    And el cuerpo contiene 2 cuentas

  # ─── Actualizar cuenta ──────────────────────────────────────────

  Scenario: Actualizar el estado de una cuenta
    Given existe una cuenta con cuentaId "cuenta-001" y estado true
    When envío PUT /api/cuentas/cuenta-001 con estado false
    Then la respuesta HTTP es 200
    And el campo estado es false

  # ─── Eliminar cuenta ────────────────────────────────────────────

  Scenario: Eliminar una cuenta sin movimientos
    Given existe una cuenta con cuentaId "cuenta-001" sin movimientos registrados
    When envío DELETE /api/cuentas/cuenta-001
    Then la respuesta HTTP es 204

  Scenario: No se puede eliminar una cuenta con movimientos registrados
    Given existe una cuenta con cuentaId "cuenta-001" con 3 movimientos registrados
    When envío DELETE /api/cuentas/cuenta-001
    Then la respuesta HTTP es 400
    And el mensaje de error indica "la cuenta tiene movimientos registrados"
```
