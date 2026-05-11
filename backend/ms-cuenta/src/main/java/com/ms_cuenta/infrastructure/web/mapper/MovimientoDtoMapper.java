package com.ms_cuenta.infrastructure.web.mapper;

import com.ms_cuenta.domain.model.Movimiento;
import com.ms_cuenta.infrastructure.web.dto.request.RegistrarMovimientoRequest;
import com.ms_cuenta.infrastructure.web.dto.response.MovimientoResponse;
import org.springframework.stereotype.Component;

@Component
public class MovimientoDtoMapper {

    public MovimientoResponse toResponse(Movimiento movimiento) {
        return new MovimientoResponse(
                movimiento.getMovimientoId(),
                movimiento.getCuentaId(),
                movimiento.getFecha(),
                movimiento.getTipoMovimiento(),
                movimiento.getValor(),
                movimiento.getSaldoAnterior(),
                movimiento.getSaldoActual(),
                movimiento.getDescripcion(),
                movimiento.getCreatedAt()
        );
    }
}
