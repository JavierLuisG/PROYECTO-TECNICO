# TASK-08 — Tests Unitarios Dominio Cliente (MS-Cliente)

**Rama**: `feat/US-01-gestion-clientes`  
**Commit**: `test(ms-cliente): add unit tests for Cliente domain model`  
**Fecha implementación**: 2026-05-10

---

## Archivo creado

| Archivo | Propósito |
|---|---|
| `src/test/java/com/ms_cliente/domain/model/ClienteTest.java` | 14 tests unitarios para dominio y value objects |

---

## Cobertura de tests

### Contrasena value object — 6 tests

| Test | Verificación |
|---|---|
| `debeRechazarContrasenaCorta` | < 8 chars → `IllegalArgumentException` con mensaje "8 caracteres" |
| `debeRechazarContrasenaVacia` | string vacío `""` → `IllegalArgumentException` |
| `debeRechazarContrasenaEnBlanco` | string en blanco `"   "` → `IllegalArgumentException` |
| `debeRechazarContrasenaNula` | `null` → `NullPointerException` |
| `debeAceptarContrasenaDeOchoCaracteres` | exactamente 8 chars → no lanza excepción |
| `debeAceptarContrasenaLarga` | > 8 chars → acepta y conserva el valor |

### Identificacion value object — 4 tests

| Test | Verificación |
|---|---|
| `debeRechazarIdentificacionVacia` | string vacío → `IllegalArgumentException` |
| `debeRechazarIdentificacionDemasiadoLarga` | > 20 chars → `IllegalArgumentException` con "20 caracteres" |
| `debeRechazarIdentificacionNula` | `null` → `NullPointerException` |
| `debeAceptarIdentificacionValida` | identificación válida → conserva el valor |

### Cliente domain model — 4 tests

| Test | Verificación |
|---|---|
| `estadoInicialDebeSerTrue` | `Cliente.builder().estado(true).build().isEstado() == true` |
| `clienteDebeContenersPersona` | `cliente.getPersona()` no es null, nombre e identificación correctos |
| `clienteDebeAlmacenarContrasena` | contraseña almacenada y recuperada correctamente |
| `clienteDebeAsignarId` | `clienteId` asignado via builder se preserva |

---

## Resultados de ejecución

```
./gradlew test --tests "com.ms_cliente.domain.model.ClienteTest"
```

| Suite | Tests | Failures | Errors | Tiempo |
|---|---|---|---|---|
| Contrasena value object | 6 | 0 | 0 | 14ms |
| Identificacion value object | 4 | 0 | 0 | 2ms |
| Cliente domain model | 4 | 0 | 0 | 3ms |
| **Total** | **14** | **0** | **0** | **~20ms** |

**BUILD SUCCESSFUL**

---

## Criterios de aceptación cubiertos (TASK-08)

- [x] Test: contraseña < 8 caracteres lanza excepción de dominio
- [x] Test: estado inicial `true` al crear un Cliente
- [x] Test: value object `Contrasena` rechaza contraseñas vacías
- [x] Sin Spring context — puro JUnit 5 (no `@SpringBootTest`, no `@ExtendWith`)

---

## Decisiones de diseño

### Estructura @Nested

Se usaron clases anidadas con `@Nested` y `@DisplayName` para agrupar los tests por componente del dominio:
- `ContrasenaTests` — value object Contrasena
- `IdentificacionTests` — value object Identificacion
- `ClienteModelTests` — modelo Cliente

Esto mejora la legibilidad del reporte de tests y facilita identificar qué componente falla.

### Tests más allá del mínimo requerido

TASK-08 requería 3 criterios de aceptación; se implementaron 14 tests que cubren:
- Casos felices (happy path)
- Casos límite (exactamente 8 chars, exactamente 20 chars)
- Casos de error (null, empty, blank, demasiado largo/corto)

Esto refuerza la confianza en los value objects y prepara la base para detectar regresiones.

---

## Notas sobre el test de contexto existente

El archivo `MsClienteApplicationTests.java` usa `@SpringBootTest` y requiere base de datos y RabbitMQ para ejecutarse. No forma parte de TASK-08 (que solo aplica a tests de dominio puro). Se ejecuta en el entorno Docker completo (`docker compose up`).

---

## Pendiente (Bloque 4 de la misma rama)

| Tarea | Descripción |
|---|---|
| TASK-09 (Bloque 4) | `infrastructure/config/RabbitMQConfig.java` + `infrastructure/messaging/publisher/ClienteCreadoPublisher.java` |
| TASK-10 (Bloque 4) | `infrastructure/messaging/consumer/MovimientoRegistradoConsumer.java` |
