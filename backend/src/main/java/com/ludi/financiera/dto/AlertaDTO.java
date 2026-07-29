package com.ludi.financiera.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AlertaDTO {
    private String titulo;
    private String subtitulo;
    private String tipo; // "AMBER" for pending, "RED" for expired
}
