package com.ms_cuenta.domain.exception;

import java.util.UUID;

public class CuentaNotFoundException extends RuntimeException {

    public CuentaNotFoundException(UUID cuentaId) {
        super("Cuenta no encontrada con id: " + cuentaId);
    }
}
