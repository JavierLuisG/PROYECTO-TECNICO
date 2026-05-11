package com.ms_cuenta.infrastructure.web.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record MovimientoReporteResponse(
        UUID movimientoId,
        LocalDateTime fecha,
        String tipoMovimiento,
        BigDecimal valor,
        BigDecimal saldoAnterior,
        BigDecimal saldoActual,
        String descripcion
) {}
