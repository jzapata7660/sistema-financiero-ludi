package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.Negocio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NegocioRepositorio extends JpaRepository<Negocio, Integer> {
    List<Negocio> findByClienteIdCliente(Integer clienteId);
    List<Negocio> findByClienteDni(String dni);
}
