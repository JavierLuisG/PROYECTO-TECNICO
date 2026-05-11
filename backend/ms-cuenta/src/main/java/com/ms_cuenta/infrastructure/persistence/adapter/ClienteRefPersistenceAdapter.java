package com.ms_cuenta.infrastructure.persistence.adapter;

import com.ms_cuenta.application.port.out.ClienteRefRepositoryPort;
import com.ms_cuenta.domain.model.ClienteRef;
import com.ms_cuenta.infrastructure.persistence.entity.ClienteRefEntity;
import com.ms_cuenta.infrastructure.persistence.repository.ClienteRefJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ClienteRefPersistenceAdapter implements ClienteRefRepositoryPort {

    private final ClienteRefJpaRepository clienteRefJpaRepository;

    @Override
    public ClienteRef save(ClienteRef clienteRef) {
        ClienteRefEntity entity = ClienteRefEntity.builder()
                .clienteId(clienteRef.getClienteId())
                .nombre(clienteRef.getNombre())
                .identificacion(clienteRef.getIdentificacion())
                .build();
        ClienteRefEntity saved = clienteRefJpaRepository.save(entity);
        return ClienteRef.builder()
                .clienteId(saved.getClienteId())
                .nombre(saved.getNombre())
                .identificacion(saved.getIdentificacion())
                .build();
    }

    @Override
    public Optional<ClienteRef> findById(UUID clienteId) {
        return clienteRefJpaRepository.findById(clienteId)
                .map(e -> ClienteRef.builder()
                        .clienteId(e.getClienteId())
                        .nombre(e.getNombre())
                        .identificacion(e.getIdentificacion())
                        .build());
    }
}
