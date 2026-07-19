import api from './api';

export const apiCobranza = {
    obtenerDashboard: async () => {
        const response = await api.get('/cobranzas/dashboard');
        return response.data;
    },
    obtenerBandeja: async () => {
        const response = await api.get('/cobranzas/bandeja');
        return response.data;
    },
    obtenerCobranzasHoy: async () => {
        const response = await api.get('/cobranzas/hoy');
        return response.data;
    },
    registrarPago: async (idCuota, data) => {
        const response = await api.post(`/cobranzas/pago/${idCuota}`, data);
        return response.data;
    },
    registrarAccion: async (idSolicitud, data) => {
        const response = await api.post(`/cobranzas/accion/${idSolicitud}`, data);
        return response.data;
    },
    obtenerHistorial: async (idSolicitud) => {
        const response = await api.get(`/cobranzas/accion/${idSolicitud}`);
        return response.data;
    }
};
