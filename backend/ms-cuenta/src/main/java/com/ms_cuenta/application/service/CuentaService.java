package com.ms_cuenta.application.service;

import com.ms_cuenta.application.port.in.CreateCuentaUseCase;
import com.ms_cuenta.application.port.in.CuentaUpdateData;
import com.ms_cuenta.application.port.in.DeleteCuentaUseCase;
import com.ms_cuenta.application.port.in.GetCuentaUseCase;
import com.ms_cuenta.application.port.in.ListCuentasUseCase;
import com.ms_cuenta.application.port.in.UpdateCuentaUseCase;
import com.ms_cuenta.application.port.out.ClienteRefRepositoryPort;
import com.ms_cuenta.application.port.out.CuentaRepositoryPort;
import com.ms_cuenta.domain.exception.CuentaNotFoundException;
import com.ms_cuenta.domain.model.Cuenta;
import com.ms_cuenta.domain.valueobject.TipoCuenta;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CuentaService implements
        CreateCuentaUseCase,
        GetCuentaUseCase,
        ListCuentasUseCase,
        UpdateCuentaUseCase,
        DeleteCuentaUseCase {

    private final CuentaRepositoryPort cuentaRepositoryPort;
    private final ClienteRefRepositoryPort clienteRefRepositoryPort;

    @Override
    @Transactional
    public Cuenta create(Cuenta cuenta) {
        if (cuentaRepositoryPort.existsByNumeroCuenta(cuenta.getNumeroCuenta())) {
            throw new IllegalArgumentException("Número de cuenta ya registrado: " + cuenta.getNumeroCuenta());
        }
        clienteRefRepositoryPort.findById(cuenta.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con id: " + cuenta.getClienteId()));

        Cuenta nuevaCuenta = Cuenta.builder()
                .clienteId(cuenta.getClienteId())
                .numeroCuenta(cuenta.getNumeroCuenta())
                .tipoCuenta(cuenta.getTipoCuenta())
                .saldoInicial(cuenta.getSaldoInicial())
                .saldo(cuenta.getSaldoInicial())
                .estado(true)
                .build();

        return cuentaRepositoryPort.save(nuevaCuenta);
    }

    @Override
    @Transactional(readOnly = true)
    public Cuenta getById(UUID cuentaId) {
        return cuentaRepositoryPort.findById(cuentaId)
                .orElseThrow(() -> new CuentaNotFoundException(cuentaId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cuenta> listAll() {
        return cuentaRepositoryPort.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cuenta> listByClienteId(UUID clienteId) {
        return cuentaRepositoryPort.findByClienteId(clienteId);
    }

    @Override
    @Transactional
    public Cuenta update(UUID cuentaId, CuentaUpdateData data) {
        Cuenta existing = cuentaRepositoryPort.findById(cuentaId)
                .orElseThrow(() -> new CuentaNotFoundException(cuentaId));

        TipoCuenta tipoCuenta = existing.getTipoCuenta();
        if (data.tipoCuenta() != null) {
            tipoCuenta = parseTipoCuenta(data.tipoCuenta());
        }

        boolean estado = data.estado() != null ? data.estado() : existing.isEstado();

        Cuenta updated = Cuenta.builder()
                .cuentaId(existing.getCuentaId())
                .clienteId(existing.getClienteId())
                .numeroCuenta(existing.getNumeroCuenta())
                .tipoCuenta(tipoCuenta)
                .saldoInicial(existing.getSaldoInicial())
                .saldo(existing.getSaldo())
                .estado(estado)
                .createdAt(existing.getCreatedAt())
                .build();

        return cuentaRepositoryPort.save(updated);
    }

    @Override
    @Transactional
    public void deleteById(UUID cuentaId) {
        if (!cuentaRepositoryPort.findById(cuentaId).isPresent()) {
            throw new CuentaNotFoundException(cuentaId);
        }
        if (cuentaRepositoryPort.existeMovimientoPorCuenta(cuentaId)) {
            throw new IllegalArgumentException("La cuenta tiene movimientos registrados");
        }
        cuentaRepositoryPort.deleteById(cuentaId);
    }

    private TipoCuenta parseTipoCuenta(String valor) {
        try {
            return TipoCuenta.valueOf(valor);
        } catch (IllegalArgumentException e) {
            String validos = Arrays.stream(TipoCuenta.values())
                    .map(Enum::name)
                    .collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Tipo de cuenta inválido: '" + valor + "'. Valores válidos: " + validos);
        }
    }
}
