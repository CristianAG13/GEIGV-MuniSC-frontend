# Sistema de Solicitudes de Rol

## 📋 Descripción
Sistema para que los usuarios puedan solicitar roles específicos y los administradores puedan gestionarlas.

## 🎯 Funcionalidades

### Para Usuarios Sin Rol
- **Botón "Solicitar Rol"**: Aparece en el dashboard cuando el usuario no tiene rol asignado
- **Modal de Solicitud**: Permite seleccionar rol y justificar la solicitud
- **Historial Personal**: Ver el estado de sus solicitudes (pendiente, aprobada, rechazada)
- **Cancelar Solicitudes**: Posibilidad de cancelar solicitudes pendientes

### Para Administradores (admin/superadmin)
- **Notificaciones en Tiempo Real**: Icono de campanita con contador de solicitudes pendientes
- **Panel de Notificaciones**: Dropdown con lista de solicitudes pendientes
- **Gestión Completa**: Sección dedicada para aprobar/rechazar solicitudes
- **Estadísticas**: Dashboard con métricas de solicitudes

## 🔄 Flujo de Trabajo

1. **Usuario registra cuenta** → Estado: Sin rol
2. **Usuario ve advertencia** en dashboard sobre permisos pendientes
3. **Usuario hace clic en "Solicitar Rol"** → Se abre modal
4. **Usuario completa formulario** (rol + justificación) → Envía solicitud
5. **Admin recibe notificación** → Aparece contador en campanita
6. **Admin revisa solicitud** → Puede aprobar o rechazar
7. **Usuario es notificado** del resultado

## 🛠️ Componentes Implementados

### `RequestRoleComponent.jsx`
- Formulario de solicitud de rol
- Historial de solicitudes del usuario
- Manejo de estados (pendiente, aprobada, rechazada)

### `RoleRequestNotifications.jsx`
- Campanita de notificaciones para admins
- Dropdown con solicitudes pendientes
- Acciones rápidas (aprobar/rechazar)

### `RoleRequestsManagement.jsx`
- Panel completo de gestión para admins
- Filtros y búsqueda
- Estadísticas detalladas
- Modal de detalles

### `roleRequestService.js`
- API para todas las operaciones de solicitudes
- Endpoints para usuarios y administradores
- Manejo de errores y estados

## 📡 Endpoints del Backend Necesarios

```javascript
// Usuarios sin rol
POST /api/v1/role-requests              // Crear solicitud
GET  /api/v1/role-requests/my-requests  // Mis solicitudes
DELETE /api/v1/role-requests/:id        // Cancelar solicitud

// Administradores
GET  /api/v1/role-requests              // Todas las solicitudes
GET  /api/v1/role-requests/pending      // Solicitudes pendientes
GET  /api/v1/role-requests/stats        // Estadísticas
PATCH /api/v1/role-requests/:id/approve // Aprobar
PATCH /api/v1/role-requests/:id/reject  // Rechazar
```

## 💾 Estructura de Datos

### Solicitud de Rol
```javascript
{
  id: number,
  userId: number,
  roleId: number,
  justification: string,
  status: 'pending' | 'approved' | 'rejected',
  rejectionReason?: string,
  createdAt: Date,
  updatedAt: Date,
  user: {
    id: number,
    name: string,
    lastname: string,
    email: string
  },
  role: {
    id: number,
    name: string,
    description: string
  }
}
```

## 🎨 Estados Visuales

### Para Usuarios Sin Rol
- **Advertencia amarilla**: Cuenta pendiente de aprobación
- **Botón azul**: "Solicitar Rol" (solo si no tiene solicitud pendiente)
- **Badge amarillo**: "Ya tiene una solicitud pendiente"

### Para Administradores
- **Campanita con contador rojo**: Solicitudes pendientes
- **Panel dropdown**: Lista de solicitudes con acciones
- **Dashboard completo**: Estadísticas y gestión avanzada

## 🔧 Configuración

### Permisos en `navigation.js`
```javascript
admin: ['solicitudes-rol'],
superadmin: ['solicitudes-rol']
```

### Navegación
- Sección "Solicitudes de Rol" en el menú de administración
- Solo visible para admin y superadmin

## 🚀 Implementación

### 1. Integración en Dashboard
```jsx
// En Dashboard.jsx
import RequestRoleComponent from '../components/RequestRoleComponent';
import RoleRequestNotifications from '../components/RoleRequestNotifications';

// Para usuarios sin rol
{!user?.rol && (
  <RequestRoleComponent user={user} onRequestSent={refreshUser} />
)}

// Para admins en el header
<RoleRequestNotifications userRole={user?.rol} />
```

### 2. Navegación
```jsx
// En renderContent()
case 'solicitudes-rol':
  return <RoleRequestsManagement />;
```

## 📱 Responsividad
- Componentes adaptados para móvil y desktop
- Modales responsivos con scroll
- Tablas con scroll horizontal en móvil

## ⚡ Actualizaciones en Tiempo Real
- Verificación automática cada 30 segundos
- Actualización manual con botón de refresh
- Estados reactivos en tiempo real

## 🔐 Seguridad
- Validación de permisos en frontend
- Tokens de autenticación en todas las peticiones
- Validación de roles para acceso a funciones

Este sistema proporciona una experiencia completa para la gestión de solicitudes de rol, mejorando significativamente el flujo de trabajo administrativo.
