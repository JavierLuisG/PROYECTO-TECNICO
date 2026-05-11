package com.ms_cliente.domain.event;

public record ClienteCreadoEvent(
        String clienteId,
        String nombre,
        String identificacion
) {}
