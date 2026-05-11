package com.ms_cuenta.application.port.out;

import com.ms_cuenta.domain.model.ClienteRef;

import java.util.Optional;
import java.util.UUID;

public interface ClienteRefRepositoryPort {

    /**
     * Persiste o actualiza (upsert idempotente) la referencia del cliente.
     * Llamado al consumir el evento cliente-creado desde RabbitMQ.
     */
    ClienteRef save(ClienteRef clienteRef);

    Optional<ClienteRef> findById(UUID clienteId);
}
