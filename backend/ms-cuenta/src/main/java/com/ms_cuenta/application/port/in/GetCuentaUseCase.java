package com.ms_cuenta.application.port.in;

import com.ms_cuenta.domain.model.Cuenta;

import java.util.UUID;

public interface GetCuentaUseCase {

    Cuenta getById(UUID cuentaId);
}
