package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepositorio extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmailAndClave(String email, String clave);
    Optional<Usuario> findByEmail(String email);
}
