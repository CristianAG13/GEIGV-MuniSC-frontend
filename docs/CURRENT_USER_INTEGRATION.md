# Integración de Usuario Actual en Boletas

## 📋 Resumen

Se ha implementado la funcionalidad para que **inspectores e ingenieros** puedan obtener automáticamente su **ID de usuario** al rellenar boletas de alquiler. Esto permite:

1. ✅ Identificar quién registra la boleta
2. ✅ Precarga automática del campo "Encargado" con los datos del usuario
3. ✅ Usuarios no-superadmin solo ven su propio nombre como encargado
4. ✅ Superadmins pueden ver y seleccionar todos los operadores

---

## 🔧 Implementación Técnica

### 1. Nuevo Endpoint: `GET /users/me`

**Backend debe proveer:**
```javascript
GET http://localhost:3000/users/me
Headers: {
  Authorization: Bearer <token>
}

// Respuesta:
{
  "id": 5,
  "name": "Juan",
  "lastname": "Pérez",
  "email": "inspector@test.com",
  "roles": ["inspector"]
}
```

### 2. Servicio de Usuarios (`usersService.js`)

Se agregó el método `getMe()`:

```javascript
async getMe() {
  const token = localStorage.getItem('access_token');
  const response = await apiClient.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
```

### 3. Hook Personalizado: `useCurrentUser.js`

Se crearon dos hooks reutilizables:

#### `useCurrentUser()`
Obtiene la información completa del usuario actual.

```javascript
import { useCurrentUser } from '@/hooks/useCurrentUser';

function MyComponent() {
  const { currentUser, loading, error } = useCurrentUser();
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Hola, {currentUser.name}</div>;
}
```

#### `useCurrentUserAsOperator()`
Versión simplificada para usar en formularios.

```javascript
import { useCurrentUserAsOperator } from '@/hooks/useCurrentUser';

function FormComponent() {
  const { userId, userFullName, loading } = useCurrentUserAsOperator();
  
  console.log('ID del usuario:', userId);
  console.log('Nombre completo:', userFullName);
}
```

---

## 🎯 Flujo de Uso en Formularios

### Formulario de Boleta de Alquiler

```javascript
// 1. Al cargar el formulario
useEffect(() => {
  // Se obtiene la información del usuario actual
  const currentUserInfo = await usersService.getMe();
  
  // 2. Si NO es superadmin
  if (!isSuperAdmin) {
    // Se crea un operador con los datos del usuario
    const userAsOperator = {
      id: `user_${currentUserInfo.id}`,
      name: currentUserInfo.name,
      last: currentUserInfo.lastname,
      email: currentUserInfo.email
    };
    
    // Se preselecciona automáticamente
    setFormData({ ...formData, operadorId: userAsOperator.id });
  }
}, []);

// 3. Al enviar el formulario
const handleSubmit = async (e) => {
  // Si el operadorId empieza con "user_", usar el ID real del usuario
  let realOperadorId;
  if (formData.operadorId.startsWith('user_')) {
    realOperadorId = user.id; // ID real del usuario
  } else {
    realOperadorId = Number(formData.operadorId); // ID de operador
  }
  
  await machineryService.createRentalReport({
    ...payload,
    operadorId: realOperadorId
  });
};
```

---

## 🔄 Comparación con el Script de Prueba

### Script de Prueba Original
```javascript
async function testMyInspectorIngenieroId() {
  // 1. Login
  const token = await login('inspector@test.com', 'password123');
  
  // 2. Obtener mi información
  const myInfo = await getMyInfo(token);
  console.log('Mi ID:', myInfo.id);
  
  // 3. Usar el ID en la boleta
  await createBoleta({ inspectorId: myInfo.id });
}
```

### Implementación en Producción
```javascript
// 1. Usuario ya está logueado (token en localStorage)

// 2. Formulario obtiene automáticamente el ID
useEffect(() => {
  const myInfo = await usersService.getMe();
  console.log('Mi ID:', myInfo.id);
  setFormData({ operadorId: `user_${myInfo.id}` });
}, []);

// 3. Al enviar, se usa el ID real
const realId = formData.operadorId.startsWith('user_') 
  ? user.id 
  : Number(formData.operadorId);
```

---

## 🧪 Validación y Testing

### Casos de Prueba

#### 1. Inspector/Ingeniero crea boleta
```bash
# Login
POST /auth/login
Body: { email: "inspector@test.com", password: "password123" }

# El formulario automáticamente:
# - Llama GET /users/me
# - Obtiene el ID: 5
# - Preselecciona "Inspector Juan Pérez" como encargado
# - Al crear la boleta, usa operadorId: 5
```

#### 2. SuperAdmin crea boleta
```bash
# Login como superadmin
POST /auth/login
Body: { email: "admin@test.com", password: "admin123" }

# El formulario:
# - Muestra TODOS los operadores en la lista
# - SuperAdmin puede elegir cualquier operador
# - Se envía el operadorId seleccionado
```

---

## 📝 Integración en Otros Formularios

Para agregar esta funcionalidad a otros formularios:

### Ejemplo: Formulario de Transporte

```javascript
import { useCurrentUser } from '@/hooks/useCurrentUser';
import usersService from '@/services/usersService';

export default function CreateTransportForm() {
  const { user } = useAuth();
  const { currentUser, loading } = useCurrentUser();
  const [formData, setFormData] = useState({
    inspectorId: null,
    // ... otros campos
  });

  useEffect(() => {
    if (currentUser && !isSuperAdmin(user)) {
      // Precargar con el ID del usuario actual
      setFormData(prev => ({
        ...prev,
        inspectorId: currentUser.id
      }));
    }
  }, [currentUser, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      inspectorId: formData.inspectorId || currentUser?.id
    };
    
    await transportService.create(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campo de inspector (deshabilitado para no-superadmin) */}
      <input
        value={currentUser?.name || ''}
        disabled={!isSuperAdmin(user)}
      />
      {/* ... otros campos */}
    </form>
  );
}
```

---

## ✅ Ventajas de esta Implementación

1. **Seguridad**: El ID del usuario se obtiene del backend, no se puede falsificar
2. **Reutilizable**: Hooks personalizados que se pueden usar en cualquier formulario
3. **UX Mejorada**: Los usuarios no tienen que buscar su nombre en una lista
4. **Auditable**: Cada boleta queda registrada con el ID real del usuario que la creó
5. **Flexible**: SuperAdmins mantienen control total

---

## 🚨 Consideraciones Importantes

### Backend Requirements
- ✅ Endpoint `GET /users/me` debe estar implementado
- ✅ Debe retornar `id`, `name`, `lastname`, `email`, `roles`
- ✅ Debe validar el token JWT
- ✅ Debe funcionar con tokens de inspectores, ingenieros y superadmins

### Frontend
- ✅ Token debe estar guardado en `localStorage` como `access_token`
- ✅ Maneja casos de error (fallback a datos del contexto)
- ✅ Diferencia entre usuarios normales y superadmins

---

## 📚 Archivos Modificados

```
src/
├── services/
│   └── usersService.js              # ✅ Agregado método getMe()
├── hooks/
│   └── useCurrentUser.js            # ✅ Nuevo hook
├── features/
│   └── transporte/
│       └── components/
│           └── forms/
│               └── create-rental-report-form.jsx  # ✅ Integrado
└── docs/
    └── CURRENT_USER_INTEGRATION.md  # ✅ Esta documentación
```

---

## 🎬 Demo Completo

### Flujo de Usuario Inspector

1. **Login**
   ```bash
   inspector@test.com / password123
   ```

2. **Navegar a "Crear Boleta de Alquiler"**
   - Campo "Encargado" automáticamente muestra: **"Juan Pérez (inspector@test.com)"**
   - Campo está deshabilitado (no puede cambiarlo)

3. **Llenar el resto del formulario**
   - Fecha
   - Tipo de maquinaria
   - Actividad
   - etc.

4. **Enviar formulario**
   - Se guarda con `operadorId: 5` (ID real del inspector)
   - Backend registra: "Boleta creada por Inspector Juan Pérez (ID: 5)"

---

## 🔗 Referencias

- Script de prueba original: (ver inicio del documento del usuario)
- Endpoint backend: `GET /users/me`
- Servicio: `src/services/usersService.js`
- Hook: `src/hooks/useCurrentUser.js`
- Formulario: `src/features/transporte/components/forms/create-rental-report-form.jsx`
