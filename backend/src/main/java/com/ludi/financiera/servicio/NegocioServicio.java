package com.ludi.financiera.servicio;

import com.ludi.financiera.dto.NegocioRequest;
import com.ludi.financiera.entidad.Cliente;
import com.ludi.financiera.entidad.Negocio;
import com.ludi.financiera.repositorio.ClienteRepositorio;
import com.ludi.financiera.repositorio.NegocioRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NegocioServicio {

    private final NegocioRepositorio negocioRepositorio;
    private final ClienteRepositorio clienteRepositorio;

    public Negocio registrarNegocio(NegocioRequest request) {
        Cliente cliente = clienteRepositorio.findByDni(request.getDniCliente())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        Negocio negocio = new Negocio();
        negocio.setCliente(cliente);
        negocio.setRuc(request.getRuc());
        negocio.setRazonSocial(request.getRazonSocial());
        negocio.setGiroNegocio(request.getGiroNegocio());
        negocio.setDireccion(request.getDireccion());
        negocio.setIngresoPromedioMensual(request.getIngresoPromedioMensual());
        negocio.setTiempoOperacion(request.getTiempoOperacion());

        return negocioRepositorio.save(negocio);
    }
    
    public List<Negocio> obtenerPorDniCliente(String dni) {
        return negocioRepositorio.findByClienteDni(dni);
    }
}
