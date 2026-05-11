package com.ms_cuenta.infrastructure.persistence.repository;

import com.ms_cuenta.infrastructure.persistence.entity.MovimientoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MovimientoJpaRepository extends JpaRepository<MovimientoEntity, UUID> {

    List<MovimientoEntity> findByCuentaId(UUID cuentaId);

    List<MovimientoEntity> findByCuentaIdAndFechaBetween(UUID cuentaId, LocalDateTime desde, LocalDateTime hasta);

    boolean existsByCuentaId(UUID cuentaId);
}
