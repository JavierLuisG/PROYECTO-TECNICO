package com.ms_cuenta.application.port.in;

import com.ms_cuenta.domain.model.Cuenta;

import java.util.List;
import java.util.UUID;

public interface ListCuentasUseCase {

    List<Cuenta> listAll();

    List<Cuenta> listByClienteId(UUID clienteId);
}
