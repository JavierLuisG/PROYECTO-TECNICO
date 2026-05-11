# TASK-22 + TASK-23 — Colección Postman y README actualizado

**Fecha implementación**: 2026-05-11

---

## TASK-22 — Colección Postman

### Archivo

`postman_collection.json` — JSON válido Postman Collection v2.1.0

### Estructura

| Carpeta | Sub-carpeta | Requests |
|---|---|---|
| MS-Cliente | — | 8 requests |
| MS-Cuenta | Cuentas | 6 requests |
| MS-Cuenta | Movimientos | 6 requests |
| MS-Cuenta | Reporte Estado de Cuenta | 4 requests |
| **Total** | | **25 requests** |

### Variables de colección

| Variable | Valor | Descripción |
|---|---|---|
| `base_cliente` | `http://localhost:8081/api` | Base URL MS-Cliente |
| `base_cuenta` | `http://localhost:8082/api` | Base URL MS-Cuenta |
| `cliente_jose` | `00000000-0000-0000-0002-000000000001` | ID Jose Lema |
| `cliente_marianela` | `00000000-0000-0000-0002-000000000002` | ID Marianela Montalvo |
| `cliente_juan` | `00000000-0000-0000-0002-000000000003` | ID Juan Osorio |
| `cuenta_478758` | `00000000-0000-0000-0003-000000000001` | Cuenta Ahorro Jose |
| `cuenta_585545` | `00000000-0000-0000-0003-000000000002` | Cuenta Corriente Jose |
| `cuenta_225487` | `00000000-0000-0000-0003-000000000003` | Cuenta Corriente Marianela |
| `cuenta_496825` | `00000000-0000-0000-0003-000000000004` | Cuenta Ahorro Marianela |
| `cuenta_495878` | `00000000-0000-0000-0003-000000000005` | Cuenta Ahorro Juan |

Los UUIDs corresponden a los datos reales de la BD (fijos en las migraciones V3).

### Casos del ejercicio incluidos

- Listar y obtener los 3 clientes del enunciado
- Crear, actualizar y verificar errores de cliente (duplicado, no encontrado)
- Listar las 5 cuentas, filtrar por cliente, obtener individual
- 4 movimientos clave: depósito válido, retiro válido, saldo insuficiente (400 "Saldo no disponible"), valor cero (400)
- **Reporte Marianela 2024** — caso principal del ejercicio: cuentas 225487 y 496825 con sus movimientos
- Reporte con defaults (sin fechas), reporte cliente inexistente (404)

---

## TASK-23 — README actualizado

### Secciones del README reescrito

| Sección | Descripción |
|---|---|
| **Arquitectura** | Tabla con todos los componentes, tecnologías y puertos (incluye mock-api) |
| **Quick Start** | `docker compose up -d` con explicación del orden de arranque y healthchecks |
| **Datos de prueba** | Tabla con las 3 entidades, 5 cuentas y 4 movimientos precargados |
| **Estructura del proyecto** | Árbol actualizado con `.github/`, `mock-api/`, `postman_collection.json`, `BaseDatos.sql` |
| **API Backend** | Tablas de endpoints MS-Cliente y MS-Cuenta con casos de error |
| **Colección Postman** | Instrucciones de importación |
| **Mock API de productos** | Descripción del servicio Node.js en puerto 3002 y sus endpoints |
| **Tests** | Comandos para backend (H2, sin infraestructura real) y frontend (cobertura 94%) |
| **CI/CD** | Resumen del pipeline GitHub Actions |
| **Restaurar BD** | Comandos para restaurar desde `BaseDatos.sql` con psql y con Docker |
| **Desarrollo local** | Instrucciones para ejecutar sin Docker |
| **Documentación** | Tabla de referencias a todos los docs del proyecto |

### Correcciones respecto al README anterior

- Eliminados los "Próximos Pasos" (toda la implementación está completa)
- Corregidas las referencias a docs (eran `ARQUITECTURA.md` y `DATABASE.md`, los nombres reales son `ARCHITECTURE.md` y `DB.md`)
- Añadido `mock-api` como componente del sistema (antes no aparecía)
- Corregido el comando de Docker Compose (`docker compose` en lugar de `docker-compose`)
- Añadida sección completa de CI/CD
- Añadida instrucción de restauración de `BaseDatos.sql`
