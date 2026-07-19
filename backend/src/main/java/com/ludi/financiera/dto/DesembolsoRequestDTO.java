package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class DesembolsoRequestDTO {
    private Integer cajeraId;
    private Boolean dniValidado;
    private String modalidadDesembolso;
    private String bancoDestino;
    private String cuentaDestino;
    private String cciDestino;
}
