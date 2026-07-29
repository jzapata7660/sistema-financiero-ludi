package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class AccionCobranzaDTO {
    private String tipoAccion;
    private String resultado;
    private Integer analistaId;
    private String compromisoPago;
}
