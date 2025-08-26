import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la aplicación
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
      // Refrescar datos del usuario desde el backend para obtener roles actualizados
      refreshUserFromBackend();
    } else {
      // Si el token expiró o no existe, limpiar el estado
      authService.logout();
      setLoading(false);
    }

    // Configurar verificación periódica de expiración del token (cada 5 minutos)
    const tokenCheckInterval = setInterval(() => {
      if (!authService.isAuthenticated()) {
        setUser(null);
        console.log('Token expirado, cerrando sesión automáticamente');
      }
    }, 5 * 60 * 1000); // 5 minutos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  // Función para refrescar datos del usuario desde el backend
  const refreshUserFromBackend = async () => {
    try {
      const result = await authService.refreshUserData();
      if (result.success) {
        // Asegúrate de que incluya los roles
        setUser(result.data);
        console.log('Usuario actualizado desde backend:', result.data); // Para debug
      } else {
        console.warn('No se pudo refrescar datos del usuario:', result.error);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.data.user);
        console.log('Login exitoso, usuario establecido:', result.data.user);
        
        // Refrescar datos del usuario para asegurar que tenga todos los datos actualizados
        setTimeout(async () => {
          try {
            const refreshResult = await authService.refreshUserData();
            if (refreshResult.success) {
              setUser(refreshResult.data);
              console.log('Datos del usuario refrescados después del login:', refreshResult.data);
            }
          } catch (error) {
            console.warn('Error refrescando datos después del login:', error);
          }
        }, 100);
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error inesperado al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    window.location.href = '/login';
  };

  // Función para actualizar los datos del usuario (útil cuando un admin cambia el rol)
  const refreshUser = async () => {
    try {
      const result = await authService.refreshUserData();
      if (result.success) {
        setUser(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error al actualizar datos del usuario' };
    }
  };

  // Función para actualizar perfil del usuario
  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);
      if (result.success) {
        setUser(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error al actualizar perfil' };
    }
  };

  // Función para obtener información del token
  const getTokenInfo = () => {
    return {
      timeRemaining: authService.getTokenTimeRemaining(),
      isExpired: authService.isTokenExpired(),
    };
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    refreshUser,
    updateProfile,
    getTokenInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado - exportado al final
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Exportaciones al final del archivo
export { AuthProvider, useAuth };