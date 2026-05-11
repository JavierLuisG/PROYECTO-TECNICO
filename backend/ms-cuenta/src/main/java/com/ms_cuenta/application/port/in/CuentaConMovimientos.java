package com.ms_cuenta.application.port.in;

import com.ms_cuenta.domain.model.Cuenta;
import com.ms_cuenta.domain.model.Movimiento;

import java.util.List;

public record CuentaConMovimientos(Cuenta cuenta, List<Movimiento> movimientos) {}
