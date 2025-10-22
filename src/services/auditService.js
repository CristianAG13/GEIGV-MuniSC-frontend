// services/auditService.js
import apiClient from '../config/api.js';

/**
 * Función utilitaria para obtener timestamp en hora de Costa Rica
 */
const getCostaRicaTimestamp = () => {
  const now = new Date();
  
  // Crear directamente una fecha con la hora de Costa Rica
  // Usando el offset de Costa Rica (-6 horas de UTC)
  const costaRicaOffset = -6 * 60; // -6 horas en minutos
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const costaRicaTime = new Date(utc + (costaRicaOffset * 60000));
  
  // Formatear manualmente para asegurar que sea correcto
  const year = costaRicaTime.getFullYear();
  const month = String(costaRicaTime.getMonth() + 1).padStart(2, '0');
  const day = String(costaRicaTime.getDate()).padStart(2, '0');
  const hours = String(costaRicaTime.getHours()).padStart(2, '0');
  const minutes = String(costaRicaTime.getMinutes()).padStart(2, '0');
  const seconds = String(costaRicaTime.getSeconds()).padStart(2, '0');
  const milliseconds = String(costaRicaTime.getMilliseconds()).padStart(3, '0');
  
  const costaRicaISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  
  return costaRicaISO;
};

const auditService = {

  getSimulatedAuditLogs: (filters = {}) => {
    // Función para generar datos simulados más dinámicamente
    const generateMockData = () => {
      const users = [
        { id: 'user123', name: 'Juan Carlos', lastname: 'Pérez González', email: 'juan.perez@municipalidad.go.cr', cedula: '123456789' },
        { id: 'user456', name: 'María Elena', lastname: 'García Rodríguez', email: 'maria.garcia@municipalidad.go.cr', cedula: '987654321' },
        { id: 'user789', name: 'Carlos Antonio', lastname: 'López Vargas', email: 'carlos.lopez@municipalidad.go.cr', cedula: '456789123' },
        { id: 'user890', name: 'Ana Patricia', lastname: 'Rodríguez Morales', email: 'ana.rodriguez@municipalidad.go.cr', cedula: '789123456' },
        { id: 'user234', name: 'Luis Fernando', lastname: 'Ramírez Jiménez', email: 'luis.ramirez@municipalidad.go.cr', cedula: '234567890' }
      ];

      const actions = ['CREATE', 'UPDATE', 'DELETE', 'AUTH', 'RESTORE'];
      const entities = ['transporte', 'operadores', 'maquinaria', 'reportes', 'fuentes', 'user_roles', 'authentication'];
      
      const logs = [];
      
      // Generar logs variados
      for (let i = 1; i <= 15; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const entity = entities[Math.floor(Math.random() * entities.length)];
        
        logs.push({
          id: i.toString(),
          action,
          entity,
          entityId: entity === 'authentication' ? null : `${entity}-${i}`,
          userId: user.id,
          userName: `${user.name} ${user.lastname}`,
          name: user.name,
          lastname: user.lastname,
          userFullName: `${user.name} ${user.lastname}`,
          userEmail: user.email,
          userCedula: user.cedula,
          description: `Se ${action.toLowerCase()} ${entity}`,
          timestamp: new Date(Date.now() - 1000 * 60 * (i * 30)).toISOString(),
          changes: {
            before: action === 'CREATE' ? null : { estado: 'anterior' },
            after: action === 'DELETE' ? null : { estado: 'nuevo' }
          },
          metadata: { userAgent: 'Mozilla/5.0...', ip: `192.168.1.${100 + i}` }
        });
      }
      
      return logs;
    };

    const simulatedLogs = generateMockData();

    // Aplicar filtros a los datos simulados
    let filteredLogs = simulatedLogs;
    
    // Filtro por email
    if (filters.userEmail || filters.email) {
      const emailSearch = (filters.userEmail || filters.email).toLowerCase();
      filteredLogs = filteredLogs.filter(log => {
        const userEmail = (log.userEmail || log.email || '').toLowerCase();
        return userEmail.includes(emailSearch);
      });
    }
    
    // Filtro por entidad
    if (filters.entity && filters.entity !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.entity === filters.entity);
    }
    
    // Filtro por acción
    if (filters.action && filters.action !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    return {
      success: true,
      data: {
        logs: filteredLogs,
        currentPage: 1,
        totalPages: 1,
        total: filteredLogs.length,
        limit: 50
      }
    };
  },

  /**
   * Genera estadísticas simuladas para demostrar la funcionalidad
   */
  getSimulatedAuditStats: () => {
    return {
      success: true,
      data: {
        totalEvents: 87,
        eventsByAction: {
          CREATE: 22,
          UPDATE: 35,
          DELETE: 12,
          AUTH: 15,
          ROLE_CHANGE: 3
        },
        eventsByEntity: {
          operadores: 25,
          transporte: 20,
          fuentes: 18,
          maquinaria: 15,
          reportes: 14,
          user_roles: 8,
          authentication: 15
        },
        recentActivity: {
          last24Hours: 12,
          last7Days: 45,
          last30Days: 87
        },
        topUsers: [
          { userId: 'user456', userName: 'María García', eventCount: 18, userEmail: 'maria.garcia@municipalidad.go.cr' },
          { userId: 'user123', userName: 'Juan Pérez', eventCount: 15, userEmail: 'juan.perez@municipalidad.go.cr' },
          { userId: 'user789', userName: 'Carlos López', eventCount: 12, userEmail: 'carlos.lopez@municipalidad.go.cr' },
          { userId: 'user890', userName: 'Ana Rodríguez', eventCount: 10, userEmail: 'ana.rodriguez@municipalidad.go.cr' },
          { userId: 'user234', userName: 'Luis Ramírez', eventCount: 8, userEmail: 'luis.ramirez@municipalidad.go.cr' }
        ]
      }
    };
  },

  // ===== REGISTRO DE EVENTOS DE AUDITORÍA =====
  
  /**
   * Registra un evento de auditoría
   * @param {Object} auditData - Datos del evento de auditoría
   * @param {string} auditData.action - Tipo de acción (CREATE, UPDATE, DELETE)
   * @param {string} auditData.entity - Entidad afectada (usuarios, transporte, operadores, etc.)
   * @param {string} auditData.entityId - ID de la entidad afectada
   * @param {Object} auditData.changes - Cambios realizados (antes y después)
   * @param {string} auditData.description - Descripción del cambio
   * @param {Object} auditData.metadata - Metadatos adicionales
   */
  logEvent: async (auditData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Agregar timestamp único para evitar duplicados en el backend
      const enrichedData = {
        ...auditData,
        clientTimestamp: Date.now(),
        source: 'frontend'
      };
      
      const response = await apiClient.post('/audit/log', enrichedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Audit-Source': 'frontend'
        }
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error logging audit event:', error);
      console.error('📋 Detalles del error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      // No lanzamos error para que no afecte la operación principal
      return { success: false, error: error.response?.data?.message || 'Error al registrar evento de auditoría' };
    }
  },

  /**
   * Registra un evento de creación
   */
  logCreate: async (entity, entityId, newData, description = '') => {
    return await auditService.logEvent({
      action: 'CREATE',
      entity,
      entityId: entityId?.toString(),
      changes: {
        before: null,
        after: newData
      },
      description: description || `Se creó un nuevo ${entity}`,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        userAgent: navigator.userAgent
      }
    });
  },

  /**
   * Registra un evento de actualización
   */
  logUpdate: async (entity, entityId, beforeData, afterData, description = '') => {
    return await auditService.logEvent({
      action: 'UPDATE',
      entity,
      entityId: entityId?.toString(),
      changes: {
        before: beforeData,
        after: afterData
      },
      description: description || `Se actualizó ${entity}`,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        userAgent: navigator.userAgent
      }
    });
  },

  /**
   * Registra un evento de eliminación
   */
  logDelete: async (entity, entityId, deletedData, description = '') => {
    return await auditService.logEvent({
      action: 'DELETE',
      entity,
      entityId: entityId?.toString(),
      changes: {
        before: deletedData,
        after: null
      },
      description: description || `Se eliminó ${entity}`,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        userAgent: navigator.userAgent
      }
    });
  },

  // ===== CONSULTA DE LOGS DE AUDITORÍA =====

  /**
   * Obtiene todos los logs de auditoría con filtros opcionales
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.startDate - Fecha de inicio (ISO string)
   * @param {string} filters.endDate - Fecha final (ISO string)
   * @param {string} filters.entity - Filtrar por entidad
   * @param {string} filters.action - Filtrar por acción
   * @param {string} filters.userId - Filtrar por usuario
   * @param {number} filters.page - Página (para paginación)
   * @param {number} filters.limit - Límite de resultados por página
   */
  getAuditLogs: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      // Determinar qué endpoint usar según los filtros disponibles
      let endpoint = '/audit/logs';
      let cleanFilters = {};
      let useSpecialEndpoint = false;
      
      // Filtrar parámetros vacíos para evitar errores de validación del backend
      Object.entries(filters).forEach(([key, value]) => {
        // Siempre incluir page y limit para paginación
        if (key === 'page' || key === 'limit') {
          cleanFilters[key] = parseInt(value) || (key === 'page' ? 1 : 50);
          return;
        }
        
        // Para otros filtros, validar que tengan contenido significativo
        if (value !== '' && value !== null && value !== undefined) {
          const stringValue = String(value).trim();
          if (stringValue !== '' && stringValue !== 'all') {
            // Para fechas, agregar validación adicional
            if (key === 'startDate' || key === 'endDate') {
              const dateValue = new Date(stringValue);
              if (!isNaN(dateValue.getTime())) {
                cleanFilters[key] = stringValue;
              }
            } else {
              cleanFilters[key] = stringValue;
            }
          }
        }
      });
      
      // Usar endpoint base para todos los filtros
      endpoint = '/audit/logs';
      
      const response = await apiClient.get(endpoint, {
        params: cleanFilters,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Verificar si el backend devuelve "PRO FEATURE ONLY" (modo demo)
      if (response.data === 'PRO FEATURE ONLY' || 
          (typeof response.data === 'string' && response.data.includes('PRO FEATURE'))) {
        console.warn('🚨 Backend en modo PRO FEATURE ONLY. Mostrando datos simulados.');
        const simulatedData = auditService.getSimulatedAuditLogs(filters);
        return simulatedData;
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      
      // Detectar si es un error de conexión (backend no disponible)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('🚨 Backend no disponible. Mostrando datos simulados.');
        const simulatedData = auditService.getSimulatedAuditLogs(filters);
        return simulatedData;
      }
      

      
      throw new Error(error.response?.data?.message || 'Error al obtener logs de auditoría');
    }
  },

  /**
   * Obtiene resumen de actividad de usuarios
   * GET /audit/users/activity-summary
   */
  getUsersActivitySummary: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      // Filtrar parámetros vacíos
      const cleanFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined && String(value).trim() !== '') {
          cleanFilters[key] = value;
        }
      });

      const response = await apiClient.get('/audit/users/activity-summary', {
        params: cleanFilters,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching users activity summary:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener resumen de actividad de usuarios');
    }
  },

  /**
   * Obtiene estadísticas de auditoría
   */
  getAuditStats: async (dateRange = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      // Filtrar parámetros vacíos para evitar errores de validación del backend
      const cleanFilters = {};
      Object.entries(dateRange).forEach(([key, value]) => {
        // Solo incluir valores que no sean vacíos, null, undefined o cadenas vacías
        if (value !== '' && value !== null && value !== undefined && String(value).trim() !== '') {
          cleanFilters[key] = value;
        }
      });

      
      const response = await apiClient.get('/audit/stats', {
        params: cleanFilters,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Verificar si el backend devuelve "PRO FEATURE ONLY" (modo demo)
      if (response.data === 'PRO FEATURE ONLY' || 
          (typeof response.data === 'string' && response.data.includes('PRO FEATURE'))) {
        console.warn('🚨 Backend en modo PRO FEATURE ONLY para stats. Mostrando estadísticas simuladas.');
        return auditService.getSimulatedAuditStats();
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      
      // Detectar si es un error de conexión (backend no disponible)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('🚨 Backend no disponible. Mostrando estadísticas simuladas para demostración.');
        // Retornar estadísticas simuladas
        return auditService.getSimulatedAuditStats();
      }
      
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas de auditoría');
    }
  },

  /**
   * Obtiene logs de auditoría por entidad específica
   */
  getAuditLogsByEntity: async (entity, entityId, limit = 50) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get(`/audit/logs/entity/${entity}/${entityId}`, {
        params: { limit },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener logs de la entidad');
    }
  },

  /**
   * Obtiene logs de auditoría por usuario
   */
  getAuditLogsByUser: async (userId, limit = 50) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get(`/audit/logs/user/${userId}`, {
        params: { limit },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener logs del usuario');
    }
  },

  /**
   * Exporta logs de auditoría a CSV
   */
  exportAuditLogs: async (filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      // Filtrar parámetros vacíos para evitar errores de validación del backend
      const cleanFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        // Solo incluir valores que no sean vacíos, null, undefined o cadenas vacías
        if (value !== '' && value !== null && value !== undefined && String(value).trim() !== '') {
          cleanFilters[key] = value;
        }
      });

      
      const response = await apiClient.get('/audit/export', {
        params: { ...cleanFilters, format: 'csv' },
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Crear y descargar el archivo
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar logs de auditoría');
    }
  },

  // ===== FUNCIONES DE UTILIDAD =====

  /**
   * Formatea la descripción de un cambio
   */
  formatChangeDescription: (action, entity, entityName = '') => {
    const actions = {
      CREATE: 'creó',
      UPDATE: 'actualizó',
      DELETE: 'eliminó',
      RESTORE: 'restauró',
      CREAR: 'creó',
      ACTUALIZAR: 'actualizó',
      ELIMINAR: 'eliminó',
      RESTAURAR: 'restauró',
      AUTH: 'autenticó',
      AUTH: 'autenticó'
    };
    
    const entities = {
      usuarios: 'usuario',
      transporte: 'vehículo',
      operadores: 'operador',
      reportes: 'reporte',
      roles: 'rol',
      solicitudes: 'solicitud'
    };
    
    const actionText = actions[action] || action.toLowerCase();
    const entityText = entities[entity] || entity;
    const nameText = entityName ? ` "${entityName}"` : '';
    
    return `Se ${actionText} el ${entityText}${nameText}`;
  },

  /**
   * Obtiene el color de la acción para la UI
   */
  getActionColor: (action) => {
    const colors = {
      CREATE: 'text-green-600 bg-green-50',
      UPDATE: 'text-blue-600 bg-blue-50',
      DELETE: 'text-red-600 bg-red-50',
      RESTORE: 'text-yellow-600 bg-yellow-50',
      CREAR: 'text-green-600 bg-green-50',
      ACTUALIZAR: 'text-blue-600 bg-blue-50',
      ELIMINAR: 'text-red-600 bg-red-50',
      RESTAURAR: 'text-yellow-600 bg-yellow-50',
      AUTH: 'text-purple-600 bg-purple-50',
      AUTH: 'text-purple-600 bg-purple-50'
    };
    return colors[action] || 'text-gray-600 bg-gray-50';
  },

  /**
   * Obtiene el ícono de la acción
   */
  getActionIcon: (action) => {
    const icons = {
      CREATE: 'plus-circle',
      UPDATE: 'edit-3',
      DELETE: 'trash-2',
      RESTORE: 'refresh-cw',
      CREAR: 'plus-circle',
      ACTUALIZAR: 'edit-3',
      ELIMINAR: 'trash-2',
      RESTAURAR: 'refresh-cw',
      AUTH: 'log-in',
      AUTH: 'log-in'
    };
    return icons[action] || 'activity';
  },

  /**
   * Verifica si el usuario actual es superadmin
   */
  isSuperAdmin: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      
      const user = JSON.parse(userStr);
      return user.roles && user.roles.includes('superadmin');
    } catch (error) {
      console.error('Error checking superadmin status:', error);
      return false;
    }
  },

  /**
   * Obtiene información de cambios detallada
   */
  getChangeDetails: (changes) => {
    if (!changes) return null;
    
    const { before, after } = changes;
    const details = [];
    
    if (!before && after) {
      // Creación
      Object.keys(after).forEach(key => {
        if (after[key] !== null && after[key] !== undefined) {
          details.push({
            field: key,
            type: 'created',
            value: after[key]
          });
        }
      });
    } else if (before && !after) {
      // Eliminación
      Object.keys(before).forEach(key => {
        if (before[key] !== null && before[key] !== undefined) {
          details.push({
            field: key,
            type: 'deleted',
            value: before[key]
          });
        }
      });
    } else if (before && after) {
      // Actualización
      const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
      allKeys.forEach(key => {
        if (before[key] !== after[key]) {
          details.push({
            field: key,
            type: 'updated',
            oldValue: before[key],
            newValue: after[key]
          });
        }
      });
    }
    
    return details;
  }
};

export default auditService;