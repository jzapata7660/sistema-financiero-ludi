package com.ludi.financiera.servicio;

import com.ludi.financiera.dto.AlertaDTO;
import com.ludi.financiera.dto.DashboardDTO;
import com.ludi.financiera.entidad.Cuota;
import com.ludi.financiera.entidad.SolicitudCredito;
import com.ludi.financiera.repositorio.ClienteRepositorio;
import com.ludi.financiera.repositorio.CuotaRepositorio;
import com.ludi.financiera.repositorio.SolicitudRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.ludi.financiera.dto.ChartDataDTO;

@Service
@RequiredArgsConstructor
public class DashboardServicio {

    private final SolicitudRepositorio solicitudRepositorio;
    private final ClienteRepositorio clienteRepositorio;
    private final CuotaRepositorio cuotaRepositorio;

    public DashboardDTO getDashboardData() {
        Long pendientes = solicitudRepositorio.countByEstado("PENDIENTE");
        Long aprobadas = solicitudRepositorio.countByEstado("APROBADA");
        Long vencidas = cuotaRepositorio.countVencidas();
        Long clientesActivos = clienteRepositorio.countByEstado("Activo");

        List<AlertaDTO> alertas = new ArrayList<>();

        // Traer algunas solicitudes pendientes para la alerta
        List<SolicitudCredito> solicitudesPendientes = solicitudRepositorio.findByEstado("PENDIENTE");
        for (int i = 0; i < Math.min(solicitudesPendientes.size(), 3); i++) {
            SolicitudCredito sol = solicitudesPendientes.get(i);
            alertas.add(new AlertaDTO(
                    sol.getCodigoSolicitud() + " - " + sol.getCliente().getNombres() + " " + sol.getCliente().getApellidos(),
                    "Solicitud pendiente de evaluación",
                    "AMBER"
            ));
        }

        // Traer cuotas vencidas para la alerta
        List<Cuota> cuotasVencidas = cuotaRepositorio.findBandejaCobranza(LocalDate.now().plusDays(30));
        for (Cuota cuota : cuotasVencidas) {
            if ("VENCIDA".equals(cuota.getEstado()) || (cuota.getFechaVencimiento().isBefore(LocalDate.now()) && "PENDIENTE".equals(cuota.getEstado()))) {
                long diasVencidos = ChronoUnit.DAYS.between(cuota.getFechaVencimiento(), LocalDate.now());
                alertas.add(new AlertaDTO(
                        "Cuota " + cuota.getNumeroCuota() + " - Cliente " + cuota.getCronograma().getSolicitud().getCliente().getNombres(),
                        "Cuota vencida hace " + diasVencidos + " días",
                        "RED"
                ));
                if (alertas.size() >= 5) break; // Límite de alertas
            }
        }

        Double totalColocaciones = solicitudRepositorio.sumMontoColocaciones();
        Double totalCobranzas = cuotaRepositorio.sumMontoCobranzas();
        Double totalVencidas = cuotaRepositorio.sumMontoVencidas();
        Double sumMontoTotal = cuotaRepositorio.sumMontoTotal();
        Double porcentajeMorosidad = 0.0;
        if (sumMontoTotal > 0) {
            porcentajeMorosidad = Math.round((totalVencidas / sumMontoTotal) * 1000.0) / 10.0;
        }

        List<ChartDataDTO> tendencias = new ArrayList<>();
        tendencias.add(new ChartDataDTO("Ene", 0.0, 0.0, 0.0));
        tendencias.add(new ChartDataDTO("Feb", 0.0, 0.0, 0.0));
        tendencias.add(new ChartDataDTO("Mar", 0.0, 0.0, 0.0));
        tendencias.add(new ChartDataDTO("Abr", 0.0, 0.0, 0.0));
        tendencias.add(new ChartDataDTO("May", 0.0, 0.0, 0.0));
        tendencias.add(new ChartDataDTO("Jun", 0.0, 0.0, 0.0));
        tendencias.add(new ChartDataDTO("Jul", totalColocaciones, totalCobranzas, porcentajeMorosidad));

        return new DashboardDTO(pendientes, aprobadas, vencidas, clientesActivos, alertas, 
                totalColocaciones, totalCobranzas, porcentajeMorosidad, tendencias);
    }
}
