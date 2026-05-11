package com.ms_cuenta.infrastructure.persistence.mapper;

import com.ms_cuenta.domain.model.Cuenta;
import com.ms_cuenta.infrastructure.persistence.entity.CuentaEntity;
import org.springframework.stereotype.Component;

@Component
public class CuentaEntityMapper {

    public Cuenta toDomain(CuentaEntity entity) {
        return Cuenta.builder()
                .cuentaId(entity.getCuentaId())
                .clienteId(entity.getClienteId())
                .numeroCuenta(entity.getNumeroCuenta())
                .tipoCuenta(entity.getTipoCuenta())
                .saldoInicial(entity.getSaldoInicial())
                .saldo(entity.getSaldo())
                .estado(entity.isEstado())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public CuentaEntity toEntity(Cuenta domain) {
        return CuentaEntity.builder()
                .cuentaId(domain.getCuentaId())
                .clienteId(domain.getClienteId())
                .numeroCuenta(domain.getNumeroCuenta())
                .tipoCuenta(domain.getTipoCuenta())
                .saldoInicial(domain.getSaldoInicial())
                .saldo(domain.getSaldo())
                .estado(domain.isEstado())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
