package com.ms_cliente.infrastructure.web.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateClienteRequest {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotBlank
    @Size(min = 1, max = 1)
    private String genero;

    @NotNull
    @Min(18)
    @Max(120)
    private Integer edad;

    @NotBlank
    @Size(max = 20)
    private String identificacion;

    @NotBlank
    @Size(max = 255)
    private String direccion;

    @NotBlank
    @Size(max = 20)
    private String telefono;

    @NotBlank
    @Size(min = 8, message = "La contraseña debe tener mínimo 8 caracteres")
    private String contrasena;
}
