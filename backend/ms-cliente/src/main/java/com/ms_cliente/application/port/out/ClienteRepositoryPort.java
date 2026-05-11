package com.ms_cliente.application.port.out;

import com.ms_cliente.domain.model.Cliente;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClienteRepositoryPort {

    Cliente save(Cliente cliente);

    Optional<Cliente> findById(UUID clienteId);

    List<Cliente> findAll();

    void deleteById(UUID clienteId);

    boolean existsByIdentificacion(String identificacion);
}
