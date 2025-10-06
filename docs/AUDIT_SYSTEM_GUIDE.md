# Sistema de Auditoría - Guía de Implementación

## Descripción General

El módulo de auditoría registra automáticamente todos los cambios realizados en el sistema, incluyendo creaciones, actualizaciones, eliminaciones y eventos de autenticación. Solo los **superadministradores** tienen acceso a estos registros.

## Arquitectura del Sistema

### Componentes Principales

1. **auditService.js** - Servicio principal para logging y consulta de auditoría
2. **useAuditLogger.js** - Hook personalizado para facilitar el registro desde componentes
3. **AuditoriaModule.jsx** - Interfaz principal para visualizar logs (solo superadmin)
4. **AuditTable.jsx** - Tabla para mostrar logs con filtros y paginación
5. **AuditFilters.jsx** - Componente de filtros para búsqueda avanzada
6. **AuditStats.jsx** - Dashboard con estadísticas de auditoría

## Cómo Implementar Auditoría en tus Módulos

### 1. Importar el Hook de Auditoría

```jsx
import { useAuditLogger } from '@/hooks/useAuditLogger';

const MiComponente = () => {
  const { logCreate, logUpdate, logDelete } = useAuditLogger();
  
  // ... resto del componente
};
```

### 2. Registrar Creaciones

```jsx
const handleCreate = async (formData) => {
  try {
    // Realizar la operación de creación
    const result = await miService.create(formData);
    
    if (result.success) {
      // Registrar en auditoría
      await logCreate('usuarios', result.data, 
        `Se creó el usuario ${result.data.email}`
      );
      
      toast.success('Usuario creado exitosamente');
    }
  } catch (error) {
    console.error('Error creating user:', error);
  }
};
```

### 3. Registrar Actualizaciones

```jsx
const handleUpdate = async (id, formData) => {
  try {
    // Obtener datos actuales antes de la actualización
    const currentData = await miService.getById(id);
    
    // Realizar la actualización
    const result = await miService.update(id, formData);
    
    if (result.success) {
      // Registrar en auditoría
      await logUpdate(
        'usuarios', 
        id, 
        currentData, 
        result.data,
        `Se actualizó el usuario ${result.data.email}`
      );
      
      toast.success('Usuario actualizado exitosamente');
    }
  } catch (error) {
    console.error('Error updating user:', error);
  }
};
```

### 4. Registrar Eliminaciones

```jsx
const handleDelete = async (id) => {
  try {
    // Obtener datos antes de eliminar
    const userData = await miService.getById(id);
    
    // Realizar la eliminación
    await miService.delete(id);
    
    // Registrar en auditoría
    await logDelete(
      'usuarios', 
      id, 
      userData,
      `Se eliminó el usuario ${userData.email}`
    );
    
    toast.success('Usuario eliminado exitosamente');
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};
```

### 5. Registrar Eventos del Sistema

```jsx
const { logSystemEvent, logAuthEvent } = useAuditLogger();

// Para eventos del sistema
await logSystemEvent('backup_completed', 'Respaldo diario completado exitosamente');

// Para eventos de autenticación
await logAuthEvent('login', { ip: userIP, device: userAgent });
```

## Entidades Recomendadas

Usa estos nombres de entidad para mantener consistencia:

- `usuarios` - Gestión de usuarios
- `transporte` - Vehículos y maquinaria
- `operadores` - Operadores de maquinaria
- `reportes` - Reportes del sistema
- `roles` - Cambios en roles y permisos
- `solicitudes` - Solicitudes de roles
- `system` - Eventos del sistema
- `authentication` - Eventos de autenticación

## Tipos de Acciones

- `CREATE` - Creación de registros
- `UPDATE` - Actualización de registros
- `DELETE` - Eliminación de registros
- `AUTH` - Eventos de autenticación
- `ROLE_CHANGE` - Cambios en roles
- `SYSTEM` - Eventos del sistema

## Ejemplo Completo: Módulo de Usuarios

```jsx
import React, { useState } from 'react';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { toast } from '@/hooks/use-toast';
import usersService from '@/services/usersService';

const UsersModule = () => {
  const [users, setUsers] = useState([]);
  const { logCreate, logUpdate, logDelete } = useAuditLogger();

  const createUser = async (userData) => {
    try {
      const result = await usersService.create(userData);
      
      if (result.success) {
        // Actualizar lista local
        setUsers(prev => [...prev, result.data]);
        
        // Registrar en auditoría
        await logCreate('usuarios', result.data);
        
        toast({
          title: "Éxito",
          description: "Usuario creado correctamente"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive"
      });
    }
  };

  const updateUser = async (id, userData) => {
    try {
      // Obtener datos actuales
      const currentUser = users.find(u => u.id === id);
      
      const result = await usersService.update(id, userData);
      
      if (result.success) {
        // Actualizar lista local
        setUsers(prev => prev.map(u => 
          u.id === id ? result.data : u
        ));
        
        // Registrar en auditoría
        await logUpdate('usuarios', id, currentUser, result.data);
        
        toast({
          title: "Éxito",
          description: "Usuario actualizado correctamente"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (id) => {
    try {
      // Obtener datos antes de eliminar
      const userToDelete = users.find(u => u.id === id);
      
      await usersService.delete(id);
      
      // Actualizar lista local
      setUsers(prev => prev.filter(u => u.id !== id));
      
      // Registrar en auditoría
      await logDelete('usuarios', id, userToDelete);
      
      toast({
        title: "Éxito",
        description: "Usuario eliminado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      {/* Tu interfaz de usuarios aquí */}
    </div>
  );
};
```

## Consideraciones Importantes

### 1. Rendimiento
- Los logs de auditoría se envían de forma asíncrona
- No bloquean las operaciones principales si fallan
- Se recomienda implementar retry logic en el backend

### 2. Privacidad
- No registres información sensible como contraseñas
- Filtra datos personales según normativas de privacidad
- Solo registra campos necesarios para auditoría

### 3. Almacenamiento
- Los logs pueden crecer rápidamente
- Implementa rotación de logs en el backend
- Considera archivar logs antiguos

### 4. Acceso
- Solo superadmins pueden ver los logs
- Los logs son de solo lectura para preservar integridad
- Implementa políticas de retención según requisitos legales

## API Backend Requerida

Tu backend debe implementar estos endpoints:

```
POST /api/audit/log           - Registrar evento de auditoría
GET  /api/audit/logs          - Obtener logs con filtros
GET  /api/audit/stats         - Obtener estadísticas
GET  /api/audit/export        - Exportar logs a CSV
GET  /api/audit/logs/entity/:entity/:id - Logs por entidad
GET  /api/audit/logs/user/:userId       - Logs por usuario
```

## Estructura de Datos

### Evento de Auditoría
```javascript
{
  action: 'CREATE|UPDATE|DELETE|AUTH|SYSTEM|ROLE_CHANGE',
  entity: 'usuarios|transporte|operadores|etc',
  entityId: 'string',
  userId: 'string',
  userEmail: 'string',
  userRoles: ['array', 'of', 'roles'],
  description: 'string',
  changes: {
    before: object|null,
    after: object|null
  },
  metadata: {
    timestamp: 'ISO string',
    userAgent: 'string',
    ip: 'string',
    url: 'string'
  }
}
```

## Monitoreo y Alertas

Considera implementar alertas para:
- Eliminaciones masivas
- Cambios en roles críticos
- Fallos frecuentes en logging
- Actividad sospechosa fuera de horario

## Cumplimiento Normativo

El sistema está diseñado para ayudar con:
- Trazabilidad completa de cambios
- Identificación de responsables
- Registro temporal de eventos
- Exportación para auditorías externas

---

Para más información o soporte, contacta al equipo de desarrollo.