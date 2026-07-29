package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.Cuota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CuotaRepositorio extends JpaRepository<Cuota, Integer> {
    List<Cuota> findByCronogramaIdCronograma(Integer cronogramaId);
    List<Cuota> findByCronogramaIdCronogramaAndEstado(Integer cronogramaId, String estado);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT c.cronograma.idCronograma) FROM Cuota c WHERE c.estado = 'PENDIENTE' AND c.fechaVencimiento = CURRENT_DATE")
    Long countPorCobrarHoy();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT c.cronograma.idCronograma) FROM Cuota c WHERE c.estado = 'VENCIDA' OR (c.estado = 'PENDIENTE' AND c.fechaVencimiento < CURRENT_DATE)")
    Long countVencidas();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(c.montoTotal) FROM Cuota c WHERE c.estado IN ('PENDIENTE', 'VENCIDA')")
    Double sumTotalPendiente();

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Cuota c WHERE c.estado = 'VENCIDA' OR (c.estado = 'PENDIENTE' AND c.fechaVencimiento <= :limiteFecha) ORDER BY c.fechaVencimiento ASC")
    List<Cuota> findBandejaCobranza(@org.springframework.data.repository.query.Param("limiteFecha") java.time.LocalDate limiteFecha);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(c.montoTotal), 0.0) FROM Cuota c WHERE c.estado = 'PAGADA'")
    Double sumMontoCobranzas();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(c.montoTotal), 0.0) FROM Cuota c WHERE c.estado = 'VENCIDA'")
    Double sumMontoVencidas();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(c.montoTotal), 0.0) FROM Cuota c")
    Double sumMontoTotal();
}
