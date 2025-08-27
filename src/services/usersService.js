// services/usersService.js
import apiClient from '../config/api.js';

class UsersService {
  async getAllUsers() {
    try {
      const response = await apiClient.get('/users');
      return Array.isArray(response.data) ? response.data : response.data.users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  }

  async createUser(userData) {
    try {
      console.log('Creando usuario con datos:', userData);
      const response = await apiClient.post('/users', {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        lastname: userData.lastname,
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

  // Corregir: tu backend usa POST /users/:id/roles con AssignRolesDto
  async assignRoles(userId, roleIds) {
    try {
      const response = await apiClient.post(`/users/${userId}/roles`, { 
        roleIds: roleIds // Tu backend espera { roleIds: [1, 2, 3] }
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning roles:', error);
      throw new Error(error.response?.data?.message || 'Error al asignar rol');
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await apiClient.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  }

  async deleteUser(userId) {
    try {
      await apiClient.delete(`/users/${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  }
}

export default new UsersService();