package com.ms_cuenta.domain.exception;

import java.util.UUID;

public class ClienteRefNotFoundException extends RuntimeException {

    public ClienteRefNotFoundException(UUID clienteId) {
        super("Cliente no encontrado con id: " + clienteId);
    }
}
