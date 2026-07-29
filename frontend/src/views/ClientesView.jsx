import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, FileText, Search, UserPlus, Eye, CheckCircle, Pencil, Trash2, UserX } from 'lucide-react';
import { apiCliente } from '../services/apiCliente';
import ModalClienteRegistro from '../components/ModalClienteRegistro';
import ModalClienteDetalle from '../components/ModalClienteDetalle';
import { useAuth } from '../context/AuthContext';

const ClientesView = () => {
  const { user } = useAuth();
  const currentDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isRegistroModalOpen, setIsRegistroModalOpen] = useState(false);
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteAEditar, setClienteAEditar] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const data = await apiCliente.getClientesResumen();
      setClientes(data || []);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (cliente) => {
    setSelectedCliente(cliente);
    setIsDetalleModalOpen(true);
  };

  const handleNuevoCliente = () => {
    setClienteAEditar(null);
    setIsRegistroModalOpen(true);
  };

  const handleEditarCliente = (cliente) => {
    setClienteAEditar(cliente);
    setIsRegistroModalOpen(true);
  };

  const handleDesactivarCliente = async (id, nombres, apellidos) => {
    if (window.confirm(`¿Está seguro que desea desactivar/suspender a ${nombres} ${apellidos}?`)) {
      try {
        await apiCliente.eliminarCliente(id);
        cargarClientes();
      } catch (err) {
        console.error("Error desactivando cliente:", err);
        const errorMessage = err.response?.data?.message || "No se pudo desactivar el cliente.";
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const getEstadoClasses = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'bg-emerald-100 text-emerald-700';
      case 'en riesgo':
        return 'bg-amber-100 text-amber-700';
      case 'mora':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const conteoActivos = clientes.filter(c => c.estado?.toLowerCase() === 'activo').length;
  const conteoEnRiesgo = clientes.filter(c => c.estado?.toLowerCase() === 'en riesgo').length;
  const conteoMora = clientes.filter(c => c.estado?.toLowerCase() === 'mora').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-2 pt-2">
        <div>
          <h2 className="text-[22px] font-extrabold text-slate-800 tracking-tight">Gestión de Clientes</h2>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">Consulta, registro y mantenimiento de clientes</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800 capitalize">{currentDate}</p>
            <p className="text-[13px] text-gray-400 font-medium">{user?.agencia?.nombre || 'Agencia Principal - Piura'}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Clientes</p>
          <p className="text-3xl font-bold text-slate-800">{clientes.length}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sin Mora</p>
          <p className="text-3xl font-bold text-slate-800">{conteoActivos}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-amber-500 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">En Riesgo</p>
          <p className="text-3xl font-bold text-slate-800">{conteoEnRiesgo}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border-l-4 border-rose-500 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Documentos Pendientes</p>
          <p className="text-3xl font-bold text-slate-800">2</p>
        </div>
      </div>

      {/* Bandeja de Clientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Gestión de Clientes</h2>
              <p className="text-sm text-slate-500">Búsqueda, consulta, registro y edición de clientes</p>
            </div>
          </div>
          <button
            onClick={handleNuevoCliente}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 bg-white border-b border-slate-100 flex gap-4">
          <input type="text" placeholder="Filtrar por DNI" className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Filtrar por nombre" className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Filtrar por teléfono" className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Todos los estados</option>
            <option>Activo</option>
            <option>En Riesgo</option>
            <option>Mora</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">DNI</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Última Operación</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clientes.map((cliente, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-sm font-semibold text-blue-600">{cliente.dni}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{cliente.nombres} {cliente.apellidos}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-700">{cliente.telefono || '-'}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getEstadoClasses(cliente.estado)}`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-sm text-slate-600">{cliente.ultimaOperacion || '-'}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleVerDetalle(cliente)}
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditarCliente(cliente)}
                        className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        title="Editar cliente"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDesactivarCliente(cliente.idCliente, cliente.nombres, cliente.apellidos)}
                        className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        title="Desactivar cliente"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clientes.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No hay clientes registrados en el sistema.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ModalClienteRegistro
        isOpen={isRegistroModalOpen}
        onClose={() => setIsRegistroModalOpen(false)}
        onClienteRegistrado={cargarClientes}
        clienteAEditar={clienteAEditar}
      />
      <ModalClienteDetalle
        isOpen={isDetalleModalOpen}
        onClose={() => setIsDetalleModalOpen(false)}
        cliente={selectedCliente}
      />
    </div>
  );
};

export default ClientesView;
