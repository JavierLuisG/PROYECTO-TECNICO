package com.ms_cuenta.application.service;

import com.ms_cuenta.application.port.in.CuentaConMovimientos;
import com.ms_cuenta.application.port.in.GenerarReporteUseCase;
import com.ms_cuenta.application.port.in.ReporteResult;
import com.ms_cuenta.application.port.out.ClienteRefRepositoryPort;
import com.ms_cuenta.application.port.out.CuentaRepositoryPort;
import com.ms_cuenta.application.port.out.MovimientoRepositoryPort;
import com.ms_cuenta.domain.exception.ClienteRefNotFoundException;
import com.ms_cuenta.domain.model.ClienteRef;
import com.ms_cuenta.domain.model.Cuenta;
import com.ms_cuenta.domain.model.Movimiento;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService implements GenerarReporteUseCase {

    private final ClienteRefRepositoryPort clienteRefRepositoryPort;
    private final CuentaRepositoryPort cuentaRepositoryPort;
    private final MovimientoRepositoryPort movimientoRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public ReporteResult generar(UUID clienteId, LocalDate desde, LocalDate hasta) {
        ClienteRef clienteRef = clienteRefRepositoryPort.findById(clienteId)
                .orElseThrow(() -> new ClienteRefNotFoundException(clienteId));

        LocalDate fechaDesde = desde != null ? desde : LocalDate.of(LocalDate.now().getYear(), 1, 1);
        LocalDate fechaHasta = hasta != null ? hasta : LocalDate.now();

        List<Cuenta> cuentas = cuentaRepositoryPort.findByClienteId(clienteId);

        List<CuentaConMovimientos> cuentasConMovimientos = cuentas.stream()
                .map(cuenta -> {
                    List<Movimiento> movimientos = movimientoRepositoryPort
                            .findByCuentaIdAndFechaBetween(
                                    cuenta.getCuentaId(),
                                    fechaDesde.atStartOfDay(),
                                    fechaHasta.atTime(LocalTime.MAX)
                            );
                    return new CuentaConMovimientos(cuenta, movimientos);
                })
                .collect(Collectors.toList());

        return new ReporteResult(clienteId, clienteRef.getNombre(), fechaDesde, fechaHasta, cuentasConMovimientos);
    }
}
