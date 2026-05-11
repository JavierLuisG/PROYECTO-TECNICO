package com.ms_cuenta.application.port.in;

import java.time.LocalDate;
import java.util.UUID;

public interface GenerarReporteUseCase {

    /**
     * Genera el estado de cuenta de un cliente para el rango de fechas indicado.
     * Si {@code desde} o {@code hasta} son null, usa inicio del año en curso y hoy respectivamente.
     *
     * @param clienteId UUID del cliente (debe existir en ClienteRef, si no → 404)
     * @param desde     fecha de inicio del rango (inclusive), null = 1 de enero del año en curso
     * @param hasta     fecha de fin del rango (inclusive), null = hoy
     * @return reporte con nombre del cliente, sus cuentas y movimientos en el rango
     */
    ReporteResult generar(UUID clienteId, LocalDate desde, LocalDate hasta);
}
