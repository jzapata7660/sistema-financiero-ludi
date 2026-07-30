import api from './api';

export const apiCliente = {
  getClientes: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },

  getClientesResumen: async () => {
    const response = await api.get('/clientes/resumen');
    return response.data;
  },

  getClientePorDni: async (dni) => {
    try {
      const response = await api.get(`/clientes/${dni}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },

  crearCliente: async (clienteData) => {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  },

  actualizarCliente: async (id, clienteData) => {
    const response = await api.put(`/clientes/${id}`, clienteData);
    return response.data;
  },

  eliminarCliente: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },

  activarCliente: async (id) => {
    const response = await api.put(`/clientes/activar/${id}`);
    return response.data;
  }
};
