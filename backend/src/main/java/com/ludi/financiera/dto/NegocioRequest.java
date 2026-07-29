package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class NegocioRequest {
    private String dniCliente;
    private String ruc;
    private String razonSocial;
    private String giroNegocio;
    private String direccion;
    private Double ingresoPromedioMensual;
    private String tiempoOperacion;
}
