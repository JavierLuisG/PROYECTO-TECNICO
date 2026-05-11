package com.ms_cuenta.domain.event;

public record ClienteCreadoEvent(
        String clienteId,
        String nombre,
        String identificacion
) {}
