// utils/permissions.js

/**
 * Sistema de permisos basado en roles
 * Según especificación del backend
 */

/**
 * Verifica si el usuario tiene un rol específico
 */
export const hasRole = (user, roleNames) => {
  if (!user || !user.roles) return false;
  
  const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
  const roleNamesToCheck = Array.isArray(roleNames) ? roleNames : [roleNames];
  
  return roleNamesToCheck.some(roleName => {
    return userRoles.some(userRole => {
      // Si es objeto con name
      if (typeof userRole === 'object' && userRole.name) {
        return userRole.name.toLowerCase() === roleName.toLowerCase();
      }
      // Si es string directo
      return String(userRole).toLowerCase() === roleName.toLowerCase();
    });
  });
};

/**
 * Obtiene el nombre del rol principal del usuario
 */
export const getUserRole = (user) => {
  if (!user || !user.roles) return null;
  
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
  const firstRole = roles[0];
  
  if (typeof firstRole === 'object' && firstRole.name) {
    return firstRole.name.toLowerCase();
  }
  
  return String(firstRole).toLowerCase();
};

/**
 * Permisos de funcionalidades según la tabla
 * 
 * Funcionalidad          | superadmin | ingeniero | inspector | operario | invitado
 * -----------------------|------------|-----------|-----------|----------|----------
 * Gestionar usuarios     | ✅         | ❌        | ❌        | ❌       | ❌
 * Gestionar roles        | ✅         | ❌        | ❌        | ❌       | ❌
 * Aprobar solicitudes    | ✅         | ❌        | ❌        | ❌       | ❌
 * Ver/editar operadores  | ✅         | ❌        | ❌        | Ver prop.| ❌
 * Gestionar maquinaria   | ✅         | ❌        | ❌        | ❌       | ❌
 * Crear/editar reportes  | ✅         | ✅        | ✅        | Solo prop| ❌
 * Ver reportes eliminados| ✅         | ❌        | ❌        | ❌       | ❌
 * Restaurar reportes     | ✅         | ❌        | ❌        | ❌       | ❌
 * Ver resúmenes          | ✅         | ❌        | ❌        | ❌       | ❌
 * Ver auditoría          | ✅         | ✅        | ✅        | ❌       | ❌
 * Gestionar auditoría    | ✅         | ❌        | ❌        | ❌       | ❌
 */

// ============ USUARIOS ============
export const canManageUsers = (user) => {
  return hasRole(user, 'superadmin');
};

// ============ ROLES ============
export const canManageRoles = (user) => {
  return hasRole(user, 'superadmin');
};

// ============ SOLICITUDES ============
export const canApproveRequests = (user) => {
  return hasRole(user, 'superadmin');
};

// ============ OPERADORES ============
export const canViewOperators = (user) => {
  return hasRole(user, ['superadmin', 'operario']);
};

export const canEditOperators = (user) => {
  return hasRole(user, 'superadmin');
};

export const canViewOwnOperator = (user) => {
  return hasRole(user, 'operario');
};

// ============ MAQUINARIA (CATÁLOGO) ============
export const canManageMachinery = (user) => {
  return hasRole(user, 'superadmin');
};

export const canViewMachineryCatalog = (user) => {
  return hasRole(user, ['superadmin', 'ingeniero', 'inspector']);
};

// ============ REPORTES ============
export const canCreateReports = (user) => {
  return hasRole(user, ['superadmin', 'ingeniero', 'inspector', 'operario']);
};

export const canEditReports = (user, report) => {
  const role = getUserRole(user);
  
  // Superadmin, ingeniero, inspector pueden editar cualquier reporte
  if (hasRole(user, ['superadmin', 'ingeniero', 'inspector'])) {
    return true;
  }
  
  // Operario solo puede editar sus propios reportes
  if (hasRole(user, 'operario')) {
    return report?.operadorId === user?.operatorId || 
           report?.operador?.userId === user?.id;
  }
  
  return false;
};

export const canDeleteReports = (user, report) => {
  const role = getUserRole(user);
  
  // Superadmin, ingeniero, inspector pueden eliminar cualquier reporte
  if (hasRole(user, ['superadmin', 'ingeniero', 'inspector'])) {
    return true;
  }
  
  // Operario solo puede eliminar sus propios reportes
  if (hasRole(user, 'operario')) {
    return report?.operadorId === user?.operatorId || 
           report?.operador?.userId === user?.id;
  }
  
  return false;
};

export const canViewDeletedReports = (user) => {
  return hasRole(user, 'superadmin');
};

export const canRestoreReports = (user) => {
  return hasRole(user, 'superadmin');
};

// ============ REPORTES DE ALQUILER ============
export const canCreateRentalReports = (user) => {
  return hasRole(user, ['superadmin', 'ingeniero', 'inspector']);
};

export const canEditRentalReports = (user) => {
  return hasRole(user, ['superadmin', 'ingeniero', 'inspector']);
};

// ============ RESÚMENES ============
export const canViewSummaries = (user) => {
  return hasRole(user, 'superadmin');
};

// ============ AUDITORÍA ============
export const canViewAudit = (user) => {
  return hasRole(user, ['superadmin', 'ingeniero', 'inspector']);
};

export const canManageAudit = (user) => {
  return hasRole(user, 'superadmin');
};

// ============ EXPORTACIÓN ============
export const canExportData = (user) => {
  // Todos pueden exportar datos que pueden ver
  return hasRole(user, ['superadmin', 'ingeniero', 'inspector', 'operario']);
};

// ============ HELPER PARA FILTRAR REPORTES ============
export const filterReportsByPermission = (user, reports) => {
  if (!reports || !Array.isArray(reports)) return [];
  
  // Superadmin, ingeniero, inspector ven todos los reportes
  if (hasRole(user, ['superadmin', 'ingeniero', 'inspector'])) {
    return reports;
  }
  
  // Operario solo ve sus propios reportes
  if (hasRole(user, 'operario') && user?.id) {
    return reports.filter(report => 
      report?.operador?.userId === user.id || 
      report?.operadorId === user?.operatorId
    );
  }
  
  // Otros roles no ven reportes
  return [];
};

export default {
  hasRole,
  getUserRole,
  canManageUsers,
  canManageRoles,
  canApproveRequests,
  canViewOperators,
  canEditOperators,
  canViewOwnOperator,
  canManageMachinery,
  canViewMachineryCatalog,
  canCreateReports,
  canEditReports,
  canDeleteReports,
  canViewDeletedReports,
  canRestoreReports,
  canCreateRentalReports,
  canEditRentalReports,
  canViewSummaries,
  canViewAudit,
  canManageAudit,
  canExportData,
  filterReportsByPermission,
};
