# TASK-20 — Pipeline CI con GitHub Actions

**Fecha implementación**: 2026-05-11

---

## Archivos creados (2)

| Archivo | Descripción |
|---|---|
| `.github/workflows/ci.yml` | Pipeline CI con 3 jobs: `backend-ms-cliente`, `backend-ms-cuenta`, `frontend` |
| `backend/ms-cliente/src/test/resources/application-test.yml` | Perfil test para ms-cliente: H2 en memoria, Flyway deshabilitado, RabbitMQ listener sin auto-start |

## Archivos modificados (1)

| Archivo | Cambio |
|---|---|
| `backend/ms-cliente/src/test/java/com/ms_cliente/MsClienteApplicationTests.java` | Añadido `@ActiveProfiles("test")` + `@MockitoBean RabbitTemplate` para que el contexto cargue sin PostgreSQL/RabbitMQ reales |

---

## Estructura del workflow

```
Triggers:
  push  → branches: [main, develop]
  PR    → branches: [main]

Jobs:
  backend-ms-cliente  (ubuntu-latest, Java 21 Temurin)
    → checkout → setup-java (cache:gradle) → chmod gradlew → ./gradlew build --no-daemon
    → upload artifact: ms-cliente-test-results

  backend-ms-cuenta   (ubuntu-latest, Java 21 Temurin)
    → checkout → setup-java (cache:gradle) → chmod gradlew → ./gradlew build --no-daemon
    → upload artifact: ms-cuenta-test-results

  frontend            (ubuntu-latest, Node.js 20)
    → checkout → setup-node (cache:npm) → npm ci → npm run build → npm run test:coverage
    → upload artifact: frontend-coverage
```

---

## Por qué se necesitó `application-test.yml` en ms-cliente

`MsClienteApplicationTests` ya existía con `@SpringBootTest` pero sin perfil de test. Sin ese perfil, el contexto de Spring intentaba conectarse a PostgreSQL real (Flyway + JPA) y a RabbitMQ, lo que falla en CI donde no hay infraestructura real.

La solución replica el patrón que ya tenía ms-cuenta:
- H2 en memoria → reemplaza PostgreSQL
- `ddl-auto: create-drop` → Hibernate crea el schema a partir de las entidades JPA
- `flyway.enabled: false` → no ejecuta migraciones SQL
- `rabbitmq.listener.simple.auto-startup: false` → los listener containers no arrancan
- `@MockitoBean RabbitTemplate` → evita que el publisher intente conectar al broker

---

## Artefactos publicados en GitHub Actions

| Artifact | Contenido |
|---|---|
| `ms-cliente-test-results` | HTML con resultados JUnit de ms-cliente |
| `ms-cuenta-test-results` | HTML con resultados JUnit de ms-cuenta |
| `frontend-coverage` | Reporte Istanbul/lcov de cobertura del frontend |

---

## Verificación local

```
backend/ms-cliente $ ./gradlew test --no-daemon  → BUILD SUCCESSFUL (5 tests) ✓
backend/ms-cuenta  $ ./gradlew test --no-daemon  → BUILD SUCCESSFUL (6 tests) ✓
frontend           $ npm run test:coverage        → 74 tests, 94.24% cobertura ✓
```
