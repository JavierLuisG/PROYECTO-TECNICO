package com.ms_cliente.infrastructure.web.mapper;

import com.ms_cliente.application.port.in.ClienteUpdateData;
import com.ms_cliente.domain.model.Cliente;
import com.ms_cliente.domain.model.Persona;
import com.ms_cliente.infrastructure.web.dto.request.CreateClienteRequest;
import com.ms_cliente.infrastructure.web.dto.request.UpdateClienteRequest;
import com.ms_cliente.infrastructure.web.dto.response.ClienteResponse;
import com.ms_cliente.infrastructure.web.dto.response.ClienteSummaryResponse;
import org.springframework.stereotype.Component;

@Component
public class ClienteDtoMapper {

    public Cliente toDomain(CreateClienteRequest request) {
        Persona persona = Persona.builder()
                .nombre(request.getNombre())
                .genero(request.getGenero())
                .edad(request.getEdad())
                .identificacion(request.getIdentificacion())
                .direccion(request.getDireccion())
                .telefono(request.getTelefono())
                .estado(true)
                .build();

        return Cliente.builder()
                .persona(persona)
                .contrasena(request.getContrasena())
                .estado(true)
                .build();
    }

    public ClienteUpdateData toUpdateData(UpdateClienteRequest request) {
        return new ClienteUpdateData(
                request.getNombre(),
                request.getEdad(),
                request.getDireccion(),
                request.getTelefono(),
                request.getEstado()
        );
    }

    public ClienteResponse toResponse(Cliente cliente) {
        Persona persona = cliente.getPersona();
        return ClienteResponse.builder()
                .clienteId(cliente.getClienteId())
                .personaId(persona.getId())
                .nombre(persona.getNombre())
                .genero(persona.getGenero())
                .edad(persona.getEdad())
                .identificacion(persona.getIdentificacion())
                .direccion(persona.getDireccion())
                .telefono(persona.getTelefono())
                .estado(cliente.isEstado())
                .createdAt(cliente.getCreatedAt())
                .updatedAt(cliente.getUpdatedAt())
                .build();
    }

    public ClienteSummaryResponse toSummary(Cliente cliente) {
        return ClienteSummaryResponse.builder()
                .clienteId(cliente.getClienteId())
                .nombre(cliente.getPersona().getNombre())
                .identificacion(cliente.getPersona().getIdentificacion())
                .estado(cliente.isEstado())
                .build();
    }
}
