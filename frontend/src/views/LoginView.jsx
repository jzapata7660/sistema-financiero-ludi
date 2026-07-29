import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Landmark, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginView = () => {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const result = await login(email, clave);
    
    if (result.success) {
      navigate('/dashboard'); // Redirigiremos según el rol más adelante en el dashboard
    } else {
      setError(result.message || 'Credenciales inválidas');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4">
      
      <div className="bg-white p-10 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] w-full max-w-[440px]">
        
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white mb-4 shadow-md">
            <Landmark size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-[1.7rem] font-bold text-[#1e293b] leading-tight mb-1">
            Ludi Financiera
          </h1>
          <p className="text-[#64748b] text-[0.95rem]">
            Sistema de Gestión de Créditos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Correo Electrónico */}
            <div>
              <label className="block text-[0.85rem] font-bold text-[#1e293b] mb-1.5">
                Correo electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition-colors text-[0.95rem]"
                  placeholder="ejemplo@ludi.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[0.85rem] font-bold text-[#1e293b] mb-1.5">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:ring-1 transition-colors text-[0.95rem] ${error?.includes('Credenciales incorrectas') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#cbd5e1] focus:border-[#1e3a8a] focus:ring-[#1e3a8a]'}`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded font-medium transition-colors mt-2 text-[0.95rem]"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-[#94a3b8] text-[0.75rem] mt-8">
          &copy; {new Date().getFullYear()} Ludi Financiera. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginView;
