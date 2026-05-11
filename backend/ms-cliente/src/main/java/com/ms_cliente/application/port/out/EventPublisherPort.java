package com.ms_cliente.application.port.out;

import com.ms_cliente.domain.event.ClienteCreadoEvent;

public interface EventPublisherPort {

    void publishClienteCreado(ClienteCreadoEvent event);
}
