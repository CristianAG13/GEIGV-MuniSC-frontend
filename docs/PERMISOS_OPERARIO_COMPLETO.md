# 🔐 Sistema de Permisos para Operario - Completo

## 📋 Resumen de Permisos del Operario

El rol **operario** tiene permisos limitados enfocados en la creación y gestión de sus propias boletas municipales.

## ✅ Permisos Configurados en Frontend

### 1. **Navegación** (`config/navigation.js`)

```javascript
operario: [
  'dashboard',      // ✅ Acceso al panel principal
  'transporte'      // ✅ Acceso al módulo de transporte (boletas municipales)
]
```

### 2. **Permisos de Funcionalidades** (`utils/permissions.js`)

| Funcionalidad | Operario | Detalles |
|---------------|----------|----------|
| **Dashboard** | ✅ | Panel principal con estadísticas básicas |
| **Gestionar usuarios** | ❌ | Solo superadmin |
| **Gestionar roles** | ❌ | Solo superadmin |
| **Aprobar solicitudes** | ❌ | Solo superadmin |
| **Ver operadores** | ✅ | Solo su propio operador |
| **Editar operadores** | ❌ | Solo superadmin |
| **Gestionar maquinaria** | ❌ | Solo superadmin |
| **Ver catálogo maquinaria** | ✅ | Para seleccionar placas al crear reportes |
| **Crear reportes municipales** | ✅ | Solo para su propio operador |
| **Editar reportes municipales** | ✅ | Solo sus propios reportes |
| **Ver reportes municipales** | ✅ | Solo sus propios reportes |
| **Eliminar reportes municipales** | ✅ | Solo sus propios reportes |
| **Crear reportes alquiler** | ❌ | Solo superadmin, ingeniero, inspector |
| **Ver reportes eliminados** | ❌ | Solo superadmin |
| **Restaurar reportes** | ❌ | Solo superadmin |
| **Ver resúmenes** | ❌ | Solo superadmin |
| **Ver auditoría** | ❌ | Solo superadmin, ingeniero, inspector |
| **Gestionar auditoría** | ❌ | Solo superadmin |
| **Ver estadísticas** | ❌ | Solo superadmin, ingeniero, inspector |

### 3. **Funciones de Permisos Específicas**

```javascript
// ============ OPERADORES ============
canViewOperators(user)        // ✅ Operario puede ver operadores
canViewOwnOperator(user)      // ✅ Operario puede ver su propio operador
canEditOperators(user)        // ❌ Solo superadmin

// ============ MAQUINARIA ============
canManageMachinery(user)      // ❌ Solo superadmin
canViewMachineryCatalog(user) // ✅ Operario puede ver catálogo (para crear reportes)

// ============ REPORTES ============
canCreateReports(user)        // ✅ Operario puede crear reportes municipales
canEditReports(user, report)  // ✅ Solo sus propios reportes
canDeleteReports(user, report)// ✅ Solo sus propios reportes
canViewDeletedReports(user)   // ❌ Solo superadmin
canRestoreReports(user)       // ❌ Solo superadmin

// ============ REPORTES DE ALQUILER ============
canCreateRentalReports(user)  // ❌ Solo superadmin, ingeniero, inspector
canEditRentalReports(user)    // ❌ Solo superadmin, ingeniero, inspector

// ============ EXPORTACIÓN ============
canExportData(user)           // ✅ Puede exportar sus propios datos
```

### 4. **Componentes Protegidos**

#### TransporteModule.jsx

```javascript
// ✅ Boleta Municipal - Acceso completo
<ProtectedRoute roles={["superadmin", "ingeniero", "inspector", "operario"]}>
  <CreateReportForm onGoToCatalog={() => setActiveTab("catalogo")} />
</ProtectedRoute>

// ❌ Boleta Alquiler - Sin acceso
{hasRole(["superadmin", "ingeniero", "inspector"]) && (
  <CreateRentalReportForm />
)}

// ✅ Tabla Reportes - Ver solo propios
<ProtectedRoute roles={["superadmin", "ingeniero", "inspector", "operario"]}>
  <ReportsTable 
    municipalReports={reportesMunicipales}
    rentalReports={reportesAlquiler}
  />
</ProtectedRoute>

// ❌ Catálogo - Sin acceso directo (solo lectura desde formulario)
<ProtectedRoute roles={["superadmin", "ingeniero", "inspector"]}>
  <CatalogTabs />
</ProtectedRoute>
```

#### CreateReportForm.jsx

```javascript
// Auto-asignación de operador
const isOperario = useMemo(() => {
  if (!user || !user.roles) return false;
  const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
  return userRoles.some(r => {
    const roleStr = String(r).toLowerCase();
    return roleStr === 'operario';
  });
}, [user]);

// Si es operario, auto-asignar su operador
if (isOperario && mode === "create") {
  try {
    const myOperatorResponse = await operatorsService.getMyOperator();
    if (myOperatorResponse.success && myOperatorResponse.data) {
      const myOperator = myOperatorResponse.data;
      setFormData(prev => ({ ...prev, operadorId: String(myOperator.id) }));
    }
  } catch (myOpError) {
    // No mostrar error, simplemente no auto-asignar
  }
}

// Deshabilitar selector de operador para operarios
<Select
  value={formData.operadorId}
  onValueChange={(v) => setFormData((p) => ({ ...p, operadorId: v }))}
  disabled={isOperario} // ← Operario no puede cambiar el operador
>
  <SelectValue placeholder={isOperario ? "Tu usuario de operador" : "Seleccionar operador"} />
</Select>
```

### 5. **Filtros de Datos**

```javascript
// Filtrar reportes por permisos
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
```

## 🔄 Flujo de Trabajo del Operario

### 1. **Login**
```
Usuario ingresa → Backend valida credenciales → Devuelve token JWT con rol "operario"
```

### 2. **Dashboard**
```
Operario ve:
- ✅ Panel principal con estadísticas básicas
- ✅ Menú lateral con acceso a "Gestión de Transporte"
```

### 3. **Módulo de Transporte**
```
Operario ve:
- ✅ Pestaña "Boleta municipal" (puede crear/editar)
- ❌ Pestaña "Boleta alquiler" (oculta)
- ✅ Pestaña "Reportes" (solo ve los suyos)
- ❌ Pestaña "Catálogo" (oculta, pero puede ver datos al crear reporte)
```

### 4. **Crear Boleta Municipal**
```
1. Operario hace clic en "Boleta municipal"
2. Formulario se carga con:
   - Operador: Auto-asignado y deshabilitado
   - Fecha: Selecciona fecha (no puede ser futura)
   - Tipo de Maquinaria: Selecciona de catálogo
   - Placa: Selecciona de lista filtrada
   - Horas: Ingresa hora inicio/fin (calcula automático)
   - Campos específicos: Según tipo de maquinaria
   - Boletas: Si es material, agrega viajes con detalles
3. Valida datos
4. Envía al backend
5. Backend valida que sea su propio operador
6. Guarda reporte
```

### 5. **Ver Reportes**
```
1. Operario hace clic en "Reportes"
2. Sistema carga solo sus reportes desde backend
3. Operario ve tabla con:
   - Fecha
   - Tipo maquinaria
   - Placa
   - Actividad
   - Acciones: Editar | Eliminar (solo los suyos)
```

### 6. **Editar Reporte**
```
1. Operario hace clic en "Editar" de su reporte
2. Sistema valida que sea suyo
3. Muestra formulario prellenado
4. Operario modifica datos
5. Guarda cambios
6. Backend valida permisos
```

## 🔒 Seguridad y Validaciones

### Frontend

```javascript
// 1. Verificar rol antes de mostrar componentes
if (hasRole(user, 'operario')) {
  // Mostrar componentes permitidos
}

// 2. Validar propiedad de reportes
const canEdit = canEditReports(user, report);
if (canEdit) {
  // Permitir edición
}

// 3. Filtrar datos mostrados
const myReports = filterReportsByPermission(user, allReports);

// 4. Deshabilitar campos según rol
<Select disabled={isOperario}>
```

### Backend (Requerido)

```typescript
// 1. Validar rol en decoradores
@Roles('superadmin', 'ingeniero', 'inspector', 'operario')
@Post('report')
async createReport(@Body() data: CreateReportDto, @User() user) {
  // Validar que operario solo cree para sí mismo
  if (user.role === 'operario') {
    const operator = await this.operatorsService.findByUserId(user.id);
    if (data.operadorId !== operator.id) {
      throw new ForbiddenException('Solo puedes crear reportes para tu operador');
    }
  }
  
  return this.reportService.create(data);
}

// 2. Filtrar resultados según rol
@Get('report')
@Roles('superadmin', 'ingeniero', 'inspector', 'operario')
async getAllReports(@User() user) {
  if (user.role === 'operario') {
    return this.reportService.findByOperatorUserId(user.id);
  }
  
  return this.reportService.findAll();
}

// 3. Validar propiedad en acciones
@Patch('report/:id')
@Roles('superadmin', 'ingeniero', 'inspector', 'operario')
async updateReport(
  @Param('id') id: number,
  @Body() data: UpdateReportDto,
  @User() user
) {
  const report = await this.reportService.findById(id);
  
  if (user.role === 'operario' && report.operador.userId !== user.id) {
    throw new ForbiddenException('Solo puedes editar tus propios reportes');
  }
  
  return this.reportService.update(id, data);
}
```

## 🎯 Endpoints del Backend que Necesita Operario

| Endpoint | Método | Permisos | Filtro para Operario |
|----------|--------|----------|---------------------|
| `/users/all` | GET | superadmin, operario | Solo usuarios operarios |
| `/operators/me` | GET | operario | Su propio operador |
| `/machinery` | GET | todos | Catálogo completo (lectura) |
| `/machinery/report` | GET | todos | Solo sus reportes |
| `/machinery/report` | POST | todos | Solo para su operador |
| `/machinery/report/:id` | GET | todos | Solo sus reportes |
| `/machinery/report/:id` | PATCH | todos | Solo sus reportes |
| `/machinery/report/:id` | DELETE | todos | Solo sus reportes |
| `/machinery/:id/last-counters` | GET | todos | Sin filtro |
| `/trailers` | GET | todos | Catálogo completo (lectura) |
| `/sources` | GET | todos | Catálogo completo (lectura) |

## 📊 Comparación de Roles

| Acción | Superadmin | Ingeniero | Inspector | Operario | Invitado |
|--------|------------|-----------|-----------|----------|----------|
| Ver dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver catálogo maquinaria | ✅ | ✅ | ✅ | ✅ (lectura) | ❌ |
| Gestionar maquinaria | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crear boleta municipal | ✅ | ✅ | ✅ | ✅ (propia) | ❌ |
| Editar boleta municipal | ✅ (todas) | ✅ (todas) | ✅ (todas) | ✅ (propia) | ❌ |
| Ver boletas municipales | ✅ (todas) | ✅ (todas) | ✅ (todas) | ✅ (propias) | ❌ |
| Crear boleta alquiler | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver estadísticas | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver auditoría | ✅ | ✅ | ✅ | ❌ | ❌ |

## ✅ Checklist de Implementación

### Frontend (Completado ✅)

- [x] Configurar rol en `navigation.js`
- [x] Crear funciones de permisos en `permissions.js`
- [x] Agregar `ProtectedRoute` en `TransporteModule`
- [x] Auto-asignar operador en `CreateReportForm`
- [x] Deshabilitar selector de operador
- [x] Filtrar reportes en tabla
- [x] Validar edición de reportes propios
- [x] Ocultar pestaña "Boleta alquiler"
- [x] Ocultar pestaña "Catálogo"
- [x] Mejorar mensajes de error 403

### Backend (Pendiente ⚠️)

- [ ] Agregar rol `'operario'` a decoradores `@Roles()`
- [ ] Filtrar reportes por `operador.userId`
- [ ] Validar que operario solo cree para sí mismo
- [ ] Validar que operario solo edite propios
- [ ] Crear endpoint `/operators/me`
- [ ] Filtrar `/users/all` para devolver solo operarios
- [ ] Probar con usuario operario real
- [ ] Verificar logs y eliminar errores 403

## 🚀 Próximos Pasos

1. **Implementar permisos en backend** (usar documento `BACKEND_PERMISOS_OPERARIO.md`)
2. **Probar con usuario operario real**
3. **Verificar en consola del navegador** (F12) que no haya errores 403
4. **Validar flujo completo**: Login → Dashboard → Crear Boleta → Ver Reportes → Editar

## 📞 Soporte

Si el operario sigue recibiendo "Acceso Denegado", verificar:

1. ✅ Token JWT incluye el rol correcto
2. ✅ Backend tiene configurados los permisos
3. ✅ Filtros están implementados en backend
4. ✅ No hay errores en consola del navegador

---

**Documentación actualizada:** ${new Date().toLocaleDateString()}
