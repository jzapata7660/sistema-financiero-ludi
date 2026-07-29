package com.ludi.financiera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class DashboardDTO {
    private Long solicitudesPendientes;
    private Long solicitudesAprobadas;
    private Long cobranzasVencidas;
    private Long clientesActivos;
    private List<AlertaDTO> alertas;
    private Double totalColocaciones;
    private Double totalCobranzas;
    private Double porcentajeMorosidad;
    private List<ChartDataDTO> tendencias;
}
