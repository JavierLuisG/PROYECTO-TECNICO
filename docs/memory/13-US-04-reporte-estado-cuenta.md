# US-04 — Reporte de Estado de Cuenta (MS-Cuenta)

**Fecha implementación**: 2026-05-11

---

## Archivos creados (8 archivos)

### Application Layer

| Archivo | Tipo | Descripción |
|---|---|---|
| `application/port/in/CuentaConMovimientos.java` | Record | Agrupación cuenta + lista de movimientos (tipo auxiliar del use case) |
| `application/port/in/ReporteResult.java` | Record | Tipo de retorno del reporte: clienteId, nombreCliente, desde, hasta, cuentas |
| `application/port/in/GenerarReporteUseCase.java` | Interface | Refinada de `List<Cuenta>` a `ReporteResult generar(UUID, LocalDate, LocalDate)` |
| `application/service/ReporteService.java` | `@Service` | Implementa `GenerarReporteUseCase`; agrega cuentas + movimientos filtrados |

**Algoritmo de `ReporteService.generar()`:**
1. Busca `ClienteRef` por clienteId → `ClienteRefNotFoundException` (404) si no existe
2. Aplica defaults de fecha: `desde = 1 ene año en curso`, `hasta = hoy`
3. Obtiene todas las cuentas del cliente con `cuentaRepositoryPort.findByClienteId()`
4. Para cada cuenta obtiene movimientos con `findByCuentaIdAndFechaBetween(inicio, fin)`
5. Retorna `ReporteResult` con toda la información agregada

### Domain Layer

| Archivo | Tipo | Descripción |
|---|---|---|
| `domain/exception/ClienteRefNotFoundException.java` | RuntimeException | Mensaje `"Cliente no encontrado con id: {id}"` — mapeada a 404 en GlobalExceptionHandler |

### Infrastructure — Web Layer

| Archivo | Tipo | Descripción |
|---|---|---|
| `infrastructure/web/dto/response/MovimientoReporteResponse.java` | Record | Campos del movimiento relevantes para el reporte (sin `createdAt`) |
| `infrastructure/web/dto/response/CuentaReporteResponse.java` | Record | Cuenta con `saldoActual` + lista de `MovimientoReporteResponse` |
| `infrastructure/web/dto/response/ReporteResponse.java` | Record | `clienteId`, `cliente`, `desde`, `hasta`, `cuentas` |
| `infrastructure/web/controller/ReporteController.java` | `@RestController` | `GET /api/reportes?clienteId&desde&hasta`; mapeo de `ReporteResult` → `ReporteResponse` interno |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `infrastructure/web/exception/GlobalExceptionHandler.java` | +handler `ClienteRefNotFoundException → 404`; +handler `MissingServletRequestParameterException → 400` |

---

## Endpoint implementado

```
GET /api/reportes?clienteId={UUID}&desde={YYYY-MM-DD}&hasta={YYYY-MM-DD}
```

| Parámetro | Tipo | Obligatorio | Default |
|---|---|---|---|
| `clienteId` | UUID | Sí | — (400 si falta) |
| `desde` | LocalDate (ISO) | No | 1 de enero del año en curso |
| `hasta` | LocalDate (ISO) | No | Hoy |

### Estructura de respuesta

```json
{
  "clienteId": "...",
  "cliente": "Marianela Montalvo",
  "desde": "2024-02-01",
  "hasta": "2024-02-28",
  "cuentas": [
    {
      "cuentaId": "...",
      "numeroCuenta": "225487",
      "tipoCuenta": "Corriente",
      "saldoInicial": 100.0,
      "saldoActual": 700.0,
      "estado": true,
      "movimientos": [
        {
          "movimientoId": "...",
          "fecha": "2024-02-10T11:00:00",
          "tipoMovimiento": "Deposito",
          "valor": 600.0,
          "saldoAnterior": 100.0,
          "saldoActual": 700.0,
          "descripcion": "Deposito ventanilla"
        }
      ]
    }
  ]
}
```

---

## Decisiones de diseño

### `ReporteResult` y `CuentaConMovimientos` en la capa application/port/in

Son tipos de transferencia dentro de la capa de aplicación. No son entidades de dominio (no van en `domain/model/`) ni DTOs de infraestructura (no son responses HTTP). Residir en `port/in/` es apropiado porque son la "forma" de retorno del use case.

### `ClienteRefNotFoundException` separada de `CuentaNotFoundException`

US-04 requiere mensaje exacto "cliente no encontrado" para 404. Reutilizar `CuentaNotFoundException` daría "Cuenta no encontrada" — incorrecto semánticamente. Nueva excepción garantiza el mensaje correcto y la legibilidad del handler.

### Cuentas sin movimientos en el rango siempre aparecen

`findByCuentaIdAndFechaBetween()` retorna lista vacía (no null) para cuentas sin movimientos en el período. El controller mapea lista vacía → `"movimientos": []`. Cumple criterio: "Si no hay movimientos en el rango, la cuenta aparece con lista de movimientos vacía".

### Filtro de fecha con `atStartOfDay()` y `atTime(LocalTime.MAX)`

`MovimientoRepositoryPort.findByCuentaIdAndFechaBetween()` toma `LocalDateTime`. Se convierte:  
- `desde.atStartOfDay()` → `2024-02-01T00:00:00` (inclusive)  
- `hasta.atTime(LocalTime.MAX)` → `2024-02-28T23:59:59.999999999` (inclusive hasta el último nanosegundo)

---

## Verificación funcional

```
GET /api/reportes?clienteId=Marianela&desde=2024-01-01&hasta=2024-12-31
  → 200, cliente="Marianela Montalvo", 2 cuentas, movimientos V3 incluidos ✓

GET /api/reportes?clienteId=Marianela
  → 200, desde=2026-01-01, hasta=2026-05-11 (defaults aplicados) ✓

GET /api/reportes?clienteId=Marianela&desde=2023-01-01&hasta=2023-12-31
  → 200, 2 cuentas con movimientos=[] ✓

GET /api/reportes?clienteId=no-existe
  → 404, "Cliente no encontrado con id: ..." ✓

GET /api/reportes (sin clienteId)
  → 400, "El parámetro 'clienteId' es requerido" ✓
```

---

## Pendiente (Bloque 2 — misma rama)

| Tarea | Descripción |
|---|---|
| TASK-17 | `RegistrarMovimientoIntegrationTest.java` — test de integración (depósito actualiza saldo + retiro insuficiente → 400) |
