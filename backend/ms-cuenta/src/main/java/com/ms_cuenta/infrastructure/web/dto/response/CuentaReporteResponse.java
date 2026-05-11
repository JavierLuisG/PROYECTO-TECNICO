package com.ms_cuenta.infrastructure.web.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CuentaReporteResponse(
        UUID cuentaId,
        String numeroCuenta,
        String tipoCuenta,
        BigDecimal saldoInicial,
        BigDecimal saldoActual,
        boolean estado,
        List<MovimientoReporteResponse> movimientos
) {}
