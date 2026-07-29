import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Landmark, 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  Users, 
  BarChart2, 
  LogOut, 
  UserCircle,
  ShieldCheck,
  FolderOpen,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = (rol) => {
    switch(rol) {
      case 'ANALISTA':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
          { name: 'Solicitudes', path: '/dashboard/solicitudes', icon: <FileText size={20} />, badge: 3 },
          { name: 'Cobranza', path: '/dashboard/cobranza', icon: <DollarSign size={20} />, badge: 5 },
          { name: 'Clientes', path: '/dashboard/clientes', icon: <Users size={20} /> },
          { name: 'Reportes', path: '/dashboard/reportes', icon: <BarChart2 size={20} /> },
        ];
      case 'CAJERA':
        return [
          { name: 'Caja', path: '/dashboard/caja', icon: <DollarSign size={20} /> },
        ];
      case 'RECUPERADOR':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
          { name: 'Cartera Pesada', path: '/dashboard/cartera-pesada', icon: <ShieldCheck size={20} /> },
          { name: 'Reportes', path: '/dashboard/reportes', icon: <BarChart2 size={20} /> },
        ];
      case 'ARCHIVO':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
          { name: 'Expedientes', path: '/dashboard/expedientes', icon: <FolderOpen size={20} /> },
        ];
      case 'GERENTE':
      case 'ADMINISTRADOR_CREDITOS':
      default:
        return [
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
          { name: 'Autorización', path: '/dashboard/autorizacion', icon: <ShieldCheck size={20} /> },
          { name: 'Expedientes', path: '/dashboard/expedientes', icon: <FolderOpen size={20} /> },
          { name: 'Reportes', path: '/dashboard/reportes', icon: <BarChart2 size={20} /> },
          { name: 'Analistas', path: '/dashboard/analistas', icon: <Users size={20} /> },
          { name: 'Configuración', path: '/dashboard/configuracion', icon: <Settings size={20} /> },
        ];
    }
  };

  const navItems = getNavItems(user?.rol);

  return (
    <div className="w-64 bg-slate-900 min-h-screen text-slate-300 flex flex-col shadow-2xl flex-shrink-0 relative overflow-hidden">
      
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

      {/* Logo Area */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-800 relative z-10">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl shadow-lg shadow-blue-500/30">
          <Landmark size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-wide text-white">Ludi Financiera</h1>
          <p className="text-[0.65rem] text-slate-400 font-medium">Sistema de Gestión</p>
        </div>
      </div>

      {/* User Profile Area */}
      <div className="flex items-center gap-3 p-6 border-b border-slate-800 bg-slate-800/50 relative z-10 backdrop-blur-sm">
        <div className="bg-slate-800 p-2 rounded-full border border-slate-700">
          <UserCircle size={28} className="text-blue-400" />
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-sm truncate text-white">{user?.nombres || 'Usuario'} {user?.apellidos || 'Demo'}</p>
          <p className="text-xs text-slate-400 truncate capitalize font-medium">
            {user?.rol ? user.rol.toLowerCase().replace('_', ' de ') : 'Administrador de Créditos'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 relative z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 font-semibold border-l-4 border-blue-500 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <div className={`transition-transform duration-300 group-hover:scale-110`}>
                {item.icon}
              </div>
              <span className="text-sm tracking-wide">{item.name}</span>
            </div>
            {item.badge && (
              <span className="bg-blue-500 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-blue-500/50">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800 relative z-10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
