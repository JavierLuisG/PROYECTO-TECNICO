# TASK-05 + TASK-06 — DDD Hexagonal Structure y Domain Models (MS-Cliente)

**Fecha implementación**: 2026-05-10

---

## Archivos creados

### Domain (sin Spring, sin JPA)

| Archivo | Tipo | Descripción |
|---|---|---|
| `domain/model/Persona.java` | POJO + Lombok | Datos personales del cliente |
| `domain/model/Cliente.java` | POJO + Lombok | Credenciales + referencia a Persona |
| `domain/valueobject/Identificacion.java` | Java record | VO inmutable, valida longitud ≤ 20, no vacío |
| `domain/valueobject/Contrasena.java` | Java record | VO inmutable, valida longitud ≥ 8 |
| `domain/exception/ClienteNotFoundException.java` | RuntimeException | Lanzada cuando `findById` no encuentra al cliente |
| `domain/exception/ClienteConCuentasException.java` | RuntimeException | Lanzada al intentar eliminar cliente con cuentas |
| `domain/event/ClienteCreadoEvent.java` | Java record | Evento de dominio publicado a RabbitMQ (TASK-09) |

### Application (interfaces, sin implementación)

| Archivo | Tipo | Descripción |
|---|---|---|
| `application/port/out/ClienteRepositoryPort.java` | Interface | `save`, `findById`, `findAll`, `deleteById`, `existsByIdentificacion` |

### Infrastructure — Persistence

| Archivo | Tipo | Descripción |
|---|---|---|
| `infrastructure/persistence/entity/PersonaEntity.java` | @Entity JPA | Tabla `persona` |
| `infrastructure/persistence/entity/ClienteEntity.java` | @Entity JPA | Tabla `cliente` con @OneToOne → PersonaEntity |
| `infrastructure/persistence/repository/ClienteJpaRepository.java` | JpaRepository | `existsByPersonaIdentificacion`, `findByPersonaIdentificacion` |
| `infrastructure/persistence/repository/PersonaJpaRepository.java` | JpaRepository | Necesario para eliminación explícita en adapter (Bloque 2) |
| `infrastructure/persistence/mapper/ClienteEntityMapper.java` | @Component | Conversión bidireccional Entity ↔ Domain |

---

## Estructura de paquetes resultante

```
com.ms_cliente/
├── MsClienteApplication.java
│
├── application/
│   └── port/
│       └── out/
│           └── ClienteRepositoryPort.java          ← interface
│   (port/in/ y service/ se crean en Bloque 2)
│
├── domain/
│   ├── event/
│   │   └── ClienteCreadoEvent.java                 ← record
│   ├── exception/
│   │   ├── ClienteConCuentasException.java
│   │   └── ClienteNotFoundException.java
│   ├── model/
│   │   ├── Cliente.java                            ← POJO
│   │   └── Persona.java                            ← POJO
│   └── valueobject/
│       ├── Contrasena.java                         ← record
│       └── Identificacion.java                     ← record
│
└── infrastructure/
    └── persistence/
        ├── entity/
        │   ├── ClienteEntity.java                  ← @Entity
        │   └── PersonaEntity.java                  ← @Entity
        ├── mapper/
        │   └── ClienteEntityMapper.java            ← @Component
        └── repository/
            ├── ClienteJpaRepository.java           ← JpaRepository<ClienteEntity, UUID>
            └── PersonaJpaRepository.java           ← JpaRepository<PersonaEntity, UUID>
```

---

## Decisiones de diseño

### Domain models: Lombok sin @Setter

`Persona` y `Cliente` usan `@Getter` + `@Builder` + `@NoArgsConstructor` + `@AllArgsConstructor`.
Sin `@Setter` porque el dominio es **inmutable por convención**: actualizaciones crean un nuevo objeto
vía builder. Esto previene mutaciones accidentales fuera del servicio.

### Value objects: Java records

`Identificacion` y `Contrasena` son Java records (Java 16+). Son inmutables por naturaleza del lenguaje.
La validación ocurre en el bloque compact constructor → imposible crear un VO inválido.

### JPA entities: @PrePersist / @PreUpdate para timestamps

Los campos `created_at` y `updated_at` se inicializan en `@PrePersist` y se actualizan en `@PreUpdate`.
Esto es consistente con el trigger PostgreSQL `update_updated_at_column()` definido en V1 (son redundantes,
pero el trigger en BD actúa como red de seguridad si alguien inserta/actualiza directo al DB).

### CascadeType.PERSIST + MERGE (no REMOVE) en ClienteEntity

```java
@OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
@JoinColumn(name = "persona_id")
private PersonaEntity persona;
```

Con `PERSIST + MERGE`: guardar/actualizar un cliente también guarda/actualiza su persona automáticamente.

**Por qué no `CascadeType.ALL` / `REMOVE`**: La BD tiene `ON DELETE RESTRICT` en `persona ← cliente`.
Si Hibernate intentara borrar la `PersonaEntity` primero (al cascadear REMOVE), violaría la FK porque
aún existe el registro `cliente` que la referencia. El adapter debe borrar en el orden correcto:
1. DELETE cliente → elimina la referencia FK
2. DELETE persona → ya libre de FK

### PersonaJpaRepository (extra respecto al listado de IMPLEMENTATION.md)

Se agregó porque el `ClientePersistenceAdapter` (Bloque 2) necesita eliminar la `PersonaEntity` explícitamente
tras eliminar la `ClienteEntity`. Sin este repositorio, el adapter debería usar `EntityManager` directamente
(menos idiomático para Spring Data).

### GenerationType.UUID para IDs

```java
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;
```

JPA 3.1 (Spring Boot 3.2+, y Spring Boot 4.x) soporta esta estrategia nativamente. Genera el UUID
en la capa de aplicación antes del INSERT, compatible con `DEFAULT gen_random_uuid()` en PostgreSQL.

---

## Criterios de aceptación cubiertos (TASK-05, TASK-06)

- [x] Estructura de paquetes `domain/`, `application/`, `infrastructure/` creada
- [x] Ninguna anotación JPA en `domain/`
- [x] Ninguna referencia a infraestructura en `application/`
- [x] `Persona`: nombre, genero, edad, identificacion, direccion, telefono, estado
- [x] `Cliente`: clienteId, contrasena, estado + referencia a Persona
- [x] `Identificacion` y `Contrasena` como value objects con validación
- [x] `ClienteNotFoundException` y `ClienteConCuentasException` definidas
- [x] Entidades JPA mapean correctamente a las tablas creadas en TASK-01
- [x] Mapper Entity ↔ Domain implementado
- [x] `ClienteRepositoryPort` define el contrato de persistencia para el servicio

---

## Pendiente (Bloque 2)

En el siguiente bloque se implementan:
- `application/port/in/` — interfaces de casos de uso (Create, Get, List, Update, Delete)
- `application/service/ClienteService.java` — implementa port/in, llama a port/out
- `infrastructure/persistence/adapter/ClientePersistenceAdapter.java` — implementa port/out
- `infrastructure/web/controller/ClienteController.java`
- DTOs de request/response y mapper DTO ↔ Domain
- `infrastructure/web/exception/GlobalExceptionHandler.java`
