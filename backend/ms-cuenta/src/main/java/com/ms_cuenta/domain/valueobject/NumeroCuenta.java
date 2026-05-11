package com.ms_cuenta.domain.valueobject;

import java.util.Objects;

public record NumeroCuenta(String valor) {

    public NumeroCuenta {
        Objects.requireNonNull(valor, "El número de cuenta no puede ser nulo");
        if (valor.isBlank()) {
            throw new IllegalArgumentException("El número de cuenta no puede estar vacío");
        }
        if (valor.length() > 20) {
            throw new IllegalArgumentException("El número de cuenta no puede superar los 20 caracteres");
        }
    }
}
