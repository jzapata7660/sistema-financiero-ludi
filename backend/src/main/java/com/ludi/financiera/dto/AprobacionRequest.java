package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class AprobacionRequest {
    private Integer aprobadorId;
    private String accion; // APROBAR o RECHAZAR
    private String observaciones;
}
