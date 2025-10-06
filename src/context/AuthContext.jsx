

// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';
import auditService from '../services/auditService.js';
import { clearNavigationCache } from '@/utils/refreshNavigation.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la aplicación
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser(currentUser);
      // Opcionalmente, refrescar datos del usuario desde el backend
      refreshUserFromBackend();
    }
    setLoading(false);
  }, []);


const refreshUserFromBackend = async () => {
  try {
    const result = await authService.refreshUserData();
    if (result.success) {
      const normalizedUser = {
        ...result.data,
        roles: result.data.roles?.map(r => r.name || r) || []
      };
      setUser(normalizedUser);
      console.log('Usuario actualizado:', normalizedUser); // Para debug
    }
  } catch (error) {
    console.error('Error refreshing user data:', error);
  }
};
  

  const login = async (email, password) => {
  setLoading(true);
  try {
    const result = await authService.login(email, password);
    
    if (result.success) {
      const normalizedUser = {
        ...result.data.user,
        roles: result.data.user?.roles?.map(r => r.name || r) || []
      };
      setUser(normalizedUser);
      
      // ✅ REGISTRAR LOGIN EN AUDITORÍA
      try {
        await auditService.logEvent({
          action: 'AUTH',
          entity: 'authentication',
          entityId: normalizedUser.id?.toString() || 'unknown',
          userId: normalizedUser.id,
          userEmail: normalizedUser.email,
          userRoles: normalizedUser.roles,
          description: `Usuario ${normalizedUser.email} inició sesión exitosamente`,
          changes: null,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.pathname,
            eventType: 'login_success'
          }
        });
      } catch (auditError) {
        console.warn('Error registrando login en auditoría:', auditError);
      }
      
      // Limpiar cualquier configuración de navegación cacheada
      clearNavigationCache();
      
      return { success: true };
    } else {
      // ✅ REGISTRAR INTENTO FALLIDO EN AUDITORÍA
      try {
        await auditService.logEvent({
          action: 'AUTH',
          entity: 'authentication',
          entityId: 'unknown',
          description: `Intento de login fallido para ${email}`,
          changes: null,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.pathname,
            eventType: 'login_failed',
            attemptedEmail: email,
            errorReason: result.error
          }
        });
      } catch (auditError) {
        console.warn('Error registrando intento fallido en auditoría:', auditError);
      }
      
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error: 'Error inesperado al iniciar sesión' };
  } finally {
    setLoading(false);
  }
};


 const logout = () => {
  // ✅ REGISTRAR LOGOUT EN AUDITORÍA ANTES DE LIMPIAR USUARIO
  if (user) {
    try {
      auditService.logEvent({
        action: 'AUTH',
        entity: 'authentication',
        entityId: user.id?.toString() || 'unknown',
        userId: user.id,
        userEmail: user.email,
        userRoles: user.roles,
        description: `Usuario ${user.email} cerró sesión`,
        changes: null,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.pathname,
          eventType: 'logout'
        }
      });
    } catch (auditError) {
      console.warn('Error registrando logout en auditoría:', auditError);
    }
  }
  
  authService.logout();
  setUser(null);
  // Asegurarse de limpiar cualquier configuración de navegación cacheada
  clearNavigationCache();
  window.location.href = '/login';
};

  // Función para actualizar los datos del usuario (útil cuando un admin cambia el rol)
  const refreshUser = async () => {
    try {
      const result = await authService.refreshUserData();
      if (result.success) {
        setUser(result.data);
        // Limpiar cualquier configuración de navegación cacheada para que se actualice con los nuevos roles
        clearNavigationCache();
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

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: authService.isAuthenticated(),
    refreshUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};