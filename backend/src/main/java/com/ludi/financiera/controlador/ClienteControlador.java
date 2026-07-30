package com.ludi.financiera.controlador;

import com.ludi.financiera.entidad.Cliente;
import com.ludi.financiera.servicio.ClienteServicio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClienteControlador {

    private final ClienteServicio clienteServicio;

    @GetMapping("/{dni}")
    public ResponseEntity<Cliente> buscarPorDni(@PathVariable String dni) {
        return ResponseEntity.ok(clienteServicio.buscarPorDni(dni));
    }

    @GetMapping("/morosos")
    public ResponseEntity<List<Cliente>> obtenerMorosos() {
        return ResponseEntity.ok(clienteServicio.obtenerClientesMorosos());
    }

    @GetMapping("/resumen")
    public ResponseEntity<List<com.ludi.financiera.dto.ClienteResumenDTO>> listarTodosResumen() {
        return ResponseEntity.ok(clienteServicio.obtenerTodosResumen());
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarTodos() {
        return ResponseEntity.ok(clienteServicio.obtenerTodos());
    }

    @PostMapping
    public ResponseEntity<Cliente> registrarCliente(@RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteServicio.registrarCliente(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizarCliente(@PathVariable Integer id, @RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteServicio.actualizarCliente(id, cliente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable Integer id) {
        clienteServicio.eliminarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/activar/{id}")
    public ResponseEntity<Void> activarCliente(@PathVariable Integer id) {
        clienteServicio.activarCliente(id);
        return ResponseEntity.noContent().build();
    }
}
