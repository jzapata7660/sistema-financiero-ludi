package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.AccionCobranza;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccionCobranzaRepositorio extends JpaRepository<AccionCobranza, Integer> {
    List<AccionCobranza> findBySolicitudIdSolicitudOrderByFechaAccionDesc(Integer solicitudId);
    List<AccionCobranza> findByClienteIdCliente(Integer clienteId);
}
