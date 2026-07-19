package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.ExpedienteFisico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ExpedienteRepositorio extends JpaRepository<ExpedienteFisico, Integer> {
    Optional<ExpedienteFisico> findByCodigoCarpeta(String codigoCarpeta);
    Optional<ExpedienteFisico> findBySolicitudIdSolicitud(Integer solicitudId);
}
