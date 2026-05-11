package com.ms_cuenta.domain.model;

import com.ms_cuenta.domain.valueobject.TipoCuenta;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cuenta {

    private UUID cuentaId;
    private UUID clienteId;
    private String numeroCuenta;
    private TipoCuenta tipoCuenta;
    private BigDecimal saldoInicial;
    private BigDecimal saldo;
    private boolean estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
