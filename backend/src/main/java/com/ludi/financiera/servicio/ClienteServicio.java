package com.ludi.financiera.servicio;

import com.ludi.financiera.entidad.Cliente;
import com.ludi.financiera.dto.ClienteResumenDTO;
import com.ludi.financiera.repositorio.ClienteRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteServicio {

    private final ClienteRepositorio clienteRepositorio;

    public Cliente buscarPorDni(String dni) {
        return clienteRepositorio.findByDni(dni)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No se encontró cliente con DNI: " + dni));
    }

    public List<Cliente> obtenerClientesMorosos() {
        return clienteRepositorio.findAll()
                .stream()
                .filter(c -> "Mora".equalsIgnoreCase(c.getEstado()))
                .toList();
    }

    public List<ClienteResumenDTO> obtenerTodosResumen() {
        return clienteRepositorio.findAll().stream().map(this::mapToResumenDTO).toList();
    }
    
    private ClienteResumenDTO mapToResumenDTO(Cliente c) {
        ClienteResumenDTO dto = new ClienteResumenDTO();
        dto.setIdCliente(c.getIdCliente());
        dto.setDni(c.getDni());
        dto.setNombres(c.getNombres());
        dto.setApellidos(c.getApellidos());
        dto.setTelefono(c.getTelefono());
        dto.setDireccion(c.getDireccion());
        
        // Automatic state calculation: if no state is defined, we evaluate mora
        String estadoCalculado = "Activo";
        if (c.getEstado() != null && !c.getEstado().isEmpty()) {
            estadoCalculado = c.getEstado();
        }
        
        // This would be replaced with actual lookup if HistorialCrediticio is linked.
        // For simplicity we return defaults if history is null.
        dto.setScoreCrediticio(100);
        dto.setCreditosAnteriores(0);
        dto.setUltimaOperacion(java.time.LocalDate.now());
        
        dto.setEstado(estadoCalculado);
        return dto;
    }

    public List<Cliente> obtenerTodos() {
        return clienteRepositorio.findAll();
    }

    public Cliente registrarCliente(Cliente cliente) {
        if (clienteRepositorio.findByDni(cliente.getDni()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe un cliente con el DNI: " + cliente.getDni());
        }
        cliente.setEstado("Activo");
        return clienteRepositorio.save(cliente);
    }

    public Cliente actualizarCliente(Integer id, Cliente datosNuevos) {
        Cliente clienteExistente = clienteRepositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No se encontró el cliente con ID: " + id));

        if (!clienteExistente.getDni().equals(datosNuevos.getDni()) && 
            clienteRepositorio.findByDni(datosNuevos.getDni()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe otro cliente con el DNI: " + datosNuevos.getDni());
        }

        clienteExistente.setDni(datosNuevos.getDni());
        clienteExistente.setNombres(datosNuevos.getNombres());
        clienteExistente.setApellidos(datosNuevos.getApellidos());
        clienteExistente.setTelefono(datosNuevos.getTelefono());
        clienteExistente.setDireccion(datosNuevos.getDireccion());
        
        if (datosNuevos.getEstado() != null) {
            clienteExistente.setEstado(datosNuevos.getEstado());
        }

        return clienteRepositorio.save(clienteExistente);
    }

    public void eliminarCliente(Integer id) {
        Cliente clienteExistente = clienteRepositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No se encontró el cliente con ID: " + id));
        
        try {
            clienteExistente.setEstado("Inactivo");
            clienteRepositorio.save(clienteExistente);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al desactivar el cliente.");
        }
    }
}
