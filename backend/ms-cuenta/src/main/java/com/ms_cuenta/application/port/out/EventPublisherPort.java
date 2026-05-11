package com.ms_cuenta.application.port.out;

import com.ms_cuenta.domain.event.MovimientoRegistradoEvent;

public interface EventPublisherPort {

    void publishMovimientoRegistrado(MovimientoRegistradoEvent event);
}
