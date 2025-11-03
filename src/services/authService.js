import apiClient from '../config/api.js';

// Obtener la URL base de la API desde las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL;

class AuthService {
  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

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

      // Procesar el usuario para extraer el rol correctamente
      if (user && user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        // Si tiene un array de roles, tomar el primero
        user.rol = user.roles[0].name || user.roles[0];
      } else if (user && user.role) {
        // Si tiene un campo role
        user.rol = user.role;
      } else if (user && user.rol) {
        // Si ya tiene rol
        // Rol already present
      }

      if (!token) {
        return {
          success: false,
          error: 'Respuesta del servidor inválida: no se encontró token',
        };
      }

      // Guardar token y datos del usuario en localStorage
      // Guardar token y datos del usuario en localStorage
       localStorage.setItem('access_token', token);  // ✅ corregido
      localStorage.setItem('user', JSON.stringify(user));


      // Intentar obtener el perfil completo del usuario con roles después del login
      try {
        const profileResult = await this.getUserProfile();
        if (profileResult.success && profileResult.data) {
          // Actualizar con los datos completos del perfil (incluye roles)
          localStorage.setItem('user', JSON.stringify(profileResult.data));
          user = profileResult.data;
        }
      } catch (profileError) {
        // Continue with basic user data if profile fetch fails
      }

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
  logout(preserveExpiredReason = false) {
    // Si no queremos preservar el motivo, limpiamos todo
    if (!preserveExpiredReason) {
      localStorage.removeItem('sessionExpiredReason');
    }
    
    localStorage.removeItem('access_token');  // ✅ corregido
    localStorage.removeItem('user');
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    // Verificar si el token ha expirado
    if (this.isTokenExpired()) {
      // Guardamos un indicador para saber que se cerró por expiración
      localStorage.setItem('sessionExpiredReason', 'token_expired');
      this.logout(); // Limpiar datos si el token expiró
      return false;
    }
    
    return true;
  }

  // Obtener el usuario actual
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Obtener el token actual
  getToken() {
    return localStorage.getItem('access_token');
  }

  // Verificar si el token ha expirado
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decodificar el payload del JWT sin verificar la firma
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Verificar si el token ha expirado
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true; // Si hay error, considerar el token como expirado
    }
  }

  // Limpiar datos de autenticación si el token ha expirado
  checkTokenExpiration() {
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }
    return true;
  }

  // Obtener tiempo restante del token en segundos
  getTokenTimeRemaining() {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeRemaining = payload.exp - currentTime;
      
      return Math.max(0, timeRemaining);
    } catch (error) {
      console.error('Error al calcular tiempo restante del token:', error);
      return 0;
    }
  }

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        lastname: userData.lastname,
        // Puedes añadir más campos según tu backend
      });

      return {
        success: true,
        message: response.data.message || 'Usuario registrado exitosamente',
        data: response.data,
      };
    } catch (error) {
      console.error('Error en registro:', error);
      
      let message = 'Error al registrar usuario';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.status === 400) {
        message = 'Datos de registro inválidos';
      } else if (error.response?.status === 409) {
        message = 'El usuario ya existe';
      } else if (error.response?.status >= 500) {
        message = 'Error del servidor. Intente más tarde.';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        message = 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose.';
      }

      return {
        success: false,
        error: message,
      };
    }
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
      
      // Verificar si hay respuesta del servidor
      if (error.response) {
        // Intentar extraer el mensaje de diferentes formas
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            message = error.response.data;
          } else if (error.response.data.message) {
            message = error.response.data.message;
          } else if (error.response.data.error) {
            message = error.response.data.error;
          }
        }
        
        // Mensajes específicos por código de estado
        if (error.response.status === 404) {
          message = 'Endpoint no encontrado. Verifique que el backend tenga la ruta /auth/forgot-password';
        } else if (error.response.status === 400) {
          message = 'Correo electrónico inválido';
        } else if (error.response.status >= 500) {
          message = 'Error del servidor. Intente más tarde.';
        }
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        message = 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose en el puerto 3001.';
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
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Token inválido o expirado',
        };
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      return {
        success: false,
        error: 'Error de conexión al verificar el token',
      };
    }
  }

  // Resetear contraseña
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          newPassword: newPassword  // Cambié de 'password' a 'newPassword'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Contraseña actualizada exitosamente',
        };
      } else {
        return {
          success: false,
          error: data.message || 'Error al resetear contraseña',
        };
      }
    } catch (error) {
      console.error('Error en reset password:', error);
      return {
        success: false,
        error: 'Error de conexión al resetear contraseña',
      };
    }
  }
  // Función para obtener perfil del usuario desde el backend
  async getUserProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await apiClient.get('/auth/profile');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener perfil',
      };
    }
  }

  // Función para refrescar datos del usuario
  async refreshUserData() {
    try {
      const profileResult = await this.getUserProfile();

      if (profileResult.success) {
        let userData = profileResult.data;

        if (userData && userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
          userData.rol = userData.roles[0].name || userData.roles[0];
        }

        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, data: userData };
      } else {
        return profileResult;
      }
    } catch (error) {
      return { success: false, error: 'Error al actualizar datos del usuario' };
    }
  }


  // Función para actualizar perfil del usuario
  async updateProfile(userData) {
    try {
      const response = await apiClient.patch('/auth/profile', userData);
      localStorage.setItem('user', JSON.stringify(response.data));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar perfil',
      };
    }
  }
}



export default new AuthService();
