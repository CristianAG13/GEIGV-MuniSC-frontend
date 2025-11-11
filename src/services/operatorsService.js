
// services/operatorsService.js
import apiClient from '../config/api';

const operatorsService = {
  // Obtener todos los operadores
  getAllOperators: async () => {
    const response = await apiClient.get('/operators');
    console.log("🔍 [DEBUG] Respuesta completa de operadores:", response.data);
    return response.data;
  },

  // Obtener operador por ID
  getOperatorById: async (id) => {
    const response = await apiClient.get(`/operators/${id}`);
    return response.data;
  },

  // Obtener operador con detalles del usuario
  getOperatorWithUserDetails: async (id) => {
    const response = await apiClient.get(`/operators/${id}/with-user-details`);
    return response.data;
  },

  // Buscar operador por identificación
  getOperatorByIdentification: async (identification) => {
    const response = await apiClient.get(`/operators/by-identification/${identification}`);
    return response.data;
  },

  // Crear operador
  createOperator: async (operatorData) => {
    const response = await apiClient.post('/operators', operatorData);
    return response.data;
  },

  // Actualizar operador (usar PATCH, no PUT)
  updateOperator: async (id, operatorData) => {
    const response = await apiClient.patch(`/operators/${id}`, operatorData);
    return response.data;
  },

  // Eliminar operador
  deleteOperator: async (id) => {
    const response = await apiClient.delete(`/operators/${id}`);
    return response.data;
  },

  // Asociar operador con usuario
  associateWithUser: async (operatorId, userId) => {
    const response = await apiClient.patch(`/operators/${operatorId}/associate-user/${userId}`);
    return response.data;
  },

  // Desasociar operador de usuario
  dissociateFromUser: async (operatorId) => {
    const response = await apiClient.patch(`/operators/${operatorId}/remove-user-association`);
    return response.data;
  },

  // Obtener reportes de un operador
  getReportsByOperator: async (id) => {
    const response = await apiClient.get(`/operators/${id}/reports`);
    return response.data;
  },

  // Obtener el operador del usuario actual (para auto-asignación)
  getMyOperator: async () => {
    const response = await apiClient.get('/operators/my-operator');
    return response.data;
  }
};

export default operatorsService;
