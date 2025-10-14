// hooks/useAuditLogger.js
import React, { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import auditService from '../services/auditService';

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
  
  console.log('🇨🇷 Timestamp Costa Rica generado:', {
    horaUTC: now.toISOString(),
    horaCostaRica: costaRicaISO,
    horaLegible: `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`
  });
  
  return costaRicaISO;
};

/**
 * Hook personalizado para registrar eventos de auditoría
 * Simplifica el proceso de logging en los componentes
 */
export const useAuditLogger = () => {
  const { user } = useAuth();
  
  // Cache para evitar logs duplicados
  const recentLogs = React.useRef(new Map());

  /**
   * Registra un evento de auditoría de manera genérica
   */
  const logAuditEvent = useCallback(async (auditData) => {
    if (!user) {
      console.warn('No user logged in, skipping audit log');
      return { success: false, error: 'No user logged in' };
    }

    // Crear una clave única para identificar logs duplicados (más específica)
    const logKey = `${auditData.action}-${auditData.entity}-${auditData.entityId}-${user.id}-${auditData.description}`;
    const now = Date.now();
    
    // Verificar si ya se envió un log similar en los últimos 10 segundos
    if (recentLogs.current.has(logKey)) {
      const lastTime = recentLogs.current.get(logKey);
      if (now - lastTime < 10000) { // 10 segundos
        console.warn('🚫 Preventing duplicate audit log:', {
          key: logKey,
          timeSince: now - lastTime,
          user: user.email
        });
        return { success: true, note: 'Duplicate prevented' };
      }
    }
    
    // Log para debug temporal
    console.log('📤 Sending audit log:', {
      action: auditData.action,
      entity: auditData.entity,
      entityId: auditData.entityId,
      user: user.email,
      userName: `${user.name} ${user.lastname}`,
      description: auditData.description
    });
    
    // Actualizar el cache
    recentLogs.current.set(logKey, now);
    
    // Limpiar logs antiguos del cache
    for (const [key, time] of recentLogs.current.entries()) {
      if (now - time > 30000) { // 30 segundos
        recentLogs.current.delete(key);
      }
    }

    try {
      const result = await auditService.logEvent({
        ...auditData,
        userId: user.id,
        userEmail: user.email,
        userName: `${user.name} ${user.lastname}`,
        userRoles: user.roles || []
      });
      
      if (!result.success) {
        console.warn('Failed to log audit event:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error in audit logger:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  /**
   * Registra la creación de una entidad
   */
  const logCreate = useCallback(async (entity, entityData, customDescription = null) => {
    const entityId = entityData?.id || entityData?._id || 'unknown';
    const entityName = entityData?.nombre || entityData?.name || entityData?.titulo || '';
    
    const description = customDescription || auditService.formatChangeDescription('CREATE', entity, entityName);
    
    const result = await logAuditEvent({
      action: 'CREAR',
      entity,
      entityId: entityId.toString(),
      changes: {
        before: null,
        after: entityData
      },
      description,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.pathname
      }
    });
    
    return result;
  }, [logAuditEvent, user]);

  /**
   * Registra la actualización de una entidad
   */
  const logUpdate = useCallback(async (entity, entityId, beforeData, afterData, customDescription = null) => {
    const entityName = afterData?.nombre || afterData?.name || afterData?.titulo || beforeData?.nombre || beforeData?.name || beforeData?.titulo || '';
    
    const description = customDescription || auditService.formatChangeDescription('UPDATE', entity, entityName);
    
    return await logAuditEvent({
      action: 'ACTUALIZAR',
      entity,
      entityId: entityId.toString(),
      changes: {
        before: beforeData,
        after: afterData
      },
      description,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.pathname
      }
    });
  }, [logAuditEvent]);

  /**
   * Registra la eliminación de una entidad
   */
  const logDelete = useCallback(async (entity, entityId, entityData, customDescription = null) => {
    const entityName = entityData?.nombre || entityData?.name || entityData?.titulo || '';
    
    const description = customDescription || auditService.formatChangeDescription('DELETE', entity, entityName);
    
    return await logAuditEvent({
      action: 'ELIMINAR',
      entity,
      entityId: entityId.toString(),
      changes: {
        before: entityData,
        after: null
      },
      description,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.pathname
      }
    });
  }, [logAuditEvent]);

  /**
   * Registra la restauración de una entidad
   */
  const logRestore = useCallback(async (entity, entityId, entityData, customDescription = null) => {
    const entityName = entityData?.nombre || entityData?.name || entityData?.titulo || '';
    
    const description = customDescription || auditService.formatChangeDescription('RESTORE', entity, entityName);
    
    return await logAuditEvent({
      action: 'RESTAURAR',
      entity,
      entityId: entityId.toString(),
      changes: {
        before: null,
        after: entityData
      },
      description,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.pathname
      }
    });
  }, [logAuditEvent]);

  /**
   * Registra eventos específicos del sistema
   */
  const logSystemEvent = useCallback(async (eventType, description, metadata = {}) => {
    return await logAuditEvent({
      action: 'SYSTEM',
      entity: 'system',
      entityId: 'system',
      changes: null,
      description,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        eventType,
        userAgent: navigator.userAgent,
        url: window.location.pathname,
        ...metadata
      }
    });
  }, [logAuditEvent]);

  /**
   * Registra eventos de autenticación
   */
  const logAuthEvent = useCallback(async (eventType, details = {}) => {
    const descriptions = {
      login: 'Usuario inició sesión',
      logout: 'Usuario cerró sesión',
      failed_login: 'Intento de inicio de sesión fallido',
      password_reset: 'Usuario solicitó restablecimiento de contraseña',
      password_changed: 'Usuario cambió su contraseña',
      profile_updated: 'Usuario actualizó su perfil'
    };

    const description = descriptions[eventType] || `Evento de autenticación: ${eventType}`;

    return await logAuditEvent({
      action: 'AUTH',
      entity: 'authentication',
      entityId: user?.id?.toString() || 'unknown',
      changes: null,
      description,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        eventType,
        userAgent: navigator.userAgent,
        url: window.location.pathname,
        ip: details.ip || 'unknown',
        ...details
      }
    });
  }, [logAuditEvent, user]);

  /**
   * Registra cambios en roles y permisos
   */
  const logRoleChange = useCallback(async (targetUserId, roleChange, performedBy = null) => {
    const description = `Se ${roleChange.action === 'granted' ? 'otorgó' : 'revocó'} el rol "${roleChange.roleName}" ${roleChange.action === 'granted' ? 'a' : 'de'} usuario`;

    return await logAuditEvent({
      action: 'ROLE_CHANGE',
      entity: 'user_roles',
      entityId: targetUserId.toString(),
      changes: {
        before: roleChange.beforeRoles,
        after: roleChange.afterRoles
      },
      description,
      metadata: {
        timestamp: getCostaRicaTimestamp(),
        performedBy: performedBy || user?.id,
        roleAction: roleChange.action,
        roleName: roleChange.roleName,
        userAgent: navigator.userAgent,
        url: window.location.pathname
      }
    });
  }, [logAuditEvent, user]);

  /**
   * Wrapper para operaciones CRUD que registra automáticamente
   */
  const withAuditLog = useCallback((operation) => {
    return async (...args) => {
      try {
        const result = await operation(...args);
        // El logging se debe hacer en el componente específico
        // después de confirmar que la operación fue exitosa
        return result;
      } catch (error) {
        // Registrar errores críticos
        await logSystemEvent('error', `Error en operación: ${error.message}`, {
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    };
  }, [logSystemEvent]);

  /**
   * Utilidad para comparar objetos y obtener cambios
   */
  const getChangedFields = useCallback((beforeData, afterData) => {
    const changes = {};
    const allKeys = new Set([
      ...Object.keys(beforeData || {}),
      ...Object.keys(afterData || {})
    ]);

    allKeys.forEach(key => {
      const before = beforeData?.[key];
      const after = afterData?.[key];
      
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        changes[key] = {
          before,
          after
        };
      }
    });

    return changes;
  }, []);

  return {
    // Métodos principales
    logCreate,
    logUpdate,
    logDelete,
    logRestore,
    logAuditEvent,
    
    // Métodos específicos
    logSystemEvent,
    logAuthEvent,
    logRoleChange,
    
    // Utilidades
    withAuditLog,
    getChangedFields,
    
    // Estado
    isLoggingEnabled: !!user,
    currentUser: user
  };
};

export default useAuditLogger;