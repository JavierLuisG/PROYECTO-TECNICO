package com.ms_cliente.infrastructure.web.dto.response;

public record ErrorResponse(
        String timestamp,
        int status,
        String error,
        String message,
        String path
) {}
