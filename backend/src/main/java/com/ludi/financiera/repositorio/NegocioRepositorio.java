package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.Negocio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NegocioRepositorio extends JpaRepository<Negocio, Integer> {
    Optional<Negocio> findByClienteIdCliente(Integer clienteId);
    Optional<Negocio> findByClienteDni(String dni);
}
