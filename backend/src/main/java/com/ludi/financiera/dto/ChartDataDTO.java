package com.ludi.financiera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChartDataDTO {
    private String name;
    private Double colocaciones;
    private Double cobranzas;
    private Double morosidad;
}
