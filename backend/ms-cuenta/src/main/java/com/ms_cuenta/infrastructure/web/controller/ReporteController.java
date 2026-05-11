package com.ms_cuenta.infrastructure.web.controller;

import com.ms_cuenta.application.port.in.CuentaConMovimientos;
import com.ms_cuenta.application.port.in.GenerarReporteUseCase;
import com.ms_cuenta.application.port.in.ReporteResult;
import com.ms_cuenta.domain.model.Movimiento;
import com.ms_cuenta.infrastructure.web.dto.response.CuentaReporteResponse;
import com.ms_cuenta.infrastructure.web.dto.response.MovimientoReporteResponse;
import com.ms_cuenta.infrastructure.web.dto.response.ReporteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final GenerarReporteUseCase generarReporteUseCase;

    @GetMapping
    public ReporteResponse generar(
            @RequestParam UUID clienteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        ReporteResult result = generarReporteUseCase.generar(clienteId, desde, hasta);
        return toResponse(result);
    }

    private ReporteResponse toResponse(ReporteResult result) {
        List<CuentaReporteResponse> cuentas = result.cuentas().stream()
                .map(this::toCuentaResponse)
                .collect(Collectors.toList());

        return new ReporteResponse(
                result.clienteId(),
                result.nombreCliente(),
                result.desde(),
                result.hasta(),
                cuentas
        );
    }

    private CuentaReporteResponse toCuentaResponse(CuentaConMovimientos ccm) {
        List<MovimientoReporteResponse> movimientos = ccm.movimientos().stream()
                .map(this::toMovimientoResponse)
                .collect(Collectors.toList());

        return new CuentaReporteResponse(
                ccm.cuenta().getCuentaId(),
                ccm.cuenta().getNumeroCuenta(),
                ccm.cuenta().getTipoCuenta() != null ? ccm.cuenta().getTipoCuenta().name() : null,
                ccm.cuenta().getSaldoInicial(),
                ccm.cuenta().getSaldo(),
                ccm.cuenta().isEstado(),
                movimientos
        );
    }

    private MovimientoReporteResponse toMovimientoResponse(Movimiento m) {
        return new MovimientoReporteResponse(
                m.getMovimientoId(),
                m.getFecha(),
                m.getTipoMovimiento(),
                m.getValor(),
                m.getSaldoAnterior(),
                m.getSaldoActual(),
                m.getDescripcion()
        );
    }
}
