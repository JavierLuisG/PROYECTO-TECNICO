package com.ms_cuenta.infrastructure.persistence.adapter;

import com.ms_cuenta.application.port.out.CuentaRepositoryPort;
import com.ms_cuenta.domain.model.Cuenta;
import com.ms_cuenta.infrastructure.persistence.mapper.CuentaEntityMapper;
import com.ms_cuenta.infrastructure.persistence.repository.CuentaJpaRepository;
import com.ms_cuenta.infrastructure.persistence.repository.MovimientoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CuentaPersistenceAdapter implements CuentaRepositoryPort {

    private final CuentaJpaRepository cuentaJpaRepository;
    private final MovimientoJpaRepository movimientoJpaRepository;
    private final CuentaEntityMapper mapper;

    @Override
    public Cuenta save(Cuenta cuenta) {
        return mapper.toDomain(cuentaJpaRepository.save(mapper.toEntity(cuenta)));
    }

    @Override
    public Optional<Cuenta> findById(UUID cuentaId) {
        return cuentaJpaRepository.findById(cuentaId).map(mapper::toDomain);
    }

    @Override
    public Optional<Cuenta> findByIdWithLock(UUID cuentaId) {
        return cuentaJpaRepository.findByIdWithLock(cuentaId).map(mapper::toDomain);
    }

    @Override
    public List<Cuenta> findAll() {
        return cuentaJpaRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Cuenta> findByClienteId(UUID clienteId) {
        return cuentaJpaRepository.findByClienteId(clienteId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID cuentaId) {
        cuentaJpaRepository.deleteById(cuentaId);
    }

    @Override
    public boolean existsByNumeroCuenta(String numeroCuenta) {
        return cuentaJpaRepository.existsByNumeroCuenta(numeroCuenta);
    }

    @Override
    public boolean existeMovimientoPorCuenta(UUID cuentaId) {
        return movimientoJpaRepository.existsByCuentaId(cuentaId);
    }
}
