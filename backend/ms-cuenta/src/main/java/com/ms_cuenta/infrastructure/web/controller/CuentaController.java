package com.ms_cuenta.infrastructure.web.controller;

import com.ms_cuenta.application.port.in.CreateCuentaUseCase;
import com.ms_cuenta.application.port.in.CuentaUpdateData;
import com.ms_cuenta.application.port.in.DeleteCuentaUseCase;
import com.ms_cuenta.application.port.in.GetCuentaUseCase;
import com.ms_cuenta.application.port.in.ListCuentasUseCase;
import com.ms_cuenta.application.port.in.UpdateCuentaUseCase;
import com.ms_cuenta.infrastructure.web.dto.request.CreateCuentaRequest;
import com.ms_cuenta.infrastructure.web.dto.request.UpdateCuentaRequest;
import com.ms_cuenta.infrastructure.web.dto.response.CuentaResponse;
import com.ms_cuenta.infrastructure.web.mapper.CuentaDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cuentas")
@RequiredArgsConstructor
public class CuentaController {

    private final CreateCuentaUseCase createCuentaUseCase;
    private final GetCuentaUseCase getCuentaUseCase;
    private final ListCuentasUseCase listCuentasUseCase;
    private final UpdateCuentaUseCase updateCuentaUseCase;
    private final DeleteCuentaUseCase deleteCuentaUseCase;
    private final CuentaDtoMapper mapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CuentaResponse create(@Valid @RequestBody CreateCuentaRequest request) {
        return mapper.toResponse(createCuentaUseCase.create(mapper.toDomain(request)));
    }

    @GetMapping("/{cuentaId}")
    public CuentaResponse getById(@PathVariable UUID cuentaId) {
        return mapper.toResponse(getCuentaUseCase.getById(cuentaId));
    }

    @GetMapping
    public List<CuentaResponse> list(@RequestParam(required = false) UUID clienteId) {
        List<com.ms_cuenta.domain.model.Cuenta> cuentas = clienteId != null
                ? listCuentasUseCase.listByClienteId(clienteId)
                : listCuentasUseCase.listAll();
        return cuentas.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @PutMapping("/{cuentaId}")
    public CuentaResponse update(@PathVariable UUID cuentaId,
                                 @RequestBody UpdateCuentaRequest request) {
        return mapper.toResponse(updateCuentaUseCase.update(
                cuentaId,
                new CuentaUpdateData(request.tipoCuenta(), request.estado())
        ));
    }

    @DeleteMapping("/{cuentaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID cuentaId) {
        deleteCuentaUseCase.deleteById(cuentaId);
    }
}
