import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Coins, Search, Eye, Filter, Banknote, History } from 'lucide-react';
import { apiCaja } from '../services/apiCaja';
import ModalDesembolso from '../components/ModalDesembolso';
import { useAuth } from '../context/AuthContext';

const CajaView = () => {
  const [pendientes, setPendientes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState(null);

  useEffect(() => {
    cargarPendientes();
    cargarHistorial();
  }, []);

  const cargarPendientes = async () => {
    try {
      const data = await apiCaja.getPendientes();
      setPendientes(data);
    } catch (error) {
      console.error("Error cargando pendientes", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async () => {
    try {
      const data = await apiCaja.getHistorial();
      // Filtrar para mostrar solo los de "hoy" en un sistema real, aquí mostramos todos
      setHistorial(data);
    } catch (error) {
      console.error("Error cargando historial", error);
    }
  };

  const handleDesembolsar = (exp) => {
    setSelectedExpediente(exp);
    setIsModalOpen(true);
  };

  const handleDesembolsoConfirmado = () => {
    setIsModalOpen(false);
    setSelectedExpediente(null);
    cargarPendientes();
    cargarHistorial();
  };

  const desembolsadosHoy = historial.length;
  const montoTotalHoy = historial.reduce((sum, h) => sum + h.monto, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Módulo de Transacciones - Caja</h1>
          <p className="text-slate-500 text-sm mt-1">Ejecución de desembolsos y operaciones de caja</p>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 capitalize">{currentDate}</p>
            <p className="text-xs text-slate-500">{user?.agencia?.nombre || 'Agencia Principal - Piura'}</p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <span className="font-bold">C</span>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">5</div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-amber-500 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">PENDIENTES</p>
            <p className="text-2xl font-bold text-slate-800">{pendientes.length}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-emerald-500 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">DESEMBOLSADOS HOY</p>
            <p className="text-2xl font-bold text-slate-800">{desembolsadosHoy}</p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">MONTO TOTAL HOY</p>
            <p className="text-2xl font-bold text-slate-800">S/ {montoTotalHoy.toFixed(2)}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-purple-500 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">SALDO EN CAJA</p>
            <p className="text-2xl font-bold text-slate-800">S/ {(12450.00 - montoTotalHoy).toFixed(2)}</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
            <Banknote className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Bandeja de Desembolsos Pendientes</h2>
            <p className="text-sm text-slate-500 mt-1">Expedientes autorizados listos para entrega de dinero</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por código o cliente..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">CÓDIGO</th>
                <th className="py-4 px-6">CLIENTE</th>
                <th className="py-4 px-6">MONTO</th>
                <th className="py-4 px-6">MODALIDAD</th>
                <th className="py-4 px-6">APROBADO POR</th>
                <th className="py-4 px-6">FECHA APROB.</th>
                <th className="py-4 px-6 text-center">ESTADO</th>
                <th className="py-4 px-6 text-center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">Cargando pendientes...</td>
                </tr>
              ) : pendientes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500 font-medium">No hay desembolsos pendientes hoy</td>
                </tr>
              ) : (
                pendientes.map((exp) => (
                  <tr key={exp.idSolicitud} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{exp.codigo}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-xs">{exp.clienteNombre.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{exp.clienteNombre}</p>
                          <p className="text-xs text-slate-500">DNI: {exp.clienteDni}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-800">S/ {exp.monto.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {exp.modalidad}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {exp.aprobadorNombre}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {exp.fechaAprobacion}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pendiente
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => handleDesembolsar(exp)}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Desembolsar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Historial de Desembolsos</h2>
            <p className="text-sm text-slate-500 mt-1">Desembolsos realizados recientemente</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">ID DESEMBOLSO</th>
                <th className="py-4 px-6">SOLICITUD</th>
                <th className="py-4 px-6">CLIENTE</th>
                <th className="py-4 px-6">MONTO</th>
                <th className="py-4 px-6">MODALIDAD</th>
                <th className="py-4 px-6">FECHA/HORA</th>
                <th className="py-4 px-6 text-center">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historial.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 font-medium">No hay historial de desembolsos</td>
                </tr>
              ) : (
                historial.map((h) => (
                  <tr key={h.idDesembolso} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-500">#{h.idDesembolso}</td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{h.codigoSolicitud}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{h.clienteNombre}</td>
                    <td className="py-4 px-6 font-bold text-emerald-600">S/ {h.monto.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {h.modalidad}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(h.fecha).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        Completado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalDesembolso 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expediente={selectedExpediente}
        onSuccess={handleDesembolsoConfirmado}
      />
    </div>
  );
};

export default CajaView;
