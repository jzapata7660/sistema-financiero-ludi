import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Solicitud (Request): Adjunta el token JWT automáticamente si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ludi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const userStr = localStorage.getItem('ludi_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch {
          // Si el JSON es inválido, continúa sin header Authorization
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta (Response): Manejo global de errores HTTP (ej: 401 expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');

    // Si recibimos 401 (No autorizado / Token vencido) y no es el endpoint de login mismo:
    if (status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('ludi_user');
      localStorage.removeItem('ludi_token');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
