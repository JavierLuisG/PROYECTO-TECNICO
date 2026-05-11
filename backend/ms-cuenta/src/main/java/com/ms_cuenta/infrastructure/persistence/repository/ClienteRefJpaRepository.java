package com.ms_cuenta.infrastructure.persistence.repository;

import com.ms_cuenta.infrastructure.persistence.entity.ClienteRefEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ClienteRefJpaRepository extends JpaRepository<ClienteRefEntity, UUID> {}
