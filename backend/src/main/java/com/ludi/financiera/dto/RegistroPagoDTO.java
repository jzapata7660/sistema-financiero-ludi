package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class RegistroPagoDTO {
    private Double montoRecibido;
    private String fechaPago;
    private String formaPago;
    private String observaciones;
    private Integer analistaId;
}
