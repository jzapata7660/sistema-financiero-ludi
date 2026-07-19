package com.ludi.financiera.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CobranzaRealizadaDTO {
    private String codigoSolicitud;
    private String clienteNombre;
    private Integer numeroCuota;
    private Integer totalCuotas;
    private Double montoPagado;
    private LocalDateTime fechaPago;
    private String formaPago;
}
