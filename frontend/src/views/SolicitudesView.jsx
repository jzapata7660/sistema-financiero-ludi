import React, { useState, useEffect } from 'react';
import { Folder, Clock, CheckCircle, XCircle, Plus, Eye, List, User, Calendar, Bell } from 'lucide-react';
import { apiSolicitud } from '../services/apiSolicitud';
import FormularioSolicitudModal from '../components/FormularioSolicitudModal';
import AutorizacionModal from '../components/AutorizacionModal';
import { useAuth } from '../context/AuthContext';

const StatusBadge = ({ estado }) => {
  const styles = {
    'PENDIENTE': 'bg-amber-100 text-amber-700',
    'APROBADA': 'bg-green-100 text-green-700',
    'RECHAZADA': 'bg-red-100 text-red-700',
  };
  
  const dotStyles = {
    'PENDIENTE': 'bg-amber-500',
    'APROBADA': 'bg-green-500',
    'RECHAZADA': 'bg-red-500',
  };

  const statusStr = estado ? estado.toUpperCase() : '';
  const displayStatus = estado ? estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase() : '';

  return (
    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-max ${styles[statusStr] || 'bg-gray-100 text-gray-700'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[statusStr] || 'bg-gray-500'}`}></span>
      {displayStatus}
    </span>
  );
};

const StatCard = ({ title, value, icon, borderColor, iconBgColor, iconColor }) => (
  <div className={`bg-white rounded-xl p-5 shadow-[0_2px_15px_-3px_rgba(6,81,237,0.06)] border-l-[6px] ${borderColor} flex items-center justify-between`}>
    <div>
      <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor}`}>
      {icon}
    </div>
  </div>
);

const SolicitudesView = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAutorizacionModal, setShowAutorizacionModal] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await apiSolicitud.getSolicitudes('', user?.idUsuario);
      setSolicitudes(data || []);
    } catch (error) {
      console.error("Error cargando solicitudes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const handleSaveSuccess = () => {
    setShowModal(false);
    cargarSolicitudes();
  };

  const handleProcesarSuccess = () => {
    setShowAutorizacionModal(false);
    setSolicitudSeleccionada(null);
    cargarSolicitudes();
  };

  const handleVerSolicitud = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setShowAutorizacionModal(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2 pt-2">
        <div>
          <h2 className="text-[22px] font-extrabold text-slate-800 tracking-tight">Módulo de Solicitudes de Crédito</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Gestión de nuevas solicitudes y seguimiento</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">domingo, 19 de julio de 2026</p>
            <p className="text-[13px] text-gray-400 font-medium">Agencia Principal - Piura</p>
          </div>
          <div className="relative cursor-pointer bg-blue-100/50 p-2.5 rounded-full hover:bg-blue-100 transition-colors">
            <Bell size={20} className="fill-blue-600 text-blue-600" />
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
              8
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="MIS SOLICITUDES" value={solicitudes.length || 12} icon={<Folder size={20} className="fill-blue-500 text-blue-500" strokeWidth={1} />} borderColor="border-blue-600" iconBgColor="bg-blue-100/80" iconColor="text-blue-500" />
        <StatCard title="PENDIENTES APROB." value={solicitudes.filter(s => s.estado === 'PENDIENTE').length || 3} icon={<Clock size={20} className="fill-amber-400 text-amber-400" strokeWidth={1} />} borderColor="border-amber-400" iconBgColor="bg-amber-100/70" iconColor="text-amber-500" />
        <StatCard title="APROBADAS" value={solicitudes.filter(s => s.estado === 'APROBADA').length || 7} icon={<CheckCircle size={20} className="text-white fill-green-500" strokeWidth={1} />} borderColor="border-green-500" iconBgColor="bg-green-100/70" iconColor="text-green-500" />
        <StatCard title="RECHAZADAS" value={solicitudes.filter(s => s.estado === 'RECHAZADA').length || 2} icon={<XCircle size={20} className="text-white fill-red-400" strokeWidth={1} />} borderColor="border-red-400" iconBgColor="bg-red-100/70" iconColor="text-red-500" />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-[0_4px_25px_-5px_rgba(6,81,237,0.06)] overflow-hidden mt-6">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <List size={22} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Solicitudes Registradas</h3>
              <p className="text-sm text-gray-500 mt-0.5 font-medium">Historial de solicitudes ingresadas</p>
            </div>
          </div>
          
          <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors">
            <Plus size={18} strokeWidth={3} />
            Nueva Solicitud
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px] p-2">
          {loading ? (
             <div className="flex justify-center items-center h-48 text-gray-500 font-medium">Cargando solicitudes...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-[11px] uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4 font-bold w-28">CÓDIGO</th>
                  <th className="px-6 py-4 font-bold">CLIENTE</th>
                  <th className="px-6 py-4 font-bold">MONTO</th>
                  <th className="px-6 py-4 font-bold">PLAZO</th>
                  <th className="px-6 py-4 font-bold">MODALIDAD</th>
                  <th className="px-6 py-4 font-bold">FECHA</th>
                  <th className="px-6 py-4 font-bold">ESTADO</th>
                  <th className="px-6 py-4 font-bold text-center">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {solicitudes.length > 0 ? solicitudes.map((s) => (
                  <tr key={s.codigoSolicitud} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-700">{s.codigoSolicitud}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100/60 text-blue-600 flex items-center justify-center shrink-0">
                          <User size={18} className="fill-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[13px]">{s.cliente?.nombres} {s.cliente?.apellidos}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">DNI: {s.cliente?.dni}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-[15px]">
                      S/ {s.montoSolicitado?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium text-[13px]">{s.plazoMeses} días</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-gray-100/80 px-2.5 py-1.5 rounded-full text-[11px] font-bold text-gray-600">
                        <Calendar size={13} className="text-gray-500" />
                        {s.modalidadPago ? s.modalidadPago.charAt(0).toUpperCase() + s.modalidadPago.slice(1).toLowerCase() : 'Diario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium text-[13px]">
                      {s.fechaRegistro ? s.fechaRegistro.substring(0, 10) : '2026-01-10'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge estado={s.estado} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleVerSolicitud(s)} className="bg-gray-50 border border-gray-200 text-gray-800 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 mx-auto transition-all">
                        <Eye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No hay solicitudes registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <FormularioSolicitudModal 
          onClose={() => setShowModal(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      {showAutorizacionModal && solicitudSeleccionada && (
        <AutorizacionModal 
          solicitud={solicitudSeleccionada}
          onClose={() => setShowAutorizacionModal(false)}
          onSuccess={handleProcesarSuccess}
        />
      )}
    </div>
  );
};

export default SolicitudesView;
