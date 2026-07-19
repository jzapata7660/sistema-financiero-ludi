package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "desembolso")
public class Desembolso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_desembolso")
    private Integer idDesembolso;

    @OneToOne
    @JoinColumn(name = "solicitud_id", nullable = false, unique = true)
    private SolicitudCredito solicitud;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cajera_id", nullable = false)
    private Usuario cajera;

    @Column(name = "monto_desembolsado", nullable = false)
    private Double montoDesembolsado;

    @Column(name = "modalidad_desembolso", length = 50)
    private String modalidadDesembolso;

    @Column(name = "banco_destino", length = 100)
    private String bancoDestino;

    @Column(name = "cuenta_destino", length = 50)
    private String cuentaDestino;

    @Column(name = "cci_destino", length = 50)
    private String cciDestino;

    @CreationTimestamp
    @Column(name = "fecha_desembolso")
    private LocalDateTime fechaDesembolso;
}
