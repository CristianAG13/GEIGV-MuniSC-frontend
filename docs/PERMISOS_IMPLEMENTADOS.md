# 🔐 Sistema de Permisos Implementado

## 📋 Tabla de Permisos por Rol

| Funcionalidad              | superadmin | ingeniero | inspector | operario | invitado |
|----------------------------|------------|-----------|-----------|----------|----------|
| Gestionar usuarios         | ✅         | ❌        | ❌        | ❌       | ❌       |
| Gestionar roles            | ✅         | ❌        | ❌        | ❌       | ❌       |
| Aprobar solicitudes        | ✅         | ❌        | ❌        | ❌       | ❌       |
| Ver/editar operadores      | ✅         | ❌        | ❌        | Ver prop.| ❌       |
| Gestionar maquinaria       | ✅         | ❌        | ❌        | ❌       | ❌       |
| Crear/editar reportes      | ✅         | ✅        | ✅        | Solo prop| ❌       |
| Ver reportes eliminados    | ✅         | ❌        | ❌        | ❌       | ❌       |
| Restaurar reportes         | ✅         | ❌        | ❌        | ❌       | ❌       |
| Ver resúmenes              | ✅         | ❌        | ❌        | ❌       | ❌       |
| Exportar datos (Excel/PDF) | ✅         | ✅        | ✅        | ✅       | ❌       |
| Ver auditoría              | ✅         | ✅ (solo vista) | ❌ | ❌       | ❌       |

---

## 🛠️ Archivos Modificados

### 1. **Nuevo archivo: `src/utils/permissions.js`**
Sistema centralizado de permisos con funciones helper:

#### Funciones Principales:

- **`hasRole(user, roleNames)`** - Verifica si el usuario tiene un rol específico
- **`getUserRole(user)`** - Obtiene el rol principal del usuario

#### Funciones de Permisos:

**Usuarios y Roles:**
- `canManageUsers(user)` - Solo superadmin
- `canManageRoles(user)` - Solo superadmin
- `canApproveRequests(user)` - Solo superadmin

**Operadores:**
- `canViewOperators(user)` - superadmin, operario (solo propios)
- `canEditOperators(user)` - Solo superadmin
- `canViewOwnOperator(user)` - Solo operario

**Maquinaria/Catálogo:**
- `canManageMachinery(user)` - Solo superadmin
- `canViewMachineryCatalog(user)` - superadmin, ingeniero, inspector

**Reportes Municipales:**
- `canCreateReports(user)` - superadmin, ingeniero, inspector, operario
- `canEditReports(user, report)` - Todos los anteriores (operario solo propios)
- `canDeleteReports(user, report)` - Todos los anteriores (operario solo propios)
- `canViewDeletedReports(user)` - Solo superadmin
- `canRestoreReports(user)` - Solo superadmin

**Reportes de Alquiler:**
- `canCreateRentalReports(user)` - superadmin, ingeniero, inspector
- `canEditRentalReports(user)` - superadmin, ingeniero, inspector

**Otros:**
- `canViewSummaries(user)` - Solo superadmin
- `canViewAudit(user)` - superadmin, ingeniero
- `canExportData(user)` - Todos excepto invitado
- `filterReportsByPermission(user, reports)` - Filtra reportes según rol

---

### 2. **Modificado: `src/features/transporte/components/ReportsTable.jsx`**

**Cambios implementados:**

#### Importaciones añadidas:
```javascript
import { useAuth } from "@/context/AuthContext";
import { 
  canEditReports, 
  canDeleteReports, 
  canViewDeletedReports, 
  canRestoreReports,
  filterReportsByPermission 
} from "@/utils/permissions";
```

#### Obtener usuario actual:
```javascript
const { user } = useAuth();
```

#### Botones de acciones condicionados:

**Botón Editar (línea ~2130):**
```javascript
{canEditReports(user, r) && (
  <button
    className="p-2 rounded hover:bg-blue-50 text-blue-800"
    title="Editar reporte"
    onClick={() => handleOpenEdit(r.id)}
  >
    <Edit2 className="w-4 h-4" />
  </button>
)}
```

**Botón Eliminar (línea ~2140):**
```javascript
{canDeleteReports(user, r) && (
  <button
    type="button"
    onClick={() => askDelete(r)}
    className="p-2 rounded-lg text-red-600 hover:bg-red-50"
    title="Eliminar"
  >
    <Trash2 size={18} />
  </button>
)}
```

**Botón Ver Eliminados (línea ~1850):**
```javascript
{canViewDeletedReports(user) && (
  <Button
    variant="secondary"
    className="whitespace-nowrap"
    onClick={openDeleted}
  >
    Ver reportes eliminados
  </Button>
)}
```

**Botón Restaurar (línea ~3000):**
```javascript
{canRestoreReports(user) && (
  <Button
    variant="secondary"
    onClick={async () => {
      // ... código de restauración
    }}
  >
    Restaurar
  </Button>
)}
```

---

### 3. **Modificado: `src/config/navigation.js`**

**Permisos de navegación actualizados:**

```javascript
export const rolePermissions = {
  ingeniero: [
    'dashboard', 
    'transporte',      // ✅ Crear/editar reportes
    'auditoria-view'   // ✅ Solo vista
  ],
  superadmin: [
    'dashboard', 
    'usuarios',        // ✅ Gestionar usuarios
    'transporte',      // ✅ Crear/editar reportes
    'solicitudes-rol', // ✅ Aprobar solicitudes
    'operadores',      // ✅ Ver/editar operadores
    'auditoria'        // ✅ Acceso completo
  ],
  inspector: [
    'dashboard', 
    'transporte'       // ✅ Crear/editar reportes
  ],
  operario: [
    'dashboard',
    'transporte'       // ✅ Solo sus propios reportes
  ],
  invitado: [
    'dashboard'        // ❌ Solo dashboard
  ]
};
```

---

### 4. **Sin cambios: `src/features/transporte/TransporteModule.jsx`**

Ya estaba correctamente implementado:

**Tab de Alquiler - Solo para superadmin, ingeniero, inspector:**
```javascript
{hasRole(["superadmin", "ingeniero", "inspector"]) && (
  <button onClick={() => setActiveTab("alquiler")}>
    Boleta de alquiler
  </button>
)}
```

**Tab de Catálogo - Solo para superadmin, ingeniero, inspector:**
```javascript
{hasRole(["superadmin", "ingeniero", "inspector"]) && (
  <button onClick={() => setActiveTab("catalogo")}>
    Catálogo
  </button>
)}
```

---

## 🎯 Comportamiento Esperado por Rol

### **🔴 Superadmin**
- ✅ Ve todos los reportes (municipales y alquiler)
- ✅ Puede crear, editar y eliminar cualquier reporte
- ✅ Puede ver reportes eliminados
- ✅ Puede restaurar reportes eliminados
- ✅ Acceso completo al catálogo de maquinaria
- ✅ Puede gestionar usuarios, roles y solicitudes
- ✅ Puede ver todos los operadores
- ✅ Acceso completo a auditoría y resúmenes

### **🔵 Ingeniero**
- ✅ Ve todos los reportes (municipales y alquiler)
- ✅ Puede crear, editar y eliminar cualquier reporte
- ❌ NO puede ver reportes eliminados
- ❌ NO puede restaurar reportes
- ✅ Acceso de solo lectura al catálogo
- ❌ NO puede gestionar usuarios ni roles
- ❌ NO puede aprobar solicitudes
- ❌ NO puede ver operadores
- ✅ Puede ver auditoría (solo lectura)

### **🟢 Inspector**
- ✅ Ve todos los reportes (municipales y alquiler)
- ✅ Puede crear, editar y eliminar cualquier reporte
- ❌ NO puede ver reportes eliminados
- ❌ NO puede restaurar reportes
- ✅ Acceso de solo lectura al catálogo
- ❌ NO puede gestionar usuarios ni roles
- ❌ NO puede ver operadores
- ❌ NO puede ver auditoría

### **🟡 Operario**
- ✅ Ve SOLO sus propios reportes municipales
- ✅ Puede crear reportes municipales
- ✅ Puede editar SOLO sus propios reportes
- ✅ Puede eliminar SOLO sus propios reportes
- ❌ NO puede ver reportes eliminados
- ❌ NO puede restaurar reportes
- ❌ NO tiene acceso al catálogo
- ❌ NO tiene acceso a boletas de alquiler
- ❌ NO puede gestionar usuarios ni roles
- ✅ Puede ver su propio registro de operador (auto-asignado en formularios)
- ❌ NO puede ver auditoría

### **⚪ Invitado**
- ✅ Solo acceso al dashboard
- ❌ Sin acceso a ninguna funcionalidad de transporte
- ❌ Sin permisos de gestión

---

## 🔍 Validación de Permisos

### **En el Frontend:**
Los permisos se validan en múltiples niveles:

1. **Navegación** - `src/config/navigation.js`
2. **Rutas** - `src/App.jsx` con `<ProtectedRoute>`
3. **Componentes** - Botones y acciones condicionadas
4. **Servicios** - Filtrado de datos según rol

### **En el Backend:**
Los permisos DEBEN estar implementados con decoradores:

```typescript
@Get()
@Roles('superadmin', 'ingeniero', 'inspector', 'operario')
async findAll(@CurrentUser() user: any) {
  // Operarios solo ven sus propios reportes
  if (user.roles.some(r => r.name === 'operario')) {
    return this.filterByUser(user.id);
  }
  return this.findAll();
}
```

---

## ⚠️ Importante

### **Backend Pendiente:**
El backend DEBE implementar:

1. ✅ Decorador `@Roles()` en el endpoint `/operators` para permitir acceso a operarios
2. ✅ Método `findByUserId()` en `operators.service.ts`
3. ✅ Filtrado de reportes por userId para operarios
4. ✅ Validación de permisos en todos los endpoints según la tabla

### **Testing Requerido:**
Probar cada rol con las siguientes acciones:
- ✅ Login con cada tipo de usuario
- ✅ Verificar qué tabs/opciones aparecen
- ✅ Intentar crear/editar/eliminar reportes
- ✅ Verificar filtrado de datos (operario solo ve los suyos)
- ✅ Probar acceso a reportes eliminados (solo superadmin)
- ✅ Probar restauración (solo superadmin)

---

## 📝 Notas Adicionales

1. **Formato de Roles:**
   - Los roles se almacenan como objetos: `{ id: 4, name: 'operario' }`
   - La función `hasRole()` maneja ambos formatos (objeto y string)

2. **Auto-asignación de Operario:**
   - En `CreateReportForm`, si el usuario es operario, se auto-asigna su ID de operador
   - Esto se encuentra en `src/features/transporte/components/forms/create-report-form.jsx`

3. **Exportación:**
   - Todos los roles pueden exportar los datos que tienen permiso de ver
   - Excel y PDF respetan el filtrado de permisos

4. **Auditoría:**
   - Superadmin: acceso completo + resúmenes
   - Ingeniero: solo lectura
   - Otros roles: sin acceso

---

## ✅ Checklist de Implementación

- [x] Sistema de permisos centralizado (`utils/permissions.js`)
- [x] Integración en `ReportsTable.jsx`
- [x] Actualización de `navigation.js`
- [x] Protección de tabs en `TransporteModule.jsx`
- [x] Documentación completa
- [ ] **Backend: Implementar decoradores @Roles en endpoints**
- [ ] **Backend: Método findByUserId en operators.service**
- [ ] **Backend: Filtrado de reportes por userId**
- [ ] Testing con cada rol
- [ ] Validación end-to-end

---

**Fecha de implementación:** 4 de noviembre, 2025  
**Desarrollador:** Sistema automatizado
