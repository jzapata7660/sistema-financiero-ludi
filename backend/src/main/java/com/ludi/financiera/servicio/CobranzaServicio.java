package com.ludi.financiera.servicio;

import com.ludi.financiera.dto.*;
import com.ludi.financiera.entidad.*;
import com.ludi.financiera.repositorio.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CobranzaServicio {

    private final CuotaRepositorio cuotaRepositorio;
    private final PagoRepositorio pagoRepositorio;
    private final AccionCobranzaRepositorio accionCobranzaRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final SolicitudRepositorio solicitudRepositorio;

    public CobranzaDashboardDTO obtenerDashboard() {
        CobranzaDashboardDTO dto = new CobranzaDashboardDTO();
        
        Long porCobrarHoy = cuotaRepositorio.countPorCobrarHoy();
        dto.setPorCobrarHoy(porCobrarHoy != null ? porCobrarHoy : 0L);
        
        Long vencidas = cuotaRepositorio.countVencidas();
        dto.setVencidas(vencidas != null ? vencidas : 0L);
        
        Double cobradoHoy = pagoRepositorio.sumCobradoHoy();
        dto.setCobradoHoy(cobradoHoy != null ? cobradoHoy : 0.0);
        
        Double totalPendiente = cuotaRepositorio.sumTotalPendiente();
        dto.setTotalPendiente(totalPendiente != null ? totalPendiente : 0.0);
        
        return dto;
    }

    public List<CuotaCobranzaDTO> obtenerBandeja() {
        List<Cuota> cuotas = cuotaRepositorio.findBandejaCobranza(LocalDate.now().plusDays(7));
        
        // Filter to keep only the earliest pending/overdue quota per credit (cronograma)
        java.util.Set<Integer> cronogramasProcesados = new java.util.HashSet<>();
        List<Cuota> cuotasFiltradas = new java.util.ArrayList<>();
        
        for (Cuota c : cuotas) {
            Integer idCronograma = c.getCronograma().getIdCronograma();
            if (!cronogramasProcesados.contains(idCronograma)) {
                cronogramasProcesados.add(idCronograma);
                cuotasFiltradas.add(c);
            }
        }
        
        return cuotasFiltradas.stream().map(this::mapToCuotaCobranzaDTO).collect(Collectors.toList());
    }

    private CuotaCobranzaDTO mapToCuotaCobranzaDTO(Cuota cuota) {
        CuotaCobranzaDTO dto = new CuotaCobranzaDTO();
        dto.setIdCuota(cuota.getIdCuota());
        
        CronogramaPagos cronograma = cuota.getCronograma();
        SolicitudCredito solicitud = cronograma.getSolicitud();
        Cliente cliente = solicitud.getCliente();
        
        dto.setCodigoSolicitud(solicitud.getCodigoSolicitud());
        dto.setClienteNombres(cliente.getNombres());
        dto.setClienteApellidos(cliente.getApellidos());
        dto.setClienteDni(cliente.getDni());
        dto.setTelefono(cliente.getTelefono());
        
        dto.setNumeroCuota(cuota.getNumeroCuota());
        dto.setTotalCuotas(solicitud.getPlazoMeses());
        dto.setMontoTotal(cuota.getMontoTotal());
        
        // Calculate partial payments and remaining balance
        List<Pago> pagos = pagoRepositorio.findByCuotaIdCuota(cuota.getIdCuota());
        double totalPagado = pagos.stream().mapToDouble(Pago::getMontoPagado).sum();
        dto.setMontoPagado(totalPagado);
        dto.setSaldoPendiente(cuota.getMontoTotal() - totalPagado);
        
        dto.setFechaVencimiento(cuota.getFechaVencimiento().toString());
        
        long dias = ChronoUnit.DAYS.between(cuota.getFechaVencimiento(), LocalDate.now());
        dto.setDiasAtraso(dias > 0 ? dias : 0L);
        
        if (cuota.getEstado().equals("PAGADA")) {
            dto.setEstado("PAGADA");
        } else if (dias > 0) {
            dto.setEstado("Vencida");
        } else {
            dto.setEstado("Por Vencer");
        }
        
        return dto;
    }

    public List<CobranzaRealizadaDTO> obtenerCobranzasHoy() {
        List<Pago> pagos = pagoRepositorio.findCobranzasHoy();
        return pagos.stream().map(pago -> {
            CobranzaRealizadaDTO dto = new CobranzaRealizadaDTO();
            CronogramaPagos crono = pago.getCuota().getCronograma();
            SolicitudCredito sol = crono.getSolicitud();
            
            dto.setCodigoSolicitud(sol.getCodigoSolicitud());
            dto.setClienteNombre(sol.getCliente().getNombres() + " " + sol.getCliente().getApellidos());
            dto.setNumeroCuota(pago.getCuota().getNumeroCuota());
            dto.setTotalCuotas(sol.getPlazoMeses());
            dto.setMontoPagado(pago.getMontoPagado());
            dto.setFechaPago(pago.getFechaPago());
            dto.setFormaPago(pago.getFormaPago());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void registrarPago(Integer idCuota, RegistroPagoDTO request) {
        Cuota cuota = cuotaRepositorio.findById(idCuota)
                .orElseThrow(() -> new RuntimeException("Cuota no encontrada"));
        
        if (request.getAnalistaId() == null) {
            throw new RuntimeException("Analista no especificado");
        }
                
        Usuario analista = usuarioRepositorio.findById(request.getAnalistaId())
                .orElseThrow(() -> new RuntimeException("Analista no encontrado"));

        // 1. Validar el monto antes de guardar
        List<Pago> pagosAnteriores = pagoRepositorio.findByCuotaIdCuota(cuota.getIdCuota());
        double totalPagadoAnterior = pagosAnteriores.stream().mapToDouble(Pago::getMontoPagado).sum();
        double saldoPendiente = cuota.getMontoTotal() - totalPagadoAnterior;
        
        // Redondeo para evitar problemas de coma flotante (ej: 6.5499999997)
        saldoPendiente = Math.round(saldoPendiente * 100.0) / 100.0;
        double montoRecibido = Math.round(request.getMontoRecibido() * 100.0) / 100.0;

        double moraCalculada = 0.0;
        if (montoRecibido > saldoPendiente) {
            moraCalculada = Math.round((montoRecibido - saldoPendiente) * 100.0) / 100.0;
        }

        // 2. Guardar el pago
        Pago pago = new Pago();
        pago.setCuota(cuota);
        pago.setAnalista(analista);
        pago.setMontoPagado(montoRecibido);
        pago.setFormaPago(request.getFormaPago());
        pago.setObservaciones(request.getObservaciones());
        pago.setNumeroCuota(cuota.getNumeroCuota());
        
        // El saldo pendiente será 0 si pagó todo o más (mora).
        double nuevoSaldo = Math.max(0, Math.round((saldoPendiente - montoRecibido) * 100.0) / 100.0);
        pago.setSaldoPendiente(nuevoSaldo);
        pago.setMoraPagada(moraCalculada);
        
        // La fecha de pago se asigna sola por @CreationTimestamp
        pagoRepositorio.save(pago);

        // 3. Actualizar estado de cuota si se completó
        double sumaTotal = totalPagadoAnterior + request.getMontoRecibido();

        if (sumaTotal >= cuota.getMontoTotal()) {
            cuota.setEstado("PAGADA");
            cuotaRepositorio.save(cuota);
        }
    }

    @Transactional
    public void registrarAccion(Integer idSolicitud, AccionCobranzaDTO dto) {
        SolicitudCredito solicitud = solicitudRepositorio.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        
        Usuario analista = usuarioRepositorio.findById(dto.getAnalistaId())
                .orElseThrow(() -> new RuntimeException("Analista no encontrado"));

        AccionCobranza accion = new AccionCobranza();
        accion.setSolicitud(solicitud);
        accion.setCliente(solicitud.getCliente());
        accion.setAnalista(analista);
        accion.setTipoAccion(dto.getTipoAccion());
        accion.setResultado(dto.getResultado());
        
        if (dto.getCompromisoPago() != null && !dto.getCompromisoPago().isEmpty()) {
            accion.setCompromisoPago(LocalDate.parse(dto.getCompromisoPago(), DateTimeFormatter.ISO_DATE));
        }

        accionCobranzaRepositorio.save(accion);
    }
    
    public List<AccionCobranza> obtenerHistorial(Integer idSolicitud) {
        return accionCobranzaRepositorio.findBySolicitudIdSolicitudOrderByFechaAccionDesc(idSolicitud);
    }
}
