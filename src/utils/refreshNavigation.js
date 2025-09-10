/**
 * Utilidad para refrescar la navegación y configuración del sidebar
 * cuando se han realizado cambios en la estructura del menú
 */

import { getFilteredSidebarByCategory } from '@/config/navigation';

/**
 * Fuerza una actualización de la configuración del sidebar en localStorage
 * @param {Object} user - El objeto de usuario actual
 * @returns {boolean} - true si se actualizó correctamente
 */
export function refreshNavigationConfig(user = null) {
  try {
    if (!user) {
      // Intentar obtener el usuario del localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        console.warn('No se puede refrescar la navegación: no hay usuario');
        return false;
      }
      
      try {
        user = JSON.parse(storedUser);
      } catch (err) {
        console.error('Error al parsear usuario del localStorage:', err);
        return false;
      }
    }

    // Determinar el rol del usuario (respetando las diferentes estructuras posibles)
    let userRole = null;
    if (user.rol) {
      userRole = user.rol;
    } else if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Tomar el primer rol no invitado si existe
      const nonGuestRoles = user.roles.filter(r => 
        typeof r === 'string' ? r !== 'invitado' : r.name !== 'invitado'
      );
      
      if (nonGuestRoles.length > 0) {
        userRole = typeof nonGuestRoles[0] === 'string' ? 
          nonGuestRoles[0] : nonGuestRoles[0].name;
      } else {
        // Si solo hay rol invitado, usarlo
        userRole = typeof user.roles[0] === 'string' ? 
          user.roles[0] : user.roles[0].name;
      }
    }

    // Regenerar la configuración del sidebar
    const sidebarConfig = getFilteredSidebarByCategory(userRole);
    
    // Almacenar la configuración actualizada (opcional, depende de tu implementación)
    // localStorage.setItem('sidebarConfig', JSON.stringify(sidebarConfig));
    
    // También puedes usar sessionStorage para una configuración temporal
    sessionStorage.setItem('refreshNavigation', 'true');
    
    console.log('Navegación actualizada correctamente');
    return true;
  } catch (error) {
    console.error('Error al refrescar la navegación:', error);
    return false;
  }
}

/**
 * Limpia cualquier configuración de navegación cacheada
 * Útil cuando se ha modificado la estructura de navegación
 */
export function clearNavigationCache() {
  try {
    // Eliminar cualquier configuración cacheada
    sessionStorage.removeItem('sidebarConfig');
    sessionStorage.removeItem('userPermissions');
    sessionStorage.setItem('navigationUpdated', Date.now().toString());
    
    console.log('Caché de navegación limpiada');
    return true;
  } catch (error) {
    console.error('Error al limpiar caché de navegación:', error);
    return false;
  }
}

export default {
  refreshNavigationConfig,
  clearNavigationCache
};
