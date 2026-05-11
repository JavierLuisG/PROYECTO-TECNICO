package com.ms_cuenta.infrastructure.persistence.adapter;

import com.ms_cuenta.application.port.out.MovimientoRepositoryPort;
import com.ms_cuenta.domain.model.Movimiento;
import com.ms_cuenta.infrastructure.persistence.mapper.MovimientoEntityMapper;
import com.ms_cuenta.infrastructure.persistence.repository.MovimientoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MovimientoPersistenceAdapter implements MovimientoRepositoryPort {

    private final MovimientoJpaRepository movimientoJpaRepository;
    private final MovimientoEntityMapper mapper;

    @Override
    public Movimiento save(Movimiento movimiento) {
        return mapper.toDomain(movimientoJpaRepository.save(mapper.toEntity(movimiento)));
    }

    @Override
    public Optional<Movimiento> findById(UUID movimientoId) {
        return movimientoJpaRepository.findById(movimientoId).map(mapper::toDomain);
    }

    @Override
    public List<Movimiento> findAll() {
        return movimientoJpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Movimiento> findByCuentaId(UUID cuentaId) {
        return movimientoJpaRepository.findByCuentaId(cuentaId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Movimiento> findByCuentaIdAndFechaBetween(UUID cuentaId, LocalDateTime desde, LocalDateTime hasta) {
        return movimientoJpaRepository.findByCuentaIdAndFechaBetween(cuentaId, desde, hasta).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID movimientoId) {
        movimientoJpaRepository.deleteById(movimientoId);
    }

    @Override
    public boolean existsByCuentaId(UUID cuentaId) {
        return movimientoJpaRepository.existsByCuentaId(cuentaId);
    }
}
