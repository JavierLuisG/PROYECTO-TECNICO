package com.ms_cuenta.domain.model;

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
public class Movimiento {

    private UUID movimientoId;
    private UUID cuentaId;
    private LocalDateTime fecha;
    private String tipoMovimiento;
    private BigDecimal valor;
    private BigDecimal saldoAnterior;
    private BigDecimal saldoActual;
    private String descripcion;
    private LocalDateTime createdAt;
}
