# Funcionalidad de Aprobación de Operarios

## Descripción
Esta funcionalidad permite que cuando se apruebe una solicitud de rol para "operario", se abra un modal para recopilar datos adicionales necesarios para crear el registro del operario en el módulo de gestión de operarios.

## Componentes Modificados/Creados

### 1. OperatorDataModal.jsx
**Ubicación:** `src/components/OperatorDataModal.jsx`

Modal que recopila los datos adicionales del operario:
- **Identificación** (obligatorio): Número de cédula/identificación del operario
- **Teléfono** (opcional): Número de teléfono del operario
- **Validaciones**: 
  - Identificación: mínimo 8 caracteres
  - Teléfono: mínimo 8 caracteres si se proporciona

**Características:**
- Muestra información del usuario (nombre y email) de solo lectura
- Validación de formulario en tiempo real
- Estado de carga durante el proceso
- Interfaz intuitiva con iconos

### 2. RoleRequestsManagement.jsx (Modificado)
**Ubicación:** `src/components/RoleRequestsManagement.jsx`

**Cambios realizados:**
- Importación del componente `OperatorDataModal`
- Importación del servicio `operatorsService`
- Nueva columna "Rol Solicitado" en la tabla
- Lógica especial en `handleApprove()` para detectar solicitudes de operario
- Nueva función `handleApproveOperator()` para procesar la aprobación del operario
- Modal de datos del operario integrado

### 3. roleRequestService.js (Modificado)
**Ubicación:** `src/services/roleRequestService.js`

**Cambio realizado:**
- Nueva función `approveOperatorRequest()` para aprobar solicitudes de operario con datos adicionales

## Flujo de Funcionamiento

### Aprobación de Rol Normal
1. Usuario administrador hace clic en "Aprobar" para una solicitud que NO es de operario
2. Se muestra confirmación estándar
3. Se aprueba la solicitud directamente

### Aprobación de Rol de Operario
1. Usuario administrador hace clic en "Aprobar" para una solicitud de rol "operario"
2. Se detecta que es una solicitud de operario
3. Se abre el modal `OperatorDataModal`
4. Administrador completa los datos adicionales:
   - Número de identificación (obligatorio)
   - Teléfono (opcional)
5. Al enviar el formulario:
   - Se crea el registro del operario usando `operatorsService.createOperator()`
   - Se aprueba la solicitud de rol usando `roleRequestService.approveRequest()`
   - Se muestran mensajes de éxito/error apropiados
   - Se actualiza la lista de solicitudes

## Validaciones Implementadas

### OperatorDataModal
- **Identificación**: 
  - Campo obligatorio
  - Mínimo 8 caracteres
- **Teléfono**:
  - Campo opcional
  - Si se proporciona, mínimo 8 caracteres

### Manejo de Errores
- Si falla la creación del operario: se muestra error y no se aprueba el rol
- Si falla la aprobación del rol pero el operario se creó: se muestra advertencia
- Mensajes de error específicos para cada situación

## Datos del Operario Creado

El registro del operario se crea con:
```javascript
{
  name: userData.name,           // Nombre del usuario
  last: userData.lastname,       // Apellido del usuario  
  identification: formData.identification, // ID proporcionada en el modal
  phoneNumber: formData.phoneNumber,      // Teléfono (puede ser null)
  userId: selectedRequest.user.id         // Asociación con el usuario
}
```

## Características de la Interfaz

### Tabla de Solicitudes
- Nueva columna "Rol Solicitado" que muestra el rol en un badge
- Rol "operario" se destaca con color azul
- Otros roles aparecen en color gris

### Modal de Detalles
- Muestra el rol solicitado en la información detallada
- Mantiene toda la funcionalidad anterior

## Consideraciones Técnicas

1. **Transaccionalidad**: Si falla la creación del operario, no se aprueba el rol
2. **Asociación**: El operario se asocia automáticamente con el usuario solicitante
3. **Validación**: Se validan los datos antes de enviar al backend
4. **UX**: El modal proporciona feedback visual durante el proceso
5. **Retrocompatibilidad**: Las solicitudes de otros roles siguen funcionando igual

## Uso

1. Navegar a la gestión de solicitudes de rol
2. Buscar solicitudes con rol "operario" y estado "pendiente"
3. Hacer clic en el botón de aprobar (✓)
4. Completar los datos adicionales en el modal
5. Hacer clic en "Aprobar y Crear Operario"
6. Verificar que el operario aparezca en el módulo de gestión de operarios

## Dependencias
- `operatorsService`: Para crear el registro del operario
- `roleRequestService`: Para aprobar la solicitud de rol  
- `sweetAlert`: Para mostrar mensajes de éxito/error
- Componentes de UI: Lucide React para iconos