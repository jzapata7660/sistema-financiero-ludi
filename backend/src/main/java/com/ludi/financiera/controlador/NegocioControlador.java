package com.ludi.financiera.controlador;

import com.ludi.financiera.dto.NegocioRequest;
import com.ludi.financiera.entidad.Negocio;
import com.ludi.financiera.servicio.NegocioServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/negocios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NegocioControlador {

    private final NegocioServicio negocioServicio;

    @PostMapping
    public ResponseEntity<Negocio> registrarNegocio(@RequestBody NegocioRequest request) {
        return ResponseEntity.ok(negocioServicio.registrarNegocio(request));
    }

    @GetMapping("/cliente/{dni}")
    public ResponseEntity<List<Negocio>> obtenerPorDniCliente(@PathVariable String dni) {
        List<Negocio> negocios = negocioServicio.obtenerPorDniCliente(dni);
        return ResponseEntity.ok(negocios);
    }
}
