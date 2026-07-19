package com.ludi.financiera.servicio;

import com.ludi.financiera.dto.DesembolsoRequestDTO;
import com.ludi.financiera.dto.ExpedienteCajaDTO;
import com.ludi.financiera.entidad.*;
import com.ludi.financiera.repositorio.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CajaServicio {

    private final SolicitudRepositorio solicitudRepositorio;
    private final DesembolsoRepositorio desembolsoRepositorio;
    private final CronogramaRepositorio cronogramaRepositorio;
    private final CuotaRepositorio cuotaRepositorio;
    private final UsuarioRepositorio usuarioRepositorio;
    private final NegocioRepositorio negocioRepositorio;

    @Transactional(readOnly = true)
    public List<ExpedienteCajaDTO> obtenerPendientesDesembolso() {
        List<SolicitudCredito> aprobadas = solicitudRepositorio.findByEstado("APROBADA");
        return aprobadas.stream().map(this::mapToExpedienteCajaDTO).collect(Collectors.toList());
    }

    private ExpedienteCajaDTO mapToExpedienteCajaDTO(SolicitudCredito solicitud) {
        ExpedienteCajaDTO dto = new ExpedienteCajaDTO();
        dto.setIdSolicitud(solicitud.getIdSolicitud());
        dto.setCodigo(solicitud.getCodigoSolicitud());
        
        Cliente cliente = solicitud.getCliente();
        dto.setClienteNombre(cliente.getNombres() + " " + cliente.getApellidos());
        dto.setClienteDni(cliente.getDni());
        dto.setClienteDireccion(cliente.getDireccion());
        
        Optional<Negocio> negocioOpt = negocioRepositorio.findByClienteIdCliente(cliente.getIdCliente());
        dto.setClienteGiro(negocioOpt.map(Negocio::getGiroNegocio).orElse("No especificado"));
        
        dto.setMonto(solicitud.getMontoSolicitado());
        dto.setPlazoMeses(solicitud.getPlazoMeses());
        dto.setTasaInteres(solicitud.getTasaInteres());
        dto.setModalidad(solicitud.getModalidadPago());
        
        Usuario aprobador = solicitud.getAprobador();
        dto.setAprobadorNombre(aprobador != null ? aprobador.getRol().getNombreRol() : "No registrado");
        dto.setFechaAprobacion(solicitud.getFechaAprobacion() != null ? solicitud.getFechaAprobacion().toLocalDate().toString() : "");
        dto.setEstado(solicitud.getEstado());

        // Fill Cronograma if exists
        Optional<CronogramaPagos> cronogramaOpt = cronogramaRepositorio.findBySolicitudIdSolicitud(solicitud.getIdSolicitud());
        if (cronogramaOpt.isPresent()) {
            List<Cuota> cuotas = cuotaRepositorio.findByCronogramaIdCronograma(cronogramaOpt.get().getIdCronograma());
            List<ExpedienteCajaDTO.CuotaDesembolsoDTO> cuotasDto = new ArrayList<>();
            for (Cuota c : cuotas) {
                ExpedienteCajaDTO.CuotaDesembolsoDTO cDto = new ExpedienteCajaDTO.CuotaDesembolsoDTO();
                cDto.setNumeroCuota(c.getNumeroCuota());
                cDto.setFechaVencimiento(c.getFechaVencimiento().toString());
                cDto.setMontoCapital(c.getMontoCapital());
                cDto.setMontoInteres(c.getMontoInteres());
                cDto.setMontoTotal(c.getMontoTotal());
                cuotasDto.add(cDto);
            }
            dto.setCronograma(cuotasDto);
        } else {
            dto.setCronograma(new ArrayList<>());
        }

        return dto;
    }

    @Transactional
    public void registrarDesembolso(Integer idSolicitud, DesembolsoRequestDTO req) {
        if (!req.getDniValidado()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe validar físicamente el DNI");
        }

        SolicitudCredito solicitud = solicitudRepositorio.findById(idSolicitud)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitud no encontrada"));

        if (!"APROBADA".equals(solicitud.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La solicitud no está en estado APROBADA");
        }

        Usuario cajera = usuarioRepositorio.findById(req.getCajeraId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cajera no encontrada"));

        Desembolso desembolso = new Desembolso();
        desembolso.setSolicitud(solicitud);
        desembolso.setCajera(cajera);
        desembolso.setMontoDesembolsado(solicitud.getMontoSolicitado());
        desembolso.setModalidadDesembolso(req.getModalidadDesembolso());
        if ("Transferencia Bancaria".equals(req.getModalidadDesembolso())) {
            desembolso.setBancoDestino(req.getBancoDestino());
            desembolso.setCuentaDestino(req.getCuentaDestino());
            desembolso.setCciDestino(req.getCciDestino());
        }
        
        desembolsoRepositorio.save(desembolso);

        // Cambiar estado de solicitud a DESEMBOLSADO o ACTIVO
        solicitud.setEstado("DESEMBOLSADO");
        solicitudRepositorio.save(solicitud);
    }

    @Transactional(readOnly = true)
    public List<com.ludi.financiera.dto.DesembolsoHistorialDTO> obtenerHistorial() {
        return desembolsoRepositorio.findAll().stream().map(d -> {
            com.ludi.financiera.dto.DesembolsoHistorialDTO dto = new com.ludi.financiera.dto.DesembolsoHistorialDTO();
            dto.setIdDesembolso(d.getIdDesembolso());
            dto.setCodigoSolicitud(d.getSolicitud().getCodigoSolicitud());
            dto.setClienteNombre(d.getSolicitud().getCliente().getNombres() + " " + d.getSolicitud().getCliente().getApellidos());
            dto.setMonto(d.getMontoDesembolsado());
            dto.setModalidad(d.getModalidadDesembolso());
            dto.setFecha(d.getFechaDesembolso());
            return dto;
        }).collect(Collectors.toList());
    }
}
