package com.ms_cliente.infrastructure.persistence.adapter;

import com.ms_cliente.application.port.out.ClienteRepositoryPort;
import com.ms_cliente.domain.model.Cliente;
import com.ms_cliente.infrastructure.persistence.entity.ClienteEntity;
import com.ms_cliente.infrastructure.persistence.mapper.ClienteEntityMapper;
import com.ms_cliente.infrastructure.persistence.repository.ClienteJpaRepository;
import com.ms_cliente.infrastructure.persistence.repository.PersonaJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ClientePersistenceAdapter implements ClienteRepositoryPort {

    private final ClienteJpaRepository clienteJpaRepository;
    private final PersonaJpaRepository personaJpaRepository;
    private final ClienteEntityMapper clienteEntityMapper;

    @Override
    public Cliente save(Cliente cliente) {
        ClienteEntity entity = clienteEntityMapper.toEntity(cliente);
        ClienteEntity saved = clienteJpaRepository.save(entity);
        return clienteEntityMapper.toDomain(saved);
    }

    @Override
    public Optional<Cliente> findById(UUID clienteId) {
        return clienteJpaRepository.findById(clienteId)
                .map(clienteEntityMapper::toDomain);
    }

    @Override
    public List<Cliente> findAll() {
        return clienteJpaRepository.findAll().stream()
                .map(clienteEntityMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public void deleteById(UUID clienteId) {
        ClienteEntity entity = clienteJpaRepository.findById(clienteId)
                .orElseThrow(() -> new IllegalStateException("ClienteEntity no encontrada: " + clienteId));
        UUID personaId = entity.getPersona().getId();
        clienteJpaRepository.deleteById(clienteId);
        personaJpaRepository.deleteById(personaId);
    }

    @Override
    public boolean existsByIdentificacion(String identificacion) {
        return clienteJpaRepository.existsByPersonaIdentificacion(identificacion);
    }
}
