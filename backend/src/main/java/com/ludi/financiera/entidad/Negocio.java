package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
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

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    @JsonIgnore
    private Cliente cliente;

    @OneToMany(mappedBy = "negocio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SolicitudCredito> solicitudes;

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

    @Column(name = "tiempo_operacion", length = 50)
    private String tiempoOperacion;
}
