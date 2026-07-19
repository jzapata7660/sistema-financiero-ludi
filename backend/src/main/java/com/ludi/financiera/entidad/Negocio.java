package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
@Entity
@Table(name = "negocio")
public class Negocio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_negocio")
    private Integer idNegocio;

    @OneToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    @JsonIgnore
    private Cliente cliente;

    @Column(length = 11)
    private String ruc;

    @Column(name = "razon_social", length = 150)
    private String razonSocial;

    @Column(name = "giro_negocio", length = 100)
    private String giroNegocio;

    @Column(length = 200)
    private String direccion;

    @Column(name = "ingreso_promedio_mensual", precision = 10)
    private Double ingresoPromedioMensual;
}
