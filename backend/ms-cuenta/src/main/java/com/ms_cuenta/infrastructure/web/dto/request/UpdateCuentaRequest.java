package com.ms_cuenta.infrastructure.web.dto.request;

public record UpdateCuentaRequest(
        String tipoCuenta,
        Boolean estado
) {}
