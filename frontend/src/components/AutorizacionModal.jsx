import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, History, CheckSquare, MessageSquare } from 'lucide-react';
import { apiSolicitud } from '../services/apiSolicitud';
import { useAuth } from '../context/AuthContext';

const AutorizacionModal = ({ solicitud, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (solicitud && solicitud.observaciones) {
      setObservaciones(solicitud.observaciones);
    }
  }, [solicitud]);

  if (!solicitud) return null;

  const isPendiente = solicitud.estado === 'PENDIENTE';
  const canAuthorize = user && (user.rol === 'ADMINISTRADOR' || user.rol === 'GERENTE');
  const isReadOnly = !isPendiente || !canAuthorize;

  const handleProcesar = async (accion) => {
    if (!canAuthorize) return;
    setLoading(true);
    setError(null);
    try {
      await apiSolicitud.procesarSolicitud(solicitud.idSolicitud, user?.id || 1, accion, observaciones);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center relative">
          <div>
            <h2 className="text-xl font-bold text-[#1e293b]">Autorización - {solicitud.codigoSolicitud}</h2>
            <p className="text-sm text-gray-500">
              Cliente: {solicitud.cliente?.nombres} {solicitud.cliente?.apellidos} | Monto: S/ {solicitud.montoSolicitado?.toFixed(2)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1.5 border absolute right-5 top-5">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50/30 space-y-6">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Datos del Cliente */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#1e3a8a] mb-3 uppercase tracking-wide">
              <User size={16} /> Datos del Cliente
            </h3>
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">Nombre Completo</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.cliente?.nombres} {solicitud.cliente?.apellidos}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">DNI</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.cliente?.dni}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">Dirección</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.cliente?.direccion}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">Giro del Negocio</p>
                {/* Asumimos que el negocio está en el cliente o no disponible aquí */}
                <p className="text-sm font-bold text-gray-800">No especificado</p>
              </div>
            </div>
          </section>

          {/* Datos del Crédito */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3 uppercase tracking-wide">
              <DollarSign size={16} /> Datos del Crédito
            </h3>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-green-600 font-semibold mb-1">Monto Solicitado</p>
                <p className="text-lg font-black text-green-800">S/ {solicitud.montoSolicitado?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-green-600 font-semibold mb-1">Plazo</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.plazoMeses} meses</p>
              </div>
              <div>
                <p className="text-xs text-green-600 font-semibold mb-1">Tasa</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.tasaInteres}%</p>
              </div>
              <div>
                <p className="text-xs text-green-600 font-semibold mb-1">Modalidad de Pago</p>
                <p className="text-sm font-bold text-gray-800">{solicitud.modalidadPago}</p>
              </div>
            </div>
          </section>

          {/* Historial Crediticio */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#1e3a8a] mb-3 uppercase tracking-wide">
              <History size={16} /> Historial Crediticio
            </h3>
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="border-r border-gray-100 last:border-0">
                <p className="text-xs text-gray-400 font-semibold mb-1">Créditos Anteriores</p>
                <p className="text-lg font-bold text-blue-600">{solicitud.cliente?.historialCrediticio?.creditosAnteriores || 0}</p>
              </div>
              <div className="border-r border-gray-100 last:border-0">
                <p className="text-xs text-gray-400 font-semibold mb-1">Pagos Puntuales</p>
                <p className="text-lg font-bold text-green-600">{solicitud.cliente?.historialCrediticio?.pagosPuntuales || 0}</p>
              </div>
              <div className="border-r border-gray-100 last:border-0">
                <p className="text-xs text-gray-400 font-semibold mb-1">Mora Actual</p>
                <p className="text-lg font-bold text-red-600">{solicitud.cliente?.historialCrediticio?.moraActualDias || 0} días</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1">Score Crediticio</p>
                <p className="text-lg font-bold text-purple-600">{solicitud.cliente?.historialCrediticio?.scoreCrediticio || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Parámetros de Evaluación */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-purple-700 mb-3 uppercase tracking-wide">
              <CheckSquare size={16} /> Parámetros de Evaluación (Registrados por el analista)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              
              <div className={`border p-3 rounded-lg flex items-start gap-2 ${solicitud.parametrosEvaluacion?.cumpleRequisitos ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`mt-0.5 rounded-full w-4 h-4 flex items-center justify-center text-white ${solicitud.parametrosEvaluacion?.cumpleRequisitos ? 'bg-green-600' : 'bg-red-600'}`}>
                  {solicitud.parametrosEvaluacion?.cumpleRequisitos ? <CheckSquare size={10} /> : <X size={10} />}
                </div>
                <div><p className={`text-xs font-bold ${solicitud.parametrosEvaluacion?.cumpleRequisitos ? 'text-green-800' : 'text-red-800'}`}>Cumple Requisitos</p>
                <p className={`text-[10px] ${solicitud.parametrosEvaluacion?.cumpleRequisitos ? 'text-green-600' : 'text-red-600'}`}>{solicitud.parametrosEvaluacion?.cumpleRequisitos ? 'Cumple' : 'No cumple'}</p></div>
              </div>

              <div className={`border p-3 rounded-lg flex items-start gap-2 ${solicitud.parametrosEvaluacion?.capacidadPago ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`mt-0.5 rounded-full w-4 h-4 flex items-center justify-center text-white ${solicitud.parametrosEvaluacion?.capacidadPago ? 'bg-green-600' : 'bg-red-600'}`}>
                  {solicitud.parametrosEvaluacion?.capacidadPago ? <CheckSquare size={10} /> : <X size={10} />}
                </div>
                <div><p className={`text-xs font-bold ${solicitud.parametrosEvaluacion?.capacidadPago ? 'text-green-800' : 'text-red-800'}`}>Capacidad de Pago</p>
                <p className={`text-[10px] ${solicitud.parametrosEvaluacion?.capacidadPago ? 'text-green-600' : 'text-red-600'}`}>{solicitud.parametrosEvaluacion?.capacidadPago ? 'Cumple' : 'No cumple'}</p></div>
              </div>

              <div className={`border p-3 rounded-lg flex items-start gap-2 ${solicitud.parametrosEvaluacion?.verificacionIngresos ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`mt-0.5 rounded-full w-4 h-4 flex items-center justify-center text-white ${solicitud.parametrosEvaluacion?.verificacionIngresos ? 'bg-green-600' : 'bg-red-600'}`}>
                  {solicitud.parametrosEvaluacion?.verificacionIngresos ? <CheckSquare size={10} /> : <X size={10} />}
                </div>
                <div><p className={`text-xs font-bold ${solicitud.parametrosEvaluacion?.verificacionIngresos ? 'text-green-800' : 'text-red-800'}`}>Verif. de Ingresos</p>
                <p className={`text-[10px] ${solicitud.parametrosEvaluacion?.verificacionIngresos ? 'text-green-600' : 'text-red-600'}`}>{solicitud.parametrosEvaluacion?.verificacionIngresos ? 'Cumple' : 'No cumple'}</p></div>
              </div>

              <div className={`border p-3 rounded-lg flex items-start gap-2 ${solicitud.parametrosEvaluacion?.referenciaVerificada ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`mt-0.5 rounded-full w-4 h-4 flex items-center justify-center text-white ${solicitud.parametrosEvaluacion?.referenciaVerificada ? 'bg-green-600' : 'bg-red-600'}`}>
                  {solicitud.parametrosEvaluacion?.referenciaVerificada ? <CheckSquare size={10} /> : <X size={10} />}
                </div>
                <div><p className={`text-xs font-bold ${solicitud.parametrosEvaluacion?.referenciaVerificada ? 'text-green-800' : 'text-red-800'}`}>Ref. Verificada</p>
                <p className={`text-[10px] ${solicitud.parametrosEvaluacion?.referenciaVerificada ? 'text-green-600' : 'text-red-600'}`}>{solicitud.parametrosEvaluacion?.referenciaVerificada ? 'Cumple' : 'No cumple'}</p></div>
              </div>

            </div>
          </section>

          {/* Observaciones */}
          {(canAuthorize || solicitud.observaciones) && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-orange-600 mb-3 uppercase tracking-wide">
                <MessageSquare size={16} /> Observaciones del Autorizador
              </h3>
              <textarea
                className={`w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-700' : 'bg-white'}`}
                rows={3}
                placeholder={isReadOnly ? 'Sin observaciones registradas' : 'Ingrese comentarios o justificaciones adicionales (opcional)...'}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                readOnly={isReadOnly}
              ></textarea>
            </section>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
          >
            <X size={16} /> Cerrar
          </button>

          {!isReadOnly && (
            <div className="flex gap-3">
              <button 
                onClick={() => handleProcesar('RECHAZAR')}
                disabled={loading}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <X size={16} /> Rechazar
              </button>
              <button 
                onClick={() => handleProcesar('APROBAR')}
                disabled={loading}
                className="px-6 py-2.5 bg-[#059669] text-white font-bold rounded-lg hover:bg-[#047857] transition-colors text-sm flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <CheckSquare size={16} /> Autorizar
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AutorizacionModal;
