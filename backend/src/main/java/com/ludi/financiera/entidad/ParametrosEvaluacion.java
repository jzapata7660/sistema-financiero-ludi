package com.ludi.financiera.entidad;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "parametros_evaluacion")
public class ParametrosEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_parametros")
    private Integer idParametros;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id", nullable = false, unique = true)
    @JsonIgnore
    private SolicitudCredito solicitud;

    @Column(name = "cumple_requisitos")
    private Boolean cumpleRequisitos;

    @Column(name = "capacidad_pago")
    private Boolean capacidadPago;

    @Column(name = "verificacion_ingresos")
    private Boolean verificacionIngresos;

    @Column(name = "referencia_verificada")
    private Boolean referenciaVerificada;
}
