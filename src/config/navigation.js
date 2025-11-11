
// config/navigation.js
import { 
  Home, Users, Truck, UserCheck, HardHat, Shield
} from 'lucide-react';

// ========================
// CONFIG DE PERMISOS POR ROL
// Basado en la tabla del backend:
// - Gestionar usuarios: solo superadmin
// - Gestionar roles: solo superadmin
// - Aprobar solicitudes: solo superadmin
// - Ver/editar operadores: solo superadmin (operario ve solo los suyos)
// - Gestionar maquinaria: solo superadmin
// - Crear/editar reportes: superadmin, ingeniero, inspector, operario (solo propios)
// - Ver reportes eliminados: solo superadmin
// - Restaurar reportes: solo superadmin
// - Ver resúmenes: solo superadmin
// - Ver auditoría: superadmin, ingeniero, inspector
// - Gestionar auditoría: solo superadmin
// ========================
export const rolePermissions = {
  user: ['dashboard'],
  operator: ['dashboard'],
  ingeniero: [
    'dashboard', 
    'transporte', // ✅ Crear/editar reportes
    'auditoria-view' // ✅ Solo visualización de auditoría
  ],
  superadmin: [
    'dashboard', 
    'usuarios', // ✅ Gestionar usuarios
    'transporte', // ✅ Crear/editar reportes
    'solicitudes-rol', // ✅ Aprobar solicitudes
    'operadores', // ✅ Ver/editar todos los operadores
    'auditoria' // ✅ Acceso completo a auditoría (incluyendo resúmenes)
  ],
  guest: ['dashboard'],
  invitado: ['dashboard'],
  inspector: [
    'dashboard', 
    'transporte', // ✅ Crear/editar reportes
    'auditoria' // ✅ Ver auditoría del sistema
  ],
  operario: [
    'dashboard',
    'transporte' // ✅ Solo crear/editar sus propios reportes municipales
  ],
  manager: [
    'dashboard', 
    'transporte'
  ]
};

// ========================
// DATOS DEL SIDEBAR
// ========================
export const sidebarData = {
  main: [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home, 
      permission: 'dashboard',
      description: 'Panel principal con estadísticas generales',
      category: 'main'
    }
  ],
  management: [
    { 
      id: 'usuarios', 
      name: 'Gestión de Usuarios', 
      icon: Users, 
      permission: 'usuarios',
      description: 'Administrar usuarios del sistema',
      category: 'management'
    },
    { 
      id: 'solicitudes-rol', 
      name: 'Solicitudes de Rol', 
      icon: UserCheck, 
      permission: 'solicitudes-rol',
      description: 'Gestionar solicitudes de roles de usuarios',
      category: 'management'
    },
    { 
      id: 'transporte', 
      name: 'Gestión de Transporte', 
      icon: Truck, 
      permission: 'transporte',
      description: 'Administrar vehículos y transporte',
      category: 'management'
    },
    { 
      id: 'operadores', 
      name: 'Gestión de Operadores', 
      icon: HardHat, 
      permission: 'operadores',
      description: 'Administrar operadores de maquinaria y vehículos',
      category: 'management'
    }
  ],
  system: [
    { 
      id: 'auditoria', 
      name: 'Auditoría del Sistema', 
      icon: Shield, 
      permission: 'auditoria',
      description: 'Registro y seguimiento de todas las actividades del sistema',
      category: 'system'
    }
  ]
};

// ========================
// LABELS DE CATEGORÍAS
// ========================
export const categoryLabels = {
  main: 'Panel Principal',
  management: 'Gestión',
  system: 'Sistema'
};

// ========================
// HELPERS
// ========================
export const getUserPermissions = (userRole) => {
  if (!userRole) return ['dashboard'];
  return rolePermissions[userRole] || ['dashboard'];
};

export const getAllSidebarItems = () => {
  return [
    ...sidebarData.main,
    ...sidebarData.management,
    ...sidebarData.system
  ];
};

export const getFilteredSidebarItems = (userRole) => {
  const permissions = getUserPermissions(userRole);
  return getAllSidebarItems().filter(item => permissions.includes(item.permission));
};

export const getFilteredSidebarByCategory = (userRole) => {
  const permissions = getUserPermissions(userRole);
  const filteredData = {};
  
  Object.keys(sidebarData).forEach(category => {
    const filteredItems = sidebarData[category].filter(item => 
      permissions.includes(item.permission)
    );
    if (filteredItems.length > 0) {
      filteredData[category] = filteredItems;
    }
  });
  
  return filteredData;
};

export default {
  rolePermissions,
  sidebarData,
  categoryLabels,
  getUserPermissions,
  getAllSidebarItems,
  getFilteredSidebarItems,
  getFilteredSidebarByCategory
};
