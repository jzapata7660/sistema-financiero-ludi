package com.ludi.financiera.entidad;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
@Entity
@Table(name = "cuota")
public class Cuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuota")
    private Integer idCuota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cronograma_id", nullable = false)
    @JsonIgnore
    private CronogramaPagos cronograma;

    @Column(name = "numero_cuota", nullable = false)
    private Integer numeroCuota;

    @Column(name = "monto_capital", nullable = false)
    private Double montoCapital;

    @Column(name = "monto_interes", nullable = false)
    private Double montoInteres;

    @Column(name = "monto_total", nullable = false)
    private Double montoTotal;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(length = 20)
    private String estado = "PENDIENTE"; // PENDIENTE, PAGADA, VENCIDA
}
