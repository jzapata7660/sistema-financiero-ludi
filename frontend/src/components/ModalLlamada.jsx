import React, { useState } from 'react';
import { Phone, Check } from 'lucide-react';

const ModalLlamada = ({ isOpen, onClose, onConfirm }) => {
  const [resultado, setResultado] = useState('Promete pagar');
  const [observaciones, setObservaciones] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      tipoAccion: 'Llamada',
      resultado: resultado,
      observaciones: observaciones
    });
    setResultado('Promete pagar');
    setObservaciones('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleSubmit} className="p-8 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Phone className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Registro de Llamada</h2>
          <p className="text-sm text-slate-500 mb-6">Confirme la gestión telefónica realizada al cliente</p>

          <div className="w-full text-left space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Resultado de la llamada *</label>
              <select 
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                required
              >
                <option value="Promete pagar">Promete pagar</option>
                <option value="Solicita prórroga">Solicita prórroga</option>
                <option value="No contesta">No contesta</option>
                <option value="Número equivocado">Número equivocado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Observaciones</label>
              <textarea 
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
                placeholder="Detalle de la conversación o compromiso..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 w-full mt-8">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors border border-slate-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Confirmar Llamada
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalLlamada;
