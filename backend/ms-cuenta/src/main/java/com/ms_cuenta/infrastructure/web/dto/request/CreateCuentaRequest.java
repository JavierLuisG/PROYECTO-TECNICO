package com.ms_cuenta.infrastructure.web.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateCuentaRequest(

        @NotNull(message = "El clienteId es obligatorio")
        UUID clienteId,

        @NotBlank(message = "El número de cuenta es obligatorio")
        @Size(max = 20, message = "El número de cuenta no puede superar 20 caracteres")
        String numeroCuenta,

        @NotBlank(message = "El tipo de cuenta es obligatorio")
        String tipoCuenta,

        @NotNull(message = "El saldo inicial es obligatorio")
        @DecimalMin(value = "0.0", inclusive = true, message = "El saldo inicial debe ser mayor o igual a 0")
        BigDecimal saldoInicial
) {}
