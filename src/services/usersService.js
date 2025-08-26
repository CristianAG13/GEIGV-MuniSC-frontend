// // // services/usersService.js
// // import apiClient from '../config/api.js';

// // class UsersService {
// //   // Obtener todos los usuarios (solo admin/superadmin)
// //   async getAllUsers() {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await apiClient.get('/users', {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //         },
// //       });
// //       return {
// //         success: true,
// //         data: response.data,
// //       };
// //     } catch (error) {
// //       console.error('Error fetching users:', error);
// //       return {
// //         success: false,
// //         error: error.response?.data?.message || 'Error al obtener usuarios',
// //       };
// //     }
// //   }

// //   // Asignar rol a usuario
// //   async assignRole(userId, roleId) {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await apiClient.patch(`/users/${userId}/role`, 
// //         { roleId }, 
// //         {
// //           headers: {
// //             'Authorization': `Bearer ${token}`,
// //           },
// //         }
// //       );
// //       return {
// //         success: true,
// //         data: response.data,
// //       };
// //     } catch (error) {
// //       console.error('Error assigning role:', error);
// //       return {
// //         success: false,
// //         error: error.response?.data?.message || 'Error al asignar rol',
// //       };
// //     }
// //   }

// //   // Actualizar usuario
// //   async updateUser(userId, userData) {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await apiClient.patch(`/users/${userId}`, 
// //         userData, 
// //         {
// //           headers: {
// //             'Authorization': `Bearer ${token}`,
// //           },
// //         }
// //       );
// //       return {
// //         success: true,
// //         data: response.data,
// //       };
// //     } catch (error) {
// //       console.error('Error updating user:', error);
// //       return {
// //         success: false,
// //         error: error.response?.data?.message || 'Error al actualizar usuario',
// //       };
// //     }
// //   }

// //   // Eliminar usuario
// //   async deleteUser(userId) {
// //     try {
// //       const token = localStorage.getItem('token');
// //       const response = await apiClient.delete(`/users/${userId}`, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //         },
// //       });
// //       return {
// //         success: true,
// //         data: response.data,
// //       };
// //     } catch (error) {
// //       console.error('Error deleting user:', error);
// //       return {
// //         success: false,
// //         error: error.response?.data?.message || 'Error al eliminar usuario',
// //       };
// //     }
// //   }
// // }

// // export default new UsersService();

// // services/usersService.js
// import apiClient from '../config/api.js';

// class UsersService {
//   // Obtener todos los usuarios (solo admin/superadmin)
//   // async getAllUsers() {
//   //   try {
//   //     const token = localStorage.getItem('token');
//   //     const response = await apiClient.get('/users', {
//   //       headers: {
//   //         'Authorization': `Bearer ${token}`,
//   //       },
//   //     });
//   //     return {
//   //       success: true,
//   //       data: response.data,
//   //     };
//   //   } catch (error) {
//   //     console.error('Error fetching users:', error);
//   //     return {
//   //       success: false,
//   //       error: error.response?.data?.message || 'Error al obtener usuarios',
//   //     };
//   //   }
//   // }
//   async getAllUsers() {
//   try {
//     const response = await apiClient.get('/users');
//     console.log('Respuesta completa del backend:', response.data);
    
//     // Si el backend devuelve { users: [...] }
//     return Array.isArray(response.data) ? response.data : response.data.users || [];
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
//   }
// }

//   // Asignar rol a usuario
//   async assignRole(userId, roleId) {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await apiClient.patch(`/users/${userId}/role`, 
//         { roleId }, 
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );
//       return {
//         success: true,
//         data: response.data,
//       };
//     } catch (error) {
//       console.error('Error assigning role:', error);
//       return {
//         success: false,
//         error: error.response?.data?.message || 'Error al asignar rol',
//       };
//     }
//   }

//   // Actualizar usuario
//   async updateUser(userId, userData) {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await apiClient.patch(`/users/${userId}`, 
//         userData, 
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );
//       return {
//         success: true,
//         data: response.data,
//       };
//     } catch (error) {
//       console.error('Error updating user:', error);
//       return {
//         success: false,
//         error: error.response?.data?.message || 'Error al actualizar usuario',
//       };
//     }
//   }

//   // Eliminar usuario
//   async deleteUser(userId) {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await apiClient.delete(`/users/${userId}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });
//       return {
//         success: true,
//         data: response.data,
//       };
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       return {
//         success: false,
//         error: error.response?.data?.message || 'Error al eliminar usuario',
//       };
//     }
//   }
// }

// export default new UsersService();

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