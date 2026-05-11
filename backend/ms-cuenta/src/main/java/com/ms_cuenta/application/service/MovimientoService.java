package com.ms_cuenta.application.service;

import com.ms_cuenta.application.port.in.RegistrarMovimientoUseCase;
import com.ms_cuenta.application.port.out.CuentaRepositoryPort;
import com.ms_cuenta.application.port.out.EventPublisherPort;
import com.ms_cuenta.application.port.out.MovimientoRepositoryPort;
import com.ms_cuenta.domain.event.MovimientoRegistradoEvent;
import com.ms_cuenta.domain.exception.CuentaNotFoundException;
import com.ms_cuenta.domain.exception.SaldoInsuficienteException;
import com.ms_cuenta.domain.model.Cuenta;
import com.ms_cuenta.domain.model.Movimiento;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MovimientoService implements RegistrarMovimientoUseCase {

    private final CuentaRepositoryPort cuentaRepositoryPort;
    private final MovimientoRepositoryPort movimientoRepositoryPort;
    private final EventPublisherPort eventPublisherPort;

    @Override
    @Transactional
    public Movimiento registrar(UUID cuentaId, String tipoMovimiento, BigDecimal valor, String descripcion) {
        if (valor.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("El valor del movimiento no puede ser cero");
        }

        // 1. Obtener cuenta con lock pesimista
        Cuenta cuenta = cuentaRepositoryPort.findByIdWithLock(cuentaId)
                .orElseThrow(() -> new CuentaNotFoundException(cuentaId));

        // 2. Validar saldo para retiros (valor negativo)
        BigDecimal saldoResultante = cuenta.getSaldo().add(valor);
        if (saldoResultante.compareTo(BigDecimal.ZERO) < 0) {
            throw new SaldoInsuficienteException();
        }

        // 3. Calcular saldos de auditoría
        BigDecimal saldoAnterior = cuenta.getSaldo();
        BigDecimal saldoActual = saldoResultante;

        // 4a. Persistir movimiento
        Movimiento movimiento = Movimiento.builder()
                .cuentaId(cuentaId)
                .tipoMovimiento(tipoMovimiento)
                .valor(valor)
                .saldoAnterior(saldoAnterior)
                .saldoActual(saldoActual)
                .descripcion(descripcion)
                .build();

        Movimiento saved = movimientoRepositoryPort.save(movimiento);

        // 4b. Actualizar saldo de la cuenta
        Cuenta cuentaActualizada = Cuenta.builder()
                .cuentaId(cuenta.getCuentaId())
                .clienteId(cuenta.getClienteId())
                .numeroCuenta(cuenta.getNumeroCuenta())
                .tipoCuenta(cuenta.getTipoCuenta())
                .saldoInicial(cuenta.getSaldoInicial())
                .saldo(saldoActual)
                .estado(cuenta.isEstado())
                .createdAt(cuenta.getCreatedAt())
                .build();

        cuentaRepositoryPort.save(cuentaActualizada);

        // 5. Publicar evento
        eventPublisherPort.publishMovimientoRegistrado(new MovimientoRegistradoEvent(
                saved.getMovimientoId().toString(),
                cuentaId.toString(),
                valor,
                saldoActual,
                saved.getFecha().toString()
        ));

        return saved;
    }
}
