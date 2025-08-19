# Autenticación - Frontend

Este documento explica cómo están implementadas las funciones de autenticación en el frontend.

## Características Implementadas

### 1. Registro de Usuario
- **Archivo**: `src/pages/Register.jsx`
- **Servicio**: `authService.register()`
- **Endpoint**: `POST /auth/register`
- **Campos requeridos**:
  - name (nombre)
  - lastname (apellido)
  - email
  - password
  - confirmPassword (validación frontend)

### 2. Recuperar Contraseña
- **Archivo**: `src/pages/ForgotPassword.jsx`
- **Servicio**: `authService.forgotPassword()`
- **Endpoint**: `POST /auth/forgot-password`
- **Campo requerido**: email

### 3. Restablecer Contraseña
- **Archivo**: `src/pages/ResetPassword.jsx`
- **Servicios**: 
  - `authService.verifyResetToken()` - Verificar token
  - `authService.resetPassword()` - Cambiar contraseña
- **Endpoints**: 
  - `GET /auth/verify-reset-token/:token`
  - `POST /auth/reset-password`
- **Ruta**: `/reset-password/:token`

## Configuración del Backend

### Variables de Entorno
El archivo `.env` ya está configurado con:

```env
VITE_API_URL=http://localhost:3001/api/v1
```

Si necesitas cambiar la URL del backend, modifica este valor en el archivo `.env`.

### Endpoints Esperados del Backend

1. **Registro**
   ```
   POST /auth/register
   Body: {
     name: string,
     lastname: string,
     email: string,
     password: string
   }
   Response: {
     success: boolean,
     message: string,
     data?: any
   }
   ```

2. **Recuperar Contraseña**
   ```
   POST /auth/forgot-password
   Body: {
     email: string
   }
   Response: {
     success: boolean,
     message: string
   }
   ```

3. **Verificar Token de Reset**
   ```
   GET /auth/verify-reset-token/:token
   Response: {
     success: boolean,
     data?: any
   }
   ```

4. **Restablecer Contraseña**
   ```
   POST /auth/reset-password
   Body: {
     token: string,
     password: string
   }
   Response: {
     success: boolean,
     message: string
   }
   ```

## Flujo de Recuperación de Contraseña

1. Usuario ingresa email en `/forgot-password`
2. Backend envía correo con enlace que contiene token
3. Usuario hace clic en enlace: `/reset-password/:token`
4. Frontend verifica si el token es válido
5. Si es válido, muestra formulario para nueva contraseña
6. Usuario ingresa nueva contraseña
7. Frontend envía token + nueva contraseña al backend
8. Redirige al login tras éxito

## Manejo de Errores

El servicio de autenticación maneja varios tipos de errores:

- **Errores de conexión**: Servidor no disponible
- **Errores 400**: Datos inválidos
- **Errores 401**: No autorizado
- **Errores 404**: Usuario/token no encontrado
- **Errores 409**: Usuario ya existe (registro)
- **Errores 500+**: Errores del servidor

## Validaciones Frontend

### Registro
- Nombres y apellidos requeridos
- Contraseñas deben coincidir
- Contraseña mínimo 6 caracteres
- Email válido

### Reset Password
- Contraseñas deben coincidir
- Contraseña mínimo 6 caracteres
- Token válido (verificado automáticamente)

## Estados de la UI

### Durante carga
- Botones deshabilitados
- Indicadores de carga (spinner)
- Campos de entrada deshabilitados

### Mensajes de éxito
- Confirmación visual
- Redirección automática
- Mensajes informativos

### Mensajes de error
- Errores específicos del backend
- Errores de validación frontend
- Errores de conexión

## Testing

Para probar las funcionalidades:

1. Asegúrate de que el backend esté corriendo en `http://localhost:3001`
2. Configura los endpoints correspondientes en tu backend
3. Configura el envío de correos para recuperación de contraseña
4. Prueba el flujo completo desde el frontend

## Notas Adicionales

- Todos los tokens se manejan en URLs, no en localStorage para mayor seguridad
- Las contraseñas nunca se almacenan en el frontend
- Los servicios incluyen logging para debug
- La configuración es flexible mediante variables de entorno
