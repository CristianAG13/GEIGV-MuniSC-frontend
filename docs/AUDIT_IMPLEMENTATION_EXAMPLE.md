# Ejemplo Práctico: Implementación de Auditoría en Módulo de Operadores

Este documento muestra cómo integrar el sistema de auditoría en un módulo existente usando el módulo de operadores como ejemplo.

## Antes: Sin Auditoría

```jsx
// features/operadores/components/OperatorModal.jsx (ANTES)
const OperatorModal = ({ isOpen, onClose, operator, onSave }) => {
  const handleSubmit = async (formData) => {
    try {
      let result;
      if (operator) {
        // Actualizar operador existente
        result = await operatorsService.updateOperator(operator.id, formData);
      } else {
        // Crear nuevo operador
        result = await operatorsService.createOperator(formData);
      }
      
      if (result.success) {
        onSave(result.data);
        onClose();
        toast.success(operator ? 'Operador actualizado' : 'Operador creado');
      }
    } catch (error) {
      toast.error('Error al guardar operador');
    }
  };
  
  // ... resto del componente
};
```

## Después: Con Auditoría

```jsx
// features/operadores/components/OperatorModal.jsx (DESPUÉS)
import { useAuditLogger } from '@/hooks/useAuditLogger';

const OperatorModal = ({ isOpen, onClose, operator, onSave }) => {
  const { logCreate, logUpdate } = useAuditLogger();
  
  const handleSubmit = async (formData) => {
    try {
      let result;
      if (operator) {
        // Actualizar operador existente
        result = await operatorsService.updateOperator(operator.id, formData);
        
        if (result.success) {
          // ✅ REGISTRAR AUDITORÍA PARA ACTUALIZACIÓN
          await logUpdate(
            'operadores', 
            operator.id, 
            operator, // datos anteriores
            result.data, // datos nuevos
            `Se actualizó el operador ${result.data.nombre}`
          );
        }
      } else {
        // Crear nuevo operador
        result = await operatorsService.createOperator(formData);
        
        if (result.success) {
          // ✅ REGISTRAR AUDITORÍA PARA CREACIÓN
          await logCreate(
            'operadores', 
            result.data,
            `Se creó el operador ${result.data.nombre}`
          );
        }
      }
      
      if (result.success) {
        onSave(result.data);
        onClose();
        toast.success(operator ? 'Operador actualizado' : 'Operador creado');
      }
    } catch (error) {
      toast.error('Error al guardar operador');
    }
  };
  
  // ... resto del componente
};
```

## Implementación en Lista de Operadores

```jsx
// features/operadores/components/OperatorsIndex.jsx
import { useAuditLogger } from '@/hooks/useAuditLogger';

const OperatorsIndex = () => {
  const [operators, setOperators] = useState([]);
  const { logDelete } = useAuditLogger();
  
  const handleDeleteOperator = async (operatorId) => {
    try {
      // ✅ OBTENER DATOS ANTES DE ELIMINAR
      const operatorToDelete = operators.find(op => op.id === operatorId);
      
      const result = await operatorsService.deleteOperator(operatorId);
      
      if (result.success) {
        // Actualizar lista local
        setOperators(prev => prev.filter(op => op.id !== operatorId));
        
        // ✅ REGISTRAR AUDITORÍA PARA ELIMINACIÓN
        await logDelete(
          'operadores',
          operatorId,
          operatorToDelete,
          `Se eliminó el operador ${operatorToDelete.nombre}`
        );
        
        toast.success('Operador eliminado correctamente');
      }
    } catch (error) {
      toast.error('Error al eliminar operador');
    }
  };
  
  // ... resto del componente
};
```

## Implementación en Servicio (Opcional)

Si prefieres centralizar la auditoría en el servicio:

```jsx
// services/operatorsService.js
import auditService from './auditService';

const operatorsService = {
  // ... otros métodos
  
  createOperatorWithAudit: async (operatorData) => {
    try {
      const result = await operatorsService.createOperator(operatorData);
      
      if (result.success) {
        // Registrar auditoría desde el servicio
        await auditService.logCreate(
          'operadores',
          result.data.id,
          result.data,
          `Se creó el operador ${result.data.nombre}`
        );
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  },
  
  updateOperatorWithAudit: async (id, operatorData, previousData) => {
    try {
      const result = await operatorsService.updateOperator(id, operatorData);
      
      if (result.success) {
        await auditService.logUpdate(
          'operadores',
          id,
          previousData,
          result.data,
          `Se actualizó el operador ${result.data.nombre}`
        );
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  },
  
  deleteOperatorWithAudit: async (id, operatorData) => {
    try {
      const result = await operatorsService.deleteOperator(id);
      
      if (result.success) {
        await auditService.logDelete(
          'operadores',
          id,
          operatorData,
          `Se eliminó el operador ${operatorData.nombre}`
        );
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }
};
```

## Casos Especiales

### 1. Cambios de Estado
```jsx
const handleChangeOperatorStatus = async (operatorId, newStatus) => {
  try {
    const operator = operators.find(op => op.id === operatorId);
    const result = await operatorsService.updateStatus(operatorId, newStatus);
    
    if (result.success) {
      await logUpdate(
        'operadores',
        operatorId,
        { ...operator, estado: operator.estado },
        { ...operator, estado: newStatus },
        `Se ${newStatus === 'activo' ? 'activó' : 'desactivó'} el operador ${operator.nombre}`
      );
    }
  } catch (error) {
    // manejar error
  }
};
```

### 2. Asignación de Maquinaria
```jsx
const handleAssignMachinery = async (operatorId, machineryId) => {
  try {
    const result = await operatorsService.assignMachinery(operatorId, machineryId);
    
    if (result.success) {
      await logUpdate(
        'operadores',
        operatorId,
        result.data.before,
        result.data.after,
        `Se asignó maquinaria al operador ${result.data.after.nombre}`
      );
    }
  } catch (error) {
    // manejar error
  }
};
```

### 3. Cambios Masivos
```jsx
const handleBulkStatusChange = async (operatorIds, newStatus) => {
  try {
    const results = await Promise.all(
      operatorIds.map(id => operatorsService.updateStatus(id, newStatus))
    );
    
    // Registrar cada cambio individualmente
    await Promise.all(
      results.map((result, index) => {
        if (result.success) {
          const operatorId = operatorIds[index];
          const operator = operators.find(op => op.id === operatorId);
          
          return logUpdate(
            'operadores',
            operatorId,
            { ...operator, estado: operator.estado },
            { ...operator, estado: newStatus },
            `Cambio masivo: ${newStatus === 'activo' ? 'activó' : 'desactivó'} operador ${operator.nombre}`
          );
        }
      })
    );
  } catch (error) {
    // manejar error
  }
};
```

## Mejores Prácticas Implementadas

### 1. ✅ Registrar DESPUÉS del éxito
```jsx
// ✅ CORRECTO
const result = await service.create(data);
if (result.success) {
  await logCreate('entity', result.data);
}

// ❌ INCORRECTO  
await logCreate('entity', data); // ¿Y si falla la creación?
const result = await service.create(data);
```

### 2. ✅ Capturar datos antes de cambios
```jsx
// ✅ CORRECTO
const currentData = await service.getById(id);
const result = await service.update(id, data);
if (result.success) {
  await logUpdate('entity', id, currentData, result.data);
}
```

### 3. ✅ Descripciones informativas
```jsx
// ✅ CORRECTO
await logCreate('operadores', data, `Se creó el operador ${data.nombre} para la maquinaria ${data.tipoMaquinaria}`);

// ❌ INCORRECTO
await logCreate('operadores', data, 'Se creó operador');
```

### 4. ✅ Manejo de errores silencioso
```jsx
// El hook useAuditLogger ya maneja errores sin romper el flujo
// No necesitas try/catch adicional para auditoría
await logCreate('entity', data); // No rompe si falla
```

## Verificación de Implementación

Para verificar que la auditoría está funcionando:

1. **Realiza operaciones** como crear, editar, eliminar operadores
2. **Ve al módulo de auditoría** (como superadmin)
3. **Filtra por entidad** "operadores"
4. **Verifica que aparezcan** los registros con la información correcta

## Integración con Notificaciones

```jsx
// Opcional: Combinar con notificaciones para superadmins
const handleCriticalChange = async (operatorId, data) => {
  await logDelete('operadores', operatorId, data);
  
  // Notificar a superadmins sobre eliminación crítica
  await notificationService.notifySuperAdmins({
    title: 'Operador Eliminado',
    message: `Se eliminó el operador ${data.nombre}`,
    type: 'critical'
  });
};
```

---

Este ejemplo muestra cómo integrar de manera práctica el sistema de auditoría en módulos existentes, manteniendo el código limpio y asegurando el registro completo de actividades.