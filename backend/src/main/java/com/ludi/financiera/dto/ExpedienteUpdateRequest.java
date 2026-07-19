package com.ludi.financiera.dto;

import lombok.Data;

@Data
public class ExpedienteUpdateRequest {
    private Integer asistenteId;
    private String estante;
    private String fila;
    private String cajaArchivera;
    private String estado; // POR_ARCHIVAR, ARCHIVADO, PRESTADO
}
