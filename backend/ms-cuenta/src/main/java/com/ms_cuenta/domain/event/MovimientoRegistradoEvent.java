package com.ms_cuenta.domain.event;

import java.math.BigDecimal;

public record MovimientoRegistradoEvent(
        String movimientoId,
        String cuentaId,
        BigDecimal valor,
        BigDecimal saldoActual,
        String fecha
) {}
