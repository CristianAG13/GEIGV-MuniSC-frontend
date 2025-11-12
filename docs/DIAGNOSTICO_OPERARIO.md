# 🔍 Diagnóstico de Problemas con Operario

## 📊 Cómo Diagnosticar el Problema

### Paso 1: Abrir Consola del Navegador

Presiona **F12** y ve a la pestaña **Console**

### Paso 2: Recargar la Página

Presiona **F5** o **Ctrl+R** para recargar

### Paso 3: Buscar los Siguientes Logs

```javascript
// ✅ Logs exitosos que deberías ver:
🔐 Request: GET /users/all | User: operario@example.com | Roles: ["operario"]
🔍 [DEBUG] Intentando cargar operador del usuario actual...
🔍 [DEBUG] Respuesta de getMyOperator: {success: true, data: {...}}
✅ [DEBUG] Operador auto-asignado: {id: 1, name: "...", ...}
🔍 [DEBUG] Select value: "1" operadorId: "1"

// ❌ Logs de error que podrías ver:
⛔ Acceso denegado (403): No tienes permisos...
❌ [DEBUG] Error al cargar operador propio: Error: Request failed...
❌ [DEBUG] Respuesta del error: {message: "...", statusCode: 403}
```

## 🔴 Errores Comunes y Soluciones

### Error 1: "Acceso Denegado (403)"

**Síntomas:**
- No se carga el formulario
- Aparece modal "Forbidden resource"
- En consola: `⛔ Acceso denegado (403)`

**Causa:** El backend no tiene configurados los permisos para operario

**Solución:** 
1. Ir a `docs/BACKEND_PERMISOS_OPERARIO.md`
2. Compartir con equipo de backend
3. Implementar permisos según documento

---

### Error 2: "No se encontró tu operador asociado"

**Síntomas:**
- El formulario carga correctamente
- Selector de operador está vacío
- Mensaje: "⚠️ No se pudo cargar tu operador automáticamente"

**Causa:** El usuario operario no tiene un operador asociado en la base de datos

**Solución en Backend:**

```sql
-- 1. Verificar si el usuario tiene operador asociado
SELECT u.id, u.email, u.name, o.id as operator_id, o.name as operator_name
FROM users u
LEFT JOIN operators o ON o.userId = u.id
WHERE u.email = 'operario@example.com';

-- 2. Si no tiene operador, crear uno
INSERT INTO operators (name, last, identification, userId)
VALUES ('Nombre', 'Apellido', 'CEDULA', <user_id>);

-- 3. O asociar usuario existente con operador existente
UPDATE operators 
SET userId = <user_id>
WHERE id = <operator_id>;
```

---

### Error 3: "Endpoint /operators/my-operator no existe"

**Síntomas:**
- En consola: `❌ [DEBUG] Error al cargar operador propio: 404 Not Found`
- Mensaje: "No se pudo auto-asignar operador"

**Causa:** El backend no tiene el endpoint `/operators/my-operator`

**Solución en Backend (NestJS):**

```typescript
// operators.controller.ts
@Get('my-operator')
@Roles('operario')
async getMyOperator(@User() user) {
  // user contiene el usuario autenticado desde el JWT
  const operator = await this.operatorsService.findByUserId(user.id);
  
  if (!operator) {
    throw new NotFoundException('No tienes un operador asociado. Contacta al administrador.');
  }
  
  return {
    success: true,
    data: operator
  };
}
```

```typescript
// operators.service.ts
async findByUserId(userId: number) {
  const operator = await this.operatorsRepository.findOne({
    where: { userId },
    relations: ['user'] // opcional: incluir datos del usuario
  });
  
  return operator;
}
```

---

### Error 4: "Lista de operadores vacía"

**Síntomas:**
- Selector muestra "No hay operadores disponibles"
- En consola: Lista vacía o error al cargar usuarios

**Causa:** 
- El endpoint `/users/all` no devuelve operarios
- O el filtrado en frontend no encuentra operarios

**Solución:**

**Opción A - Backend devuelve solo operarios:**
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

**Opción B - Verificar estructura del objeto usuario:**
```javascript
// En consola del navegador, ejecutar:
console.log("Todos los usuarios:", operatorsList);
console.log("Primer usuario:", operatorsList[0]);
console.log("Estructura:", JSON.stringify(operatorsList[0], null, 2));
```

Si los usuarios no tienen el campo `roles` o está en otro formato, ajustar el filtro:

```javascript
// En create-report-form.jsx
const operatorsOnly = Array.isArray(allUsers) ? allUsers.filter(user => {
  // Imprimir estructura para debugging
  console.log("Usuario:", user);
  
  // Buscar en diferentes posibles ubicaciones del rol
  const userString = JSON.stringify(user).toLowerCase();
  const hasOperario = 
    userString.includes('operario') || 
    userString.includes('operator') || 
    userString.includes('operador') ||
    user.role?.toLowerCase() === 'operario' ||
    user.roles?.some(r => String(r).toLowerCase() === 'operario');
  
  return hasOperario;
}) : [];
```

---

### Error 5: "Operador se carga pero no se muestra en selector"

**Síntomas:**
- En consola: `✅ [DEBUG] Operador auto-asignado: {id: 1, ...}`
- En consola: `🔍 [DEBUG] Select value: "1" operadorId: "1"`
- Pero el selector muestra "Tu usuario de operador"

**Causa:** El `operadorId` no coincide con ningún `user.id` en la lista

**Solución:**

El problema es que estamos asignando el **ID del operador**, pero el selector busca el **ID del usuario**.

```javascript
// CORRECTO: Asignar el userId del operador, no el operatorId
if (myOperatorResponse.success && myOperatorResponse.data) {
  const myOperator = myOperatorResponse.data;
  // Usar userId en vez de id
  setFormData(prev => ({ 
    ...prev, 
    operadorId: String(myOperator.userId || myOperator.id) 
  }));
}
```

O cambiar el endpoint para devolver el userId:

```typescript
// Backend
async getMyOperator(@User() user) {
  const operator = await this.operatorsService.findByUserId(user.id);
  
  return {
    success: true,
    data: {
      ...operator,
      userId: user.id // Asegurar que devuelve userId
    }
  };
}
```

---

## 🎯 Checklist de Verificación

### Frontend
- [ ] Usuario tiene rol "operario" en localStorage
- [ ] Token JWT es válido y no expirado
- [ ] Consola muestra logs de debug sin errores 403
- [ ] Lista de operadores se carga correctamente
- [ ] Auto-asignación ejecuta sin errores

### Backend
- [ ] Endpoint `/users/all` permite acceso a operario
- [ ] Endpoint `/users/all` filtra y devuelve solo operarios
- [ ] Endpoint `/operators/my-operator` existe
- [ ] Endpoint `/operators/my-operator` permite acceso a operario
- [ ] Usuario operario tiene operador asociado en DB
- [ ] Campo `userId` existe en tabla operators
- [ ] Relación entre users y operators está correcta

### Base de Datos
- [ ] Usuario existe en tabla `users`
- [ ] Usuario tiene rol "operario"
- [ ] Operador existe en tabla `operators`
- [ ] Campo `userId` en operador coincide con `user.id`

---

## 🛠️ Herramientas de Debug

### 1. Verificar Token JWT

```javascript
// En consola del navegador:
const token = localStorage.getItem('access_token');
console.log('Token:', token);

// Decodificar JWT (copiar token y pegar en https://jwt.io)
// Verificar que el payload incluya:
// - userId
// - email
// - roles: ["operario"]
```

### 2. Verificar Usuario Actual

```javascript
// En consola del navegador:
const user = JSON.parse(localStorage.getItem('user'));
console.log('Usuario:', user);
console.log('Roles:', user.roles);
console.log('Es operario?', user.roles?.includes('operario'));
```

### 3. Probar Endpoint Manualmente

```javascript
// En consola del navegador:
fetch('http://localhost:3000/operators/my-operator', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
.then(r => r.json())
.then(data => console.log('Mi operador:', data))
.catch(err => console.error('Error:', err));
```

### 4. Ver Network Tab

1. Abrir DevTools (F12)
2. Ir a pestaña **Network**
3. Filtrar por "Fetch/XHR"
4. Recargar página
5. Buscar peticiones:
   - `GET /users/all` → Debe retornar 200
   - `GET /operators/my-operator` → Debe retornar 200

---

## 📋 Reporte de Error

Si el problema persiste, recolecta esta información:

### Información del Usuario
```javascript
// Ejecutar en consola:
const user = JSON.parse(localStorage.getItem('user'));
console.log({
  id: user.id,
  email: user.email,
  name: user.name,
  roles: user.roles
});
```

### Logs de Consola
1. Copiar TODOS los logs de consola (especialmente los con 🔍, ✅, ❌)
2. Copiar errores en rojo

### Network Requests
1. Hacer screenshot de pestaña Network
2. Copiar response de peticiones fallidas (clic derecho → Copy → Copy response)

### Compartir con Equipo
- Screenshot de la pantalla
- Logs de consola
- Response de peticiones
- Documento `BACKEND_PERMISOS_OPERARIO.md`

---

## 🚀 Solución Rápida (Temporal)

Si necesitas que el operario trabaje YA mientras se arregla el backend:

### Opción 1: Deshabilitar auto-asignación
```javascript
// En create-report-form.jsx, comentar la auto-asignación:
// if (isOperario && mode === "create") { ... }

// Y permitir que el operario seleccione manualmente
disabled={false} // En vez de disabled={isOperario}
```

### Opción 2: Asignar manualmente en código
```javascript
// Si sabes el ID del operador:
if (isOperario && mode === "create") {
  setFormData(prev => ({ ...prev, operadorId: "123" })); // ID del operador
}
```

---

**Última actualización:** ${new Date().toLocaleDateString()}
