# Implementación de Auditoría en Todos los Módulos del Sistema

Esta guía muestra cómo integrar el sistema de auditoría en cada módulo existente del sistema de gestión vial.

## 1. Módulo de Usuarios

### Implementación en Dashboard.jsx

```jsx
// En src/pages/Dashboard.jsx
import { useAuditLogger } from '../hooks/useAuditLogger';

export default function Dashboard() {
  const { logCreate, logUpdate, logDelete, logRoleChange } = useAuditLogger();
  
  const handleSaveNewUser = async () => {
    try {
      // ... validaciones existentes ...
      
      // Crear el usuario
      const result = await usersService.createUser({
        name: newUser.name.trim(),
        lastname: newUser.lastname.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
      });

      if (result.success) {
        await loadData();
        setShowCreateModal(false);
        
        // ✅ REGISTRAR AUDITORÍA
        await logCreate('usuarios', result.data, 
          `Se creó el usuario ${result.data.email}`
        );
        
        showSuccess('Usuario creado', 'El usuario ha sido creado exitosamente');
      }
    } catch (error) {
      showError('Error al crear usuario', error.message);
    }
  };

  const handleSaveUser = async () => {
    try {
      // Obtener datos actuales para auditoría
      const originalUser = users.find(u => u.id === editingUser.id);
      
      const result = await usersService.updateUser(editingUser.id, {
        email: editingUser.email,
        name: editingUser.nombre,
        lastname: editingUser.apellido,
      });
      
      if (result.success) {
        await loadData();
        setShowEditModal(false);
        
        // ✅ REGISTRAR AUDITORÍA
        await logUpdate('usuarios', editingUser.id, originalUser, result.data,
          `Se actualizó el usuario ${result.data.email}`
        );
        
        showSuccess('Usuario actualizado', 'El usuario ha sido actualizado exitosamente');
      }
    } catch (error) {
      showError('Error al actualizar', error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await confirmDelete('este usuario');
    if (result.isConfirmed) {
      try {
        // Obtener datos antes de eliminar
        const userToDelete = users.find(u => u.id === userId);
        
        await usersService.deleteUser(userId);
        await loadData();
        
        // ✅ REGISTRAR AUDITORÍA
        await logDelete('usuarios', userId, userToDelete,
          `Se eliminó el usuario ${userToDelete.email}`
        );
        
        showSuccess('Usuario eliminado', 'El usuario ha sido eliminado exitosamente');
      } catch (error) {
        showError('Error al eliminar', error.message);
      }
    }
  };

  const handleRoleChange = async (userId, roleName) => {
    try {
      // Obtener datos actuales para auditoría
      const currentUser = users.find(u => u.id === userId);
      const currentRoles = currentUser.roles || [];
      
      let newRoles = [];
      if (roleName === '') {
        await usersService.assignRoles(userId, []);
      } else {
        const role = roles.find(r => r.name === roleName);
        if (role) {
          await usersService.assignRoles(userId, [role.id]);
          newRoles = [role.name];
        }
      }
      
      await loadData();
      
      // ✅ REGISTRAR AUDITORÍA DE CAMBIO DE ROL
      await logRoleChange(userId, {
        action: roleName === '' ? 'revoked' : 'granted',
        roleName: roleName || 'ninguno',
        beforeRoles: currentRoles.map(r => r.name || r),
        afterRoles: newRoles
      });
      
      showSuccess('Rol asignado', 'El rol ha sido asignado exitosamente');
    } catch (error) {
      showError('Error al asignar rol', error.message);
    }
  };
}
```

## 2. Módulo de Transporte/Maquinaria

### Implementación en TransporteModule.jsx

```jsx
// En src/features/transporte/TransporteModule.jsx
import { useAuditLogger } from '@/hooks/useAuditLogger';

const TransporteModule = () => {
  const { logCreate, logUpdate, logDelete } = useAuditLogger();
  
  // Ejemplo para crear maquinaria
  const handleCreateMachinery = async (machineryData) => {
    try {
      const result = await machineryService.create(machineryData);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logCreate('transporte', result.data,
          `Se registró la maquinaria ${result.data.name || result.data.model}`
        );
        
        toast.success('Maquinaria registrada exitosamente');
      }
    } catch (error) {
      toast.error('Error al registrar maquinaria');
    }
  };

  // Ejemplo para actualizar maquinaria
  const handleUpdateMachinery = async (id, machineryData) => {
    try {
      const currentData = await machineryService.getById(id);
      const result = await machineryService.update(id, machineryData);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logUpdate('transporte', id, currentData, result.data,
          `Se actualizó la maquinaria ${result.data.name || result.data.model}`
        );
        
        toast.success('Maquinaria actualizada exitosamente');
      }
    } catch (error) {
      toast.error('Error al actualizar maquinaria');
    }
  };

  // Ejemplo para eliminar maquinaria
  const handleDeleteMachinery = async (id) => {
    try {
      const machineryToDelete = await machineryService.getById(id);
      await machineryService.delete(id);
      
      // ✅ REGISTRAR AUDITORÍA
      await logDelete('transporte', id, machineryToDelete,
        `Se eliminó la maquinaria ${machineryToDelete.name || machineryToDelete.model}`
      );
      
      toast.success('Maquinaria eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar maquinaria');
    }
  };

  // Ejemplo para crear reportes de maquinaria
  const handleCreateReport = async (reportData) => {
    try {
      const result = await reportsService.create(reportData);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logCreate('reportes', result.data,
          `Se creó reporte de ${reportData.type} para maquinaria ${reportData.machineryId}`
        );
        
        toast.success('Reporte creado exitosamente');
      }
    } catch (error) {
      toast.error('Error al crear reporte');
    }
  };
};
```

## 3. Módulo de Operadores

### Implementación en OperadoresModule.jsx

```jsx
// En src/features/operadores/OperadoresModule.jsx
import { useAuditLogger } from '@/hooks/useAuditLogger';

const OperadoresModule = () => {
  const { logCreate, logUpdate, logDelete } = useAuditLogger();
  
  const handleCreateOperator = async (operatorData) => {
    try {
      const result = await operatorsService.create(operatorData);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logCreate('operadores', result.data,
          `Se registró el operador ${result.data.nombre} ${result.data.apellido}`
        );
        
        toast.success('Operador registrado exitosamente');
      }
    } catch (error) {
      toast.error('Error al registrar operador');
    }
  };

  const handleUpdateOperator = async (id, operatorData) => {
    try {
      const currentData = await operatorsService.getById(id);
      const result = await operatorsService.update(id, operatorData);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logUpdate('operadores', id, currentData, result.data,
          `Se actualizó el operador ${result.data.nombre} ${result.data.apellido}`
        );
        
        toast.success('Operador actualizado exitosamente');
      }
    } catch (error) {
      toast.error('Error al actualizar operador');
    }
  };

  const handleDeleteOperator = async (id) => {
    try {
      const operatorToDelete = await operatorsService.getById(id);
      await operatorsService.delete(id);
      
      // ✅ REGISTRAR AUDITORÍA
      await logDelete('operadores', id, operatorToDelete,
        `Se eliminó el operador ${operatorToDelete.nombre} ${operatorToDelete.apellido}`
      );
      
      toast.success('Operador eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar operador');
    }
  };

  // Asignación de maquinaria a operador
  const handleAssignMachinery = async (operatorId, machineryId) => {
    try {
      const operatorBefore = await operatorsService.getById(operatorId);
      const result = await operatorsService.assignMachinery(operatorId, machineryId);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logUpdate('operadores', operatorId, 
          { ...operatorBefore, assignedMachinery: operatorBefore.assignedMachinery },
          { ...operatorBefore, assignedMachinery: result.data.assignedMachinery },
          `Se asignó maquinaria al operador ${operatorBefore.nombre}`
        );
        
        toast.success('Maquinaria asignada exitosamente');
      }
    } catch (error) {
      toast.error('Error al asignar maquinaria');
    }
  };
};
```

## 4. Módulo de Solicitudes de Rol

### Implementación en RoleRequestsManagement.jsx

```jsx
// En src/components/RoleRequestsManagement.jsx
import { useAuditLogger } from '@/hooks/useAuditLogger';

const RoleRequestsManagement = () => {
  const { logUpdate, logSystemEvent } = useAuditLogger();
  
  const handleApproveRequest = async (requestId) => {
    try {
      const requestData = await roleRequestService.getById(requestId);
      const result = await roleRequestService.approve(requestId);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logUpdate('solicitudes', requestId,
          { ...requestData, status: 'pending' },
          { ...requestData, status: 'approved' },
          `Se aprobó solicitud de rol ${requestData.requestedRole} para usuario ${requestData.userEmail}`
        );
        
        // También registrar el cambio de rol del usuario
        await logSystemEvent('role_request_approved',
          `Solicitud de rol aprobada: ${requestData.userEmail} -> ${requestData.requestedRole}`
        );
        
        toast.success('Solicitud aprobada');
      }
    } catch (error) {
      toast.error('Error al aprobar solicitud');
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    try {
      const requestData = await roleRequestService.getById(requestId);
      const result = await roleRequestService.reject(requestId, reason);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logUpdate('solicitudes', requestId,
          { ...requestData, status: 'pending' },
          { ...requestData, status: 'rejected', rejectionReason: reason },
          `Se rechazó solicitud de rol ${requestData.requestedRole} para usuario ${requestData.userEmail}`
        );
        
        toast.success('Solicitud rechazada');
      }
    } catch (error) {
      toast.error('Error al rechazar solicitud');
    }
  };
};
```

## 5. Eventos de Autenticación

### Implementación en AuthContext.jsx

```jsx
// En src/context/AuthContext.jsx
import auditService from '../services/auditService';

export const AuthProvider = ({ children }) => {
  // ... código existente ...

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
        
        // ✅ REGISTRAR AUDITORÍA DE LOGIN
        await auditService.logEvent({
          action: 'AUTH',
          entity: 'authentication',
          entityId: normalizedUser.id.toString(),
          userId: normalizedUser.id,
          userEmail: normalizedUser.email,
          userRoles: normalizedUser.roles,
          description: `Usuario ${normalizedUser.email} inició sesión`,
          changes: null,
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.pathname,
            eventType: 'login'
          }
        });
        
        clearNavigationCache();
        return { success: true };
      } else {
        // ✅ REGISTRAR INTENTO FALLIDO
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
            eventType: 'failed_login',
            attemptedEmail: email
          }
        });
        
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error inesperado al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // ✅ REGISTRAR LOGOUT ANTES DE LIMPIAR USUARIO
    if (user) {
      auditService.logEvent({
        action: 'AUTH',
        entity: 'authentication',
        entityId: user.id.toString(),
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
    }
    
    authService.logout();
    setUser(null);
    clearNavigationCache();
    window.location.href = '/login';
  };

  const updateProfile = async (userData) => {
    try {
      const currentUser = { ...user };
      const result = await authService.updateProfile(userData);
      
      if (result.success) {
        setUser(result.data);
        
        // ✅ REGISTRAR ACTUALIZACIÓN DE PERFIL
        await auditService.logEvent({
          action: 'UPDATE',
          entity: 'usuarios',
          entityId: user.id.toString(),
          userId: user.id,
          userEmail: user.email,
          userRoles: user.roles,
          description: `Usuario ${user.email} actualizó su perfil`,
          changes: {
            before: currentUser,
            after: result.data
          },
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.pathname,
            eventType: 'profile_update'
          }
        });
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error al actualizar perfil' };
    }
  };
};
```

## 6. Formularios de Reportes de Maquinaria

### Implementación en create-report-form.jsx

```jsx
// En src/features/transporte/components/forms/create-report-form.jsx
import { useAuditLogger } from '@/hooks/useAuditLogger';

const CreateReportForm = () => {
  const { logCreate } = useAuditLogger();
  
  const handleSubmit = async (formData) => {
    try {
      const result = await reportsService.createMachineryReport(formData);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logCreate('reportes', result.data,
          `Se creó reporte de maquinaria: ${formData.tipo} - ${formData.descripcion?.substring(0, 50)}...`
        );
        
        toast.success('Reporte creado exitosamente');
        navigate('/transporte');
      }
    } catch (error) {
      toast.error('Error al crear reporte');
    }
  };
};
```

### Implementación en create-material-report-form.jsx

```jsx
// En src/features/transporte/components/forms/create-material-report-form.jsx
import { useAuditLogger } from '@/hooks/useAuditLogger';

const CreateMaterialReportForm = () => {
  const { logCreate } = useAuditLogger();
  
  const handleSubmit = async (formData) => {
    try {
      const result = await reportsService.createMaterialReport(formData);
      
      if (result.success) {
        // ✅ REGISTRAR AUDITORÍA
        await logCreate('reportes', result.data,
          `Se creó reporte de materiales: ${formData.materials?.length || 0} materiales reportados`
        );
        
        toast.success('Reporte de materiales creado');
      }
    } catch (error) {
      toast.error('Error al crear reporte de materiales');
    }
  };
};
```

## 7. Servicios - Integración Automática

### Modificar servicios existentes para logging automático

```jsx
// En src/services/usersService.js
import auditService from './auditService';

const usersService = {
  // ... métodos existentes ...
  
  // Wrapper con auditoría automática
  createUserWithAudit: async (userData) => {
    try {
      const result = await usersService.createUser(userData);
      
      if (result.success) {
        // Auditoría automática desde el servicio
        await auditService.logCreate('usuarios', result.data.id, result.data,
          `Se creó usuario desde servicio: ${result.data.email}`
        );
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }
};
```

## 8. Eventos del Sistema

### Implementación de eventos automáticos

```jsx
// En src/utils/systemEvents.js
import auditService from '../services/auditService';

export const logSystemEvents = {
  // Backup completado
  backupCompleted: async () => {
    await auditService.logEvent({
      action: 'SYSTEM',
      entity: 'system',
      entityId: 'backup',
      description: 'Respaldo del sistema completado exitosamente',
      metadata: {
        timestamp: new Date().toISOString(),
        eventType: 'backup_completed'
      }
    });
  },

  // Error crítico del sistema
  criticalError: async (error, context) => {
    await auditService.logEvent({
      action: 'SYSTEM',
      entity: 'system',
      entityId: 'error',
      description: `Error crítico del sistema: ${error.message}`,
      metadata: {
        timestamp: new Date().toISOString(),
        eventType: 'critical_error',
        error: error.message,
        stack: error.stack,
        context
      }
    });
  },

  // Mantenimiento del sistema
  maintenanceMode: async (enabled) => {
    await auditService.logEvent({
      action: 'SYSTEM',
      entity: 'system',
      entityId: 'maintenance',
      description: `Modo mantenimiento ${enabled ? 'activado' : 'desactivado'}`,
      metadata: {
        timestamp: new Date().toISOString(),
        eventType: 'maintenance_mode',
        enabled
      }
    });
  }
};
```

## Resumen de Integración

### Módulos que DEBEN implementar auditoría:

1. ✅ **Usuarios** - Crear, editar, eliminar, cambios de rol
2. ✅ **Transporte/Maquinaria** - CRUD completo, asignaciones
3. ✅ **Operadores** - CRUD, asignaciones, cambios de estado  
4. ✅ **Reportes** - Creación de reportes de maquinaria/materiales
5. ✅ **Solicitudes de Rol** - Aprobación, rechazo
6. ✅ **Autenticación** - Login, logout, cambios de perfil
7. ✅ **Sistema** - Eventos críticos, mantenimiento, errores

### Tipos de eventos por módulo:

| Módulo | CREATE | UPDATE | DELETE | OTROS |
|--------|--------|--------|--------|--------|
| Usuarios | ✅ | ✅ | ✅ | Cambios de rol |
| Transporte | ✅ | ✅ | ✅ | Asignaciones |
| Operadores | ✅ | ✅ | ✅ | Cambios estado |
| Reportes | ✅ | ✅ | ✅ | - |
| Solicitudes | - | ✅ | - | Aprobación/Rechazo |
| Auth | - | ✅ | - | Login/Logout |
| Sistema | - | - | - | Eventos especiales |

Todos estos cambios aseguran que **cada acción importante del sistema quede registrada** para cumplir con los requisitos de auditoría y trazabilidad.