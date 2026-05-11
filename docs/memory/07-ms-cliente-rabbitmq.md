# TASK-09 + TASK-10 — Mensajería RabbitMQ (MS-Cliente)
 
**Fecha implementación**: 2026-05-11

---

## Archivos creados

| Archivo | Propósito |
|---|---|
| `application/port/out/EventPublisherPort.java` | Interface hexagonal para publicación de eventos |
| `infrastructure/config/RabbitMQConfig.java` | Declaración de exchanges, cola y binding; converter JSON |
| `infrastructure/messaging/publisher/ClienteCreadoPublisher.java` | Implementa EventPublisherPort con RabbitTemplate |
| `infrastructure/messaging/consumer/MovimientoRegistradoConsumer.java` | @RabbitListener para auditoría de movimientos |

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `application/service/ClienteService.java` | Inyecta `EventPublisherPort`; publica `ClienteCreadoEvent` tras `create` exitoso |
| `application/yml` (perfil docker) | Corregido `com.msclient` → `com.ms_cliente` en logging |

---

## Flujo de mensajería implementado

### TASK-09 — Publisher `cliente-creado`

```
POST /api/clientes
    ↓ ClienteController
    ↓ ClienteService.create()
    ↓ clienteRepositoryPort.save(cliente) ← commit en BD
    ↓ eventPublisherPort.publishClienteCreado(ClienteCreadoEvent)
    ↓ ClienteCreadoPublisher.publishClienteCreado()
    ↓ RabbitTemplate.convertAndSend("cliente-creado-exchange", "cliente", event)
    → RabbitMQ: cliente-creado-exchange
```

**Payload** (`ClienteCreadoEvent` record):
```json
{ "clienteId": "uuid", "nombre": "string", "identificacion": "string" }
```

**Degradación graceful**: Si RabbitMQ no está disponible, el publisher captura la excepción y registra un WARN. El cliente YA fue guardado en BD — no hay rollback del negocio.

### TASK-10 — Consumer `movimiento-registrado`

```
RabbitMQ: movimiento-registrado-exchange
    → cola: ms-cliente.movimiento-registrado (routing key: #)
    → MovimientoRegistradoConsumer.consume(Map<String,Object>)
    → log.info("Auditoria — movimiento-registrado: ...")
```

**Payload deserializado como** `Map<String, Object>` para tolerancia a cambios de schema en MS-Cuenta.

---

## RabbitMQConfig — Declaraciones

| Componente | Nombre | Tipo | Durabilidad |
|---|---|---|---|
| Exchange | `cliente-creado-exchange` | TopicExchange | durable |
| Exchange | `movimiento-registrado-exchange` | TopicExchange | durable |
| Queue | `ms-cliente.movimiento-registrado` | Queue | durable |
| Binding | cola → exchange | routing key `#` | — |
| Converter | `Jackson2JsonMessageConverter` | JSON | — |

---

## Verificación funcional

```
# Cola activa en RabbitMQ:
ms-cliente.movimiento-registrado: messages=0, consumers=1

# Log al crear cliente:
INFO c.m.i.m.p.ClienteCreadoPublisher - Evento cliente-creado publicado: clienteId=..., nombre=...
```

---

## Decisiones de diseño

### Spring AMQP en lugar de Spring Cloud Stream functions

Se usó **Spring AMQP** (`RabbitTemplate` + `@RabbitListener`) en lugar de Spring Cloud Stream functions porque:
1. Más directo y explícito — sin necesidad de configurar `spring.cloud.function.definition`
2. El `@RabbitListener` acepta directamente el nombre de cola declarado en `RabbitMQConfig`
3. El `StreamBridge` (Cloud Stream) y el `RabbitTemplate` (AMQP) coexisten en el classpath sin conflicto
4. La configuración Cloud Stream en application.yml (bindings) permanece como referencia futura pero no está activa (sin function beans registrados)

### EventPublisherPort — Puerto hexagonal

```
application/port/out/EventPublisherPort
     ↑ implementa
infrastructure/messaging/publisher/ClienteCreadoPublisher
```

`ClienteService` (capa de aplicación) solo conoce `EventPublisherPort` (interfaz). No hay dependencia directa en RabbitMQ/Spring AMQP desde la capa de aplicación. Correcto con la regla de dependencia hexagonal.

### Consumer con Map<String, Object>

El consumer desserializa el payload como `Map<String, Object>` (genérico) en lugar de un DTO específico. Esto evita acoplar MS-Cliente al schema exacto del evento publicado por MS-Cuenta. Si MS-Cuenta agrega campos al evento, MS-Cliente no falla — simplemente no los usa.

### Corrección de logging (perfil Docker)

El perfil Docker tenía `com.msclient` (sin guión bajo) cuando el paquete real es `com.ms_cliente`. La corrección permite ver los logs INFO del publisher en el contenedor.

---
