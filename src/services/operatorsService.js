import apiClient from '../config/api';

const operatorsService = {
  /**
   * Obtener todos los operadores
   * @returns {Promise<Array>} Lista de operadores
   */
  getAllOperators: async () => {
    try {
      const response = await apiClient.get('/operators');
      return response.data;
    } catch (error) {
      console.error('Error al obtener operadores:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obtener un operador por su ID
   * @param {number} id - ID del operador
   * @returns {Promise<Object>} Datos del operador
   */
  getOperatorById: async (id) => {
    try {
      const response = await apiClient.get(`/operators/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener operador con ID ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obtener un operador con detalles de usuario (incluyendo email) por su ID
   * @param {number} id - ID del operador
   * @returns {Promise<Object>} Datos del operador con email si está asociado a un usuario
   */
  getOperatorWithUserDetails: async (id) => {
    try {
      const response = await apiClient.get(`/operators/${id}/with-user-details`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener operador con detalles de usuario, ID ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Crear un nuevo operador
   * @param {Object} operatorData - Datos del operador a crear
   * @returns {Promise<Object>} Operador creado
   */
  createOperator: async (operatorData) => {
    try {
      const response = await apiClient.post('/operators', operatorData);
      return response.data;
    } catch (error) {
      console.error('Error al crear operador:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Actualizar un operador existente
   * @param {number} id - ID del operador a actualizar
   * @param {Object} operatorData - Datos actualizados del operador
   * @returns {Promise<Object>} Operador actualizado
   */
  updateOperator: async (id, operatorData) => {
    try {
      const response = await apiClient.put(`/operators/${id}`, operatorData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar operador con ID ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Eliminar un operador
   * @param {number} id - ID del operador a eliminar
   * @returns {Promise<Object>} Resultado de la operación
   */
  deleteOperator: async (id) => {
    try {
      const response = await apiClient.delete(`/operators/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar operador con ID ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Asociar un operador con un usuario
   * @param {number} operatorId - ID del operador
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Resultado de la asociación
   */
  associateWithUser: async (operatorId, userId) => {
    try {
      const response = await apiClient.patch(`/operators/${operatorId}/associate-user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al asociar operador ${operatorId} con usuario ${userId}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Desasociar un operador de su usuario
   * @param {number} operatorId - ID del operador
   * @returns {Promise<Object>} Resultado de la desasociación
   */
  dissociateFromUser: async (operatorId) => {
    try {
      const response = await apiClient.patch(`/operators/${operatorId}/dissociate-user`);
      return response.data;
    } catch (error) {
      console.error(`Error al desasociar operador ${operatorId} de su usuario:`, error);
      throw error.response?.data || error.message;
    }
  }
};

export default operatorsService;
