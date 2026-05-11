package com.ms_cuenta.infrastructure.web.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record RegistrarMovimientoRequest(

        @NotNull(message = "El cuentaId es obligatorio")
        UUID cuentaId,

        @NotBlank(message = "El tipo de movimiento es obligatorio")
        String tipoMovimiento,

        @NotNull(message = "El valor es obligatorio")
        BigDecimal valor,

        String descripcion
) {}
