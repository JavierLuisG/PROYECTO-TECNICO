package com.ms_cuenta.infrastructure.web.controller;

import com.ms_cuenta.application.port.in.RegistrarMovimientoUseCase;
import com.ms_cuenta.application.port.out.MovimientoRepositoryPort;
import com.ms_cuenta.domain.exception.CuentaNotFoundException;
import com.ms_cuenta.infrastructure.web.dto.request.RegistrarMovimientoRequest;
import com.ms_cuenta.infrastructure.web.dto.response.MovimientoResponse;
import com.ms_cuenta.infrastructure.web.mapper.MovimientoDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
public class MovimientoController {

    private final RegistrarMovimientoUseCase registrarMovimientoUseCase;
    private final MovimientoRepositoryPort movimientoRepositoryPort;
    private final MovimientoDtoMapper mapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovimientoResponse registrar(@Valid @RequestBody RegistrarMovimientoRequest request) {
        return mapper.toResponse(registrarMovimientoUseCase.registrar(
                request.cuentaId(),
                request.tipoMovimiento(),
                request.valor(),
                request.descripcion()
        ));
    }

    @GetMapping("/{movimientoId}")
    public MovimientoResponse getById(@PathVariable UUID movimientoId) {
        return movimientoRepositoryPort.findById(movimientoId)
                .map(mapper::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado con id: " + movimientoId));
    }

    @GetMapping
    public List<MovimientoResponse> list(@RequestParam(required = false) UUID cuentaId) {
        List<com.ms_cuenta.domain.model.Movimiento> movimientos = cuentaId != null
                ? movimientoRepositoryPort.findByCuentaId(cuentaId)
                : movimientoRepositoryPort.findAll();
        return movimientos.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{movimientoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID movimientoId) {
        movimientoRepositoryPort.findById(movimientoId)
                .orElseThrow(() -> new IllegalArgumentException("Movimiento no encontrado con id: " + movimientoId));
        movimientoRepositoryPort.deleteById(movimientoId);
    }
}
