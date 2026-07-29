package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
@Entity
@Table(name = "cronograma_pagos")
public class CronogramaPagos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cronograma")
    private Integer idCronograma;

    @OneToOne
    @JoinColumn(name = "solicitud_id", nullable = false, unique = true)
    @JsonIgnore
    private SolicitudCredito solicitud;

    @Column(name = "total_capital", nullable = false)
    private Double totalCapital;

    @Column(name = "total_interes", nullable = false)
    private Double totalInteres;

    @Column(name = "total_pagar", nullable = false)
    private Double totalPagar;

    @OneToMany(mappedBy = "cronograma", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Cuota> cuotas;
}
