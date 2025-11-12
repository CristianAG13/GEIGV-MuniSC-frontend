// export default new UsersService();

// services/usersService.js
import apiClient from '../config/api.js';

class UsersService {
  /**
   * Obtiene la información del usuario autenticado actual
   * Útil para que inspectores e ingenieros obtengan su propio ID
   * al rellenar boletas
   */
  async getMe() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await apiClient.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('✅ Usuario actual obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener usuario actual:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener información del usuario');
    }
  }

  async getAllUsers() {
    try {
      const token = localStorage.getItem('access_token');
      const response = await apiClient.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(response.data) ? response.data : response.data.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  }

  async createUser(userData) {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Creando usuario con datos:', userData);
      const response = await apiClient.post('/users', {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        lastname: userData.lastname,
      }, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });
      console.log('Usuario creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      let message = 'Error al crear usuario';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.status === 400) {
        message = 'Datos de usuario inválidos';
      } else if (error.response?.status === 409) {
        message = 'El usuario ya existe';
      } else if (error.response?.status >= 500) {
        message = 'Error del servidor. Intente más tarde.';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        message = 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose.';
      }
      throw new Error(message);
    }
  }

  async assignRoles(userId, roleIds) {
    try {
      const token = localStorage.getItem('access_token');
      console.log('=== ASIGNANDO ROLES ===');
      console.log('userId:', userId);
      console.log('roleIds:', roleIds);
      
      const response = await apiClient.post(`/users/${userId}/roles`, { 
        roleIds: roleIds // tu backend espera { roleIds: [1, 2, 3] }
      }, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });
      
      console.log('Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error assigning roles:', error);
      console.error('Error completo:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al asignar rol');
    }
  }

  async updateUser(userId, userData) {
    try {
      const token = localStorage.getItem('access_token');
      const response = await apiClient.patch(`/users/${userId}`, userData, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  }

  async deleteUser(userId) {
    try {
      const token = localStorage.getItem('access_token');
      await apiClient.delete(`/users/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  }
}

export default new UsersService();
