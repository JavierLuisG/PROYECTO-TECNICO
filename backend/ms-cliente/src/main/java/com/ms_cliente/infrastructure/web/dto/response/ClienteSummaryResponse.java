package com.ms_cliente.infrastructure.web.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteSummaryResponse {

    private UUID clienteId;
    private String nombre;
    private String identificacion;
    private boolean estado;
}
