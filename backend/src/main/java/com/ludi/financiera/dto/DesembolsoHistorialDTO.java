package com.ludi.financiera.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DesembolsoHistorialDTO {
    private Integer idDesembolso;
    private String codigoSolicitud;
    private String clienteNombre;
    private Double monto;
    private String modalidad;
    private LocalDateTime fecha;
}
