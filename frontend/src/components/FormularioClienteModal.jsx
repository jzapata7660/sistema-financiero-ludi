import React, { useState, useEffect } from 'react';

const FormularioClienteModal = ({ isOpen, onClose, onSubmit, clienteAEditar }) => {
  const [formData, setFormData] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    direccion: '',
    esMoroso: false
  });
  
  const [error, setError] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (clienteAEditar) {
      setFormData({
        dni: clienteAEditar.dni || '',
        nombres: clienteAEditar.nombres || '',
        apellidos: clienteAEditar.apellidos || '',
        telefono: clienteAEditar.telefono || '',
        direccion: clienteAEditar.direccion || '',
        esMoroso: clienteAEditar.esMoroso || false
      });
    } else {
      setFormData({
        dni: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        direccion: '',
        esMoroso: false
      });
    }
    setError('');
  }, [clienteAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.dni || formData.dni.length !== 8) {
      setError("El DNI debe tener 8 dígitos.");
      return;
    }
    if (!formData.nombres || !formData.apellidos) {
      setError("Nombres y apellidos son obligatorios.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-semibold">
            {clienteAEditar ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">DNI *</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                maxLength="8"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                placeholder="Ej. 74839210"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none"
              />
            </div>

            <div className="md:col-span-2 pt-2 border-t border-slate-100 mt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="esMoroso"
                  checked={formData.esMoroso}
                  onChange={handleChange}
                  className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <div>
                  <span className="block text-sm font-medium text-slate-900">¿Es Moroso?</span>
                  <span className="block text-xs text-slate-500">Marcar si el cliente tiene deudas impagas o mal historial.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all shadow-sm"
            >
              {clienteAEditar ? 'Guardar Cambios' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioClienteModal;
