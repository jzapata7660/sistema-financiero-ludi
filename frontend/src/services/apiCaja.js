import axios from 'axios';

const API_URL = 'http://localhost:8080/api/caja';

export const apiCaja = {
    getPendientes: async () => {
        const response = await axios.get(`${API_URL}/pendientes`);
        return response.data;
    },
    
    registrarDesembolso: async (idSolicitud, data) => {
        const response = await axios.post(`${API_URL}/desembolsar/${idSolicitud}`, data);
        return response.data;
    },
    
    getHistorial: async () => {
        const response = await axios.get(`${API_URL}/historial`);
        return response.data;
    }
};
