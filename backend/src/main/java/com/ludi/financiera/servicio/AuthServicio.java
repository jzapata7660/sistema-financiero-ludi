package com.ludi.financiera.servicio;

import com.ludi.financiera.dto.LoginRequest;
import com.ludi.financiera.dto.LoginResponse;
import com.ludi.financiera.dto.AgenciaDTO;
import com.ludi.financiera.entidad.Usuario;
import com.ludi.financiera.repositorio.UsuarioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthServicio {

    private final UsuarioRepositorio usuarioRepositorio;

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepositorio
                .findByEmailAndClave(request.getEmail(), request.getClave())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        if (!"ACTIVO".equals(usuario.getEstado())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario inactivo");
        }

        AgenciaDTO agenciaDTO = usuario.getAgencia() != null ? 
                new AgenciaDTO(usuario.getAgencia().getIdAgencia(), usuario.getAgencia().getNombre()) : null;

        return new LoginResponse(
                usuario.getIdUsuario(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getEmail(),
                usuario.getRol().getNombreRol(),
                agenciaDTO
        );
    }
}
