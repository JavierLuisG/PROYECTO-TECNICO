# TASK-17 — Test de Integración: Registro de Movimientos (MS-Cuenta)

**Fecha implementación**: 2026-05-11

---

## Archivos creados (2 archivos)

| Archivo | Tipo | Descripción |
|---|---|---|
| `src/test/resources/application-test.yml` | YAML | Perfil test: H2 in-memory, Flyway deshabilitado, AMQP auto-startup OFF |
| `src/test/java/.../RegistrarMovimientoIntegrationTest.java` | `@SpringBootTest` | 5 tests de integración sobre el flujo completo de registro de movimientos |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `build.gradle` | `testRuntimeOnly 'com.h2database:h2'` |
| `MsCuentaApplicationTests.java` | `@ActiveProfiles("test")` + `@MockitoBean RabbitTemplate` |

---

## Configuración del entorno de test

### `application-test.yml`

| Propiedad | Valor | Razón |
|---|---|---|
| `spring.datasource.url` | `jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1` | BD en memoria, sin necesitar PostgreSQL |
| `spring.jpa.database-platform` | `org.hibernate.dialect.H2Dialect` | Evita que Hibernate genere SQL PostgreSQL-específico con H2 |
| `spring.jpa.hibernate.ddl-auto` | `create-drop` | Hibernate crea el schema desde las entidades JPA |
| `spring.flyway.enabled` | `false` | Las migraciones V1-V3 usan SQL PostgreSQL; no compatibles con H2 |
| `spring.rabbitmq.listener.simple.auto-startup` | `false` | Evita que `@RabbitListener` intente conectarse a RabbitMQ |

### `@MockitoBean RabbitTemplate`

En Spring Boot 4.0 (Spring Framework 6.2), `@MockBean` fue eliminado. El reemplazo es `@MockitoBean` de `org.springframework.test.context.bean.override.mockito.MockitoBean`. Mockeando `RabbitTemplate`, `MovimientoRegistradoPublisher.publishMovimientoRegistrado()` no realiza llamadas AMQP reales.

---

## Tests implementados (5 tests)

| Test | Verifica |
|---|---|
| `deposito_actualizaSaldoEnBD` | saldoActual = saldoInicial + depósito en BD; movimiento persistido |
| `retiro_saldoInsuficiente_lanzaExcepcionYSaldoSinCambio` | `SaldoInsuficienteException("Saldo no disponible")`; saldo sin cambio; sin movimientos en BD |
| `retiro_dejaSaldoEnCero_esValido` | saldo + valor = 0 es válido; saldo = 0 en BD |
| `movimiento_valorCero_lanzaExcepcion` | `IllegalArgumentException("El valor del movimiento no puede ser cero")` |
| `multiplesDepositos_acumulanSaldo` | 2 depósitos → saldo = inicial + suma; 2 movimientos en BD |

---

## Resultados

```
Testsuite: TASK-17: Integration tests — Registro de Movimientos
Tests: 5, Failures: 0, Errors: 0, Skipped: 0

Testsuite: com.ms_cuenta.MsCuentaApplicationTests
Tests: 1, Failures: 0, Errors: 0, Skipped: 0

Total: 6 tests, 0 failures ✓
```

`./gradlew test` → BUILD SUCCESSFUL ✓

---

## Decisiones de diseño

### Test a nivel de servicio (no HTTP)

Los tests invocando `RegistrarMovimientoUseCase.registrar()` directamente (no mediante MockMvc) son más resilientes:
- No dependen del stack HTTP
- Verifican el comportamiento transaccional ACID directamente  
- Las excepciones de dominio (`SaldoInsuficienteException`) se propagan sin envoltura HTTP

### H2Dialect explícito en el perfil test

Sin `database-platform: H2Dialect`, el perfil test heredaba `PostgreSQLDialect` del `application.yml` base. Hibernate generaba SQL PostgreSQL-específico (`set client_min_messages = WARNING`) que H2 no entiende, causando `JdbcSQLSyntaxErrorException`.

### Setup/teardown con @BeforeEach/@AfterEach

En lugar de `@Transactional` en el test (que haría rollback tras cada test y complicaría la verificación de estado post-transacción), se usa setup/teardown explícito. Cada test parte de un estado limpio con `deleteAll()` y termina limpiando.

### `@MockitoBean` vs TestConfiguration

`@MockitoBean RabbitTemplate` es la opción más directa: reemplaza el bean auto-configurado con un mock de Mockito. El resto de la infraestructura AMQP (ConnectionFactory lazy, containers con auto-startup=false) no intenta conectarse.
