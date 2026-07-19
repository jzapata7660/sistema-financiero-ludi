import React, { useState } from 'react';
import { X, DollarSign, Calendar, Info, CheckCircle } from 'lucide-react';
import { apiCobranza } from '../services/apiCobranza';
import { useAuth } from '../context/AuthContext';

const ModalRegistrarPago = ({ isOpen, onClose, cuota, onPagoRegistrado }) => {
  const { user } = useAuth();
  const [montoRecibido, setMontoRecibido] = useState(cuota?.montoTotal || '');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [formaPago, setFormaPago] = useState('Efectivo');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !cuota) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiCobranza.registrarPago(cuota.idCuota, {
        montoRecibido: parseFloat(montoRecibido),
        fechaPago,
        formaPago,
        observaciones,
        cajeraId: user.idUsuario
      });
      onPagoRegistrado();
      onClose();
    } catch (error) {
      console.error("Error registrando pago", error);
      alert("Error registrando el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isParcial = parseFloat(montoRecibido) < cuota.montoTotal;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col relative overflow-hidden">
        
        {/* Header Icon */}
        <div className="flex justify-center mt-6">
          <div className="bg-emerald-100 p-4 rounded-full">
            <DollarSign className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        
        <div className="text-center mt-4 px-6">
          <h2 className="text-xl font-bold text-slate-800">Registrar Pago</h2>
          <p className="text-slate-500 text-sm mt-1">
            Cuota Nº {cuota.numeroCuota}/{cuota.totalCuotas} - Monto: <span className="font-semibold text-slate-700">S/ {parseFloat(cuota.montoTotal).toFixed(2)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Monto Recibido (S/) *</label>
            <input 
              type="number" 
              step="0.01" 
              required
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={montoRecibido}
              onChange={e => setMontoRecibido(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de Pago *</label>
            <div className="relative">
              <input 
                type="date" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 pl-3 pr-10 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={fechaPago}
                onChange={e => setFechaPago(e.target.value)}
              />
              <Calendar className="w-5 h-5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Forma de Pago *</label>
            <select 
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formaPago}
              onChange={e => setFormaPago(e.target.value)}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Yape/Plin">Yape / Plin</option>
              <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Observaciones</label>
            <textarea 
              rows="2"
              placeholder="Opcional..."
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            ></textarea>
          </div>

          {isParcial && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium">
                El monto es menor al total. Se registrará como abono parcial.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 mt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              <CheckCircle className="w-5 h-5" />
              Confirmar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalRegistrarPago;
