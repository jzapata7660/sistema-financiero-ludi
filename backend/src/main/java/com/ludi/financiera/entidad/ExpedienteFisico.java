package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "expediente_fisico")
public class ExpedienteFisico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_expediente")
    private Integer idExpediente;

    @OneToOne
    @JoinColumn(name = "solicitud_id", nullable = false, unique = true)
    private SolicitudCredito solicitud;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asistente_id")
    private Usuario asistente;

    @Column(name = "codigo_carpeta", nullable = false, unique = true, length = 50)
    private String codigoCarpeta;

    @Column(length = 20)
    private String estante;

    @Column(length = 20)
    private String fila;

    @Column(name = "caja_archivera", length = 20)
    private String cajaArchivera;

    @Column(length = 30)
    private String estado = "POR_ARCHIVAR"; // POR_ARCHIVAR, ARCHIVADO, PRESTADO

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}
