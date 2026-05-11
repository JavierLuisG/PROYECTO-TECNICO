package com.ms_cliente.application.port.in;

import java.util.UUID;

public interface DeleteClienteUseCase {

    void deleteById(UUID clienteId);
}
