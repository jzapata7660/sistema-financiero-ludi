import React, { useState } from 'react';
import { Check, Footprints } from 'lucide-react';

const ModalVisita = ({ isOpen, onClose, onConfirm }) => {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [observacion, setObservacion] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      tipoAccion: 'Visita',
      resultado: `Agendada para ${fecha} a las ${hora}`,
      observaciones: observacion
    });
    setFecha('');
    setHora('');
    setObservacion('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <form onSubmit={handleSubmit} className="p-8 flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <Footprints className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Programar Visita</h2>
          <p className="text-sm text-slate-500 mb-6 px-4">Defina la fecha, hora y observación de la visita de campo</p>

          <div className="w-full text-left space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Fecha de visita *</label>
              <input 
                type="date"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Hora de visita *</label>
              <input 
                type="time"
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Motivo u observación</label>
              <textarea 
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none min-h-[80px] resize-none"
                placeholder="Ej. No se ubicó al cliente, se agendó nuevo contacto..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
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
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Check className="w-5 h-5" />
              Confirmar Visita
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalVisita;
