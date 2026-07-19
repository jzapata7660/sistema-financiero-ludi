import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Search, Filter, Eye, Coins } from 'lucide-react';
import { apiSolicitud } from '../services/apiSolicitud';
import AutorizacionModal from '../components/AutorizacionModal';
import { useAuth } from '../context/AuthContext';

const AutorizacionView = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await apiSolicitud.getSolicitudes('', user?.idUsuario);
      setSolicitudes(data || []);
    } catch (error) {
      console.error("Error cargando solicitudes para autorización", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const handleModalSuccess = () => {
    setSolicitudSeleccionada(null);
    cargarSolicitudes();
  };

  // KPI Calculations
  const hoyStr = new Date().toISOString().split('T')[0];
  
  const pendientes = solicitudes.filter(s => s.estado === 'PENDIENTE');
  
  const autorizadosHoy = solicitudes.filter(s => 
    s.estado === 'APROBADA' && s.fechaAprobacion && s.fechaAprobacion.startsWith(hoyStr)
  );
  
  const rechazadosHoy = solicitudes.filter(s => 
    s.estado === 'RECHAZADA' && s.fechaAprobacion && s.fechaAprobacion.startsWith(hoyStr)
  );

  const montoAutorizado = autorizadosHoy.reduce((acc, s) => acc + (s.montoSolicitado || 0), 0);

  const filteredPendientes = pendientes.filter(s => {
    const term = searchTerm.toLowerCase();
    const clienteName = `${s.cliente?.nombres} ${s.cliente?.apellidos}`.toLowerCase();
    return s.codigoSolicitud?.toLowerCase().includes(term) || clienteName.includes(term) || s.cliente?.dni?.includes(term);
  });

  // Utilidad para calcular días en cola (diferencia entre fecha registro y hoy)
  const calcularDiasEnCola = (fechaRegistro) => {
    if (!fechaRegistro) return 0;
    const diffTime = Math.abs(new Date() - new Date(fechaRegistro));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-amber-400">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Pendientes</p>
            <p className="text-3xl font-black text-gray-800">{pendientes.length}</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg text-amber-500">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Autorizados Hoy</p>
            <p className="text-3xl font-black text-gray-800">{autorizadosHoy.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-green-500">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-red-500">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Rechazados Hoy</p>
            <p className="text-3xl font-black text-gray-800">{rechazadosHoy.length}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-red-500">
            <XCircle size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Monto Autorizado</p>
            <p className="text-3xl font-black text-gray-800">S/ {montoAutorizado.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-blue-500">
            <Coins size={24} />
          </div>
        </div>

      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="text-green-600">📥</span> Bandeja de Autorización de Créditos
            </h3>
            <p className="text-sm text-gray-500 mt-1">Expedientes pendientes de autorización</p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por código o cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <Filter size={16} /> Filtrar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex justify-center items-center h-48 text-gray-500">Cargando bandeja...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[0.7rem] uppercase tracking-wider border-b border-gray-100">
                  <th className="p-4 font-bold">Código</th>
                  <th className="p-4 font-bold">Cliente</th>
                  <th className="p-4 font-bold">Monto</th>
                  <th className="p-4 font-bold">Plazo</th>
                  <th className="p-4 font-bold">Modalidad</th>
                  <th className="p-4 font-bold">Analista</th>
                  <th className="p-4 font-bold text-center">Días en cola</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {filteredPendientes.map((s) => (
                  <tr key={s.codigoSolicitud} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-semibold text-green-700">{s.codigoSolicitud}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                          {s.cliente?.nombres?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-[0.8rem]">{s.cliente?.nombres} {s.cliente?.apellidos}</p>
                          <p className="text-[0.65rem] text-gray-500 font-medium">DNI: {s.cliente?.dni}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-black text-gray-800 text-[0.95rem]">S/ {s.montoSolicitado?.toFixed(2)}</td>
                    <td className="p-4 text-gray-600 text-xs">{s.plazoMeses} días</td>
                    <td className="p-4 text-gray-600 text-xs">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-gray-600 font-medium w-fit">
                        🗓️ {s.modalidadPago}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-xs font-medium">{s.analista?.nombres || 'Analista'}</td>
                    <td className="p-4 text-center">
                       <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold">
                         {calcularDiasEnCola(s.fechaRegistro)} días
                       </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold border border-amber-200 bg-amber-100 text-amber-700 uppercase tracking-wider">
                        • PENDIENTE
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSolicitudSeleccionada(s)}
                        className="bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 mx-auto transition-all shadow-sm"
                      >
                        <Eye size={14} /> Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && filteredPendientes.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-medium">
              No hay expedientes pendientes de autorización.
            </div>
          )}
        </div>
      </div>

      {solicitudSeleccionada && (
        <AutorizacionModal 
          solicitud={solicitudSeleccionada}
          onClose={() => setSolicitudSeleccionada(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default AutorizacionView;
