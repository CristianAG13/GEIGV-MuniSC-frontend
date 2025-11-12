# 🔧 Configuración de Permisos para Operario en Backend

## 🔴 Problema Actual

El operario está recibiendo error **403 Forbidden** al intentar acceder al módulo de boletas municipales. Esto indica que el **backend NO tiene configurados los permisos** para el rol `operario`.

## ✅ Frontend Configurado Correctamente

El frontend ya está configurado con los permisos correctos:

```javascript
// navigation.js
operario: [
  'dashboard',
  'transporte' // ✅ Acceso al módulo de transporte
]

// permissions.js
canCreateReports: ['superadmin', 'ingeniero', 'inspector', 'operario'] ✅
canEditReports: Solo propios para operario ✅
canDeleteReports: Solo propios para operario ✅

// TransporteModule.jsx
<ProtectedRoute roles={["superadmin", "ingeniero", "inspector", "operario"]}>
  <CreateReportForm />
</ProtectedRoute>
```

## 🚨 Acción Requerida en Backend

El backend debe permitir que el rol `operario` acceda a los siguientes endpoints:

### 1. Ver Lista de Operadores
```
GET /users/all
Roles permitidos: ['superadmin', 'operario']
```

**Nota:** El operario solo necesita ver usuarios que sean operarios (para cargar la lista en el formulario).

### 2. Ver Reportes
```
GET /machinery/report
Roles permitidos: ['superadmin', 'ingeniero', 'inspector', 'operario']
```

**Nota:** El operario solo debe ver SUS PROPIOS reportes. Implementar filtro:

```typescript
if (user.role === 'operario') {
  return this.reportService.findByOperatorUserId(user.id);
}
```

### 3. Crear Reportes
```
POST /machinery/report
Roles permitidos: ['superadmin', 'ingeniero', 'inspector', 'operario']
```

**Nota:** El operario solo puede crear reportes para SU PROPIO operador.

### 4. Ver Detalle de Reporte
```
GET /machinery/report/:id
Roles permitidos: ['superadmin', 'ingeniero', 'inspector', 'operario']
```

**Nota:** El operario solo puede ver SUS PROPIOS reportes.

### 5. Editar Reporte
```
PATCH /machinery/report/:id
Roles permitidos: ['superadmin', 'ingeniero', 'inspector', 'operario']
```

**Nota:** El operario solo puede editar SUS PROPIOS reportes.

### 6. Ver Catálogo de Maquinaria
```
GET /machinery
Roles permitidos: ['superadmin', 'ingeniero', 'inspector', 'operario']
```

### 7. Ver Últimos Contadores
```
GET /machinery/:id/last-counters
Roles permitidos: ['superadmin', 'ingeniero', 'inspector', 'operario']
```

### 8. Ver Información de Operador
```
GET /operators/me
Roles permitidos: ['operario']
```

**Nota:** Endpoint para que el operario obtenga su propia información de operador.

## 📝 Ejemplo de Implementación (NestJS)

### Usando Decoradores de Roles

```typescript
// machinery.controller.ts
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';

@Controller('machinery')
@UseGuards(RolesGuard)
export class MachineryController {
  
  @Post('report')
  @Roles('superadmin', 'ingeniero', 'inspector', 'operario')
  async createReport(@Body() data: CreateReportDto, @User() user) {
    // Validar que operario solo cree reportes para sí mismo
    if (user.role === 'operario' && data.operadorId !== user.operatorId) {
      throw new ForbiddenException('Solo puedes crear reportes para tu propio operador');
    }
    
    return this.machineryService.createReport(data);
  }

  @Get('report')
  @Roles('superadmin', 'ingeniero', 'inspector', 'operario')
  async getAllReports(@User() user) {
    // Filtrar reportes según el rol
    if (user.role === 'operario') {
      return this.machineryService.findReportsByOperatorUserId(user.id);
    }
    
    return this.machineryService.findAllReports();
  }

  @Get('report/:id')
  @Roles('superadmin', 'ingeniero', 'inspector', 'operario')
  async getReportById(@Param('id') id: number, @User() user) {
    const report = await this.machineryService.findReportById(id);
    
    // Validar que operario solo vea sus propios reportes
    if (user.role === 'operario' && report.operador.userId !== user.id) {
      throw new ForbiddenException('No tienes permiso para ver este reporte');
    }
    
    return report;
  }

  @Patch('report/:id')
  @Roles('superadmin', 'ingeniero', 'inspector', 'operario')
  async updateReport(
    @Param('id') id: number, 
    @Body() data: UpdateReportDto, 
    @User() user
  ) {
    const report = await this.machineryService.findReportById(id);
    
    // Validar que operario solo edite sus propios reportes
    if (user.role === 'operario' && report.operador.userId !== user.id) {
      throw new ForbiddenException('Solo puedes editar tus propios reportes');
    }
    
    return this.machineryService.updateReport(id, data);
  }

  @Get()
  @Roles('superadmin', 'ingeniero', 'inspector', 'operario')
  async getAllMachinery() {
    return this.machineryService.findAll();
  }

  @Get(':id/last-counters')
  @Roles('superadmin', 'ingeniero', 'inspector', 'operario')
  async getLastCounters(@Param('id') id: number) {
    return this.machineryService.getLastCounters(id);
  }
}
```

### Controlador de Usuarios

```typescript
// users.controller.ts
@Get('all')
@Roles('superadmin', 'operario')
async getAllUsers(@User() user) {
  // Si es operario, solo devolver usuarios operarios
  if (user.role === 'operario') {
    return this.usersService.findByRole('operario');
  }
  
  return this.usersService.findAll();
}
```

### Controlador de Operadores

```typescript
// operators.controller.ts
@Get('me')
@Roles('operario')
async getMyOperator(@User() user) {
  return this.operatorsService.findByUserId(user.id);
}
```

## 🔍 Debugging

Después de implementar estos cambios, abre la consola del navegador y verifica:

```javascript
// Deberías ver logs como:
🔐 Request: GET /machinery/report | User: operario@example.com | Roles: ["operario"]
🔐 Request: POST /machinery/report | User: operario@example.com | Roles: ["operario"]
```

Si aún ves errores 403, verifica:

1. ✅ Los decoradores `@Roles()` incluyen `'operario'`
2. ✅ El `RolesGuard` está activo
3. ✅ El token JWT incluye el rol correcto
4. ✅ El backend está leyendo correctamente el rol del token

## 📊 Tabla de Permisos Completa

| Endpoint | superadmin | ingeniero | inspector | operario | Filtro para operario |
|----------|------------|-----------|-----------|----------|---------------------|
| GET /machinery | ✅ | ✅ | ✅ | ✅ | Todos |
| GET /machinery/report | ✅ | ✅ | ✅ | ✅ | Solo propios |
| POST /machinery/report | ✅ | ✅ | ✅ | ✅ | Solo para sí mismo |
| GET /machinery/report/:id | ✅ | ✅ | ✅ | ✅ | Solo propios |
| PATCH /machinery/report/:id | ✅ | ✅ | ✅ | ✅ | Solo propios |
| DELETE /machinery/report/:id | ✅ | ✅ | ✅ | ✅ | Solo propios |
| GET /machinery/:id/last-counters | ✅ | ✅ | ✅ | ✅ | Todos |
| GET /users/all | ✅ | ❌ | ❌ | ✅ | Solo operarios |
| GET /operators/me | ❌ | ❌ | ❌ | ✅ | Propio |

## ✅ Checklist de Implementación

- [ ] Agregar rol `'operario'` a decoradores `@Roles()` en endpoints de reportes
- [ ] Implementar filtros para que operario solo vea sus propios reportes
- [ ] Validar que operario solo cree/edite sus propios reportes
- [ ] Permitir acceso al catálogo de maquinaria
- [ ] Crear endpoint `/operators/me` para que operario obtenga su info
- [ ] Filtrar `/users/all` para devolver solo operarios cuando es solicitado por operario
- [ ] Probar con un usuario operario real
- [ ] Verificar logs en consola del navegador
- [ ] Verificar que no aparezca error 403

## 🎯 Prioridad

**ALTA** - Sin estos cambios, el operario no puede usar el sistema.
