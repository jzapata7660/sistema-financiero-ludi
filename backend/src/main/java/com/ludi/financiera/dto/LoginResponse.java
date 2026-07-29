package com.ludi.financiera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Integer idUsuario;
    private String nombres;
    private String apellidos;
    private String email;
    private String rol;
    private AgenciaDTO agencia;
}
