package com.ludi.financiera.entidad;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "historial_crediticio")
public class HistorialCrediticio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Integer idHistorial;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false, unique = true)
    @JsonIgnore
    private Cliente cliente;

    @Column(name = "creditos_anteriores")
    private Integer creditosAnteriores = 0;

    @Column(name = "pagos_puntuales")
    private Integer pagosPuntuales = 0;

    @Column(name = "mora_actual_dias")
    private Integer moraActualDias = 0;

    @Column(name = "score_crediticio")
    private Integer scoreCrediticio;
    
    @Column(name = "ultima_operacion")
    private java.time.LocalDate ultimaOperacion;
}
