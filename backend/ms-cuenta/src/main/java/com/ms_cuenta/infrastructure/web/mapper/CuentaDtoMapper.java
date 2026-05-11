package com.ms_cuenta.infrastructure.web.mapper;

import com.ms_cuenta.domain.model.Cuenta;
import com.ms_cuenta.domain.valueobject.TipoCuenta;
import com.ms_cuenta.infrastructure.web.dto.request.CreateCuentaRequest;
import com.ms_cuenta.infrastructure.web.dto.response.CuentaResponse;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

@Component
public class CuentaDtoMapper {

    public Cuenta toDomain(CreateCuentaRequest request) {
        return Cuenta.builder()
                .clienteId(request.clienteId())
                .numeroCuenta(request.numeroCuenta())
                .tipoCuenta(parseTipoCuenta(request.tipoCuenta()))
                .saldoInicial(request.saldoInicial())
                .build();
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

    public CuentaResponse toResponse(Cuenta cuenta) {
        return new CuentaResponse(
                cuenta.getCuentaId(),
                cuenta.getClienteId(),
                cuenta.getNumeroCuenta(),
                cuenta.getTipoCuenta() != null ? cuenta.getTipoCuenta().name() : null,
                cuenta.getSaldoInicial(),
                cuenta.getSaldo(),
                cuenta.isEstado(),
                cuenta.getCreatedAt(),
                cuenta.getUpdatedAt()
        );
    }
}
