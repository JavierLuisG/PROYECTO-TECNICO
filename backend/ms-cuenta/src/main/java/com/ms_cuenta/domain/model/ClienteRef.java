package com.ms_cuenta.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteRef {

    private UUID clienteId;
    private String nombre;
    private String identificacion;
}
