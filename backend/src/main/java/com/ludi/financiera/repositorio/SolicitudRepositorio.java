package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.SolicitudCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SolicitudRepositorio extends JpaRepository<SolicitudCredito, Integer> {
    List<SolicitudCredito> findByEstado(String estado);
    List<SolicitudCredito> findByEstadoIn(List<String> estados);
    List<SolicitudCredito> findByAnalistaIdUsuario(Integer analistaId);
    Long countByEstado(String estado);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(s.montoSolicitado), 0.0) FROM SolicitudCredito s WHERE s.estado = 'APROBADA' OR s.estado = 'DESEMBOLSADO'")
    Double sumMontoColocaciones();
}
