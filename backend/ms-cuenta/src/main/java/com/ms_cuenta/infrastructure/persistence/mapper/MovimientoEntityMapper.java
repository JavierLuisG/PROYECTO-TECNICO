package com.ms_cuenta.infrastructure.persistence.mapper;

import com.ms_cuenta.domain.model.Movimiento;
import com.ms_cuenta.infrastructure.persistence.entity.MovimientoEntity;
import org.springframework.stereotype.Component;

@Component
public class MovimientoEntityMapper {

    public Movimiento toDomain(MovimientoEntity entity) {
        return Movimiento.builder()
                .movimientoId(entity.getMovimientoId())
                .cuentaId(entity.getCuentaId())
                .fecha(entity.getFecha())
                .tipoMovimiento(entity.getTipoMovimiento())
                .valor(entity.getValor())
                .saldoAnterior(entity.getSaldoAnterior())
                .saldoActual(entity.getSaldoActual())
                .descripcion(entity.getDescripcion())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public MovimientoEntity toEntity(Movimiento domain) {
        return MovimientoEntity.builder()
                .movimientoId(domain.getMovimientoId())
                .cuentaId(domain.getCuentaId())
                .fecha(domain.getFecha())
                .tipoMovimiento(domain.getTipoMovimiento())
                .valor(domain.getValor())
                .saldoAnterior(domain.getSaldoAnterior())
                .saldoActual(domain.getSaldoActual())
                .descripcion(domain.getDescripcion())
                .createdAt(domain.getCreatedAt())
                .build();
    }
}
