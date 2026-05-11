package com.ms_cliente.infrastructure.persistence.repository;

import com.ms_cliente.infrastructure.persistence.entity.ClienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ClienteJpaRepository extends JpaRepository<ClienteEntity, UUID> {

    boolean existsByPersonaIdentificacion(String identificacion);

    Optional<ClienteEntity> findByPersonaIdentificacion(String identificacion);
}
