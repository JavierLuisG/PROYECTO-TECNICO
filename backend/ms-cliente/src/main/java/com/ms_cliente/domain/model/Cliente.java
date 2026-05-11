package com.ms_cliente.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    private UUID clienteId;
    private Persona persona;
    private String contrasena;
    private boolean estado;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
