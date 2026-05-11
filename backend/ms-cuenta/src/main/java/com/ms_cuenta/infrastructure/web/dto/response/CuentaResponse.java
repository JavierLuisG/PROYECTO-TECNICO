package com.ms_cuenta.infrastructure.web.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CuentaResponse(
        UUID cuentaId,
        UUID clienteId,
        String numeroCuenta,
        String tipoCuenta,
        BigDecimal saldoInicial,
        BigDecimal saldo,
        boolean estado,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
