package com.ludi.financiera.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExpedienteCajaDTO {
    private Integer idSolicitud;
    private String codigo;
    private String clienteNombre;
    private String clienteDni;
    private String clienteDireccion;
    private String clienteGiro;
    
    private Double monto;
    private Integer plazoMeses;
    private Double tasaInteres;
    private String modalidad;
    
    private String aprobadorNombre;
    private String fechaAprobacion;
    private String estado;
    
    private List<CuotaDesembolsoDTO> cronograma;

    @Data
    public static class CuotaDesembolsoDTO {
        private Integer numeroCuota;
        private String fechaVencimiento;
        private Double montoCapital;
        private Double montoInteres;
        private Double montoTotal;
    }
}
