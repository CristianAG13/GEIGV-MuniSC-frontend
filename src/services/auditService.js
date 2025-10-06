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
  
  console.log('🇨🇷 Timestamp Costa Rica generado (auditService):', {
    horaUTC: now.toISOString(),
    horaCostaRica: costaRicaISO,
    horaLegible: `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`
  });
  
  return costaRicaISO;
};

const auditService = {
  // ===== DATOS SIMULADOS PARA DEMO =====

  /**
   * Genera datos simulados para demostrar la funcionalidad cuando el backend no está disponible
   * 
   * Estructura esperada del backend para usuarios:
   * - name: string (255 caracteres)
   * - lastname: string (255 caracteres, nullable)
   * 
   * Los logs deben contener tanto name/lastname como campos de compatibilidad
   */
  getSimulatedAuditLogs: () => {
    const simulatedLogs = [
      {
        id: '1',
        action: 'AUTH',
        entity: 'authentication',
        entityId: null,
        userId: 'user123',
        userName: 'Juan Pérez',
        name: 'Juan Carlos',
        lastname: 'Pérez González',
        userFullName: 'Juan Carlos Pérez González',
        userCedula: '123456789',
        description: 'Usuario inició sesión en el sistema',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        changes: { before: null, after: { status: 'logged_in' } },
        metadata: { userAgent: 'Mozilla/5.0...', ip: '192.168.1.100' }
      },
      {
        id: '2',
        action: 'CREATE',
        entity: 'transporte',
        entityId: 'vehicle-001',
        userId: 'user456',
        userName: 'María García',
        name: 'María Elena',
        lastname: 'García Rodríguez',
        userFullName: 'María Elena García Rodríguez',
        userCedula: '987654321',
        description: 'Se creó un nuevo vehículo de transporte',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        changes: { 
          before: null, 
          after: { placa: 'ABC-123', tipo: 'Camión', estado: 'Activo' } 
        },
        metadata: { userAgent: 'Mozilla/5.0...', ip: '192.168.1.101' }
      },
      {
        id: '3',
        action: 'UPDATE',
        entity: 'operadores',
        entityId: 'op-789',
        userId: 'user789',
        userName: 'Carlos López',
        name: 'Carlos Antonio',
        lastname: 'López Vargas',
        userFullName: 'Carlos Antonio López Vargas',
        userCedula: '456789123',
        description: 'Se actualizó información del operador',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        changes: { 
          before: { nombre: 'Carlos Lopez', telefono: '123456789' }, 
          after: { nombre: 'Carlos López', telefono: '987654321' } 
        },
        metadata: { userAgent: 'Mozilla/5.0...', ip: '192.168.1.102' }
      },
      {
        id: '4',
        action: 'DELETE',
        entity: 'reportes',
        entityId: 'report-456',
        userId: 'user123',
        userName: 'Juan Pérez',
        name: 'Juan Carlos',
        lastname: 'Pérez González',
        userFullName: 'Juan Carlos Pérez González',
        userCedula: '123456789',
        description: 'Se eliminó un reporte de actividades',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        changes: { 
          before: { id: 'report-456', tipo: 'Mantenimiento', estado: 'Completado' }, 
          after: null 
        },
        metadata: { userAgent: 'Mozilla/5.0...', ip: '192.168.1.103' }
      },
      {
        id: '5',
        action: 'RESTORE',
        entity: 'reportes',
        entityId: 'report-789',
        userId: 'user890',
        userName: 'Ana Rodríguez',
        name: 'Ana Patricia',
        lastname: 'Rodríguez Morales',
        userFullName: 'Ana Patricia Rodríguez Morales',
        userCedula: '789123456',
        description: 'Se restauró un reporte eliminado',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        changes: { 
          before: null, 
          after: { id: 'report-789', tipo: 'Inspección', estado: 'Pendiente' } 
        },
        metadata: { userAgent: 'Mozilla/5.0...', ip: '192.168.1.104' }
      },
      {
        id: '6',
        action: 'CREATE',
        entity: 'operadores',
        entityId: 'op-456',
        userId: 'user234',
        userName: 'Luis Ramírez',
        name: 'Luis Fernando',
        lastname: 'Ramírez Jiménez',
        userFullName: 'Luis Fernando Ramírez Jiménez',
        userCedula: '234567890',
        description: 'Se registró un nuevo operador',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        changes: { 
          before: null, 
          after: { nombre: 'Luis Fernando', licencia: 'B2', estado: 'Activo' } 
        },
        metadata: { userAgent: 'Mozilla/5.0...', ip: '192.168.1.105' }
      }
    ];

    console.log('📋 Datos simulados generados con name/lastname:', simulatedLogs.map(log => ({
      id: log.id,
      name: log.name,
      lastname: log.lastname,
      hasNames: !!(log.name && log.lastname)
    })));

    return {
      success: true,
      data: {
        logs: simulatedLogs,
        currentPage: 1,
        totalPages: 1,
        total: simulatedLogs.length,
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
        totalEvents: 67,
        eventsByAction: {
          CREATE: 18,
          UPDATE: 25,
          DELETE: 9,
          AUTH: 12,
          ROLE_CHANGE: 3
        },
        eventsByEntity: {
          usuarios: 12,
          transporte: 15,
          operadores: 18,
          reportes: 14,
          roles: 3,
          authentication: 5
        },
        recentActivity: {
          last24Hours: 8,
          last7Days: 34,
          last30Days: 67
        },
        topUsers: [
          { userId: 'user123', userName: 'Juan Pérez', eventCount: 12 },
          { userId: 'user456', userName: 'María García', eventCount: 9 },
          { userId: 'user789', userName: 'Carlos López', eventCount: 7 }
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
    console.log('🚀 auditService.logEvent llamado con:', auditData);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token disponible:', !!token);
      
      console.log('📤 Enviando petición POST a /audit/log...');
      const response = await apiClient.post('/audit/log', auditData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Respuesta del backend:', response.data);
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
      
      // Filtrar parámetros vacíos para evitar errores de validación del backend
      const cleanFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        // Siempre incluir page y limit para paginación
        if (key === 'page' || key === 'limit') {
          cleanFilters[key] = value || (key === 'page' ? 1 : 50);
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
                console.log(`✅ Fecha ${key} válida:`, {
                  value: stringValue,
                  parsed: dateValue.toISOString(),
                  readable: dateValue.toLocaleString('es-CR')
                });
              } else {
                console.warn(`❌ Fecha ${key} inválida:`, stringValue);
              }
            } else {
              cleanFilters[key] = stringValue;
            }
          }
        }
      });
      
      // Logs de debug detallados
      console.log('🔍 AuditService - Filtros procesados:', {
        original: filters,
        cleaned: cleanFilters,
        params: new URLSearchParams(cleanFilters).toString(),
        url: `/audit/logs?${new URLSearchParams(cleanFilters).toString()}`
      });
      
      const response = await apiClient.get('/audit/logs', {
        params: cleanFilters,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('🎯 Respuesta del backend recibida:', {
        data: response.data,
        logs: response.data.data || response.data.logs || [],
        firstLog: (response.data.data || response.data.logs || [])[0]
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      
      // Detectar si es un error de conexión (backend no disponible)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('🚨 Backend no disponible. Mostrando datos simulados para demostración.');
        const simulatedData = auditService.getSimulatedAuditLogs();
        console.log('📊 Datos simulados generados:', simulatedData);
        return simulatedData;
      }
      
      throw new Error(error.response?.data?.message || 'Error al obtener logs de auditoría');
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
      RESTORE: 'restauró'
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
      RESTORE: 'text-yellow-600 bg-yellow-50'
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
      RESTORE: 'refresh-cw'
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