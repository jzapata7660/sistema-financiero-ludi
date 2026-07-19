package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class CobranzaDashboardDTO {
    private Long porCobrarHoy;
    private Long vencidas;
    private Double cobradoHoy;
    private Double totalPendiente;
}
