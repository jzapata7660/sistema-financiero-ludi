package com.ludi.financiera.servicio;

import com.ludi.financiera.dto.AprobacionRequest;
import com.ludi.financiera.dto.SolicitudRequest;
import com.ludi.financiera.entidad.*;
import com.ludi.financiera.repositorio.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudServicio {

    private final SolicitudRepositorio solicitudRepositorio;
    private final ClienteRepositorio clienteRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final CronogramaRepositorio cronogramaRepositorio;
    private final CuotaRepositorio cuotaRepositorio;
    private final ExpedienteRepositorio expedienteRepositorio;

    @Transactional
    public SolicitudCredito crearSolicitud(SolicitudRequest req) {
        Cliente cliente = clienteRepositorio.findByDni(req.getDniCliente())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        Usuario analista = usuarioRepositorio.findById(req.getAnalistaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analista no encontrado"));

        // Generar código de solicitud único
        String codigo = "SOL-" + System.currentTimeMillis();

        SolicitudCredito solicitud = new SolicitudCredito();
        solicitud.setCodigoSolicitud(codigo);
        solicitud.setCliente(cliente);
        solicitud.setAnalista(analista);
        solicitud.setMontoSolicitado(req.getMonto());
        solicitud.setPlazoMeses(req.getPlazoMeses());
        solicitud.setTasaInteres(req.getTasaInteres());
        solicitud.setModalidadPago(req.getModalidadPago());
        solicitud.setEstado("PENDIENTE");

        if (req.getEvaluacion() != null) {
            ParametrosEvaluacion pe = new ParametrosEvaluacion();
            pe.setCumpleRequisitos(req.getEvaluacion().getCumpleRequisitos());
            pe.setCapacidadPago(req.getEvaluacion().getCapacidadPago());
            pe.setVerificacionIngresos(req.getEvaluacion().getVerificacionIngresos());
            pe.setReferenciaVerificada(req.getEvaluacion().getReferenciaVerificada());
            pe.setSolicitud(solicitud);
            solicitud.setParametrosEvaluacion(pe);
        }

        solicitud = solicitudRepositorio.save(solicitud);

        // Generar cronograma de pagos automáticamente
        generarCronograma(solicitud);

        return solicitud;
    }

    private void generarCronograma(SolicitudCredito solicitud) {
        double capital = solicitud.getMontoSolicitado();
        double tasaMensual = solicitud.getTasaInteres() / 100.0;
        int plazo = solicitud.getPlazoMeses();

        // Calcular cuota mensual con fórmula de amortización francesa
        double cuotaMensual;
        if (tasaMensual == 0) {
            cuotaMensual = capital / plazo;
        } else {
            cuotaMensual = capital * (tasaMensual * Math.pow(1 + tasaMensual, plazo))
                    / (Math.pow(1 + tasaMensual, plazo) - 1);
        }

        double totalPagar = cuotaMensual * plazo;
        double totalInteres = totalPagar - capital;

        CronogramaPagos cronograma = new CronogramaPagos();
        cronograma.setSolicitud(solicitud);
        cronograma.setTotalCapital(Math.round(capital * 100.0) / 100.0);
        cronograma.setTotalInteres(Math.round(totalInteres * 100.0) / 100.0);
        cronograma.setTotalPagar(Math.round(totalPagar * 100.0) / 100.0);
        cronograma = cronogramaRepositorio.save(cronograma);

        // Generar cuotas individuales
        List<Cuota> cuotas = new ArrayList<>();
        double saldo = capital;
        LocalDate fechaVencimiento = LocalDate.now().plusMonths(1);

        for (int i = 1; i <= plazo; i++) {
            double interesCuota = saldo * tasaMensual;
            double capitalCuota = cuotaMensual - interesCuota;

            Cuota cuota = new Cuota();
            cuota.setCronograma(cronograma);
            cuota.setNumeroCuota(i);
            cuota.setMontoCapital(Math.round(capitalCuota * 100.0) / 100.0);
            cuota.setMontoInteres(Math.round(interesCuota * 100.0) / 100.0);
            cuota.setMontoTotal(Math.round(cuotaMensual * 100.0) / 100.0);
            cuota.setFechaVencimiento(fechaVencimiento);
            cuota.setEstado("PENDIENTE");

            cuotas.add(cuota);
            saldo -= capitalCuota;
            fechaVencimiento = fechaVencimiento.plusMonths(1);
        }

        cuotaRepositorio.saveAll(cuotas);
    }

    @Transactional
    public SolicitudCredito aprobarOrechazarSolicitud(Integer solicitudId, AprobacionRequest req) {
        SolicitudCredito solicitud = solicitudRepositorio.findById(solicitudId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));

        if (!"PENDIENTE".equals(solicitud.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La solicitud ya fue procesada");
        }

        Usuario aprobador = usuarioRepositorio.findById(req.getAprobadorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aprobador no encontrado"));

        String rolAprobador = aprobador.getRol().getNombreRol();
        double monto = solicitud.getMontoSolicitado();

        if ("ADMINISTRADOR".equalsIgnoreCase(rolAprobador) && monto > 1500.0) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El Administrador no puede aprobar créditos mayores a S/ 1,500");
        }

        if ("GERENTE".equalsIgnoreCase(rolAprobador) && monto <= 1500.0) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "La Gerencia solo aprueba créditos mayores a S/ 1,500");
        }

        if ("APROBAR".equalsIgnoreCase(req.getAccion())) {
            solicitud.setEstado("APROBADA");
            solicitud.setAprobador(aprobador);
            solicitud.setFechaAprobacion(LocalDateTime.now());
            solicitud.setObservaciones(req.getObservaciones());

            solicitudRepositorio.save(solicitud);

            // Crear expediente físico automáticamente
            ExpedienteFisico expediente = new ExpedienteFisico();
            expediente.setSolicitud(solicitud);
            expediente.setCodigoCarpeta("EXP-" + solicitud.getCodigoSolicitud());
            expediente.setEstado("POR_ARCHIVAR");
            expedienteRepositorio.save(expediente);

        } else if ("RECHAZAR".equalsIgnoreCase(req.getAccion())) {
            solicitud.setEstado("RECHAZADA");
            solicitud.setAprobador(aprobador);
            solicitud.setFechaAprobacion(LocalDateTime.now());
            solicitud.setObservaciones(req.getObservaciones());
            solicitudRepositorio.save(solicitud);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Acción inválida. Use APROBAR o RECHAZAR");
        }

        return solicitud;
    }
    
    public CronogramaPagos previsualizarCronograma(SolicitudRequest req) {
        SolicitudCredito mockSolicitud = new SolicitudCredito();
        mockSolicitud.setMontoSolicitado(req.getMonto());
        mockSolicitud.setPlazoMeses(req.getPlazoMeses());
        mockSolicitud.setTasaInteres(req.getTasaInteres());
        mockSolicitud.setModalidadPago(req.getModalidadPago());

        double capital = mockSolicitud.getMontoSolicitado();
        double tasaMensual = mockSolicitud.getTasaInteres() / 100.0;
        int plazo = mockSolicitud.getPlazoMeses();

        double cuotaMensual;
        if (tasaMensual == 0) {
            cuotaMensual = capital / plazo;
        } else {
            cuotaMensual = capital * (tasaMensual * Math.pow(1 + tasaMensual, plazo))
                    / (Math.pow(1 + tasaMensual, plazo) - 1);
        }

        double totalPagar = cuotaMensual * plazo;
        double totalInteres = totalPagar - capital;

        CronogramaPagos cronograma = new CronogramaPagos();
        cronograma.setTotalCapital(Math.round(capital * 100.0) / 100.0);
        cronograma.setTotalInteres(Math.round(totalInteres * 100.0) / 100.0);
        cronograma.setTotalPagar(Math.round(totalPagar * 100.0) / 100.0);

        List<Cuota> cuotas = new ArrayList<>();
        double saldo = capital;
        LocalDate fechaVencimiento = LocalDate.now().plusMonths(1);

        for (int i = 1; i <= plazo; i++) {
            double interesCuota = saldo * tasaMensual;
            double capitalCuota = cuotaMensual - interesCuota;

            Cuota cuota = new Cuota();
            cuota.setNumeroCuota(i);
            cuota.setMontoCapital(Math.round(capitalCuota * 100.0) / 100.0);
            cuota.setMontoInteres(Math.round(interesCuota * 100.0) / 100.0);
            cuota.setMontoTotal(Math.round(cuotaMensual * 100.0) / 100.0);
            cuota.setFechaVencimiento(fechaVencimiento);
            cuota.setEstado("PENDIENTE");

            cuotas.add(cuota);
            saldo -= capitalCuota;
            fechaVencimiento = fechaVencimiento.plusMonths(1);
        }
        cronograma.setCuotas(cuotas); // Asumiendo que CronogramaPagos tiene setCuotas()
        return cronograma;
    }

    public List<SolicitudCredito> listarPorEstado(String estado, Integer usuarioId) {
        List<SolicitudCredito> lista;
        if (estado == null || estado.isBlank()) {
            lista = solicitudRepositorio.findAll();
        } else {
            lista = solicitudRepositorio.findByEstado(estado.toUpperCase());
        }

        if (usuarioId != null) {
            Usuario usuario = usuarioRepositorio.findById(usuarioId).orElse(null);
            if (usuario != null) {
                String rol = usuario.getRol().getNombreRol();
                if ("ADMINISTRADOR".equalsIgnoreCase(rol)) {
                    // Administrador solo ve solicitudes <= 1500 (o que ya haya aprobado él)
                    lista.removeIf(s -> s.getMontoSolicitado() > 1500.0);
                } else if ("GERENTE".equalsIgnoreCase(rol)) {
                    // Gerente solo ve solicitudes > 1500 (o que ya haya aprobado él)
                    lista.removeIf(s -> s.getMontoSolicitado() <= 1500.0);
                }
            }
        }
        return lista;
    }

    public SolicitudCredito obtenerPorId(Integer id) {
        return solicitudRepositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));
    }
}
