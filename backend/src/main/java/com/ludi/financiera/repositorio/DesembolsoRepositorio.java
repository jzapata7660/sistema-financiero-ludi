package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.Desembolso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DesembolsoRepositorio extends JpaRepository<Desembolso, Integer> {
    Optional<Desembolso> findBySolicitudIdSolicitud(Integer solicitudId);
}
