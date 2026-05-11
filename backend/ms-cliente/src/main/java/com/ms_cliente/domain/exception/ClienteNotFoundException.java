package com.ms_cliente.domain.exception;

public class ClienteNotFoundException extends RuntimeException {

    public ClienteNotFoundException(String clienteId) {
        super("Cliente no encontrado con id: " + clienteId);
    }
}
