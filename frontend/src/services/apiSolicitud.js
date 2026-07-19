import api from './api';

export const apiSolicitud = {
  // CLIENTES
  getClientePorDni: async (dni) => {
    try {
      const response = await api.get(`/clientes/${dni}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // Cliente no encontrado
      }
      throw error;
    }
  },

  registrarCliente: async (clienteData) => {
    const response = await api.post('/clientes', clienteData);
    return response.data;
  },

  // NEGOCIOS
  getNegocioPorDniCliente: async (dni) => {
    try {
      const response = await api.get(`/negocios/cliente/${dni}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },

  registrarNegocio: async (negocioData) => {
    const response = await api.post('/negocios', negocioData);
    return response.data;
  },

  // SOLICITUDES Y CRONOGRAMA
  previsualizarCronograma: async (datosCronograma) => {
    const response = await api.post('/solicitudes/previsualizar-cronograma', datosCronograma);
    return response.data;
  },

  crearSolicitud: async (solicitudData) => {
    const response = await api.post('/solicitudes', solicitudData);
    return response.data;
  },

  procesarSolicitud: async (solicitudId, aprobadorId, accion, observaciones) => {
    const response = await api.post(`/solicitudes/${solicitudId}/procesar`, {
      aprobadorId,
      accion,
      observaciones
    });
    return response.data;
  },

  getSolicitudes: async (estado = '', usuarioId = null) => {
    let url = '/solicitudes?';
    if (estado) url += `estado=${estado}&`;
    if (usuarioId) url += `usuarioId=${usuarioId}&`;
    const response = await api.get(url);
    return response.data;
  }
};
