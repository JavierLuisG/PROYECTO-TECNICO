package com.ms_cliente.application.port.in;

import com.ms_cliente.domain.model.Cliente;

public interface CreateClienteUseCase {

    Cliente create(Cliente cliente);
}
