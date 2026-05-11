package com.ms_cuenta.application.port.out;

import com.ms_cuenta.domain.model.Movimiento;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MovimientoRepositoryPort {

    Movimiento save(Movimiento movimiento);

    Optional<Movimiento> findById(UUID movimientoId);

    List<Movimiento> findAll();

    List<Movimiento> findByCuentaId(UUID cuentaId);

    List<Movimiento> findByCuentaIdAndFechaBetween(UUID cuentaId, LocalDateTime desde, LocalDateTime hasta);

    void deleteById(UUID movimientoId);

    boolean existsByCuentaId(UUID cuentaId);
}
