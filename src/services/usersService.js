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