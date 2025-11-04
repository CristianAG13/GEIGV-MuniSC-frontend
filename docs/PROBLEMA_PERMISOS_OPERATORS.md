# 🔴 PROBLEMA: Permisos en Endpoint /operators

## Error Actual

```
GET http://localhost:3001/api/v1/operators
Status: 403 Forbidden
Response: {"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

## Usuarios Afectados

| Usuario | Rol | ¿Debería tener acceso? | Estado Actual |
|---------|-----|------------------------|---------------|
| Joan | ingeniero | ✅ SÍ | ❌ BLOQUEADO (403) |
| Roy Peraza | operario | ✅ SÍ | ❌ BLOQUEADO (403) |
| Cristian | superadmin | ✅ SÍ | ✅ FUNCIONA |

## Permisos Configurados en Frontend

Según `src/config/navigation.js`:

```javascript
export const rolePermissions = {
  superadmin: ['dashboard', 'usuarios', 'transporte', 'solicitudes-rol', 'operadores', 'auditoria'],
  ingeniero: ['dashboard', 'usuarios', 'transporte', 'solicitudes-rol', 'operadores', 'auditoria-view'],
  inspector: ['dashboard', 'transporte', 'operadores'],
  operario: ['dashboard', 'transporte'] // ⚠️ No tiene 'operadores' pero NECESITA acceso
}
```

### ⚠️ IMPORTANTE: Operarios necesitan acceso a GET /operators

**Razón**: Aunque no tienen el permiso `operadores` en la navegación (porque no pueden gestionar operadores), **SÍ necesitan acceso de solo lectura** para:

1. Ver la lista de operadores en el formulario de creación de boletas
2. Auto-asignarse a su propio perfil de operador (por userId)

## Solución Backend Requerida

### 1. Verificar Guards en `operators.controller.ts`

El endpoint `GET /operators` debe permitir acceso a:

```typescript
@Get()
@Roles('superadmin', 'ingeniero', 'inspector', 'operario') // ✅ Agregar operario aquí
async findAll(@CurrentUser() user: any) {
  // Si es operario, filtrar solo su propio registro
  if (user.roles.some(r => r.name === 'operario')) {
    return this.operatorsService.findByUserId(user.id);
  }
  
  // Para otros roles, devolver todos
  return this.operatorsService.findAll();
}
```

### 2. Verificar Decorador @Roles

Asegurarse que el guard de roles permita múltiples roles:

```typescript
// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### 3. Verificar RolesGuard

El guard debe permitir si el usuario tiene AL MENOS UNO de los roles especificados:

```typescript
// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // Sin restricción de roles
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // ✅ Permitir si tiene AL MENOS UN rol de los requeridos
    return requiredRoles.some((role) => 
      user.roles?.some(userRole => userRole.name === role)
    );
  }
}
```

## Logs de Error del Frontend

```javascript
// Console error en create-report-form.jsx línea 300
[CreateReportForm] getAllOperators error: AxiosError {
  message: 'Request failed with status code 403',
  status: 403,
  response: {
    data: {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403
    }
  }
}
```

## Testing Recomendado

Después de corregir el backend, probar:

### Test 1: Cristian (superadmin)
```bash
# Usuario: martinguaduz@gmail.com
curl -X GET http://localhost:3001/api/v1/operators \
  -H "Authorization: Bearer {token_cristian}"
# Esperado: 200 OK con todos los operadores
```

### Test 2: Joan (ingeniero)
```bash
# Usuario: joan@gmail.com
curl -X GET http://localhost:3001/api/v1/operators \
  -H "Authorization: Bearer {token_joan}"
# Esperado: 200 OK con todos los operadores
```

### Test 3: Gerald (inspector)
```bash
# Usuario: gerald@gmail.com
curl -X GET http://localhost:3001/api/v1/operators \
  -H "Authorization: Bearer {token_gerald}"
# Esperado: 200 OK con todos los operadores
```

### Test 4: Roy Peraza (operario)
```bash
# Usuario: royr@gmail.com (userId: 2)
curl -X GET http://localhost:3001/api/v1/operators \
  -H "Authorization: Bearer {token_roy}"
# Esperado: 200 OK con SOLO el operador asociado a su userId (id: 2)
```

## Checklist de Corrección

- [ ] Actualizar decorator `@Roles()` en `GET /operators`
- [ ] Implementar lógica de filtrado por rol en el controller
- [ ] Verificar que RolesGuard funciona correctamente
- [ ] Agregar método `findByUserId()` en OperatorsService si no existe
- [ ] Probar con cada rol (superadmin, ingeniero, inspector, operario)
- [ ] Verificar que operario solo ve su propio registro
- [ ] Actualizar documentación de la API

## Archivos Backend a Modificar

1. **operators.controller.ts** - Agregar rol `operario` y lógica de filtrado
2. **operators.service.ts** - Implementar método `findByUserId()`
3. **roles.guard.ts** - Verificar lógica de validación de roles
4. **roles.decorator.ts** - Confirmar exportación correcta

## Referencias

- **Frontend config**: `src/config/navigation.js`
- **Frontend form**: `src/features/transporte/components/forms/create-report-form.jsx`
- **Error logs**: Console Ninja runtime logs (12:24:12.618)
- **Users affected**: Joan (ID: 36), Roy Peraza (ID: 2)

---

**Fecha**: 2025-11-04  
**Prioridad**: 🔴 ALTA  
**Impacto**: Bloquea funcionalidad principal del sistema
