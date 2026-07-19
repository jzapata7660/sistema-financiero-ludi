package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class PagoRequest {
    private Integer cuotaId;
    private Integer cajeraId;
    private Double montoPagado;
    private Double moraPagada;
}
