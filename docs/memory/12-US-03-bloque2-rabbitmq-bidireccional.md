# US-03 Bloque 2 — Integración RabbitMQ Bidireccional (MS-Cuenta)

**Fecha implementación**: 2026-05-11

---

## Archivos creados (3 archivos)

| Archivo | Tipo | Descripción |
|---|---|---|
| `infrastructure/config/RabbitMQConfig.java` | `@Configuration` | Declara exchanges, cola de entrada y serialización JSON |
| `infrastructure/messaging/publisher/MovimientoRegistradoPublisher.java` | `@Component` | Implementa `EventPublisherPort`; publica a `movimiento-registrado-exchange` |
| `infrastructure/messaging/consumer/ClienteCreadoConsumer.java` | `@Component` | Consume `cliente-creado-exchange`; upsert idempotente en `cliente_ref` |

## Archivos modificados/eliminados

| Archivo | Acción | Razón |
|---|---|---|
| `infrastructure/messaging/publisher/NoOpEventPublisher.java` | Eliminado | Stub reemplazado por `MovimientoRegistradoPublisher` |
| `src/main/resources/application.yml` | Sección `spring.cloud.stream` eliminada | Se usa Spring AMQP puro; la config Cloud Stream era obsoleta |

---

## Topología RabbitMQ

```
MS-Cliente                                    MS-Cuenta
──────────────────────────────────────────────────────────────────────
PublicaCREADO ──► [cliente-creado-exchange] ──► ms-cuenta.cliente-creado ──► ClienteCreadoConsumer
                                                                             ↓ upsert cliente_ref

MovimientoRegistradoConsumer ◄── ms-cliente.movimiento-registrado ◄── [movimiento-registrado-exchange] ◄── MovimientoRegistradoPublisher
```

### Recursos declarados en ms-cuenta RabbitMQConfig

| Recurso | Tipo | Descripción |
|---|---|---|
| `cliente-creado-exchange` | TopicExchange durable | Publicado por MS-Cliente |
| `movimiento-registrado-exchange` | TopicExchange durable | Publicado por MS-Cuenta |
| `ms-cuenta.cliente-creado` | Queue durable | Consumida por MS-Cuenta |
| Binding | `ms-cuenta.cliente-creado` → `cliente-creado-exchange` con `#` | Recibe todos los eventos |

---

## TASK-16 — MovimientoRegistradoPublisher

Implementa `EventPublisherPort`. Publica `MovimientoRegistradoEvent` al `movimiento-registrado-exchange` con routing key `"movimiento"` tras cada movimiento exitoso en `MovimientoService`.

**Degradación graceful**: try/catch en `publishMovimientoRegistrado()` — si RabbitMQ no está disponible, el movimiento ya fue persistido; solo se pierde la notificación.

---

## TASK-15 — ClienteCreadoConsumer

`@RabbitListener(queues = "ms-cuenta.cliente-creado")` deserializa el mensaje como `ClienteCreadoEvent` y llama `clienteRefRepositoryPort.save()`.

**Upsert idempotente**: `ClienteRefEntity` no tiene `@GeneratedValue`; el UUID viene del evento. Si el cliente ya existe en `cliente_ref` (cargado por V3 migration), JPA hace `UPDATE` en lugar de `INSERT`. Permite procesar el mismo evento múltiples veces sin efectos secundarios.

---

## Decisiones de diseño

### Spring AMQP (@RabbitListener + RabbitTemplate) vs Spring Cloud Stream

Mismo patrón elegido en MS-Cliente. Spring AMQP es más explícito: las colas, exchanges y bindings se declaran como `@Bean` en `RabbitMQConfig` y son auto-provisionadas al arrancar. Cloud Stream requiere función beans nombrados con convención `in-0`/`out-0`, lo que añade complejidad innecesaria.

### Exchanges declarados en ambos microservicios

Tanto ms-cliente como ms-cuenta declaran `cliente-creado-exchange` y `movimiento-registrado-exchange`. RabbitMQ ignora declaraciones duplicadas si los atributos son idénticos (`durable=true`). Esto garantiza que cualquier microservicio que arranque primero cree el exchange que necesita.

---

## Verificación funcional

```
Colas en RabbitMQ:
  ms-cliente.movimiento-registrado → consumers: 1 ✓
  ms-cuenta.cliente-creado         → consumers: 1 ✓

Flujo Publisher (TASK-16):
  POST /api/movimientos (depósito +100)
  → MovimientoService.registrar()
  → MovimientoRegistradoPublisher publica evento
  → MS-Cliente consume y loguea auditoría ✓

Flujo Consumer (TASK-15):
  POST /api/clientes (nuevo cliente "Test RabbitMQ")
  → MS-Cliente publica cliente-creado
  → ClienteCreadoConsumer hace upsert en cliente_ref
  → Verificado en BD: cliente_ref contiene "34185157-..." ✓
  → POST /api/cuentas para el nuevo cliente → 201 ✓ (validación ClienteRef funciona)
```
