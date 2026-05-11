package com.ms_cliente.application.service;

import com.ms_cliente.application.port.in.*;
import com.ms_cliente.application.port.out.ClienteRepositoryPort;
import com.ms_cliente.application.port.out.CuentaQueryPort;
import com.ms_cliente.application.port.out.EventPublisherPort;
import com.ms_cliente.domain.event.ClienteCreadoEvent;
import com.ms_cliente.domain.exception.ClienteConCuentasException;
import com.ms_cliente.domain.exception.ClienteNotFoundException;
import com.ms_cliente.domain.model.Cliente;
import com.ms_cliente.domain.model.Persona;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClienteService implements
        CreateClienteUseCase,
        GetClienteUseCase,
        ListClientesUseCase,
        UpdateClienteUseCase,
        DeleteClienteUseCase {

    private final ClienteRepositoryPort clienteRepositoryPort;
    private final CuentaQueryPort cuentaQueryPort;
    private final EventPublisherPort eventPublisherPort;

    @Override
    @Transactional
    public Cliente create(Cliente cliente) {
        String identificacion = cliente.getPersona().getIdentificacion();
        if (clienteRepositoryPort.existsByIdentificacion(identificacion)) {
            throw new IllegalArgumentException(
                    "Ya existe un cliente con la identificacion: " + identificacion);
        }
        Cliente saved = clienteRepositoryPort.save(cliente);
        eventPublisherPort.publishClienteCreado(new ClienteCreadoEvent(
                saved.getClienteId().toString(),
                saved.getPersona().getNombre(),
                saved.getPersona().getIdentificacion()
        ));
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Cliente getById(UUID clienteId) {
        return clienteRepositoryPort.findById(clienteId)
                .orElseThrow(() -> new ClienteNotFoundException(clienteId.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> listAll() {
        return clienteRepositoryPort.findAll();
    }

    @Override
    @Transactional
    public Cliente update(UUID clienteId, ClienteUpdateData data) {
        Cliente existing = clienteRepositoryPort.findById(clienteId)
                .orElseThrow(() -> new ClienteNotFoundException(clienteId.toString()));

        Persona existingPersona = existing.getPersona();

        Persona updatedPersona = Persona.builder()
                .id(existingPersona.getId())
                .nombre(data.nombre() != null ? data.nombre() : existingPersona.getNombre())
                .genero(existingPersona.getGenero())
                .edad(data.edad() != null ? data.edad() : existingPersona.getEdad())
                .identificacion(existingPersona.getIdentificacion())
                .direccion(data.direccion() != null ? data.direccion() : existingPersona.getDireccion())
                .telefono(data.telefono() != null ? data.telefono() : existingPersona.getTelefono())
                .estado(data.estado() != null ? data.estado() : existingPersona.isEstado())
                .createdAt(existingPersona.getCreatedAt())
                .updatedAt(existingPersona.getUpdatedAt())
                .build();

        Cliente updatedCliente = Cliente.builder()
                .clienteId(existing.getClienteId())
                .persona(updatedPersona)
                .contrasena(existing.getContrasena())
                .estado(data.estado() != null ? data.estado() : existing.isEstado())
                .createdAt(existing.getCreatedAt())
                .updatedAt(existing.getUpdatedAt())
                .build();

        return clienteRepositoryPort.save(updatedCliente);
    }

    @Override
    @Transactional
    public void deleteById(UUID clienteId) {
        clienteRepositoryPort.findById(clienteId)
                .orElseThrow(() -> new ClienteNotFoundException(clienteId.toString()));

        if (cuentaQueryPort.hasCuentas(clienteId)) {
            throw new ClienteConCuentasException(clienteId.toString());
        }

        clienteRepositoryPort.deleteById(clienteId);
    }
}
