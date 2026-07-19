package com.ludi.financiera.controlador;

import com.ludi.financiera.dto.*;
import com.ludi.financiera.entidad.AccionCobranza;
import com.ludi.financiera.servicio.CobranzaServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cobranzas")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CobranzaControlador {

    private final CobranzaServicio cobranzaServicio;

    @GetMapping("/dashboard")
    public ResponseEntity<CobranzaDashboardDTO> obtenerDashboard() {
        return ResponseEntity.ok(cobranzaServicio.obtenerDashboard());
    }

    @GetMapping("/bandeja")
    public ResponseEntity<List<CuotaCobranzaDTO>> obtenerBandeja() {
        return ResponseEntity.ok(cobranzaServicio.obtenerBandeja());
    }

    @GetMapping("/hoy")
    public ResponseEntity<List<CobranzaRealizadaDTO>> obtenerCobranzasHoy() {
        return ResponseEntity.ok(cobranzaServicio.obtenerCobranzasHoy());
    }

    @PostMapping("/pago/{idCuota}")
    public ResponseEntity<String> registrarPago(@PathVariable Integer idCuota, @RequestBody RegistroPagoDTO request) {
        cobranzaServicio.registrarPago(idCuota, request);
        return ResponseEntity.ok("Pago registrado correctamente");
    }

    @PostMapping("/accion/{idSolicitud}")
    public ResponseEntity<String> registrarAccion(@PathVariable Integer idSolicitud, @RequestBody AccionCobranzaDTO dto) {
        cobranzaServicio.registrarAccion(idSolicitud, dto);
        return ResponseEntity.ok("Acción de cobranza registrada");
    }

    @GetMapping("/accion/{idSolicitud}")
    public ResponseEntity<List<AccionCobranza>> obtenerHistorial(@PathVariable Integer idSolicitud) {
        return ResponseEntity.ok(cobranzaServicio.obtenerHistorial(idSolicitud));
    }
}
