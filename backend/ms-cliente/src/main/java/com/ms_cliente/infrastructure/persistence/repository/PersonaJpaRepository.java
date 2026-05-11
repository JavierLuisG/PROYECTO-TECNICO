package com.ms_cliente.infrastructure.persistence.repository;

import com.ms_cliente.infrastructure.persistence.entity.PersonaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PersonaJpaRepository extends JpaRepository<PersonaEntity, UUID> {
}
