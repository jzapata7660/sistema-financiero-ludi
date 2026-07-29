package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "accion_cobranza")
public class AccionCobranza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_accion")
    private Integer idAccion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "solicitud_id", nullable = false)
    private SolicitudCredito solicitud;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "analista_id", nullable = false)
    private Usuario analista;

    @Column(name = "tipo_accion", nullable = false, length = 50)
    private String tipoAccion; // LLAMADA, VISITA, NOTIFICACION

    @Column(nullable = false, length = 255)
    private String resultado;

    @CreationTimestamp
    @Column(name = "fecha_accion")
    private LocalDateTime fechaAccion;

    @Column(name = "compromiso_pago")
    private LocalDate compromisoPago;
}
