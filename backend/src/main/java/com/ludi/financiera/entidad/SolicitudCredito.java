package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "solicitud_credito")
public class SolicitudCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @Column(name = "codigo_solicitud", unique = true, nullable = false, length = 20)
    private String codigoSolicitud;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "negocio_id", nullable = false)
    private Negocio negocio;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "analista_id", nullable = false)
    private Usuario analista;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "aprobador_id")
    private Usuario aprobador;

    @Column(name = "monto_solicitado", nullable = false)
    private Double montoSolicitado;

    @Column(name = "plazo_meses", nullable = false)
    private Integer plazoMeses;

    @Column(name = "tasa_interes", nullable = false)
    private Double tasaInteres;

    @Column(name = "modalidad_pago", nullable = false, length = 20)
    private String modalidadPago; // DIARIO, SEMANAL, MENSUAL

    @Column(nullable = false, length = 30)
    private String estado; // PENDIENTE, APROBADA, RECHAZADA, DESEMBOLSADO

    @CreationTimestamp
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    @Column(length = 500)
    private String observaciones;

    @OneToOne(mappedBy = "solicitud", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private CronogramaPagos cronogramaPagos;

    @OneToOne(mappedBy = "solicitud", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ParametrosEvaluacion parametrosEvaluacion;
}
