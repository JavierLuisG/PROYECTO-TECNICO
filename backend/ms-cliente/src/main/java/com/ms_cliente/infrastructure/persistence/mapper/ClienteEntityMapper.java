package com.ms_cliente.infrastructure.persistence.mapper;

import com.ms_cliente.domain.model.Cliente;
import com.ms_cliente.domain.model.Persona;
import com.ms_cliente.infrastructure.persistence.entity.ClienteEntity;
import com.ms_cliente.infrastructure.persistence.entity.PersonaEntity;
import org.springframework.stereotype.Component;

@Component
public class ClienteEntityMapper {

    public Cliente toDomain(ClienteEntity entity) {
        return Cliente.builder()
                .clienteId(entity.getClienteId())
                .persona(personaToDomain(entity.getPersona()))
                .contrasena(entity.getContrasena())
                .estado(entity.isEstado())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ClienteEntity toEntity(Cliente domain) {
        return ClienteEntity.builder()
                .clienteId(domain.getClienteId())
                .persona(personaToEntity(domain.getPersona()))
                .contrasena(domain.getContrasena())
                .estado(domain.isEstado())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    private Persona personaToDomain(PersonaEntity entity) {
        return Persona.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .genero(entity.getGenero())
                .edad(entity.getEdad())
                .identificacion(entity.getIdentificacion())
                .direccion(entity.getDireccion())
                .telefono(entity.getTelefono())
                .estado(entity.isEstado())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private PersonaEntity personaToEntity(Persona domain) {
        return PersonaEntity.builder()
                .id(domain.getId())
                .nombre(domain.getNombre())
                .genero(domain.getGenero())
                .edad(domain.getEdad())
                .identificacion(domain.getIdentificacion())
                .direccion(domain.getDireccion())
                .telefono(domain.getTelefono())
                .estado(domain.isEstado())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
