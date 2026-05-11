# US-05 — Listado, búsqueda y contador de productos financieros

**Referencia ACTION_PLAN:** US-05  
**Issue GitHub:** `[US-05] Listado, búsqueda y contador de productos financieros`  
**Milestone:** Milestone 4 — Frontend  
**Labels:** `user-story` `frontend` `F1` `F2` `F3`

---

## Historia de usuario

**Como** usuario del portal bancario  
**Quiero** ver, buscar y conocer la cantidad de productos financieros disponibles  
**Para** explorar fácilmente las opciones que ofrece el banco

---

## Criterios de aceptación

- [ ] Al cargar la página se muestra la lista completa de productos obtenida del API
- [ ] Se muestra un indicador de carga mientras se obtienen los datos
- [ ] Se muestra un mensaje de error si el API no responde
- [ ] El campo de búsqueda filtra en tiempo real por nombre o descripción (sin llamar al API)
- [ ] El contador de registros refleja siempre la cantidad de productos visibles (con o sin filtro)
- [ ] Limpiar el campo de búsqueda restaura el listado completo
- [ ] Si la búsqueda no tiene coincidencias, se muestra un mensaje informativo
- [ ] El diseño es CSS propio (sin frameworks de componentes ni de estilos)

---

## Escenarios Gherkin

```gherkin
Feature: Listado, búsqueda y contador de productos financieros
  Como usuario del portal bancario
  Quiero explorar los productos financieros disponibles
  Para conocer las opciones del banco

  Background:
    Given el backend Node.js está disponible en http://localhost:3002
    And existen 5 productos registrados en el sistema

  # ─── Listado ────────────────────────────────────────────────────

  Scenario: Ver el listado completo al cargar la página
    When el usuario accede a la página principal
    Then se muestran los 5 productos en pantalla
    And el contador muestra "5 resultados"

  Scenario: Se muestra un indicador de carga mientras se obtienen los productos
    Given la red tarda en responder
    When el usuario accede a la página principal
    Then se muestra un estado de carga visible
    And al completarse la carga se muestran los productos

  Scenario: Se muestra un mensaje de error si el API no está disponible
    Given el backend Node.js no está disponible
    When el usuario accede a la página principal
    Then se muestra un mensaje de error al usuario
    And no se rompe la aplicación

  # ─── Búsqueda ───────────────────────────────────────────────────

  Scenario: Buscar productos por texto filtra la lista en tiempo real
    Given el usuario está en la página principal con 5 productos visibles
    When el usuario escribe "Tarjeta" en el campo de búsqueda
    Then solo se muestran los productos cuyo nombre o descripción contienen "Tarjeta"
    And el contador muestra la cantidad de productos filtrados
    And no se realiza ninguna llamada adicional al API

  Scenario: La búsqueda es insensible a mayúsculas y minúsculas
    When el usuario escribe "tarjeta" en el campo de búsqueda
    Then se muestran los mismos resultados que con "Tarjeta"

  Scenario: Búsqueda sin coincidencias muestra mensaje informativo
    When el usuario escribe "xyzabc" en el campo de búsqueda
    Then la lista de productos está vacía
    And el contador muestra "0 resultados"
    And se muestra un mensaje indicando que no hay resultados

  # ─── Contador ───────────────────────────────────────────────────

  Scenario: El contador se actualiza al filtrar
    Given el usuario tiene 5 productos visibles y el contador muestra "5 resultados"
    When el usuario escribe un texto que filtra a 2 productos
    Then el contador muestra "2 resultados"

  Scenario: Limpiar la búsqueda restaura el contador al total original
    Given el usuario tiene un filtro activo con 2 resultados visibles
    When el usuario borra el contenido del campo de búsqueda
    Then se muestran los 5 productos
    And el contador muestra "5 resultados"
```
