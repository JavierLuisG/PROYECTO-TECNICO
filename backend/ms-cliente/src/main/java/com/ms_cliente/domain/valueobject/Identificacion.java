package com.ms_cliente.domain.valueobject;

import java.util.Objects;

public record Identificacion(String valor) {

    public Identificacion {
        Objects.requireNonNull(valor, "La identificacion no puede ser nula");
        if (valor.isBlank()) {
            throw new IllegalArgumentException("La identificacion no puede estar vacía");
        }
        if (valor.length() > 20) {
            throw new IllegalArgumentException("La identificacion no puede superar 20 caracteres");
        }
    }
}
