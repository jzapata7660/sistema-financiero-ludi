package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CuotaRepositorio extends JpaRepository<Cuota, Integer> {
    List<Cuota> findByCronogramaIdCronograma(Integer cronogramaId);
    List<Cuota> findByCronogramaIdCronogramaAndEstado(Integer cronogramaId, String estado);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Cuota c WHERE c.estado = 'PENDIENTE' AND c.fechaVencimiento = CURRENT_DATE")
    Long countPorCobrarHoy();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Cuota c WHERE c.estado = 'VENCIDA' OR (c.estado = 'PENDIENTE' AND c.fechaVencimiento < CURRENT_DATE)")
    Long countVencidas();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(c.montoTotal) FROM Cuota c WHERE c.estado IN ('PENDIENTE', 'VENCIDA')")
    Double sumTotalPendiente();

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Cuota c WHERE c.estado IN ('PENDIENTE', 'VENCIDA') ORDER BY c.fechaVencimiento ASC")
    List<Cuota> findBandejaCobranza();
}
