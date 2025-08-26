// services/rolesService.js
import apiClient from '../config/api.js';

const rolesService = {
  // ===== ENDPOINTS PÚBLICOS (PARA TESTING) =====
  
  // Test del endpoint
  testEndpoint: async () => {
    try {
      const response = await apiClient.get('/roles/test');
      return response.data;
    } catch (error) {
      console.error('Error en test endpoint:', error);
      throw new Error(error.response?.data?.message || 'Error en test endpoint');
    }
  },

  // Obtener todos los roles (público)
  getAllRoles: async () => {
    try {
      const response = await apiClient.get('/roles/public');
      return response.data;
    } catch (error) {
      console.error('Error fetching all roles:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener roles');
    }
  },

  // Obtener roles activos (público)
  getActiveRoles: async () => {
    try {
      const response = await apiClient.get('/roles/public', {
        params: { active: 'true' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active roles:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener roles activos');
    }
  },

  // Crear roles por defecto (público)
  createDefaultRoles: async () => {
    try {
      const response = await apiClient.post('/roles/public/default');
      return response.data;
    } catch (error) {
      console.error('Error creating default roles:', error);
      throw new Error(error.response?.data?.message || 'Error al crear roles por defecto');
    }
  },

  // Crear rol (público)
  createRole: async (roleData) => {
    try {
      const response = await apiClient.post('/roles/public', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw new Error(error.response?.data?.message || 'Error al crear rol');
    }
  },

  // Obtener estadísticas de roles (público)
  getStats: async () => {
    try {
      const response = await apiClient.get('/roles/public/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles stats:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Obtener rol por ID (público)
  getRoleById: async (id) => {
    try {
      const response = await apiClient.get(`/roles/public/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role by ID:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener rol');
    }
  },

  // ===== ENDPOINTS CON AUTENTICACIÓN =====

  // Crear rol (con autenticación - admin)
  createRoleAuth: async (roleData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.post('/roles', roleData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating role (auth):', error);
      throw new Error(error.response?.data?.message || 'Error al crear rol');
    }
  },

  // Crear roles por defecto (con autenticación - admin)
  createDefaultRolesAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.post('/roles/default', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating default roles (auth):', error);
      throw new Error(error.response?.data?.message || 'Error al crear roles por defecto');
    }
  },

  // Obtener todos los roles (con autenticación)
  getAllRolesAuth: async (activeOnly = false) => {
    try {
      const token = localStorage.getItem('token');
      const params = activeOnly ? { active: 'true' } : {};
      
      const response = await apiClient.get('/roles', {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching roles (auth):', error);
      throw new Error(error.response?.data?.message || 'Error al obtener roles');
    }
  },

  // Obtener estadísticas de roles (con autenticación - admin)
  getStatsAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get('/roles/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching roles stats (auth):', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  // Obtener rol por ID (con autenticación)
  getRoleByIdAuth: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get(`/roles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching role by ID (auth):', error);
      throw new Error(error.response?.data?.message || 'Error al obtener rol');
    }
  },

  // Actualizar rol (con autenticación - admin)
  updateRole: async (id, roleData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.patch(`/roles/${id}`, roleData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar rol');
    }
  },

  // Activar rol (con autenticación - admin)
  activateRole: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.patch(`/roles/${id}/activate`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error activating role:', error);
      throw new Error(error.response?.data?.message || 'Error al activar rol');
    }
  },

  // Desactivar rol (con autenticación - admin)
  deactivateRole: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.patch(`/roles/${id}/deactivate`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deactivating role:', error);
      throw new Error(error.response?.data?.message || 'Error al desactivar rol');
    }
  },

  // Eliminar rol (con autenticación - admin)
  deleteRole: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.delete(`/roles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar rol');
    }
  },

  // ===== MÉTODOS DE UTILIDAD =====

  // Verificar si un rol existe
  roleExists: async (roleName) => {
    try {
      const roles = await rolesService.getAllRoles();
      return roles.some(role => role.nombre === roleName);
    } catch (error) {
      console.error('Error checking if role exists:', error);
      return false;
    }
  },

  // Obtener rol por nombre
  getRoleByName: async (roleName) => {
    try {
      const roles = await rolesService.getAllRoles();
      return roles.find(role => role.nombre === roleName) || null;
    } catch (error) {
      console.error('Error getting role by name:', error);
      return null;
    }
  },

  // Inicializar roles por defecto si no existen
  initializeDefaultRoles: async () => {
    try {
      // Verificar si ya existen roles
      const existingRoles = await rolesService.getAllRoles();
      
      if (existingRoles.length === 0) {
        console.log('No hay roles existentes, creando roles por defecto...');
        return await rolesService.createDefaultRoles();
      } else {
        console.log('Roles ya existen:', existingRoles);
        return existingRoles;
      }
    } catch (error) {
      console.error('Error initializing default roles:', error);
      throw error;
    }
  }
};

export default rolesService;