import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginView from './views/LoginView';
import Layout from './components/Layout';
import AnalistaDashboard from './views/AnalistaDashboard';
import SolicitudesView from './views/SolicitudesView';
import AutorizacionView from './views/AutorizacionView';
import ClientesView from './views/ClientesView';
import CobranzaView from './views/CobranzaView';
import CajaView from './views/CajaView';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginView />} />
        
        {/* Protected Dashboard Routes wrapped in Layout */}
        <Route path="/dashboard" element={user ? <Layout /> : <Navigate to="/login" />}>
          
          {/* Default dashboard view */}
          <Route index element={
            user?.rol === 'ANALISTA' ? <AnalistaDashboard /> : 
            user?.rol === 'CAJERA' ? <Navigate to="/dashboard/caja" /> :
            <div className="p-8"><h2 className="text-xl">Bienvenido, {user?.nombres}. Seleccione una opción en el menú.</h2></div>
          } />

          {/* Placeholders for other routes */}
          <Route path="solicitudes" element={<SolicitudesView />} />
          <Route path="autorizacion" element={<AutorizacionView />} />
          <Route path="cobranza" element={<CobranzaView />} />
          <Route path="clientes" element={<ClientesView />} />
          <Route path="caja" element={<CajaView />} />
          <Route path="cartera-pesada" element={<div className="p-8 bg-white rounded-lg shadow-sm border border-red-200"><h2 className="text-xl font-bold text-red-600">Módulo de Cartera Pesada en construcción...</h2><p className="text-slate-500 mt-2">Este módulo será exclusivo para el Recuperador de Créditos.</p></div>} />
          <Route path="expedientes" element={<div className="p-8 bg-white rounded-lg shadow-sm"><h2 className="text-xl font-bold text-blue-600">Módulo de Gestión Documental en construcción...</h2><p className="text-slate-500 mt-2">Aquí se registrarán y validarán los expedientes físicos.</p></div>} />
          <Route path="reportes" element={<div className="p-8 bg-white rounded-lg shadow-sm"><h2 className="text-xl font-bold">Módulo de Reportes en construcción...</h2></div>} />
          
        </Route>

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
