# TASK-11 — Dependencias Gradle MS-Cuenta

**Rama**: `feat/US-02-gestion-cuentas`  
**Commit**: `build(ms-cuenta): add JPA, RabbitMQ, Flyway and Lombok dependencies`  
**Fecha implementación**: 2026-05-11

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/ms-cuenta/build.gradle` | Reescrito con dependencias completas (de 3 a 16 entradas) |
| `backend/ms-cuenta/src/main/resources/application.yml` | Corregido `com.mscuenta` → `com.ms_cuenta` en logging (ambos perfiles) |
| `docker-compose.yml` | Agregado `SPRING_FLYWAY_BASELINE_VERSION: "0"` al servicio ms-cuenta |

---

## Dependencias agregadas a build.gradle

### Antes
```gradle
implementation 'org.springframework.boot:spring-boot-starter-web'
testImplementation 'org.springframework.boot:spring-boot-starter-test'
testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
```

### Después (espejo de ms-cliente)
```gradle
// Web
implementation 'org.springframework.boot:spring-boot-starter-webmvc'
implementation 'org.springframework.boot:spring-boot-starter-validation'

// Persistencia
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
implementation 'org.springframework.boot:spring-boot-starter-flyway'
implementation 'org.flywaydb:flyway-database-postgresql'
runtimeOnly 'org.postgresql:postgresql'

// Mensajería
implementation 'org.springframework.boot:spring-boot-starter-amqp'
implementation 'org.springframework.cloud:spring-cloud-stream'
implementation 'org.springframework.cloud:spring-cloud-stream-binder-rabbit'

// Lombok
compileOnly 'org.projectlombok:lombok'
annotationProcessor 'org.projectlombok:lombok'

// Dev
developmentOnly 'org.springframework.boot:spring-boot-devtools'

// Tests
testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.springframework.boot:spring-boot-starter-data-jpa-test'
testImplementation 'org.springframework.boot:spring-boot-starter-webmvc-test'
testImplementation 'org.springframework.boot:spring-boot-starter-amqp-test'
testImplementation 'org.springframework.cloud:spring-cloud-stream-test-binder'
testCompileOnly 'org.projectlombok:lombok'
testAnnotationProcessor 'org.projectlombok:lombok'
testRuntimeOnly 'org.junit.platform:junit-platform-launcher'

dependencyManagement {
    imports {
        mavenBom "org.springframework.cloud:spring-cloud-dependencies:2025.1.1"
    }
}
```

---

## Criterios de aceptación cubiertos (TASK-11)

- [x] `spring-boot-starter-data-jpa` agregado
- [x] `flyway-database-postgresql` agregado
- [x] `spring-boot-starter-amqp` agregado
- [x] `spring-cloud-stream` y `spring-cloud-stream-binder-rabbit` agregados
- [x] `lombok` agregado (compileOnly + annotationProcessor + test variants)
- [x] `postgresql` agregado (runtime)
- [x] `./gradlew build -x test` exitoso: **BUILD SUCCESSFUL in 27s**
- [x] `docker compose build ms-cuenta` exitoso
- [x] Contenedor ms-cuenta: **STATUS: healthy**

---

## Problema encontrado y resolución — Flyway baseline race condition

### Causa raíz
MS-cuenta y MS-cliente comparten la misma base de datos `banco_db` (esquema `public`). Cuando Flyway de MS-cuenta arranca por primera vez:
1. No existe `flyway_schema_history_cuenta` (primera vez con Flyway en ms-cuenta)
2. El esquema `public` **no está vacío** (tiene tablas `persona` y `cliente` de ms-cliente)
3. Con `baseline-on-migrate: true`, Flyway detecta objetos existentes y crea un baseline en `baseline-version` (default V1)
4. Al baselinar en V1, Flyway **marca V1 como "ya aplicado"** sin ejecutarlo
5. Intenta ejecutar V2 (índices de `cuenta`) → **FALLA** porque `cuenta` no existe

### Solución
Añadir `SPRING_FLYWAY_BASELINE_VERSION: "0"` como variable de entorno en docker-compose (las env vars sobreescriben el application.yml):
- La propiedad `baseline-version: 0` en YAML no era tomada por Flyway en Spring Boot 4
- La env var fuerza el baseline en la versión "0" (antes de V1)
- Con baseline en V0: Flyway ejecuta V1 (crear tablas), V2 (índices), V3 (datos de prueba)

### Estado Flyway tras la corrección
```
version | description           | success
--------+-----------------------+---------
0       | << Flyway Baseline >> | t
1       | schema cuenta         | t
2       | indexes cuenta        | t
3       | test data cuenta      | t
```

### Lección para futuros microservicios en BD compartida
Cuando múltiples microservicios comparten la misma BD PostgreSQL con Flyway independiente:
- Siempre agregar `SPRING_FLYWAY_BASELINE_VERSION: "0"` en el docker-compose para los servicios que arrancan después de que la BD ya tiene objetos de otros servicios
- O migrar hacia esquemas PostgreSQL separados por microservicio (más robusto a largo plazo)

---

## Estado de todos los contenedores post-implementación

```
banco-postgres   → healthy
banco-rabbitmq   → healthy
ms-cliente       → healthy (Puerto 8081)
ms-cuenta        → healthy (Puerto 8082, Flyway V0-V3 aplicadas)
banco-frontend   → healthy (Puerto 3000)
```

### Tablas cargadas en ms-cuenta
```
cliente_ref:  3 registros (Jose Lema, Marianela Montalvo, Juan Osorio)
cuenta:       5 registros (478758, 585545, 225487, 496825, 495878)
movimiento:   4 registros (datos del ejercicio)
```

---

## Pendiente (próximas tareas en la misma rama)

| Tarea | Descripción |
|---|---|
| TASK-12 (Bloque 2) | Estructura DDD + Hexagonal MS-Cuenta |
| TASK-13 (Bloque 2) | Modelos de dominio y entidades JPA |
| US-02 (Bloque 3) | CRUD de cuentas (POST, GET, PUT, DELETE /api/cuentas) |
