package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.CronogramaPagos;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CronogramaRepositorio extends JpaRepository<CronogramaPagos, Integer> {
    Optional<CronogramaPagos> findBySolicitudIdSolicitud(Integer solicitudId);
}
