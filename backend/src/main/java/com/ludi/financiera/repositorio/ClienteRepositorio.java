package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepositorio extends JpaRepository<Cliente, Integer> {
    Optional<Cliente> findByDni(String dni);
    Long countByEstado(String estado);
}
