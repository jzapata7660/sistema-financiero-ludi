package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class CuotaCobranzaDTO {
    private Integer idCuota;
    private String codigoSolicitud;
    private String clienteNombres;
    private String clienteApellidos;
    private String clienteDni;
    private Integer numeroCuota;
    private Integer totalCuotas;
    private Double montoTotal;
    private Double montoPagado;
    private Double saldoPendiente;
    private String fechaVencimiento;
    private Long diasAtraso;
    private String telefono;
    private String estado;
}
