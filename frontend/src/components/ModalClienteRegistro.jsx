import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-900 text-white">
          <h2 className="text-xl font-bold">{clienteAEditar ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">DNI *</label>
            <input 
              type="text" 
              name="dni"
              maxLength="8"
              required
              placeholder="Ej. 74839210"
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.dni}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nombres *</label>
              <input 
                type="text" 
                name="nombres"
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.nombres}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Apellidos *</label>
              <input 
                type="text" 
                name="apellidos"
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.apellidos}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
            <input 
              type="text" 
              name="telefono"
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Dirección</label>
            <input 
              type="text" 
              name="direccion"
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.direccion}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 pt-4 mt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70"
            >
              {clienteAEditar ? 'Actualizar Cliente' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalClienteRegistro;
