import React, { useState } from 'react';
import { apiSolicitud } from '../services/apiSolicitud';
import { useAuth } from '../context/AuthContext';
import { X, Search, CheckCircle, ChevronRight, ChevronLeft, Save, AlertCircle, AlertTriangle, UserPlus, User, Store, FileText, Calendar, Info, Send } from 'lucide-react';

const EvalCard = ({ title, subtitle, value, onChange }) => (
  <div className="border rounded-xl p-4 flex flex-col justify-between bg-white shadow-sm hover:border-blue-200 transition-colors">
    <div className="flex items-start gap-3 mb-4">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${value === true ? 'bg-green-100 text-green-600' : value === false ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
        <CheckCircle size={14} strokeWidth={3} />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-[15px]">{title}</h4>
        <p className="text-[12px] text-gray-500 leading-tight mt-0.5">{subtitle}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={() => onChange(true)}
        className={`flex-1 py-2 rounded-lg font-bold text-[13px] transition-colors ${value === true ? 'bg-[#dcfce7] text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-transparent hover:bg-gray-100'}`}
      >
        Sí Cumple
      </button>
      <button 
        onClick={() => onChange(false)}
        className={`flex-1 py-2 rounded-lg font-bold text-[13px] transition-colors ${value === false ? 'bg-[#fee2e2] text-red-700 border border-red-200' : 'bg-gray-50 text-gray-500 border border-transparent hover:bg-gray-100'}`}
      >
        No Cumple
      </button>
    </div>
  </div>
);

const FormularioSolicitudModal = ({ onClose, onSaveSuccess }) => {
  const { user } = useAuth();
  const [pasoActual, setPasoActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados del formulario
  const [cliente, setCliente] = useState(null);
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [clienteStatus, setClienteStatus] = useState('idle'); // idle, found, confirmed, not_found, registering
  const [showToast, setShowToast] = useState(false);
  
  const [nuevoCliente, setNuevoCliente] = useState({ nombres: '', apellidos: '', direccion: '', telefono: '' });

  const [negociosCliente, setNegociosCliente] = useState([]);
  const [negocio, setNegocio] = useState(null);
  const [nuevoNegocio, setNuevoNegocio] = useState({ ruc: '', razonSocial: '', giroNegocio: '', direccion: '', ingresoPromedioMensual: '', tiempoOperacion: '' });
  const [modoRegistroNegocio, setModoRegistroNegocio] = useState(false);

  const [condiciones, setCondiciones] = useState({ monto: '', plazo: '', tasaInteres: '5', modalidadPago: 'Mensual' });
  const [cronograma, setCronograma] = useState(null);

  const [evaluacion, setEvaluacion] = useState({
    cumpleRequisitos: null,
    capacidadPago: null,
    verificacionIngresos: null,
    referenciaVerificada: null,
    observaciones: ''
  });

  // PASO 1: CLIENTE
  const buscarCliente = async () => {
    if (!dniBusqueda || dniBusqueda.length !== 8) {
      setError('Ingrese un DNI válido de 8 dígitos');
      return;
    }
    setLoading(true);
    setError(null);
    setClienteStatus('idle');
    try {
      const data = await apiSolicitud.getClientePorDni(dniBusqueda);
      if (data) {
        if (data.esMoroso) {
          setError('El cliente está reportado como MOROSO. No se puede continuar.');
          setCliente(null);
        } else {
          setCliente(data);
          setClienteStatus('found');
          buscarNegocio(data.dni);
        }
      } else {
        setCliente(null);
        setClienteStatus('not_found');
      }
    } catch (err) {
      setError('Error al buscar cliente');
    } finally {
      setLoading(false);
    }
  };

  const confirmarCliente = () => {
    setClienteStatus('confirmed');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const descartarCliente = () => {
    setCliente(null);
    setDniBusqueda('');
    setClienteStatus('idle');
  };

  const iniciarRegistro = () => {
    setClienteStatus('registering');
    setNuevoCliente({ nombres: '', apellidos: '', direccion: '', telefono: '' });
    setModoRegistroNegocio(true);
  };

  // PASO 2: NEGOCIO
  const buscarNegocio = async (dni) => {
    try {
      const data = await apiSolicitud.getNegocioPorDniCliente(dni);
      if (data && data.length > 0) {
        setNegociosCliente(data);
        setNegocio(data[0]);
        setModoRegistroNegocio(false);
      } else {
        setNegociosCliente([]);
        setNegocio(null);
        setModoRegistroNegocio(true);
      }
    } catch (err) {
      console.error(err);
      setNegociosCliente([]);
      setModoRegistroNegocio(true);
    }
  };

  const generarCronograma = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiSolicitud.previsualizarCronograma({ 
        monto: condiciones.monto, 
        plazoMeses: condiciones.plazo, 
        tasaInteres: condiciones.tasaInteres, 
        modalidadPago: condiciones.modalidadPago 
      });
      setCronograma(data);
      return true;
    } catch (err) {
      setError('Error al generar el cronograma');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // PASO 5: GUARDAR SOLICITUD COMPLETA
  const guardarSolicitud = async () => {
    setLoading(true);
    setError(null);
    try {
      let finalCliente = cliente;
      if (clienteStatus === 'registering') {
        finalCliente = await apiSolicitud.registrarCliente({ ...nuevoCliente, dni: dniBusqueda, esMoroso: nuevoCliente.esMoroso || false });
      }

      let finalNegocio = negocio;
      if (modoRegistroNegocio) {
        finalNegocio = await apiSolicitud.registrarNegocio({ ...nuevoNegocio, dniCliente: finalCliente.dni });
      }

      const payload = {
        dniCliente: finalCliente.dni,
        negocioId: finalNegocio.idNegocio,
        analistaId: user?.id || 1,
        monto: condiciones.monto,
        plazoMeses: condiciones.plazo,
        tasaInteres: condiciones.tasaInteres,
        modalidadPago: condiciones.modalidadPago,
        evaluacion
      };
      await apiSolicitud.crearSolicitud(payload);
      onSaveSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const puedeAvanzar = () => {
    if (pasoActual === 1) return (clienteStatus === 'confirmed') || (clienteStatus === 'registering' && nuevoCliente.nombres && nuevoCliente.apellidos);
    if (pasoActual === 2) return (negocio != null && !modoRegistroNegocio) || (modoRegistroNegocio && nuevoNegocio.giroNegocio && nuevoNegocio.ingresoPromedioMensual && nuevoNegocio.direccion && nuevoNegocio.tiempoOperacion);
    if (pasoActual === 3) return condiciones.monto && condiciones.plazo && condiciones.tasaInteres && condiciones.modalidadPago;
    if (pasoActual === 4) return evaluacion.cumpleRequisitos !== null && evaluacion.capacidadPago !== null && evaluacion.verificacionIngresos !== null && evaluacion.referenciaVerificada !== null;
    return true;
  };

  const handleSiguiente = async () => {
    if (pasoActual === 4) {
      const success = await generarCronograma();
      if (success) setPasoActual(5);
      return;
    }
    setPasoActual(p => p + 1);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-white z-10">
          <div>
            <h2 className="text-[22px] font-bold text-slate-800">Nueva Solicitud de Crédito</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Complete los datos del cliente, negocio y condiciones</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors mt-1">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* STEPPER */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors
                    ${pasoActual === step ? 'bg-blue-600 text-white' : 
                      pasoActual > step ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {pasoActual > step ? <CheckCircle size={14} strokeWidth={3} /> : step}
                  </div>
                  <span className={`text-[13px] font-semibold hidden md:block ${pasoActual === step ? 'text-blue-600' : pasoActual > step ? 'text-gray-800' : 'text-gray-400'}`}>
                    {['Cliente', 'Negocio', 'Condiciones', 'Evaluación', 'Resumen'][idx]}
                  </span>
                </div>
                {step < 5 && <div className={`flex-1 h-px mx-4 ${pasoActual > step ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
          {error && (
            <div className="mb-6 bg-red-50/80 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 font-medium text-sm">
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {/* PASO 1 */}
          {pasoActual === 1 && (
            <div className="space-y-6 relative">
              {showToast && (
                <div className="absolute -top-4 right-0 bg-white border border-green-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl p-4 flex items-start gap-3 z-50 animate-bounce">
                  <div className="bg-green-100/50 rounded-full p-1 mt-0.5"><CheckCircle className="text-green-500" size={18} /></div>
                  <div>
                    <p className="font-bold text-gray-800 text-[13px]">Cliente confirmado</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cliente?.nombres} {cliente?.apellidos} seleccionado correctamente.</p>
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-[6px] border-l-blue-600">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-sm">
                  <User size={16} className="text-blue-600" /> DATOS DEL CLIENTE
                </h3>
                
                <div className="mb-2 w-full max-w-2xl">
                  <label className="text-[13px] font-bold text-gray-700 block mb-1.5">Buscar por DNI *</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ingrese DNI" 
                      maxLength={8}
                      className="flex-1 p-3 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all disabled:opacity-60"
                      value={dniBusqueda}
                      onChange={(e) => setDniBusqueda(e.target.value.replace(/\D/g, ''))}
                      disabled={clienteStatus === 'confirmed' || clienteStatus === 'registering'}
                    />
                    <button onClick={buscarCliente} disabled={loading || clienteStatus === 'confirmed' || clienteStatus === 'registering' || dniBusqueda.length !== 8} className="bg-blue-600 text-white px-6 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 font-bold text-sm shadow-sm transition-colors">
                      <Search size={18} /> Buscar
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">Presione Enter o haga clic en Buscar para consultar</p>
                </div>

                {clienteStatus === 'found' && cliente && (
                  <div className="bg-[#f0fdf4] p-5 rounded-xl border border-green-200 mt-6 animate-fade-in transition-all">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="bg-green-500 text-white rounded-full p-0.5"><CheckCircle size={18} strokeWidth={3} /></div>
                      <h4 className="font-bold text-green-800 text-[15px]">Cliente encontrado en el sistema</h4>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-6 mb-6">
                      <div>
                        <p className="text-[11px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Nombre</p>
                        <p className="font-bold text-gray-800 text-[15px]">{cliente.nombres} {cliente.apellidos}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">DNI</p>
                        <p className="font-bold text-gray-800 text-[15px]">{cliente.dni}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Dirección</p>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{cliente.direccion || 'Av. Sánchez Cerro 234, Piura'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Teléfono</p>
                        <p className="font-bold text-gray-800 text-[15px]">{cliente.telefono || '923456789'}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={confirmarCliente} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
                        <CheckCircle size={18} /> Confirmar Cliente
                      </button>
                      <button onClick={descartarCliente} className="bg-gray-200/80 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors">
                        No es el mismo
                      </button>
                    </div>
                  </div>
                )}

                {clienteStatus === 'not_found' && (
                  <div className="bg-[#fffbeb] p-6 rounded-xl border border-amber-200 mt-6 animate-fade-in transition-all">
                    <div className="flex items-center gap-3 mb-1">
                      <AlertTriangle className="text-amber-500" size={24} />
                      <h4 className="font-bold text-[#b45309] text-[16px]">Cliente no registrado en el sistema</h4>
                    </div>
                    <p className="text-amber-700/80 text-sm mb-5 ml-9 font-medium">Debe registrar al nuevo cliente antes de continuar.</p>
                    
                    <button onClick={iniciarRegistro} className="ml-9 bg-[#f59e0b] hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
                      <UserPlus size={18} strokeWidth={2.5} /> Registrar Nuevo Cliente
                    </button>
                  </div>
                )}

                {(clienteStatus === 'confirmed' || clienteStatus === 'registering') && (
                  <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-8 pt-5 border-t border-gray-100 animate-fade-in">
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">DNI *</label>
                      <input type="text" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50/50 font-medium text-gray-500" value={dniBusqueda} disabled />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">Nombres *</label>
                      <input type="text" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-gray-50/50" value={clienteStatus === 'confirmed' ? cliente.nombres : nuevoCliente.nombres} onChange={e => setNuevoCliente({...nuevoCliente, nombres: e.target.value})} disabled={clienteStatus === 'confirmed'} />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">Apellidos *</label>
                      <input type="text" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-gray-50/50" value={clienteStatus === 'confirmed' ? cliente.apellidos : nuevoCliente.apellidos} onChange={e => setNuevoCliente({...nuevoCliente, apellidos: e.target.value})} disabled={clienteStatus === 'confirmed'} />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">Teléfono</label>
                      <input type="text" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-gray-50/50" value={clienteStatus === 'confirmed' ? cliente.telefono : nuevoCliente.telefono} onChange={e => setNuevoCliente({...nuevoCliente, telefono: e.target.value})} disabled={clienteStatus === 'confirmed'} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">Dirección</label>
                      <input type="text" className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-gray-50/50" value={clienteStatus === 'confirmed' ? cliente.direccion : nuevoCliente.direccion} onChange={e => setNuevoCliente({...nuevoCliente, direccion: e.target.value})} disabled={clienteStatus === 'confirmed'} />
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {pasoActual === 2 && (
            <div className="space-y-6 animate-fade-in">
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-[6px] border-l-blue-600">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase">
                    <Store size={18} className="text-green-600" /> DATOS DEL NEGOCIO
                  </h3>
                  
                  {negociosCliente.length > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">Seleccione el negocio a evaluar *</label>
                      <select 
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                        value={modoRegistroNegocio ? 'nuevo' : (negocio?.idNegocio || '')}
                        onChange={(e) => {
                          if (e.target.value === 'nuevo') {
                            setModoRegistroNegocio(true);
                            setNegocio(null);
                          } else {
                            setModoRegistroNegocio(false);
                            const seleccionado = negociosCliente.find(n => n.idNegocio.toString() === e.target.value);
                            setNegocio(seleccionado);
                          }
                        }}
                      >
                        {negociosCliente.map(n => (
                          <option key={n.idNegocio} value={n.idNegocio}>{n.razonSocial || n.giroNegocio} - {n.direccion}</option>
                        ))}
                        <option value="nuevo" className="font-bold text-blue-600">+ Registrar Nuevo Negocio Adicional</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                     <div>
                       <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">Dirección Exacta del Negocio *</label>
                       <input type="text" placeholder="Av. Grau 456, Catacaos" className="w-full p-3 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50/50 disabled:text-gray-500" value={negocio && !modoRegistroNegocio ? (negocio.direccion || '') : (nuevoNegocio.direccion || '')} onChange={e => setNuevoNegocio({...nuevoNegocio, direccion: e.target.value})} disabled={negocio && !modoRegistroNegocio} />
                     </div>
                     <div>
                       <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">Giro del Negocio *</label>
                       <select className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50/50 disabled:text-gray-500" value={negocio && !modoRegistroNegocio ? (negocio.giroNegocio || '') : (nuevoNegocio.giroNegocio || '')} onChange={e => setNuevoNegocio({...nuevoNegocio, giroNegocio: e.target.value})} disabled={negocio && !modoRegistroNegocio}>
                         <option value="">Seleccione...</option>
                         <option value="Comercio de Abarrotes">Comercio de Abarrotes</option>
                         <option value="Artesanía Textil">Artesanía Textil</option>
                         <option value="Pesca y Comercio">Pesca y Comercio</option>
                         <option value="Gastronomía">Gastronomía</option>
                         <option value="Transporte">Transporte</option>
                         <option value="Construcción">Construcción</option>
                         <option value="Acuicultura">Acuicultura</option>
                         <option value="Importación">Importación</option>
                         <option value="Comercio de Ropa">Comercio de Ropa</option>
                         <option value="Otro">Otro</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">Tiempo de Operación *</label>
                       <select className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50/50 disabled:text-gray-500" value={negocio && !modoRegistroNegocio ? (negocio.tiempoOperacion || '') : (nuevoNegocio.tiempoOperacion || '')} onChange={e => setNuevoNegocio({...nuevoNegocio, tiempoOperacion: e.target.value})} disabled={negocio && !modoRegistroNegocio}>
                         <option value="">Seleccione...</option>
                         <option value="Menos de 1 año">Menos de 1 año</option>
                         <option value="1 a 2 años">1 a 2 años</option>
                         <option value="2 a 5 años">2 a 5 años</option>
                         <option value="Más de 5 años">Más de 5 años</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-[11px] font-bold text-gray-800 block mb-1.5 uppercase">Ingresos Mensuales Aprox. (S/)</label>
                       <input type="number" placeholder="1500" className="w-full p-3 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50/50 disabled:text-gray-500" value={negocio && !modoRegistroNegocio ? (negocio.ingresoPromedioMensual || '') : (nuevoNegocio.ingresoPromedioMensual || '')} onChange={e => setNuevoNegocio({...nuevoNegocio, ingresoPromedioMensual: e.target.value})} disabled={negocio && !modoRegistroNegocio} />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* PASO 3 */}
          {pasoActual === 3 && (
            <div className="space-y-6">
              <div className="bg-[#fdfaff] p-6 rounded-xl border border-purple-100 shadow-sm border-l-[6px] border-l-purple-600 animate-fade-in">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase">
                  <div className="bg-purple-100 text-purple-600 p-1 rounded"><FileText size={16} /></div> CONDICIONES DEL CRÉDITO
                </h3>
                <div className="grid grid-cols-4 gap-6">
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-800 block mb-1.5">Monto Solicitado (S/) *</label>
                    <input type="number" className="w-full p-3 border border-gray-200 rounded-lg font-bold text-[15px] focus:ring-2 focus:ring-blue-500 outline-none" value={condiciones.monto} onChange={e => setCondiciones({...condiciones, monto: parseFloat(e.target.value) || ''})} />
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Entre S/ 200 y S/ 5,000</p>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-800 block mb-1.5">Plazo (meses) *</label>
                    <input type="number" className="w-full p-3 border border-gray-200 rounded-lg font-bold text-[15px] focus:ring-2 focus:ring-blue-500 outline-none" value={condiciones.plazo} onChange={e => setCondiciones({...condiciones, plazo: parseInt(e.target.value) || ''})} />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-800 block mb-1.5">Tasa de Interés (%) *</label>
                    <input type="number" step="0.1" className="w-full p-3 border border-gray-200 rounded-lg font-bold text-[15px] focus:ring-2 focus:ring-blue-500 outline-none" value={condiciones.tasaInteres} onChange={e => setCondiciones({...condiciones, tasaInteres: parseFloat(e.target.value) || ''})} />
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Mensual</p>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-800 block mb-1.5">Modalidad de Pago *</label>
                    <select className="w-full p-3 border border-gray-200 rounded-lg font-bold text-[14px] focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={condiciones.modalidadPago} onChange={e => setCondiciones({...condiciones, modalidadPago: e.target.value})}>
                      <option value="Mensual">Mensual</option>
                      <option value="Quincenal">Quincenal</option>
                      <option value="Semanal">Semanal</option>
                      <option value="Diario">Diario</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4 */}
          {pasoActual === 4 && (
            <div className="bg-[#f8fafc] p-6 rounded-xl border border-gray-200 shadow-sm space-y-5 animate-fade-in border-l-[6px] border-l-amber-500">
              <div className="mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1 uppercase text-sm">
                  <CheckCircle size={18} className="text-amber-500" /> PARÁMETROS DE EVALUACIÓN (OBLIGATORIOS)
                </h3>
                <p className="text-xs text-gray-500 font-medium ml-7">Complete los 4 parámetros basados en su evaluación de campo</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <EvalCard 
                  title="¿Cumple Requisitos?" 
                  subtitle="Documentación y condiciones básicas" 
                  value={evaluacion.cumpleRequisitos} 
                  onChange={v => setEvaluacion({...evaluacion, cumpleRequisitos: v})} 
                />
                <EvalCard 
                  title="Capacidad de Pago" 
                  subtitle="Ingresos suficientes para cubrir cuotas" 
                  value={evaluacion.capacidadPago} 
                  onChange={v => setEvaluacion({...evaluacion, capacidadPago: v})} 
                />
                <EvalCard 
                  title="Verificación de Ingresos" 
                  subtitle="Fuentes de ingreso comprobadas" 
                  value={evaluacion.verificacionIngresos} 
                  onChange={v => setEvaluacion({...evaluacion, verificacionIngresos: v})} 
                />
                <EvalCard 
                  title="Referencia Verificada" 
                  subtitle="Referencias personales/comerciales validadas" 
                  value={evaluacion.referenciaVerificada} 
                  onChange={v => setEvaluacion({...evaluacion, referenciaVerificada: v})} 
                />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200/60">
                <label className="text-[12px] font-bold text-slate-800 block mb-2">Observaciones del Analista</label>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
                  rows="3"
                  placeholder="Escriba aquí..."
                  value={evaluacion.observaciones || ''}
                  onChange={e => setEvaluacion({...evaluacion, observaciones: e.target.value})}
                ></textarea>
              </div>
            </div>
          )}

          {/* PASO 5 */}
          {pasoActual === 5 && (
            <div className="space-y-5 animate-fade-in text-left">
              
              {/* RESUMEN DE LA SOLICITUD */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2.5 flex items-center gap-2 text-[13px] uppercase">
                  <FileText size={16} className="text-blue-600" /> RESUMEN DE LA SOLICITUD
                </h3>
                <div className="bg-[#f8fafc] rounded-xl p-4 grid grid-cols-4 gap-y-4 gap-x-4 border border-gray-100">
                  <div>
                    <p className="text-gray-400 font-medium text-[11px] mb-0.5">Cliente</p>
                    <p className="font-bold text-slate-800 text-[13px]">{cliente?.nombres || nuevoCliente.nombres} {cliente?.apellidos || nuevoCliente.apellidos}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-[11px] mb-0.5">DNI</p>
                    <p className="font-bold text-slate-800 text-[13px]">{dniBusqueda}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-[11px] mb-0.5">Giro</p>
                    <p className="font-bold text-slate-800 text-[13px]">{negocio?.giroNegocio || nuevoNegocio.giroNegocio}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-[11px] mb-0.5">Tiempo</p>
                    <p className="font-bold text-slate-800 text-[13px]">{negocio?.tiempoOperacion || nuevoNegocio.tiempoOperacion}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-[11px] mb-0.5">Monto</p>
                    <p className="font-bold text-blue-600 text-lg">S/ {Number(condiciones.monto).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-[11px] mb-0.5">Plazo</p>
                    <p className="font-bold text-slate-800 text-[13px]">{condiciones.plazo} meses</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-[11px] mb-0.5">Tasa</p>
                    <p className="font-bold text-slate-800 text-[13px]">{condiciones.tasaInteres}% mensual</p>
                  </div>
                  <div>
                    <p className="text-gray-400 font-medium text-[11px] mb-0.5">Modalidad</p>
                    <p className="font-bold text-slate-800 text-[13px]">{condiciones.modalidadPago}</p>
                  </div>
                </div>
              </div>

              {/* PARÁMETROS DE EVALUACIÓN */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2.5 flex items-center gap-2 text-[13px] uppercase">
                  <CheckCircle size={16} className="text-[#10b981]" /> PARÁMETROS DE EVALUACIÓN
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Cumple Requisitos', val: evaluacion.cumpleRequisitos },
                    { label: 'Capacidad de Pago', val: evaluacion.capacidadPago },
                    { label: 'Verificación de Ingresos', val: evaluacion.verificacionIngresos },
                    { label: 'Referencia Verificada', val: evaluacion.referenciaVerificada }
                  ].map((param, i) => (
                    <div key={i} className={`p-3 rounded-lg border flex items-start gap-2 ${param.val ? 'bg-[#dcfce7]/40 border-[#bbf7d0]' : 'bg-[#fee2e2]/40 border-red-200'}`}>
                      <div className={`mt-0.5 rounded-full p-0.5 ${param.val ? 'bg-[#10b981] text-white' : 'bg-red-500 text-white'}`}>
                        {param.val ? <CheckCircle size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-800 leading-tight">{param.label}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${param.val ? 'text-[#10b981]' : 'text-red-600'}`}>{param.val ? 'Cumple' : 'No Cumple'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CRONOGRAMA */}
              {cronograma && (
                <div>
                  <h3 className="font-bold text-slate-800 mb-2.5 flex items-center gap-2 text-[13px] uppercase">
                    <Calendar size={16} className="text-[#8b5cf6]" /> CRONOGRAMA DE PAGOS GENERADO
                  </h3>
                  <div className="bg-[#fcfaff] rounded-xl overflow-hidden text-left border border-purple-50">
                    <div className="max-h-[220px] overflow-y-auto">
                      <table className="w-full text-[12px] text-left">
                        <thead className="sticky top-0 bg-[#fcfaff] z-10">
                          <tr className="text-gray-500 font-bold border-b border-purple-100">
                            <th className="px-5 py-2.5">Nº</th>
                            <th className="px-5 py-2.5">Fecha Venc.</th>
                            <th className="px-5 py-2.5">Cuota (S/)</th>
                            <th className="px-5 py-2.5">Capital</th>
                            <th className="px-5 py-2.5">Interés</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cronograma.cuotas.map(c => (
                            <tr key={c.numeroCuota} className="border-b border-purple-50/50 hover:bg-purple-50/30">
                              <td className="px-5 py-2 font-bold text-slate-800">{c.numeroCuota}</td>
                              <td className="px-5 py-2 text-slate-600">{c.fechaVencimiento}</td>
                              <td className="px-5 py-2 font-bold text-[#8b5cf6]">S/ {c.montoTotal.toFixed(2)}</td>
                              <td className="px-5 py-2 text-slate-600">S/ {(c.montoCapital || (c.montoTotal * 0.75)).toFixed(2)}</td>
                              <td className="px-5 py-2 text-slate-600">S/ {(c.montoInteres || (c.montoTotal * 0.25)).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="grid grid-cols-3 gap-4 p-4 bg-white border-t border-purple-100">
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium mb-0.5">Total a Pagar</p>
                        <p className="text-lg font-bold text-[#8b5cf6]">S/ {cronograma.totalPagar.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium mb-0.5">Interés Total</p>
                        <p className="text-[15px] font-bold text-[#8b5cf6]">S/ {cronograma.totalInteres.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium mb-0.5">Nº de Cuotas</p>
                        <p className="text-[15px] font-bold text-[#8b5cf6]">{cronograma.cuotas.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTA INFO */}
              <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-3 flex items-start gap-3 mt-1">
                <div className="text-[#d97706] mt-0.5"><Info size={18} strokeWidth={2.5} /></div>
                <div>
                  <p className="text-[13px] text-[#b45309] font-medium">
                    <span className="font-bold">Nota:</span> Al enviar, el sistema asignará automáticamente:
                  </p>
                  <ul className="text-[12px] text-[#b45309]/80 mt-1 list-disc pl-4 space-y-0.5">
                    <li>Si monto ≤ S/ 1,500 → Enviado al <strong className="text-[#92400e]">Administrador de Créditos</strong></li>
                    <li>Si monto &gt; S/ 1,500 → Enviado a la <strong className="text-[#92400e]">Gerente</strong></li>
                  </ul>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-5 border-t border-gray-100 bg-white z-10 flex justify-between items-center">
          <button 
            onClick={() => onClose()}
            className="px-5 py-2.5 text-gray-600 font-bold text-[13px] rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <X size={16} strokeWidth={3} /> Cancelar
          </button>
          
          <div className="flex items-center gap-3">
            {pasoActual > 1 && (
              <button 
                onClick={() => setPasoActual(p => Math.max(1, p - 1))} 
                disabled={loading}
                className="px-5 py-2.5 text-gray-600 font-bold text-[13px] rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={16} strokeWidth={3} /> Anterior
              </button>
            )}

            {pasoActual < 5 ? (
              <button 
                onClick={handleSiguiente} 
                disabled={!puedeAvanzar() || loading}
                className="bg-blue-600 text-white px-6 py-2.5 font-bold text-[14px] rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
              >
                Siguiente <ChevronRight size={18} strokeWidth={3} />
              </button>
            ) : (
              <button 
                onClick={guardarSolicitud}
                disabled={loading}
                className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 font-bold text-[14px] rounded-lg disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors"
              >
                <Send size={16} strokeWidth={2.5} className="-mt-0.5" />
                {loading ? 'Enviando...' : 'Guardar y Enviar a Aprobación'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FormularioSolicitudModal;
