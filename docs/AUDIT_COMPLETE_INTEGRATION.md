# Guía Completa de Integración de Auditoría

## ✅ Estado Actual de Integración

### **Módulos con Auditoría Implementada:**

1. **✅ Autenticación (AuthContext)**
   - Login de usuarios
   - Logout de usuarios
   - Ubicación: `src/context/AuthContext.jsx`

2. **✅ Transporte - Crear Maquinaria**
   - Creación de vehículos/maquinaria
   - Ubicación: `src/features/transporte/components/forms/create-machinery-form.jsx`

3. **✅ Transporte - Crear Reportes**
   - Creación de reportes de transporte
   - Ubicación: `src/features/transporte/components/forms/create-report-form.jsx`

---

## 🔄 Módulos que Necesitan Integración

### **1. Operadores Module**
**Ubicación:** `src/features/operadores/`

#### Acciones a registrar:
- ✅ Crear operador
- ✅ Actualizar información de operador
- ✅ Eliminar operador
- ✅ Asignar/desasignar vehículos

#### Ejemplo de implementación:

```javascript
import { useAuditLogger } from '@/hooks/useAuditLogger';

const OperatorsManagement = () => {
  const { logCreate, logUpdate, logDelete } = useAuditLogger();

  const handleCreateOperator = async (operatorData) => {
    try {
      // Crear operador
      const result = await createOperator(operatorData);
      
      // Registrar en auditoría
      await logCreate('operadores', result.data, 
        `Se creó el operador: ${operatorData.nombre}`
      );
      
      toast.success('Operador creado exitosamente');
    } catch (error) {
      toast.error('Error al crear operador');
    }
  };

  const handleUpdateOperator = async (operatorId, beforeData, newData) => {
    try {
      // Actualizar operador
      const result = await updateOperator(operatorId, newData);
      
      // Registrar cambios
      await logUpdate('operadores', operatorId, beforeData, newData,
        `Se actualizó el operador: ${newData.nombre}`
      );
      
      toast.success('Operador actualizado');
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleDeleteOperator = async (operatorId, operatorData) => {
    try {
      await deleteOperator(operatorId);
      
      // Registrar eliminación
      await logDelete('operadores', operatorId, operatorData,
        `Se eliminó el operador: ${operatorData.nombre}`
      );
      
      toast.success('Operador eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };
};
```

---

### **2. Materiales Module**
**Ubicación:** `src/features/materiales/`

#### Acciones a registrar:
- ✅ Crear material
- ✅ Actualizar inventario
- ✅ Eliminar material
- ✅ Registrar alquileres
- ✅ Generar reportes de materiales

---

### **3. Reportes Module**
**Ubicación:** `src/features/reportes/`

#### Acciones a registrar:
- ✅ Generar reporte
- ✅ Exportar reporte
- ✅ Modificar reporte
- ✅ Eliminar reporte

---

### **4. Roles y Permisos**
**Ubicación:** `src/features/roles/` o componentes de gestión de usuarios

#### Acciones a registrar:
- ✅ Crear rol
- ✅ Modificar permisos
- ✅ Asignar rol a usuario
- ✅ Revocar rol

```javascript
const { logRoleChange } = useAuditLogger();

const handleAssignRole = async (userId, roleData) => {
  const beforeRoles = user.roles;
  const afterRoles = [...beforeRoles, roleData.roleName];
  
  await assignRoleToUser(userId, roleData);
  
  await logRoleChange(userId, {
    action: 'granted',
    roleName: roleData.roleName,
    beforeRoles,
    afterRoles
  });
};
```

---

## 📋 Checklist de Implementación

### Para cada acción CRUD en el sistema:

#### ✅ **CREATE (Crear)**
```javascript
const { logCreate } = useAuditLogger();

// Después de crear exitosamente
await logCreate(
  'nombre_entidad',           // ej: 'operadores', 'materiales'
  createdData,                 // Datos del nuevo registro
  'Descripción personalizada'  // Opcional
);
```

#### ✅ **UPDATE (Actualizar)**
```javascript
const { logUpdate } = useAuditLogger();

// Antes de actualizar, guardar datos anteriores
const beforeData = { ...currentData };

// Después de actualizar exitosamente
await logUpdate(
  'nombre_entidad',
  entityId,
  beforeData,
  updatedData,
  'Descripción personalizada'  // Opcional
);
```

#### ✅ **DELETE (Eliminar)**
```javascript
const { logDelete } = useAuditLogger();

// Antes de eliminar, guardar datos
const dataToDelete = { ...currentData };

// Después de eliminar exitosamente
await logDelete(
  'nombre_entidad',
  entityId,
  dataToDelete,
  'Descripción personalizada'  // Opcional
);
```

---

## 🎯 Entidades del Sistema

### Lista de entidades para usar en el logging:

1. **`usuarios`** - Gestión de usuarios
2. **`operadores`** - Operadores de maquinaria
3. **`transporte`** - Vehículos y maquinaria
4. **`reportes`** - Reportes del sistema
5. **`materiales`** - Gestión de materiales
6. **`alquileres`** - Alquileres de materiales
7. **`roles`** - Roles y permisos
8. **`solicitudes`** - Solicitudes de cambio de rol
9. **`authentication`** - Eventos de autenticación
10. **`system`** - Eventos del sistema

---

## 🔒 Mejores Prácticas

### 1. **Siempre registrar DESPUÉS del éxito**
```javascript
try {
  const result = await performAction();  // Primero ejecutar
  await logCreate(...);                   // Luego registrar
  toast.success('Éxito');
} catch (error) {
  // No registrar si falló
  toast.error('Error');
}
```

### 2. **Incluir información descriptiva**
```javascript
// ❌ Malo
await logCreate('operadores', data);

// ✅ Bueno
await logCreate('operadores', data, 
  `Se creó el operador ${data.nombre} con cédula ${data.cedula}`
);
```

### 3. **Capturar datos completos para UPDATE**
```javascript
// Guardar estado anterior
const beforeData = { ...operatorData };

// Hacer cambios
const updatedData = await updateOperator(id, newData);

// Registrar ambos estados
await logUpdate('operadores', id, beforeData, updatedData);
```

### 4. **No romper el flujo si falla el logging**
```javascript
try {
  const result = await createItem(data);
  
  // Intentar registrar, pero no fallar si no se puede
  try {
    await logCreate('items', result.data);
  } catch (auditError) {
    console.warn('Failed to log audit:', auditError);
  }
  
  toast.success('Item creado');
  return result;
} catch (error) {
  toast.error('Error al crear item');
}
```

---

## 📊 Ejemplo Completo: Módulo de Operadores

```javascript
import React, { useState } from 'react';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { toast } from '@/hooks/use-toast';

const OperatorsModule = () => {
  const { logCreate, logUpdate, logDelete } = useAuditLogger();
  const [operators, setOperators] = useState([]);

  // CREATE
  const handleCreate = async (formData) => {
    try {
      const response = await fetch('/api/operators', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const newOperator = await response.json();

      // Agregar a la lista
      setOperators([...operators, newOperator]);

      // Registrar en auditoría
      await logCreate('operadores', newOperator, 
        `Nuevo operador registrado: ${formData.nombre}`
      );

      toast({ title: 'Operador creado exitosamente' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  // UPDATE
  const handleUpdate = async (operatorId, updatedData) => {
    try {
      // Guardar datos anteriores
      const currentOperator = operators.find(op => op.id === operatorId);
      const beforeData = { ...currentOperator };

      const response = await fetch(`/api/operators/${operatorId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      const updated = await response.json();

      // Actualizar lista
      setOperators(operators.map(op => 
        op.id === operatorId ? updated : op
      ));

      // Registrar cambios
      await logUpdate('operadores', operatorId, beforeData, updated,
        `Operador actualizado: ${updated.nombre}`
      );

      toast({ title: 'Operador actualizado' });
    } catch (error) {
      toast({ 
        title: 'Error al actualizar',
        variant: 'destructive' 
      });
    }
  };

  // DELETE
  const handleDelete = async (operatorId) => {
    try {
      // Guardar datos antes de eliminar
      const operatorToDelete = operators.find(op => op.id === operatorId);

      await fetch(`/api/operators/${operatorId}`, {
        method: 'DELETE'
      });

      // Quitar de la lista
      setOperators(operators.filter(op => op.id !== operatorId));

      // Registrar eliminación
      await logDelete('operadores', operatorId, operatorToDelete,
        `Operador eliminado: ${operatorToDelete.nombre}`
      );

      toast({ title: 'Operador eliminado' });
    } catch (error) {
      toast({ 
        title: 'Error al eliminar',
        variant: 'destructive' 
      });
    }
  };

  return (
    <div>
      {/* UI del módulo */}
    </div>
  );
};
```

---

## 🚀 Próximos Pasos

1. [ ] Integrar auditoría en módulo de Operadores
2. [ ] Integrar auditoría en módulo de Materiales
3. [ ] Integrar auditoría en módulo de Reportes
4. [ ] Integrar auditoría en gestión de Roles
5. [ ] Integrar auditoría en gestión de Usuarios
6. [ ] Probar todas las integraciones con el backend

---

## 📝 Notas Importantes

- El hook `useAuditLogger` NO lanza errores si falla el logging
- Los logs se envían de forma asíncrona y no bloquean la UI
- Todos los logs incluyen automáticamente: userId, timestamp, userAgent, URL
- Los datos simulados se muestran cuando el backend no está disponible
- El módulo de auditoría es solo visible para superadmin

---

## ✅ Verificación de Implementación

Para verificar que la auditoría está funcionando:

1. Realizar una acción (crear, actualizar, eliminar)
2. Ir al módulo de Auditoría
3. Verificar que aparezca el registro en la tabla de logs
4. Comprobar que la descripción sea clara
5. Revisar que los datos "antes" y "después" sean correctos

