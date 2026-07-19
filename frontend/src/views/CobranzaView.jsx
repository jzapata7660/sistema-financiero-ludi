import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Coins, 
  Search, 
  User, 
  Banknote,
  RefreshCw,
  ClipboardList
} from 'lucide-react';
import { apiCobranza } from '../services/apiCobranza';
import ModalCobranza from '../components/ModalCobranza';
import ModalRegistrarPago from '../components/ModalRegistrarPago';

const CobranzaView = () => {
  const [dashboard, setDashboard] = useState(null);
  const [bandeja, setBandeja] = useState([]);
  const [cobranzasHoy, setCobranzasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Modals
  const [isCobranzaModalOpen, setIsCobranzaModalOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [dash, list, hoy] = await Promise.all([
        apiCobranza.obtenerDashboard(),
        apiCobranza.obtenerBandeja(),
        apiCobranza.obtenerCobranzasHoy()
      ]);
      setDashboard(dash);
      setBandeja(list);
      setCobranzasHoy(hoy);
    } catch (error) {
      console.error("Error cargando datos de cobranza", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const openCobranzaModal = (cuota) => {
    setSelectedCuota(cuota);
    setIsCobranzaModalOpen(true);
  };

  const openPagoModal = () => {
    setIsCobranzaModalOpen(false);
    setIsPagoModalOpen(true);
  };

  const handlePagoRegistrado = () => {
    cargarDatos(); // Refresh table and dashboard
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Módulo de Cobranza</h1>
          <p className="text-slate-500 text-sm">Gestión de cobranza de créditos (≤ 30 días)</p>
        </div>
        <button 
          onClick={cargarDatos}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border-l-4 border-amber-400 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Por Cobrar Hoy</p>
            <p className="text-3xl font-bold text-slate-800">{dashboard?.porCobrarHoy || 0}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-rose-500 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vencidas</p>
            <p className="text-3xl font-bold text-slate-800">{dashboard?.vencidas || 0}</p>
          </div>
          <div className="bg-rose-100 p-3 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cobrado Hoy</p>
            <p className="text-3xl font-bold text-slate-800">S/ {dashboard?.cobradoHoy?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-xl">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Pendiente</p>
            <p className="text-3xl font-bold text-slate-800">S/ {dashboard?.totalPendiente?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <Coins className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Bandeja de Cobranza */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Banknote className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Bandeja de Cobranza Diaria</h2>
              <p className="text-sm text-slate-500">Créditos con cuotas vencidas o por vencer (≤ 30 días)</p>
            </div>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar cliente o código..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Cuota Nº</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Vencimiento</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Días Atraso</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bandeja.map((cuota, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-blue-600">{cuota.codigoSolicitud}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{cuota.clienteNombres} {cuota.clienteApellidos}</p>
                        <p className="text-xs text-slate-400">DNI: {cuota.clienteDni}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-slate-700">{cuota.numeroCuota}/{cuota.totalCuotas}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-slate-800">S/ {cuota.montoTotal.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-600">{cuota.fechaVencimiento}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${cuota.diasAtraso > 0 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {cuota.diasAtraso} días
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{cuota.telefono || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      cuota.estado === 'Vencida' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cuota.estado === 'Vencida' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                      {cuota.estado}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => openCobranzaModal(cuota)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                      Cobrar
                    </button>
                  </td>
                </tr>
              ))}
              {bandeja.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">No hay cuotas pendientes para cobranza.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cobranzas Realizadas Hoy */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-emerald-600" /> Cobranzas Realizadas Hoy
        </h3>
        <div className="space-y-3">
          {cobranzasHoy.map((cobro, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{cobro.codigoSolicitud} - {cobro.clienteNombre}</p>
                  <p className="text-xs text-slate-500">Cuota {cobro.numeroCuota}/{cobro.totalCuotas} • {new Date(cobro.fechaPago).toLocaleTimeString()} • {cobro.formaPago}</p>
                </div>
              </div>
              <div className="font-bold text-emerald-700">
                S/ {cobro.montoPagado.toFixed(2)}
              </div>
            </div>
          ))}
          {cobranzasHoy.length === 0 && !loading && (
            <p className="text-slate-500 text-sm">No se han registrado cobranzas el día de hoy.</p>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalCobranza 
        isOpen={isCobranzaModalOpen} 
        onClose={() => setIsCobranzaModalOpen(false)} 
        cuota={selectedCuota} 
        onRegistrarPago={openPagoModal}
      />
      <ModalRegistrarPago 
        isOpen={isPagoModalOpen} 
        onClose={() => setIsPagoModalOpen(false)} 
        cuota={selectedCuota} 
        onPagoRegistrado={handlePagoRegistrado}
      />
    </div>
  );
};

export default CobranzaView;
