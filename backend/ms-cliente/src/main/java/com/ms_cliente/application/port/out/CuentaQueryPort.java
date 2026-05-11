package com.ms_cliente.application.port.out;

import java.util.UUID;

public interface CuentaQueryPort {

    boolean hasCuentas(UUID clienteId);
}
