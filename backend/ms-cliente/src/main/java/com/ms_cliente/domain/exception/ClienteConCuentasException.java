package com.ms_cliente.domain.exception;

public class ClienteConCuentasException extends RuntimeException {

    public ClienteConCuentasException(String clienteId) {
        super("No se puede eliminar el cliente porque tiene cuentas asociadas: " + clienteId);
    }
}
