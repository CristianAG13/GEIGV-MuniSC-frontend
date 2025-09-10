# Actualización de Roles en la Base de Datos

Este documento contiene los scripts SQL necesarios para actualizar los roles en la base de datos del sistema.

## Script de Actualización de Roles

```sql
-- Primero, borrar roles anteriores si es necesario
-- ADVERTENCIA: Esto eliminará todos los roles existentes. Usar con precaución.
-- DELETE FROM roles;

-- Insertar los nuevos roles
INSERT INTO roles (name, description) VALUES
('superadmin', 'Administrador con todos los permisos'),
('ingeniero', 'Ingeniero con permisos de administración'),
('inspector', 'Inspector con permisos de gestión'),
('operario', 'Operario con permisos de gestión'),
('invitado', 'Usuario invitado con permisos limitados');
```

## Nota Importante

Este cambio de roles requiere actualizar tanto el backend como el frontend:

1. En el backend: Ejecutar el script SQL anterior para actualizar la tabla de roles.
2. En el frontend: Ya se han actualizado los componentes para usar los nuevos roles.

## Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| superadmin | Administrador con todos los permisos | Acceso total al sistema |
| ingeniero | Ingeniero con permisos de administración | Gestión de usuarios, reportes y maquinaria |
| inspector | Inspector con permisos de gestión | Gestión de maquinaria y reportes |
| operario | Operario con permisos de gestión | Creación de reportes y uso de materiales |
| invitado | Usuario invitado con permisos limitados | Solo visualización de datos |

## Compatibilidad con Versiones Anteriores

Si en el sistema existían roles como "user", "operator", o "manager", se recomienda migrar a los nuevos roles de la siguiente manera:

- "user" → "invitado"
- "operator" → "operario"
- "manager" → "inspector"
- "admin" → "ingeniero"
- "ingeniero" → "inspector"

Esto asegurará que los usuarios existentes mantengan permisos similares después de la actualización.
