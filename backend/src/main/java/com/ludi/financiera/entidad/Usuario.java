package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Integer idUsuario;

    @ManyToOne
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    @ManyToOne
    @JoinColumn(name = "agencia_id")
    private Agencia agencia;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(nullable = false, length = 100)
    private String apellidos;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String clave;

    @Column(length = 20)
    private String estado = "ACTIVO";

    @Column(name = "meta_mensual", precision = 10)
    private Double metaMensual;

    @Column(name = "limite_aprobacion", precision = 10)
    private Double limiteAprobacion;

    @Column(name = "caja_asignada", length = 20)
    private String cajaAsignada;
}
