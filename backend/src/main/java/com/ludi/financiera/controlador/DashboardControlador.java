package com.ludi.financiera.controlador;

import com.ludi.financiera.dto.DashboardDTO;
import com.ludi.financiera.servicio.DashboardServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardControlador {

    private final DashboardServicio dashboardServicio;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboardData() {
        return ResponseEntity.ok(dashboardServicio.getDashboardData());
    }
}
