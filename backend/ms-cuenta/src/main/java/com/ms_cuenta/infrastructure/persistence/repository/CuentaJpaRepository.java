package com.ms_cuenta.infrastructure.persistence.repository;

import com.ms_cuenta.infrastructure.persistence.entity.CuentaEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CuentaJpaRepository extends JpaRepository<CuentaEntity, UUID> {

    boolean existsByNumeroCuenta(String numeroCuenta);

    List<CuentaEntity> findByClienteId(UUID clienteId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CuentaEntity c WHERE c.cuentaId = :cuentaId")
    Optional<CuentaEntity> findByIdWithLock(@Param("cuentaId") UUID cuentaId);
}
