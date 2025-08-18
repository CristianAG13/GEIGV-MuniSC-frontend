import apiClient from '../config/api.js';

class AuthService {
  // Iniciar sesión
  async login(email, password) {
    try {
      console.log('Intentando login con:', { email, url: apiClient.defaults.baseURL + '/auth/login' });
      
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      console.log('Respuesta del servidor:', response.data);

      // El backend puede devolver diferentes estructuras de datos
      // Necesitamos verificar qué estructura está devolviendo
      const responseData = response.data;
      
      let token, user;
      
      // Verificar diferentes estructuras posibles de respuesta
      if (responseData.token) {
        token = responseData.token;
        user = responseData.user || responseData.usuario || { email };
      } else if (responseData.access_token) {
        token = responseData.access_token;
        user = responseData.user || responseData.usuario || { email };
      } else if (responseData.data) {
        token = responseData.data.token || responseData.data.access_token;
        user = responseData.data.user || responseData.data.usuario || { email };
      }

      if (!token) {
        console.error('No se encontró token en la respuesta:', responseData);
        return {
          success: false,
          error: 'Respuesta del servidor inválida: no se encontró token',
        };
      }

      // Guardar token y datos del usuario en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        data: { token, user },
      };
    } catch (error) {
      console.error('Error en login:', error);
      
      let message = 'Error al iniciar sesión';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.status === 401) {
        message = 'Credenciales inválidas';
      } else if (error.response?.status === 400) {
        message = 'Datos de login inválidos';
      } else if (error.response?.status >= 500) {
        message = 'Error del servidor. Intente más tarde.';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        message = 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose en el puerto 3001.';
      }

      return {
        success: false,
        error: message,
      };
    }
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Obtener el usuario actual
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Obtener el token actual
  getToken() {
    return localStorage.getItem('token');
  }

  // Recuperar contraseña
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email,
      });

      return {
        success: true,
        message: response.data.message || 'Instrucciones enviadas a su correo',
      };
    } catch (error) {
      console.error('Error en forgot password:', error);
      
      let message = 'Error al procesar solicitud';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      return {
        success: false,
        error: message,
      };
    }
  }

  // Verificar token de reseteo
  async verifyResetToken(token) {
    try {
      const response = await apiClient.get(`/auth/verify-reset-token/${token}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      };
    }
  }

  // Resetear contraseña
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword,
      });

      return {
        success: true,
        message: response.data.message || 'Contraseña actualizada exitosamente',
      };
    } catch (error) {
      console.error('Error en reset password:', error);
      
      let message = 'Error al resetear contraseña';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      return {
        success: false,
        error: message,
      };
    }
  }
}

export default new AuthService();
