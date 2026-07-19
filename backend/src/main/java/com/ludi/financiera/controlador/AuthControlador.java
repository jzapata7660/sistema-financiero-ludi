package com.ludi.financiera.controlador;

import com.ludi.financiera.dto.LoginRequest;
import com.ludi.financiera.dto.LoginResponse;
import com.ludi.financiera.servicio.AuthServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permite peticiones desde el frontend (React)
public class AuthControlador {

    private final AuthServicio authServicio;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authServicio.login(request);
        return ResponseEntity.ok(response);
    }
}
