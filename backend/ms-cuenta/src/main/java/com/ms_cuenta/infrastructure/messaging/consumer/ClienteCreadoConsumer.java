package com.ms_cuenta.infrastructure.messaging.consumer;

import com.ms_cuenta.application.port.out.ClienteRefRepositoryPort;
import com.ms_cuenta.domain.event.ClienteCreadoEvent;
import com.ms_cuenta.domain.model.ClienteRef;
import com.ms_cuenta.infrastructure.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClienteCreadoConsumer {

    private final ClienteRefRepositoryPort clienteRefRepositoryPort;

    /**
     * Consume evento cliente-creado publicado por MS-Cliente.
     * Persiste/actualiza ClienteRef para uso en reportes y validación de cuentas.
     * Upsert idempotente: si el clienteId ya existe, JPA hace UPDATE.
     */
    @RabbitListener(queues = RabbitMQConfig.CLIENTE_CREADO_QUEUE)
    @Transactional
    public void consume(ClienteCreadoEvent event) {
        try {
            ClienteRef clienteRef = ClienteRef.builder()
                    .clienteId(UUID.fromString(event.clienteId()))
                    .nombre(event.nombre())
                    .identificacion(event.identificacion())
                    .build();

            clienteRefRepositoryPort.save(clienteRef);

            log.info("ClienteRef sincronizado: clienteId={}, nombre={}",
                    event.clienteId(), event.nombre());
        } catch (Exception e) {
            log.error("Error al procesar evento cliente-creado para clienteId={}: {}",
                    event.clienteId(), e.getMessage());
        }
    }
}
