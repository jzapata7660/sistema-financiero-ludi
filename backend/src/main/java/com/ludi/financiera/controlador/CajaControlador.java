package com.ludi.financiera.controlador;

import com.ludi.financiera.dto.DesembolsoRequestDTO;
import com.ludi.financiera.dto.ExpedienteCajaDTO;
import com.ludi.financiera.servicio.CajaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caja")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CajaControlador {

    private final CajaServicio cajaServicio;

    @GetMapping("/pendientes")
    public ResponseEntity<List<ExpedienteCajaDTO>> obtenerPendientes() {
        return ResponseEntity.ok(cajaServicio.obtenerPendientesDesembolso());
    }

    @PostMapping("/desembolsar/{id}")
    public ResponseEntity<?> registrarDesembolso(@PathVariable Integer id, @RequestBody DesembolsoRequestDTO request) {
        cajaServicio.registrarDesembolso(id, request);
        return ResponseEntity.ok().body("Desembolso registrado correctamente");
    }

    @GetMapping("/historial")
    public ResponseEntity<List<com.ludi.financiera.dto.DesembolsoHistorialDTO>> getHistorial() {
        return ResponseEntity.ok(cajaServicio.obtenerHistorial());
    }
}
