import React, { useState } from 'react';
import { X, User, Banknote, Calendar, ShieldCheck, Check, Info, FileText } from 'lucide-react';
import { apiCaja } from '../services/apiCaja';
import { useAuth } from '../context/AuthContext';

const ModalDesembolso = ({ isOpen, onClose, expediente, onSuccess }) => {
  const { user } = useAuth();
  const [dniValidado, setDniValidado] = useState(false);
  const [modalidadDesembolso, setModalidadDesembolso] = useState('Efectivo en Caja');
  
  // Nuevos estados para transferencia bancaria
  const [bancoDestino, setBancoDestino] = useState('');
  const [otroBanco, setOtroBanco] = useState('');
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [cciDestino, setCciDestino] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !expediente) return null;

  const handleSubmit = async () => {
    if (!dniValidado) {
      alert("Debe validar físicamente el DNI del cliente (RN-14)");
      return;
    }

    if (modalidadDesembolso === 'Transferencia Bancaria') {
      if (!bancoDestino || (bancoDestino === 'Otros' && !otroBanco) || !cuentaDestino || !cciDestino) {
        alert("Por favor complete todos los campos de la transferencia bancaria.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await apiCaja.registrarDesembolso(expediente.idSolicitud, {
        cajeraId: user?.idUsuario || 4, // Fallback a 4 (Cajera) si no hay auth
        modalidadDesembolso,
        dniValidado,
        bancoDestino: bancoDestino === 'Otros' ? otroBanco : bancoDestino,
        cuentaDestino,
        cciDestino
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Error registrando el desembolso: " + (error.response?.data?.message || "Desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 relative">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Detalle del Expediente {expediente.codigo}</h2>
            <p className="text-sm text-slate-500">Cliente: {expediente.clienteNombre}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors absolute top-6 right-6">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1 bg-slate-50/30">
          
          {/* Datos del Cliente */}
          <section>
            <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-4 uppercase">
              <User className="w-4 h-4" /> Datos del Cliente
            </h3>
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-500">Nombre Completo</p>
                <p className="font-bold text-slate-800">{expediente.clienteNombre}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">DNI</p>
                <p className="font-bold text-slate-800">{expediente.clienteDni}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Dirección</p>
                <p className="font-bold text-slate-800">{expediente.clienteDireccion}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Giro del Negocio</p>
                <p className="font-bold text-slate-800">{expediente.clienteGiro}</p>
              </div>
            </div>
          </section>

          {/* Datos del Crédito */}
          <section>
            <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-4 uppercase">
              <Banknote className="w-4 h-4" /> Datos del Crédito
            </h3>
            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-emerald-600">Monto a Desembolsar</p>
                <p className="text-xl font-bold text-emerald-800">S/ {expediente.monto.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Plazo</p>
                <p className="font-bold text-emerald-800">{expediente.plazoMeses} meses</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Tasa</p>
                <p className="font-bold text-emerald-800">{expediente.tasaInteres}% mensual</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Modalidad de Pago</p>
                <p className="font-bold text-emerald-800 capitalize">{expediente.modalidad.toLowerCase()}</p>
              </div>
            </div>
          </section>

          {/* Cronograma de Cuotas */}
          <section>
            <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2 mb-4 uppercase">
              <Calendar className="w-4 h-4" /> Cronograma de Cuotas (Se activará al desembolsar)
            </h3>
            <div className="bg-purple-50/30 rounded-xl border border-purple-100 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-purple-50/50 text-purple-900 border-b border-purple-100">
                  <tr>
                    <th className="py-3 px-4 font-bold">Nº</th>
                    <th className="py-3 px-4 font-bold">Fecha Venc.</th>
                    <th className="py-3 px-4 font-bold">Cuota</th>
                    <th className="py-3 px-4 font-bold">Capital</th>
                    <th className="py-3 px-4 font-bold">Interés</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50">
                  {expediente.cronograma && expediente.cronograma.map((c) => (
                    <tr key={c.numeroCuota}>
                      <td className="py-2.5 px-4 font-bold text-purple-900">{c.numeroCuota}</td>
                      <td className="py-2.5 px-4 text-slate-600">{c.fechaVencimiento}</td>
                      <td className="py-2.5 px-4 font-bold text-purple-700">S/ {c.montoTotal.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-slate-600">S/ {c.montoCapital.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-slate-600">S/ {c.montoInteres.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Información de Autorización */}
          <section>
            <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-4 uppercase">
              <ShieldCheck className="w-4 h-4" /> Información de Autorización
            </h3>
            <div className="bg-amber-50/30 p-5 rounded-xl border border-amber-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-amber-700 mb-1">Autorizado por</p>
                <p className="font-bold text-slate-800">{expediente.aprobadorNombre}</p>
              </div>
              <div>
                <p className="text-xs text-amber-700 mb-1">Fecha de Aprobación</p>
                <p className="font-bold text-slate-800">{expediente.fechaAprobacion}</p>
              </div>
              <div>
                <p className="text-xs text-amber-700 mb-1">Estado Actual</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  Aprobada
                </span>
              </div>
            </div>
          </section>

          {/* Validación y Modalidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 uppercase">
                <FileText className="w-4 h-4" /> Validación de Identidad (RN-14)
              </h3>
              <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-colors ${dniValidado ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={dniValidado}
                      onChange={(e) => setDniValidado(e.target.checked)}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">He validado físicamente el DNI del cliente</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Confirmo que el documento de identidad presentado coincide con los datos registrados en el sistema (DNI: {expediente.clienteDni}).
                    </p>
                  </div>
                </div>
              </label>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2 uppercase">
                <Banknote className="w-4 h-4" /> Modalidad de Desembolso (RN-13)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModalidadDesembolso('Efectivo en Caja')}
                  className={`p-4 rounded-xl border-2 text-left transition-colors flex flex-col gap-2 ${modalidadDesembolso === 'Efectivo en Caja' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
                >
                  <Banknote className={`w-6 h-6 ${modalidadDesembolso === 'Efectivo en Caja' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Efectivo en Caja</p>
                    <p className="text-xs text-slate-500 mt-1">Entrega física de dinero en ventanilla</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setModalidadDesembolso('Transferencia Bancaria')}
                  className={`p-4 rounded-xl border-2 text-left transition-colors flex flex-col gap-2 ${modalidadDesembolso === 'Transferencia Bancaria' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                >
                  <Info className={`w-6 h-6 ${modalidadDesembolso === 'Transferencia Bancaria' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Transferencia Bancaria</p>
                    <p className="text-xs text-slate-500 mt-1">Depósito en cuenta del cliente</p>
                  </div>
                </button>
              </div>

              {/* Campos para Transferencia Bancaria */}
              {modalidadDesembolso === 'Transferencia Bancaria' && (
                <div className="mt-4 p-4 border rounded-xl bg-blue-50/50 space-y-4 animate-in fade-in zoom-in-95">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Banco Destino *</label>
                    <select
                      className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={bancoDestino}
                      onChange={(e) => setBancoDestino(e.target.value)}
                    >
                      <option value="">Seleccione...</option>
                      <option value="BCP">BCP</option>
                      <option value="Interbank">Interbank</option>
                      <option value="BBVA">BBVA</option>
                      <option value="Scotiabank">Scotiabank</option>
                      <option value="Banco de la Nación">Banco de la Nación</option>
                      <option value="Caja Piura">Caja Piura</option>
                      <option value="Otros">Otros bancos...</option>
                    </select>
                  </div>

                  {bancoDestino === 'Otros' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Especifique el Banco *</label>
                      <input
                        type="text"
                        placeholder="Escriba el nombre del banco"
                        className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        value={otroBanco}
                        onChange={(e) => setOtroBanco(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nº de Cuenta *</label>
                      <input
                        type="text"
                        placeholder="Ej. 191-1234567-0-00"
                        className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        value={cuentaDestino}
                        onChange={(e) => setCuentaDestino(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">CCI *</label>
                      <input
                        type="text"
                        placeholder="Ej. 00219100123456789012"
                        className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        value={cciDestino}
                        onChange={(e) => setCciDestino(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
          >
            <X className="w-4 h-4 inline-block mr-2" />
            Cancelar
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={!dniValidado || isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Check className="w-5 h-5" />
            {isSubmitting ? 'Procesando...' : 'Confirmar Desembolso'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalDesembolso;
