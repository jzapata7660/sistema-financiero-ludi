package com.ludi.financiera.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ClienteResumenDTO {
    private Integer idCliente;
    private String dni;
    private String nombres;
    private String apellidos;
    private String telefono;
    private String direccion;
    private String estado;

    // Historial Crediticio
    private Integer scoreCrediticio;
    private Integer creditosAnteriores;
    private LocalDate ultimaOperacion;
}
