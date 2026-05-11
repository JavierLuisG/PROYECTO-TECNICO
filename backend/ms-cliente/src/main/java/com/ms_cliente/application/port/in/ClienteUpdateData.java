package com.ms_cliente.application.port.in;

public record ClienteUpdateData(
        String nombre,
        Integer edad,
        String direccion,
        String telefono,
        Boolean estado
) {}
