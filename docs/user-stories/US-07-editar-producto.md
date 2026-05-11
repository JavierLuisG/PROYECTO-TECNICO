# US-07 — Formulario de edición de producto financiero

**Referencia ACTION_PLAN:** US-07  
**Issue GitHub:** `[US-07] Formulario de edición de producto financiero`  
**Milestone:** Milestone 4 — Frontend  
**Labels:** `user-story` `frontend` `F5` `deseable`

---

## Historia de usuario

**Como** administrador del portal bancario  
**Quiero** editar los datos de un producto financiero existente  
**Para** mantener actualizada la información del catálogo sin perder el identificador original

---

## Criterios de aceptación

- [ ] Al acceder a la pantalla de edición, el formulario pre-carga los valores actuales del producto
- [ ] El campo ID está deshabilitado (no editable)
- [ ] Se aplican las mismas validaciones que en la creación (excepto verificación de unicidad de ID)
- [ ] Al actualizar exitosamente, el usuario es redirigido al listado
- [ ] Si el producto no existe, se muestra un mensaje de error apropiado

---

## Escenarios Gherkin

```gherkin
Feature: Edición de producto financiero
  Como administrador del portal bancario
  Quiero editar productos financieros existentes
  Para mantener actualizado el catálogo del banco

  Background:
    Given el backend Node.js está disponible en http://localhost:3002
    And existe un producto con los datos:
      | id           | trj-crd                                          |
      | name         | Tarjetas de Crédito                              |
      | description  | Tarjeta de consumo bajo la modalidad de crédito  |
      | logo         | https://ejemplo.com/logo.png                     |
      | date_release | 2023-02-01                                       |
      | date_revision| 2024-02-01                                       |
    And el usuario está en la página de edición del producto "trj-crd"

  # ─── Pre-carga de datos ─────────────────────────────────────────

  Scenario: El formulario de edición pre-carga los valores actuales del producto
    When el usuario accede a la página de edición
    Then el campo ID muestra "trj-crd" y está deshabilitado
    And el campo Nombre muestra "Tarjetas de Crédito"
    And el campo Descripción muestra el valor actual
    And los campos de fecha muestran los valores actuales

  Scenario: El campo ID no es editable durante la edición
    When el usuario intenta modificar el campo ID
    Then el campo no acepta ninguna entrada
    And el valor permanece en "trj-crd"

  # ─── Edición exitosa ────────────────────────────────────────────

  Scenario: Editar un producto exitosamente
    Given el usuario cambia el campo Nombre a "Tarjetas de Crédito Premium"
    When el usuario hace clic en "Actualizar"
    Then se realiza una llamada a PUT /bp/products/trj-crd con el nombre actualizado
    And la respuesta del API es exitosa
    And el usuario es redirigido al listado de productos
    And el producto aparece con el nombre "Tarjetas de Crédito Premium"

  # ─── Validaciones ───────────────────────────────────────────────

  Scenario: Las validaciones de campos aplican igual que en la creación
    Given el usuario borra el contenido del campo Nombre
    When el usuario hace clic en "Actualizar"
    Then se muestra el error "Nombre es requerido" bajo el campo Nombre
    And el formulario no se envía al API

  Scenario: La Fecha de Revisión se recalcula si cambia la Fecha de Liberación
    When el usuario cambia la Fecha de Liberación a "2025-06-01"
    Then el campo Fecha de Revisión se actualiza automáticamente a "2026-06-01"

  # ─── Errores ────────────────────────────────────────────────────

  Scenario: Error si el producto no existe al cargar la edición
    Given no existe ningún producto con ID "no-existe"
    When el usuario accede a /products/no-existe/edit
    Then se muestra un mensaje de error indicando que el producto no fue encontrado
```
