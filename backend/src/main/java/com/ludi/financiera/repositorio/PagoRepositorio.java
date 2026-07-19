package com.ludi.financiera.repositorio;

import com.ludi.financiera.entidad.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface PagoRepositorio extends JpaRepository<Pago, Integer> {
    
    @Query("SELECT SUM(p.montoPagado) FROM Pago p WHERE DATE(p.fechaPago) = CURRENT_DATE")
    Double sumCobradoHoy();
    
    @Query("SELECT p FROM Pago p WHERE DATE(p.fechaPago) = CURRENT_DATE ORDER BY p.fechaPago DESC")
    List<Pago> findCobranzasHoy();
    
    List<Pago> findByCuotaIdCuota(Integer idCuota);
}
