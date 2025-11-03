// services/roleRequestService.js
import apiClient from '../config/api.js';

class RoleRequestService {
  // Solicitar un rol (usuario sin rol)
  async requestRole(roleName, justification = '') {
    try {
      const payload = {
        requestedRole: (roleName || '').toLowerCase(), // Convertir a minúsculas como espera el backend
        justification
      };
      
      console.log('RoleRequestService - enviando al backend:');
      console.log('- roleName original:', roleName);
      console.log('- roleName.toLowerCase():', (roleName || '').toLowerCase());
      console.log('- justification:', justification);
      console.log('- payload final:', payload);
      
      const response = await apiClient.post('/role-requests', payload);
      
      console.log('Response del backend:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Solicitud de rol enviada exitosamente'
      };
    } catch (error) {
      console.error('Error requesting role:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al solicitar rol'
      };
    }
  }

  // Obtener solicitudes pendientes (para admins)
  async getPendingRequests() {
    try {
      const response = await apiClient.get('/role-requests/pending');
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : response.data.requests || []
      };
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener solicitudes pendientes',
        data: []
      };
    }
  }

  // Obtener todas las solicitudes (para admins)
  async getAllRequests() {
    try {
      const response = await apiClient.get('/role-requests');
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : response.data.requests || []
      };
    } catch (error) {
      console.error('Error fetching all requests:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener solicitudes',
        data: []
      };
    }
  }

  // Aprobar solicitud de rol (admin)
  async approveRequest(requestId) {
    try {
      const response = await apiClient.patch(`/role-requests/${requestId}/approve`);
      return {
        success: true,
        data: response.data,
        message: 'Solicitud aprobada exitosamente'
      };
    } catch (error) {
      console.error('Error approving request:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al aprobar solicitud'
      };
    }
  }

  // Aprobar solicitud de rol de operario con datos adicionales
  async approveOperatorRequest(requestId, additionalData) {
    try {
      const response = await apiClient.patch(`/role-requests/${requestId}/approve-operator`, {
        additionalData
      });
      return {
        success: true,
        data: response.data,
        message: 'Solicitud de operario aprobada exitosamente'
      };
    } catch (error) {
      console.error('Error approving operator request:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al aprobar solicitud de operario'
      };
    }
  }

  // Rechazar solicitud de rol (admin)
  async rejectRequest(requestId, reason = '') {
    try {
      const response = await apiClient.patch(`/role-requests/${requestId}/reject`, {
        reason
      });
      return {
        success: true,
        data: response.data,
        message: 'Solicitud rechazada'
      };
    } catch (error) {
      console.error('Error rejecting request:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al rechazar solicitud'
      };
    }
  }

  // Obtener solicitudes del usuario actual
  async getMyRequests() {
    try {
      const response = await apiClient.get('/role-requests/my-requests');
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : response.data.requests || []
      };
    } catch (error) {
      console.error('Error fetching my requests:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener mis solicitudes',
        data: []
      };
    }
  }

  // Cancelar solicitud propia
  async cancelRequest(requestId) {
    try {
      const response = await apiClient.delete(`/role-requests/${requestId}`);
      return {
        success: true,
        data: response.data,
        message: 'Solicitud cancelada'
      };
    } catch (error) {
      console.error('Error canceling request:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cancelar solicitud'
      };
    }
  }

  // Obtener estadísticas de solicitudes (admin)
  async getRequestsStats() {
    try {
      const response = await apiClient.get('/role-requests/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching requests stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener estadísticas',
        data: {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0
        }
      };
    }
  }

  // Obtener roles disponibles para solicitar (desde el backend)
  async getAvailableRoles() {
    try {
      const response = await apiClient.get('/roles/available-for-request');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching available roles:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener roles disponibles',
        data: []
      };
    }
  }
}

export default new RoleRequestService();
