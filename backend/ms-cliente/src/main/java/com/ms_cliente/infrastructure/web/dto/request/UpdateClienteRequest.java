package com.ms_cliente.infrastructure.web.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateClienteRequest {

    @Size(max = 100)
    private String nombre;

    @Min(18)
    @Max(120)
    private Integer edad;

    @Size(max = 255)
    private String direccion;

    @Size(max = 20)
    private String telefono;

    private Boolean estado;
}
