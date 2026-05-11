package com.ms_cuenta.infrastructure.messaging.publisher;

import com.ms_cuenta.application.port.out.EventPublisherPort;
import com.ms_cuenta.domain.event.MovimientoRegistradoEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Stub sin RabbitMQ. Reemplazado por MovimientoRegistradoPublisher en Bloque 2 (TASK-16).
 */
@Slf4j
@Component
public class NoOpEventPublisher implements EventPublisherPort {

    @Override
    public void publishMovimientoRegistrado(MovimientoRegistradoEvent event) {
        log.debug("(stub) movimiento-registrado: cuentaId={}, valor={}, saldoActual={}",
                event.cuentaId(), event.valor(), event.saldoActual());
    }
}
