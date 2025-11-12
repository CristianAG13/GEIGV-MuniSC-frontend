import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import usersService from '@/services/usersService';

/**
 * Hook personalizado para obtener la información completa del usuario actual
 * desde el endpoint /users/me
 * 
 * @returns {Object} { currentUser, loading, error }
 * - currentUser: Objeto con los datos completos del usuario (id, name, lastname, email, roles)
 * - loading: Boolean indicando si está cargando
 * - error: String con mensaje de error si ocurrió alguno
 */
export function useCurrentUser() {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Llamar al endpoint /users/me para obtener datos completos
        const userData = await usersService.getMe();

        if (isMounted) {
          console.log('✅ useCurrentUser: Datos del usuario obtenidos', userData);
          setCurrentUser(userData);
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ useCurrentUser: Error al obtener usuario', err);
          setError(err.message || 'Error al obtener información del usuario');
          
          // Fallback: usar datos básicos del contexto
          setCurrentUser({
            id: user.id,
            name: user.name,
            lastname: user.last || user.lastname,
            email: user.email,
            roles: user.roles
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { currentUser, loading, error };
}

/**
 * Hook para obtener el ID del usuario actual y usarlo como "encargado" en formularios
 * 
 * @returns {Object} { userId, userFullName, loading, error }
 */
export function useCurrentUserAsOperator() {
  const { currentUser, loading, error } = useCurrentUser();

  return {
    userId: currentUser?.id || null,
    userFullName: currentUser 
      ? `${currentUser.name} ${currentUser.lastname || ''}`.trim() 
      : null,
    userEmail: currentUser?.email || null,
    loading,
    error
  };
}
