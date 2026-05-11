package com.ms_cuenta.application.port.in;

import com.ms_cuenta.domain.model.Cuenta;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface GenerarReporteUseCase {

    /**
     * Devuelve las cuentas con sus movimientos filtrados por rango de fechas
     * para el cliente indicado. El tipo de retorno exacto se refinará en US-04.
     *
     * @param clienteId UUID del cliente
     * @param desde     fecha de inicio del rango (inclusive)
     * @param hasta     fecha de fin del rango (inclusive)
     * @return lista de cuentas del cliente que tuvieron actividad en el periodo
     */
    List<Cuenta> getCuentasConMovimientosPorCliente(UUID clienteId, LocalDate desde, LocalDate hasta);
}
