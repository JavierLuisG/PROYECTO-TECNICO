# US-06 — Formulario de creación de producto financiero

**Referencia ACTION_PLAN:** US-06  
**Issue GitHub:** `[US-06] Formulario de creación de producto financiero con validaciones`  
**Milestone:** Milestone 4 — Frontend  
**Labels:** `user-story` `frontend` `F4`

---

## Historia de usuario

**Como** administrador del portal bancario  
**Quiero** agregar nuevos productos financieros mediante un formulario con validaciones  
**Para** ampliar el catálogo de productos que el banco ofrece a sus clientes

---

## Criterios de aceptación

- [ ] El formulario tiene los campos: ID, Nombre, Descripción, Logo, Fecha de Liberación, Fecha de Revisión
- [ ] Cada campo muestra su error de validación de forma individual y visible
- [ ] El campo ID verifica en tiempo real (al perder foco) que no exista ya en el sistema
- [ ] La Fecha de Revisión se calcula automáticamente como 1 año después de la Fecha de Liberación
- [ ] El botón "Agregar" no envía el formulario si hay errores de validación
- [ ] Al crear exitosamente, el usuario es redirigido al listado
- [ ] El botón "Reiniciar" limpia todos los campos y mensajes de error
- [ ] Se muestra un mensaje de error visual si el API rechaza la creación

---

## Reglas de validación

| Campo | Regla |
|---|---|
| ID | Requerido, 3-10 caracteres, no debe existir (verifica con `/verification/:id`) |
| Nombre | Requerido, 5-100 caracteres |
| Descripción | Requerido, 10-200 caracteres |
| Logo | Requerido |
| Fecha Liberación | Requerido, fecha ≥ hoy |
| Fecha Revisión | Requerido, exactamente 1 año después de Fecha Liberación (auto-calculado) |

---

## Escenarios Gherkin

```gherkin
Feature: Creación de producto financiero
  Como administrador del portal bancario
  Quiero agregar nuevos productos financieros al catálogo
  Para ampliar las opciones disponibles para los clientes del banco

  Background:
    Given el backend Node.js está disponible en http://localhost:3002
    And el usuario está en la página de creación de producto (/products/new)

  # ─── Happy path ─────────────────────────────────────────────────

  Scenario: Crear un producto exitosamente con datos válidos
    Given no existe ningún producto con ID "seg-vida"
    When el usuario completa el formulario con:
      | id           | seg-vida                        |
      | name         | Seguro de Vida                  |
      | description  | Protección de vida para titulares |
      | logo         | https://ejemplo.com/logo.png    |
      | date_release | 2025-06-01                      |
    And la fecha de revisión se calcula automáticamente como "2026-06-01"
    And el usuario hace clic en "Agregar"
    Then el producto se crea exitosamente
    And el usuario es redirigido al listado de productos
    And el nuevo producto "Seguro de Vida" aparece en la lista

  # ─── Validaciones de ID ─────────────────────────────────────────

  Scenario: El campo ID es requerido
    Given el usuario deja el campo ID vacío
    When el usuario hace clic en "Agregar"
    Then se muestra el error "ID es requerido" bajo el campo ID
    And el formulario no se envía al API

  Scenario: El campo ID debe tener mínimo 3 caracteres
    When el usuario ingresa "ab" en el campo ID
    And el usuario hace clic en "Agregar"
    Then se muestra el error de longitud mínima bajo el campo ID

  Scenario: El campo ID no puede superar 10 caracteres
    When el usuario ingresa "identificador-muy-largo" en el campo ID
    And el usuario hace clic en "Agregar"
    Then se muestra el error de longitud máxima bajo el campo ID

  Scenario: No se puede crear un producto con ID ya existente
    Given existe un producto con ID "trj-crd"
    When el usuario ingresa "trj-crd" en el campo ID
    And el campo ID pierde el foco
    Then se realiza una llamada a GET /bp/products/verification/trj-crd
    And se muestra el error "ID ya registrado" bajo el campo ID

  # ─── Validaciones de otros campos ───────────────────────────────

  Scenario: El campo Nombre debe tener mínimo 5 caracteres
    When el usuario ingresa "Seg" en el campo Nombre (3 caracteres)
    And el usuario hace clic en "Agregar"
    Then se muestra el error de longitud mínima bajo el campo Nombre

  Scenario: La Descripción debe tener mínimo 10 caracteres
    When el usuario ingresa "Corta" en el campo Descripción (5 caracteres)
    And el usuario hace clic en "Agregar"
    Then se muestra el error de longitud mínima bajo el campo Descripción

  Scenario: La Fecha de Liberación no puede ser anterior a hoy
    Given la fecha de hoy es 2025-05-10
    When el usuario selecciona "2025-05-09" como Fecha de Liberación
    And el usuario hace clic en "Agregar"
    Then se muestra el error "la fecha debe ser igual o mayor a hoy"

  # ─── Cálculo automático de fecha revisión ───────────────────────

  Scenario: La Fecha de Revisión se calcula automáticamente
    When el usuario selecciona "2025-06-01" como Fecha de Liberación
    Then el campo Fecha de Revisión se completa automáticamente con "2026-06-01"
    And el campo Fecha de Revisión no es editable manualmente

  # ─── Reiniciar formulario ───────────────────────────────────────

  Scenario: El botón Reiniciar limpia todos los campos y errores
    Given el usuario ha completado varios campos y hay errores visibles
    When el usuario hace clic en "Reiniciar"
    Then todos los campos del formulario quedan vacíos
    And no se muestra ningún mensaje de error
```
