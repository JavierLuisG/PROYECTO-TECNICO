package com.ms_cuenta.infrastructure.messaging.publisher;

import com.ms_cuenta.application.port.out.EventPublisherPort;
import com.ms_cuenta.domain.event.MovimientoRegistradoEvent;
import com.ms_cuenta.infrastructure.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MovimientoRegistradoPublisher implements EventPublisherPort {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void publishMovimientoRegistrado(MovimientoRegistradoEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.MOVIMIENTO_REGISTRADO_EXCHANGE,
                    "movimiento",
                    event
            );
            log.info("Evento movimiento-registrado publicado: movimientoId={}, cuentaId={}, valor={}, saldoActual={}",
                    event.movimientoId(), event.cuentaId(), event.valor(), event.saldoActual());
        } catch (Exception e) {
            log.warn("No se pudo publicar evento movimiento-registrado para cuentaId={}: {}",
                    event.cuentaId(), e.getMessage());
        }
    }
}
