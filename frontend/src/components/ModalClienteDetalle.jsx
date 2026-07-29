import React from 'react';
import { X, User, FileText, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

const ModalClienteDetalle = ({ isOpen, onClose, cliente }) => {
  if (!isOpen || !cliente) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Detalle de Cliente</h2>
            <p className="text-slate-500 text-sm">Ficha completa, historial crediticio y documentación</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">

          {/* Top Info Cards */}
          <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">DNI</p>
              <p className="text-sm font-bold text-blue-600">{cliente.dni}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Nombre</p>
              <p className="text-sm font-bold text-slate-800">{cliente.nombres} {cliente.apellidos}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Teléfono</p>
              <p className="text-sm font-bold text-slate-800">{cliente.telefono}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Estado</p>
              <p className="text-sm font-bold text-slate-800">{cliente.estado}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">Última Operación</p>
              <p className="text-sm font-bold text-slate-800">{cliente.ultimaOperacion}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Score</p>
              <p className="text-sm font-bold text-blue-600">{cliente.scoreCrediticio}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Créditos</p>
              <p className="text-sm font-bold text-slate-800">{cliente.creditosAnteriores} créditos externos</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Documentación</p>
              <p className="text-sm font-bold text-slate-800">Completa</p>
            </div>
          </div>

          {/* DATOS DEL CLIENTE */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4 text-emerald-600" /> DATOS DEL CLIENTE
            </h3>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-emerald-600 mb-1">Dirección</p>
                <p className="text-sm font-bold text-slate-800">{cliente.direccion || 'Sin registrar'}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600 mb-1">Observación</p>
                <p className="text-sm font-bold text-slate-800">Cliente con historial actualizado en el sistema.</p>
              </div>
            </div>
          </section>

          {/* HISTORIAL CREDITICIO (Mockup) */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider text-purple-600">
              <FileText className="w-4 h-4" /> HISTORIAL CREDITICIO
            </h3>
            <div className="space-y-3">
              <div className="p-4 border border-slate-200 rounded-xl flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Solicitud - {cliente.ultimaOperacion}</p>
                  <p className="text-xs text-slate-500">Crédito aprobado</p>
                </div>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Pago - {cliente.ultimaOperacion}</p>
                  <p className="text-xs text-slate-500">Cuota registrada</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => { alert('Funcionalidad de edición pendiente'); }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalClienteDetalle;
