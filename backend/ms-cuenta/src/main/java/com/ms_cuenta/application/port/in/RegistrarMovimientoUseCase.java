package com.ms_cuenta.application.port.in;

import com.ms_cuenta.domain.model.Movimiento;

import java.math.BigDecimal;
import java.util.UUID;

public interface RegistrarMovimientoUseCase {

    /**
     * Registra un movimiento sobre la cuenta indicada.
     * Aplica lock pesimista y valida saldo disponible antes de persistir.
     *
     * @param cuentaId      UUID de la cuenta a afectar
     * @param tipoMovimiento tipo de movimiento (Deposito, Retiro, Transferencia, Pago, Ajuste)
     * @param valor          importe del movimiento (distinto de cero)
     * @param descripcion    descripción opcional del movimiento
     * @return el movimiento registrado con saldos calculados
     */
    Movimiento registrar(UUID cuentaId, String tipoMovimiento, BigDecimal valor, String descripcion);
}
