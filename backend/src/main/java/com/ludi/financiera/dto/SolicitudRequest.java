package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class SolicitudRequest {
    private String dniCliente;
    private Integer analistaId;
    private Double monto;
    private Integer plazoMeses;
    private Double tasaInteres;
    private String modalidadPago; // DIARIO, SEMANAL, MENSUAL
    private EvaluacionRequest evaluacion;

    @Data
    public static class EvaluacionRequest {
        private Boolean cumpleRequisitos;
        private Boolean capacidadPago;
        private Boolean verificacionIngresos;
        private Boolean referenciaVerificada;
    }
}
