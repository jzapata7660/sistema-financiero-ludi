import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FileText, CheckCircle, Clock, Users, Zap, TrendingUp, Bell, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// El data ahora vendrá del estado

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} ${color}`}>
      {icon}
    </div>
  </div>
);

const AnalistaDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const [stats, setStats] = useState({
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    cobranzasVencidas: 0,
    clientesActivos: 0,
    alertas: [],
    totalColocaciones: 0.0,
    totalCobranzas: 0.0,
    porcentajeMorosidad: 0.0,
    tendencias: []
  });
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 pt-2">
        <div>
          <h2 className="text-[22px] font-extrabold text-slate-800 tracking-tight">Dashboard Principal</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Indicadores personalizados y alertas operativas</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800 capitalize">{currentDate}</p>
            <p className="text-[13px] text-gray-400 font-medium">{user?.agencia?.nombre || 'Agencia Principal - Piura'}</p>
          </div>
          <div className="relative cursor-pointer bg-blue-100/50 p-2.5 rounded-full hover:bg-blue-100 transition-colors" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} className="fill-blue-600 text-blue-600" />
            {stats.alertas.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                {stats.alertas.length}
              </span>
            )}
            
            {showNotifications && (
              <div className="absolute top-12 right-0 w-80 bg-white shadow-lg rounded-xl border border-gray-100 p-4 z-50">
                <h4 className="font-bold text-gray-800 mb-3 border-b pb-2">Notificaciones</h4>
                {stats.alertas.length === 0 ? (
                  <p className="text-sm text-gray-500">No tienes notificaciones recientes.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.alertas.map((alerta, idx) => (
                      <div key={idx} className={`border-l-2 ${alerta.tipo === 'RED' ? 'border-red-500' : 'border-amber-500'} pl-3 py-1`}>
                        <p className="text-sm font-bold text-gray-800">{alerta.titulo}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{alerta.subtitulo}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Stats & Charts) */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* KPI Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-md text-blue-600">
                <LayoutDashboardIcon size={18} />
              </div>
              <h3 className="font-bold text-gray-800">Dashboard Principal</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Solicitudes Pendientes" 
              value={stats.solicitudesPendientes} 
              icon={<FileText size={24} />} 
              color="text-blue-600" 
              bgColor="bg-blue-50" 
            />
            <StatCard 
              title="Aprobadas" 
              value={stats.solicitudesAprobadas} 
              icon={<CheckCircle size={24} />} 
              color="text-green-600" 
              bgColor="bg-green-50" 
            />
            <StatCard 
              title="Cobranzas Vencidas" 
              value={stats.cobranzasVencidas} 
              icon={<Clock size={24} />} 
              color="text-amber-500" 
              bgColor="bg-amber-50" 
            />
            <StatCard 
              title="Clientes Activos" 
              value={stats.clientesActivos} 
              icon={<Users size={24} />} 
              color="text-purple-600" 
              bgColor="bg-purple-50" 
            />
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-green-500" />
            <h3 className="font-bold text-gray-800">Tendencias Operativas</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
             <div className="p-3 border border-gray-100 rounded-lg">
               <p className="text-xs text-gray-500 font-semibold">Colocaciones</p>
               <p className="text-xl font-bold text-blue-600">S/ {stats.totalColocaciones?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
             </div>
             <div className="p-3 border border-gray-100 rounded-lg">
               <p className="text-xs text-gray-500 font-semibold">Cobranzas</p>
               <p className="text-xl font-bold text-green-600">S/ {stats.totalCobranzas?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
             </div>
             <div className="p-3 border border-gray-100 rounded-lg">
               <p className="text-xs text-gray-500 font-semibold">Morosidad</p>
               <p className="text-xl font-bold text-red-500">{stats.porcentajeMorosidad}%</p>
             </div>
          </div>

          <div className="h-[250px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.tendencias}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="colocaciones" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Right Column (Sidebar Widgets) */}
      <div className="space-y-6">
        
        {/* Quick Access */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-orange-500" />
            <h3 className="font-bold text-gray-800">Accesos Rápidos</h3>
          </div>
          <div className="space-y-3">
            <button onClick={() => navigate('/dashboard/solicitudes')} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all text-gray-600 text-sm font-medium">
              <div className="bg-blue-100 p-1.5 rounded text-blue-600"><FileText size={16} /></div>
              Solicitudes Pendientes
            </button>
            <button onClick={() => navigate('/dashboard/cobranza')} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all text-gray-600 text-sm font-medium">
              <div className="bg-blue-100 p-1.5 rounded text-blue-600"><DollarSign size={16} /></div>
              Cobranza Diaria
            </button>
            <button onClick={() => navigate('/dashboard/clientes')} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all text-gray-600 text-sm font-medium">
              <div className="bg-blue-100 p-1.5 rounded text-blue-600"><Users size={16} /></div>
              Gestionar Clientes
            </button>
            <button onClick={() => navigate('/dashboard/reportes')} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all text-gray-600 text-sm font-medium">
              <div className="bg-blue-100 p-1.5 rounded text-blue-600"><TrendingUp size={16} /></div>
              Generar Reportes
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-red-500" />
              <h3 className="font-bold text-gray-800">Alertas Pendientes</h3>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Recientes</span>
          </div>
          <div className="space-y-4">
            {stats.alertas.length === 0 ? (
              <p className="text-sm text-gray-500">No hay alertas pendientes.</p>
            ) : (
              stats.alertas.map((alerta, idx) => (
                <div key={idx} className={`border-l-2 ${alerta.tipo === 'RED' ? 'border-red-500' : 'border-amber-500'} pl-3 py-1`}>
                  <p className="text-sm font-bold text-gray-800">{alerta.titulo}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alerta.subtitulo}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      </div>
    </div>
  );
};

// Pequeño helper para el icono del header
const LayoutDashboardIcon = ({size}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);

export default AnalistaDashboard;
