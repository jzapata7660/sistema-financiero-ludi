import React, { useState, useEffect } from 'react';
import { X, UserPlus, User } from 'lucide-react';
import { apiCliente } from '../services/apiCliente';

const ModalClienteRegistro = ({ isOpen, onClose, onClienteRegistrado, clienteAEditar }) => {
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clienteAEditar) {
      setFormData({
        dni: clienteAEditar.dni || '',
        nombres: clienteAEditar.nombres || '',
        apellidos: clienteAEditar.apellidos || '',
        telefono: clienteAEditar.telefono || '',
        direccion: clienteAEditar.direccion || ''
      });
    } else {
      setFormData({ dni: '', nombres: '', apellidos: '', telefono: '', direccion: '' });
    }
  }, [clienteAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (clienteAEditar) {
        await apiCliente.actualizarCliente(clienteAEditar.id || clienteAEditar.idCliente, formData);
      } else {
        await apiCliente.crearCliente(formData);
      }
      onClienteRegistrado();
      onClose();
    } catch (error) {
      console.error("Error al registrar/actualizar cliente", error);
      alert(error.response?.data?.message || "Error al procesar la solicitud del cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${clienteAEditar ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              {clienteAEditar ? <User size={24} strokeWidth={2.5} /> : <UserPlus size={24} strokeWidth={2.5} />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                {clienteAEditar ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <p className="text-[13px] text-gray-500 mt-0.5 font-medium">Complete los datos personales del cliente</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 p-2 rounded-full transition-colors mt-1"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">DNI *</label>
            <input 
              type="text" 
              name="dni"
              maxLength="8"
              required
              placeholder="Ej. 74839210"
              className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
              value={formData.dni}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">Nombres *</label>
              <input 
                type="text" 
                name="nombres"
                required
                placeholder="Nombres completos"
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                value={formData.nombres}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">Apellidos *</label>
              <input 
                type="text" 
                name="apellidos"
                required
                placeholder="Apellidos completos"
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                value={formData.apellidos}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">Teléfono</label>
            <input 
              type="text" 
              name="telefono"
              placeholder="Número de contacto"
              className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">Dirección</label>
            <input 
              type="text" 
              name="direccion"
              placeholder="Dirección del domicilio"
              className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
              value={formData.direccion}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 pt-6 pb-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl transition-colors border border-gray-200"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-3 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {clienteAEditar ? 'Guardar Cambios' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalClienteRegistro;

