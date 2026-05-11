package com.ms_cliente.infrastructure.web.controller;

import com.ms_cliente.application.port.in.*;
import com.ms_cliente.domain.model.Cliente;
import com.ms_cliente.infrastructure.web.dto.request.CreateClienteRequest;
import com.ms_cliente.infrastructure.web.dto.request.UpdateClienteRequest;
import com.ms_cliente.infrastructure.web.dto.response.ClienteResponse;
import com.ms_cliente.infrastructure.web.dto.response.ClienteSummaryResponse;
import com.ms_cliente.infrastructure.web.mapper.ClienteDtoMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final CreateClienteUseCase createClienteUseCase;
    private final GetClienteUseCase getClienteUseCase;
    private final ListClientesUseCase listClientesUseCase;
    private final UpdateClienteUseCase updateClienteUseCase;
    private final DeleteClienteUseCase deleteClienteUseCase;
    private final ClienteDtoMapper clienteDtoMapper;

    @PostMapping
    public ResponseEntity<ClienteResponse> create(@Valid @RequestBody CreateClienteRequest request) {
        Cliente domain = clienteDtoMapper.toDomain(request);
        Cliente created = createClienteUseCase.create(domain);
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteDtoMapper.toResponse(created));
    }

    @GetMapping
    public ResponseEntity<List<ClienteSummaryResponse>> listAll() {
        List<ClienteSummaryResponse> responses = listClientesUseCase.listAll().stream()
                .map(clienteDtoMapper::toSummary)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{clienteId}")
    public ResponseEntity<ClienteResponse> getById(@PathVariable UUID clienteId) {
        Cliente cliente = getClienteUseCase.getById(clienteId);
        return ResponseEntity.ok(clienteDtoMapper.toResponse(cliente));
    }

    @PutMapping("/{clienteId}")
    public ResponseEntity<ClienteResponse> update(
            @PathVariable UUID clienteId,
            @Valid @RequestBody UpdateClienteRequest request) {
        ClienteUpdateData data = clienteDtoMapper.toUpdateData(request);
        Cliente updated = updateClienteUseCase.update(clienteId, data);
        return ResponseEntity.ok(clienteDtoMapper.toResponse(updated));
    }

    @DeleteMapping("/{clienteId}")
    public ResponseEntity<Void> deleteById(@PathVariable UUID clienteId) {
        deleteClienteUseCase.deleteById(clienteId);
        return ResponseEntity.noContent().build();
    }
}
