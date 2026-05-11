package com.ms_cuenta.application.port.in;

import java.util.UUID;

public interface DeleteCuentaUseCase {

    void deleteById(UUID cuentaId);
}
