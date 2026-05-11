package com.ms_cliente.application.port.in;

import com.ms_cliente.domain.model.Cliente;

import java.util.UUID;

public interface UpdateClienteUseCase {

    Cliente update(UUID clienteId, ClienteUpdateData data);
}
