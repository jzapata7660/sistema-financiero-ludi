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

@Service
@RequiredArgsConstructor
public class NegocioServicio {

    private final NegocioRepositorio negocioRepositorio;
    private final ClienteRepositorio clienteRepositorio;

    public Negocio registrarNegocio(NegocioRequest request) {
        Cliente cliente = clienteRepositorio.findByDni(request.getDniCliente())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        if (negocioRepositorio.findByClienteIdCliente(cliente.getIdCliente()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cliente ya tiene un negocio registrado");
        }

        Negocio negocio = new Negocio();
        negocio.setCliente(cliente);
        negocio.setRuc(request.getRuc());
        negocio.setRazonSocial(request.getRazonSocial());
        negocio.setGiroNegocio(request.getGiroNegocio());
        negocio.setDireccion(request.getDireccion());
        negocio.setIngresoPromedioMensual(request.getIngresoPromedioMensual());

        return negocioRepositorio.save(negocio);
    }
    
    public Negocio obtenerPorDniCliente(String dni) {
        return negocioRepositorio.findByClienteDni(dni)
                .orElse(null); // Optional. Puede retornar null si no tiene negocio
    }
}
