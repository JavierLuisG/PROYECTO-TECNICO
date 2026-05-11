package com.ms_cliente.infrastructure.messaging.publisher;

import com.ms_cliente.application.port.out.EventPublisherPort;
import com.ms_cliente.domain.event.ClienteCreadoEvent;
import com.ms_cliente.infrastructure.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ClienteCreadoPublisher implements EventPublisherPort {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publishClienteCreado(ClienteCreadoEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.CLIENTE_CREADO_EXCHANGE,
                    "cliente",
                    event
            );
            log.info("Evento cliente-creado publicado: clienteId={}, nombre={}",
                    event.clienteId(), event.nombre());
        } catch (Exception e) {
            // Degradación graceful: el cliente ya fue creado en BD.
            // RabbitMQ puede estar temporalmente no disponible.
            log.warn("No se pudo publicar evento cliente-creado para clienteId={}: {}",
                    event.clienteId(), e.getMessage());
        }
    }
}
