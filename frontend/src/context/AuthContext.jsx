import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recuperar sesión al recargar la página
  useEffect(() => {
    const storedUser = localStorage.getItem('ludi_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, clave) => {
    try {
      const response = await api.post('/auth/login', { email, clave });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('ludi_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ludi_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
