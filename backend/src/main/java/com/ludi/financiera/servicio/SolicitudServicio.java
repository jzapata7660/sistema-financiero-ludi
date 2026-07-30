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
    private final NegocioRepositorio negocioRepositorio;

    @Transactional
    public SolicitudCredito crearSolicitud(SolicitudRequest req) {
        Cliente cliente = clienteRepositorio.findByDni(req.getDniCliente())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        Usuario analista = usuarioRepositorio.findById(req.getAnalistaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analista no encontrado"));

        Negocio negocio = negocioRepositorio.findById(req.getNegocioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Negocio no encontrado"));

        // Generar código de solicitud único
        String codigo = "SOL-" + System.currentTimeMillis();

        SolicitudCredito solicitud = new SolicitudCredito();
        solicitud.setCodigoSolicitud(codigo);
        solicitud.setCliente(cliente);
        solicitud.setNegocio(negocio);
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

    private CronogramaPagos calcularCuotasCronograma(double capital, double tasaMensualPorcentaje, int plazoMeses, String modalidadPago) {
        double tasaPeriodo = tasaMensualPorcentaje / 100.0;
        int numCuotas = plazoMeses;
        int diasIncremento = 30;

        if ("Quincenal".equalsIgnoreCase(modalidadPago)) {
            numCuotas = plazoMeses * 2;
            tasaPeriodo = tasaPeriodo / 2;
            diasIncremento = 15;
        } else if ("Semanal".equalsIgnoreCase(modalidadPago)) {
            numCuotas = plazoMeses * 4;
            tasaPeriodo = tasaPeriodo / 4;
            diasIncremento = 7;
        } else if ("Diario".equalsIgnoreCase(modalidadPago)) {
            numCuotas = plazoMeses * 30;
            tasaPeriodo = tasaPeriodo / 30;
            diasIncremento = 1;
        }

        double cuotaPeriodo;
        if (tasaPeriodo == 0) {
            cuotaPeriodo = capital / numCuotas;
        } else {
            cuotaPeriodo = capital * (tasaPeriodo * Math.pow(1 + tasaPeriodo, numCuotas))
                    / (Math.pow(1 + tasaPeriodo, numCuotas) - 1);
        }

        double totalPagar = cuotaPeriodo * numCuotas;
        double totalInteres = totalPagar - capital;

        CronogramaPagos cronograma = new CronogramaPagos();
        cronograma.setTotalCapital(Math.round(capital * 100.0) / 100.0);
        cronograma.setTotalInteres(Math.round(totalInteres * 100.0) / 100.0);
        cronograma.setTotalPagar(Math.round(totalPagar * 100.0) / 100.0);

        List<Cuota> cuotas = new ArrayList<>();
        double saldo = capital;
        LocalDate fechaVencimiento = LocalDate.now();

        if ("Mensual".equalsIgnoreCase(modalidadPago) || modalidadPago == null) {
            fechaVencimiento = fechaVencimiento.plusMonths(1);
        } else {
            fechaVencimiento = fechaVencimiento.plusDays(diasIncremento);
        }

        for (int i = 1; i <= numCuotas; i++) {
            double interesCuota = saldo * tasaPeriodo;
            double capitalCuota = cuotaPeriodo - interesCuota;

            Cuota cuota = new Cuota();
            cuota.setNumeroCuota(i);
            cuota.setMontoCapital(Math.round(capitalCuota * 100.0) / 100.0);
            cuota.setMontoInteres(Math.round(interesCuota * 100.0) / 100.0);
            cuota.setMontoTotal(Math.round(cuotaPeriodo * 100.0) / 100.0);
            cuota.setFechaVencimiento(fechaVencimiento);
            cuota.setEstado("PENDIENTE");
            cuota.setCronograma(cronograma);

            cuotas.add(cuota);
            saldo -= capitalCuota;

            if ("Mensual".equalsIgnoreCase(modalidadPago) || modalidadPago == null) {
                fechaVencimiento = fechaVencimiento.plusMonths(1);
            } else {
                fechaVencimiento = fechaVencimiento.plusDays(diasIncremento);
            }
        }

        cronograma.setCuotas(cuotas);
        return cronograma;
    }

    private void generarCronograma(SolicitudCredito solicitud) {
        CronogramaPagos cronogramaCalculado = calcularCuotasCronograma(
                solicitud.getMontoSolicitado(),
                solicitud.getTasaInteres(),
                solicitud.getPlazoMeses(),
                solicitud.getModalidadPago()
        );

        cronogramaCalculado.setSolicitud(solicitud);
        cronogramaRepositorio.save(cronogramaCalculado);
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
        return calcularCuotasCronograma(
                req.getMonto(),
                req.getTasaInteres(),
                req.getPlazoMeses(),
                req.getModalidadPago()
        );
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
