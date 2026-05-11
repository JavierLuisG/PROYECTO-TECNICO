package com.ms_cliente.domain.valueobject;

import java.util.Objects;

public record Contrasena(String valor) {

    public Contrasena {
        Objects.requireNonNull(valor, "La contraseña no puede ser nula");
        if (valor.isBlank()) {
            throw new IllegalArgumentException("La contraseña no puede estar vacía");
        }
        if (valor.length() < 8) {
            throw new IllegalArgumentException("La contraseña debe tener mínimo 8 caracteres");
        }
    }
}
