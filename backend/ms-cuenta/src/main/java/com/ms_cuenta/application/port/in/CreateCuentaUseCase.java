package com.ms_cuenta.application.port.in;

import com.ms_cuenta.domain.model.Cuenta;

public interface CreateCuentaUseCase {

    Cuenta create(Cuenta cuenta);
}
