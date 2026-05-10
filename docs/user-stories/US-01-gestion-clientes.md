# US-01 — Gestión de clientes (CRUD)

**Referencia ACTION_PLAN:** US-01  
**Issue GitHub:** `[US-01] Gestión de clientes - CRUD completo`  
**Milestone:** Milestone 2 — MS-Cliente  
**Labels:** `user-story` `backend` `ms-cliente`

---

## Historia de usuario

**Como** administrador del banco  
**Quiero** crear, consultar, actualizar y eliminar clientes  
**Para** mantener actualizado el registro de personas que operan con el banco

---

## Criterios de aceptación

- [ ] Se puede crear un cliente con sus datos personales y credenciales
- [ ] No se permite registrar dos clientes con la misma identificación
- [ ] La contraseña debe tener mínimo 8 caracteres
- [ ] Se puede obtener un cliente por su ID
- [ ] Se puede listar todos los clientes activos
- [ ] Se pueden actualizar los datos permitidos de un cliente (nombre, dirección, teléfono, estado)
- [ ] No se puede eliminar un cliente que tenga cuentas asociadas
- [ ] Los errores siguen el formato estándar `{ timestamp, status, message, path }`

---

## Escenarios Gherkin

```gherkin
Feature: Gestión de clientes bancarios
  Como administrador del banco
  Quiero gestionar el registro de clientes
  Para mantener actualizada la información de las personas que operan con el banco

  Background:
    Given el microservicio MS-Cliente está disponible en el puerto 8081

  # ─── Crear cliente ──────────────────────────────────────────────

  Scenario: Crear un cliente exitosamente
    Given no existe ningún cliente con identificación "1234567890"
    When envío POST /api/clientes con los datos:
      | nombre        | Jose Lema          |
      | genero        | M                  |
      | edad          | 35                 |
      | identificacion| 1234567890         |
      | direccion     | Otavalo sn y principal |
      | telefono      | 098254785          |
      | contrasena    | password123        |
    Then la respuesta HTTP es 201
    And el cuerpo contiene un clienteId no nulo
    And el campo estado es true

  Scenario: No se puede crear un cliente con identificación duplicada
    Given ya existe un cliente con identificación "1234567890"
    When envío POST /api/clientes con identificacion "1234567890"
    Then la respuesta HTTP es 400
    And el mensaje de error indica "identificación ya registrada"

  Scenario: No se puede crear un cliente con contraseña menor a 8 caracteres
    Given no existe ningún cliente con identificación "9876543210"
    When envío POST /api/clientes con contrasena "1234"
    Then la respuesta HTTP es 400
    And el mensaje de error indica "contraseña debe tener mínimo 8 caracteres"

  # ─── Consultar cliente ──────────────────────────────────────────

  Scenario: Obtener un cliente existente por ID
    Given existe un cliente con clienteId "abc-001" y nombre "Jose Lema"
    When envío GET /api/clientes/abc-001
    Then la respuesta HTTP es 200
    And el cuerpo contiene nombre "Jose Lema" e identificacion

  Scenario: Obtener un cliente inexistente retorna 404
    Given no existe ningún cliente con clienteId "no-existe"
    When envío GET /api/clientes/no-existe
    Then la respuesta HTTP es 404
    And el mensaje de error indica "cliente no encontrado"

  Scenario: Listar todos los clientes
    Given existen 3 clientes registrados
    When envío GET /api/clientes
    Then la respuesta HTTP es 200
    And el cuerpo contiene una lista con 3 clientes

  # ─── Actualizar cliente ─────────────────────────────────────────

  Scenario: Actualizar datos permitidos de un cliente
    Given existe un cliente con clienteId "abc-001"
    When envío PUT /api/clientes/abc-001 con nombre "Jose Lema Actualizado"
    Then la respuesta HTTP es 200
    And el campo nombre es "Jose Lema Actualizado"

  # ─── Eliminar cliente ───────────────────────────────────────────

  Scenario: Eliminar un cliente sin cuentas asociadas
    Given existe un cliente con clienteId "abc-001" sin cuentas asociadas
    When envío DELETE /api/clientes/abc-001
    Then la respuesta HTTP es 204

  Scenario: No se puede eliminar un cliente con cuentas asociadas
    Given existe un cliente con clienteId "abc-001" con 2 cuentas asociadas
    When envío DELETE /api/clientes/abc-001
    Then la respuesta HTTP es 400
    And el mensaje de error indica "el cliente tiene cuentas asociadas"
```
