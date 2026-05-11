package com.ms_cuenta.application.port.in;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReporteResult(
        UUID clienteId,
        String nombreCliente,
        LocalDate desde,
        LocalDate hasta,
        List<CuentaConMovimientos> cuentas
) {}
