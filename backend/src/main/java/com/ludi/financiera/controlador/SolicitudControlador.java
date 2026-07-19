package com.ludi.financiera.controlador;

import com.ludi.financiera.dto.AprobacionRequest;
import com.ludi.financiera.dto.SolicitudRequest;
import com.ludi.financiera.entidad.SolicitudCredito;
import com.ludi.financiera.servicio.SolicitudServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SolicitudControlador {

    private final SolicitudServicio solicitudServicio;

    @PostMapping
    public ResponseEntity<SolicitudCredito> crearSolicitud(@RequestBody SolicitudRequest request) {
        return ResponseEntity.ok(solicitudServicio.crearSolicitud(request));
    }

    @GetMapping
    public ResponseEntity<List<SolicitudCredito>> listarSolicitudes(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer usuarioId) {
        return ResponseEntity.ok(solicitudServicio.listarPorEstado(estado, usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudCredito> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(solicitudServicio.obtenerPorId(id));
    }

    @PostMapping("/{id}/procesar")
    public ResponseEntity<SolicitudCredito> procesarSolicitud(
            @PathVariable Integer id,
            @RequestBody AprobacionRequest request) {
        return ResponseEntity.ok(solicitudServicio.aprobarOrechazarSolicitud(id, request));
    }

    @PostMapping("/previsualizar-cronograma")
    public ResponseEntity<Object> previsualizarCronograma(@RequestBody SolicitudRequest request) {
        return ResponseEntity.ok(solicitudServicio.previsualizarCronograma(request));
    }
}
