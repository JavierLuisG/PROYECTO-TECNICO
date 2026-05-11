package com.ms_cuenta.application.port.out;

import com.ms_cuenta.domain.model.Cuenta;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CuentaRepositoryPort {

    Cuenta save(Cuenta cuenta);

    Optional<Cuenta> findById(UUID cuentaId);

    /**
     * Obtiene la cuenta aplicando un lock pesimista (PESSIMISTIC_WRITE).
     * Usar exclusivamente durante el registro de movimientos (US-03).
     */
    Optional<Cuenta> findByIdWithLock(UUID cuentaId);

    List<Cuenta> findAll();

    List<Cuenta> findByClienteId(UUID clienteId);

    void deleteById(UUID cuentaId);

    boolean existsByNumeroCuenta(String numeroCuenta);

    /**
     * Verifica si la cuenta tiene al menos un movimiento registrado.
     * Utilizado para impedir el borrado de cuentas con historial.
     */
    boolean existeMovimientoPorCuenta(UUID cuentaId);
}
