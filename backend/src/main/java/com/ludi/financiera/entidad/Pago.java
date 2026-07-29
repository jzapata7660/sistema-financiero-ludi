package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "pago")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Integer idPago;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cuota_id", nullable = false)
    private Cuota cuota;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "analista_id", nullable = false)
    private Usuario analista;

    @Column(name = "monto_pagado", nullable = false)
    private Double montoPagado;

    @CreationTimestamp
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Column(name = "mora_pagada")
    private Double moraPagada = 0.0;

    @Column(name = "forma_pago")
    private String formaPago = "EFECTIVO";

    @Column(name = "observaciones")
    private String observaciones;

    @Column(name = "numero_cuota", nullable = false)
    private Integer numeroCuota;

    @Column(name = "saldo_pendiente")
    private Double saldoPendiente = 0.0;
}
