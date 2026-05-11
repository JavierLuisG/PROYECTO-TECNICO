package com.ms_cuenta.domain.valueobject;

import java.math.BigDecimal;
import java.util.Objects;

public record Saldo(BigDecimal valor) {

    public Saldo {
        Objects.requireNonNull(valor, "El saldo no puede ser nulo");
        if (valor.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El saldo no puede ser negativo");
        }
    }
}
