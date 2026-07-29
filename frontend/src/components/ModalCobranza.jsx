import React, { useState, useEffect } from 'react';
import { X, User, FileText, Phone, MapPin, AlertTriangle, Clock, Banknote, CheckCircle } from 'lucide-react';
import { apiCobranza } from '../services/apiCobranza';
import { apiSolicitud } from '../services/apiSolicitud';
import { useAuth } from '../context/AuthContext';
import ModalLlamada from './ModalLlamada';
import ModalVisita from './ModalVisita';

const ModalCobranza = ({ isOpen, onClose, cuota, onRegistrarPago, onActionComplete }) => {
  const { user } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Modal states
  const [isLlamadaOpen, setIsLlamadaOpen] = useState(false);
  const [isVisitaOpen, setIsVisitaOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [derivacionSuccess, setDerivacionSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && cuota) {
      cargarHistorial();
    }
  }, [isOpen, cuota]);

  const cargarHistorial = async () => {
    try {
      setLoadingHistory(true);
      const solicitudes = await apiSolicitud.getSolicitudes();
      const sol = solicitudes.find(s => s.codigoSolicitud === cuota.codigoSolicitud);
      if (sol) {
        const h = await apiCobranza.obtenerHistorial(sol.idSolicitud);
        setHistorial(h);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleConfirmAction = async (datos) => {
    try {
      const solicitudes = await apiSolicitud.getSolicitudes();
      const sol = solicitudes.find(s => s.codigoSolicitud === cuota.codigoSolicitud);
      if (!sol) throw new Error("No se encontró la solicitud");

      let idSolicitud = sol.idSolicitud;
      
      await apiCobranza.registrarAccion(idSolicitud, {
        tipoAccion: datos.tipoAccion,
        resultado: datos.resultado + (datos.observaciones ? ` - ${datos.observaciones}` : ''),
        analistaId: user.idUsuario
      });
      // Recargar historial
      cargarHistorial();
    } catch (error) {
      alert('Error registrando acción');
      throw error;
    }
  };

  const handleDerivacion = async () => {
    if (cuota.diasAtraso <= 30) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }
    
    try {
      await handleConfirmAction({
        tipoAccion: 'Derivación',
        resultado: 'Caso derivado a jefe de cobranza',
        observaciones: ''
      });
      setDerivacionSuccess(true);
    } catch(err) {
      // Error is handled in handleConfirmAction
    }
  };

  if (!isOpen || !cuota) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {derivacionSuccess ? (
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center animate-fade-in relative z-[60]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Derivación exitosa!</h2>
          <p className="text-sm text-slate-500 mb-6">El caso ha sido escalado a Recuperaciones.</p>
          
          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mb-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Solicitud:</span>
              <span className="font-bold text-slate-800">{cuota.codigoSolicitud}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Cliente:</span>
              <span className="font-bold text-slate-800 text-right">{cuota.clienteNombres} {cuota.clienteApellidos}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-semibold text-slate-500 uppercase">Estado actual:</span>
              <span className="font-bold text-rose-600">En Recuperación</span>
            </div>
          </div>

          <button 
            onClick={() => {
              setDerivacionSuccess(false);
              if(onActionComplete) onActionComplete();
              onClose();
            }} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm flex justify-center gap-2 items-center"
          >
            <CheckCircle size={18} /> Aceptar
          </button>
        </div>
      ) : (
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Cobranza - {cuota.codigoSolicitud}</h2>
            <p className="text-slate-500 text-sm">Cliente: {cuota.clienteNombres} {cuota.clienteApellidos}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Datos del Cliente */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <User className="w-4 h-4" /> Datos del Cliente
            </h3>
            <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Nombre</p>
                <p className="text-sm font-semibold text-slate-800">{cuota.clienteNombres} {cuota.clienteApellidos}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">DNI</p>
                <p className="text-sm font-semibold text-slate-800">{cuota.clienteDni}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Teléfono</p>
                <p className="text-sm font-semibold text-slate-800">{cuota.telefono || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Dirección</p>
                <p className="text-sm font-semibold text-slate-800">-</p>
              </div>
            </div>
          </section>

          {/* Detalle de la Cuota */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <FileText className="w-4 h-4" /> Detalle de la Cuota
            </h3>
            <div className="grid grid-cols-5 gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <div>
                <p className="text-xs text-emerald-600 mb-1">Nº Cuota</p>
                <p className="text-sm font-bold text-emerald-800">{cuota.numeroCuota}/{cuota.totalCuotas}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600 mb-1">Monto</p>
                <p className="text-sm font-bold text-emerald-800">S/ {cuota.montoTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600 mb-1">Vencimiento</p>
                <p className="text-sm font-bold text-emerald-800">{cuota.fechaVencimiento}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600 mb-1">Días Atraso</p>
                <p className={`text-sm font-bold ${cuota.diasAtraso > 0 ? 'text-red-600' : 'text-emerald-800'}`}>
                  {cuota.diasAtraso} días
                </p>
              </div>
              <div>
                <p className="text-xs text-emerald-600 mb-1">Saldo Pendiente</p>
                <p className="text-sm font-bold text-emerald-800">S/ {(cuota.saldoPendiente ?? cuota.montoTotal).toFixed(2)}</p>
              </div>
            </div>
          </section>

          {/* Acciones de Cobranza */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Phone className="w-4 h-4" /> Acciones de Cobranza
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <button onClick={onRegistrarPago} className="flex flex-col text-left p-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                <Banknote className="w-6 h-6 text-emerald-600 mb-2" />
                <span className="font-bold text-emerald-800 text-sm">Registrar Pago</span>
                <span className="text-xs text-emerald-600 mt-1">Cliente pagó la cuota</span>
              </button>
              
              <button onClick={() => setIsLlamadaOpen(true)} className="flex flex-col text-left p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
                <Phone className="w-6 h-6 text-blue-600 mb-2" />
                <span className="font-bold text-blue-800 text-sm">Llamar Cliente</span>
                <span className="text-xs text-blue-600 mt-1">Cobranza telefónica</span>
              </button>

              <button onClick={() => setIsVisitaOpen(true)} className="flex flex-col text-left p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors">
                <MapPin className="w-6 h-6 text-amber-600 mb-2" />
                <span className="font-bold text-amber-800 text-sm">Programar Visita</span>
                <span className="text-xs text-amber-600 mt-1">Cobranza en campo</span>
              </button>

              <button onClick={handleDerivacion} className="flex flex-col text-left p-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors">
                <AlertTriangle className="w-6 h-6 text-rose-600 mb-2" />
                <span className="font-bold text-rose-800 text-sm">Derivar</span>
                <span className="text-xs text-rose-600 mt-1">Escala el caso por mora</span>
              </button>
            </div>
          </section>

          {/* Historial de Gestión */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-4 h-4" /> Historial de Gestión
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              {/* Aquí se listaría el historial real. Ponemos un mock si está vacío. */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Llamada realizada - 2026-01-14 10:30</p>
                  <p className="text-xs text-slate-500 mt-0.5">El cliente indica que se acercará a la agencia por la tarde para cancelar.</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
      )}

      {/* Toast Alert for Derivación */}
      {showToast && (
        <div className="absolute top-4 right-4 bg-white border-l-4 border-amber-500 shadow-lg rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="bg-amber-100 p-1.5 rounded-full h-fit">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Derivación no permitida</p>
            <p className="text-xs text-slate-500">Solo se deriva cuando la mora supera los 30 días.</p>
          </div>
        </div>
      )}

      {/* Child Modals */}
      <ModalLlamada 
        isOpen={isLlamadaOpen} 
        onClose={() => setIsLlamadaOpen(false)} 
        onConfirm={handleConfirmAction} 
      />
      <ModalVisita 
        isOpen={isVisitaOpen} 
        onClose={() => setIsVisitaOpen(false)} 
        onConfirm={handleConfirmAction} 
      />
    </div>
  );
};

export default ModalCobranza;
