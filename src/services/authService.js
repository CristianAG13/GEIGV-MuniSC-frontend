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

  // Registrar nuevo usuario
  async register(userData) {
    try {
      console.log('Intentando registro con:', { 
        email: userData.email, 
        url: apiClient.defaults.baseURL + '/auth/register' 
      });

      const response = await apiClient.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        lastname: userData.lastname,
        // Puedes añadir más campos según tu backend
      });

      console.log('Respuesta del registro:', response.data);

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

  // Método mejorado para forgot password
  // async forgotPassword(email) {
  //   try {
  //     // 1. Hacer llamada a tu API backend
  //     const response = await fetch('/api/auth/forgot-password', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email })
  //     });

  //     const result = await response.json();

  //     if (response.ok && result.success) {
  //       // 2. Si es exitoso, opcionalmente preparar el template para mostrar preview
  //       // (esto sería solo para desarrollo/testing)
  //       if (process.env.NODE_ENV === 'development') {
  //         await this.generateEmailPreview(email, result.resetToken);
  //       }

  //       return {
  //         success: true,
  //         message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.'
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         error: result.message || 'Error al procesar la solicitud'
  //       };
  //     }
  //   } catch (error) {
  //     console.error('Error en forgotPassword:', error);
  //     return {
  //       success: false,
  //       error: 'Error de conexión. Verifica tu conexión a internet.'
  //     };
  //   }
  // }

  // // Método para generar preview del email (solo desarrollo)
  // async generateEmailPreview(email, resetToken) {
  //   try {
  //     const template = await this.loadEmailTemplate('reset-password');
  //     const resetUrl = `${window.location.origin}/reset-password/${resetToken}`;
  //     const emailHtml = template.replace(/{{RESET_URL}}/g, resetUrl);
      
  //     // Abrir en nueva ventana para preview
  //     const previewWindow = window.open('', '_blank', 'width=600,height=800');
  //     previewWindow.document.write(emailHtml);
  //     previewWindow.document.close();
      
  //     console.log('📧 Preview del email generado');
  //   } catch (error) {
  //     console.error('Error generando preview:', error);
  //   }
  // }

  // async loadEmailTemplate(templateName) {
  //   try {
  //     const response = await fetch(`/email-templates/${templateName}.html`);
  //     if (!response.ok) throw new Error('Template no encontrado');
  //     return await response.text();
  //   } catch (error) {
  //     console.error('Error cargando template:', error);
  //     // Template básico de fallback
  //     return this.getBasicEmailTemplate();
  //   }
  // }
  // Recuperar contraseña
  async forgotPassword(email) {
    try {
      console.log('Solicitud de recuperación de contraseña para:', email);
      
      const response = await apiClient.post('/auth/forgot-password', {
        email,
      });

      console.log('Respuesta de forgot password:', response.data);

      return {
        success: true,
        message: response.data.message || 'Instrucciones enviadas a su correo',
      };
    } catch (error) {
      console.error('Error en forgot password:', error);
      
      let message = 'Error al procesar solicitud';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.status === 404) {
        message = 'No se encontró una cuenta con ese correo electrónico';
      } else if (error.response?.status === 400) {
        message = 'Correo electrónico inválido';
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
      console.error('Error obteniendo perfil:', error);
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
        localStorage.setItem('user', JSON.stringify(profileResult.data));
        return {
          success: true,
          data: profileResult.data,
        };
      } else {
        return profileResult;
      }
    } catch (error) {
      console.error('Error refrescando datos del usuario:', error);
      return {
        success: false,
        error: 'Error al actualizar datos del usuario',
      };
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
