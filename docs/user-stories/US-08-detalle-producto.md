# US-08 — Vista de detalle de producto financiero

**Referencia ejercicio:** F1 (parte de navegación al seleccionar item)  
**Issue GitHub:** `[US-08] Vista de detalle de producto financiero`  
**Milestone:** Milestone 4 — Frontend  
**Labels:** `user-story` `frontend` `F1`

---

## Historia de usuario

**Como** usuario del portal bancario  
**Quiero** hacer clic en un producto del listado y ver toda su información en una pantalla dedicada  
**Para** conocer el detalle completo del producto antes de editarlo o eliminarlo

---

## Criterios de aceptación

- [ ] Cada fila del listado es clickeable y navega a `/products/[id]`
- [ ] El listado muestra una flecha `>` o indicador visual de navegación en cada item
- [ ] La pantalla de detalle muestra: ID, Nombre, Descripción, Logo (imagen), Fecha de Liberación y Fecha de Revisión
- [ ] La pantalla de detalle incluye un botón "Editar" que navega a `/products/[id]/edit`
- [ ] La pantalla de detalle incluye un botón "Eliminar" (rojo) que abre el modal de confirmación (F6)
- [ ] Si el producto no existe, se muestra un mensaje de error con opción de volver al listado
- [ ] El diseño sigue el patrón D1 (diseño derecho): ID como título principal, campos etiquetados, logo centrado

---

## Diseño de referencia (D1 — vista derecha)

```
┌─────────────────────────────┐
│  [ícono banco] BANCO        │
├─────────────────────────────┤
│                             │
│  ID: 123455                 │
│  Información extra          │
│                             │
│  Nombre      {nombre}       │
│  Descripción {descripción}  │
│  Logo        [imagen]       │
│  Fecha lib.  {fecha}        │
│  Fecha rev.  {fecha}        │
│                             │
│  ┌─────────────────────┐    │
│  │       Editar        │    │  ← gris / secundario
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │      Eliminar       │    │  ← rojo / destructivo
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

## Escenarios Gherkin

```gherkin
Feature: Vista de detalle de producto financiero
  Como usuario del portal bancario
  Quiero ver el detalle completo de un producto al seleccionarlo
  Para conocer su información antes de editarlo o eliminarlo

  Background:
    Given el backend Node.js está disponible en http://localhost:3002
    And existe un producto con los datos:
      | id           | trj-crd                                         |
      | name         | Tarjetas de Crédito                             |
      | description  | Tarjeta de consumo bajo la modalidad de crédito |
      | logo         | https://ejemplo.com/logo.png                    |
      | date_release | 2026-05-13                                      |
      | date_revision| 2027-05-13                                      |

  # ─── Navegación desde el listado ────────────────────────────────

  Scenario: Cada item del listado es clickeable y navega al detalle
    Given el usuario está en la página principal
    When el usuario hace clic sobre el item "Tarjetas de Crédito"
    Then el usuario es redirigido a /products/trj-crd
    And se muestra la pantalla de detalle del producto

  Scenario: El listado indica visualmente que los items son navegables
    Given el usuario está en la página principal con productos cargados
    Then cada fila muestra un indicador de navegación (flecha u otro elemento visual)

  # ─── Pantalla de detalle ────────────────────────────────────────

  Scenario: La pantalla de detalle muestra toda la información del producto
    When el usuario accede a /products/trj-crd
    Then se muestra "ID: trj-crd" como título principal
    And se muestra el campo Nombre con "Tarjetas de Crédito"
    And se muestra el campo Descripción con su valor
    And se muestra el logo del producto como imagen
    And se muestra la Fecha de Liberación con "2026-05-13"
    And se muestra la Fecha de Revisión con "2027-05-13"

  Scenario: El botón Editar navega al formulario de edición
    Given el usuario está en la pantalla de detalle de "trj-crd"
    When el usuario hace clic en "Editar"
    Then el usuario es redirigido a /products/trj-crd/edit

  Scenario: El botón Eliminar abre el modal de confirmación
    Given el usuario está en la pantalla de detalle de "trj-crd"
    When el usuario hace clic en "Eliminar"
    Then se muestra un modal con los botones "Cancelar" y "Eliminar"

  # ─── Errores ────────────────────────────────────────────────────

  Scenario: Producto inexistente muestra error con opción de volver
    Given no existe ningún producto con ID "no-existe"
    When el usuario accede a /products/no-existe
    Then se muestra un mensaje indicando que el producto no fue encontrado
    And se muestra un botón para volver al listado
```

---

## Notas de implementación

- Ruta nueva: `frontend/src/app/products/[id]/page.tsx` (distinta de `/[id]/edit/page.tsx`)
- Llama a `productService.getById(id)` para obtener los datos
- El botón "Eliminar" dispara el modal de F6 (US-09 o integrado en esta misma página)
- La fila de `ProductCard` en el listado debe envolverse en un `<Link href="/products/${id}">` en lugar de solo tener el botón "Editar"
- El botón "Editar" en el listado puede eliminarse o mantenerse como acceso directo — según D1, los botones de acción viven en la pantalla de detalle
