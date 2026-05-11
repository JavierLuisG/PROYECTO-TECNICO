package com.ms_cuenta.infrastructure.web.dto.response;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReporteResponse(
        UUID clienteId,
        String cliente,
        LocalDate desde,
        LocalDate hasta,
        List<CuentaReporteResponse> cuentas
) {}
