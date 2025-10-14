
// config/navigation.js
import { 
  Home, Users, Truck, UserCheck, HardHat, Shield
} from 'lucide-react';

// ========================
// CONFIG DE PERMISOS POR ROL
// ========================
export const rolePermissions = {
  user: ['dashboard'], // usuario normal solo ve su dashboard
  operator: ['dashboard'], // operadores solo dashboard
  ingeniero: [
    'dashboard', 
    'usuarios', 
    'transporte', 
    'solicitudes-rol', 
    'operadores'
  ],
  superadmin: [
    'dashboard', 
    'usuarios', 
    'transporte', 
    'solicitudes-rol', 
    'operadores',
    'auditoria'
  ],
  guest: ['dashboard'],
  invitado: ['dashboard'], // Usuario invitado solo tiene acceso al dashboard
  inspector: [
    'dashboard', 
    'transporte', 
    'operadores'
  ],
  operario: [
    'dashboard',
    'transporte'
  ],
  manager: [
    'dashboard', 
    'usuarios', 
    'transporte', 
    'operadores'
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
