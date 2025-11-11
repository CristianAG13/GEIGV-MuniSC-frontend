
// config/navigation.js
import { 
  Home, Users, Truck, UserCheck, HardHat, Shield, BarChart3
} from 'lucide-react';


export const rolePermissions = {
  user: ['dashboard'],
  operator: ['dashboard'],
  ingeniero: [
    'dashboard', 
    'transporte', // ✅ Crear/editar reportes
    'estadisticas', // ✅ Dashboard de estadísticas completo
    'auditoria' // ✅ Auditoría del sistema (logs y usuarios activos)
  ],
  superadmin: [
    'dashboard', 
    'usuarios', // ✅ Gestionar usuarios
    'transporte', // ✅ Crear/editar reportes
    'solicitudes-rol', // ✅ Aprobar solicitudes
    'operadores', // ✅ Ver/editar todos los operadores
    'estadisticas', // ✅ Dashboard de estadísticas completo
    'auditoria' // ✅ Acceso completo a auditoría (logs, usuarios activos y estadísticas de auditoría)
  ],
  guest: ['dashboard'],
  invitado: ['dashboard'],
  inspector: [
    'dashboard', 
    'transporte', // ✅ Crear/editar reportes
    'estadisticas', // ✅ Dashboard de estadísticas (básicas)
    'auditoria' // ✅ Ver auditoría del sistema (logs y estadísticas básicas de auditoría)
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
      id: 'estadisticas', 
      name: 'Estadísticas del Sistema', 
      icon: BarChart3, 
      permission: 'estadisticas',
      description: 'Dashboard completo de métricas y análisis de tendencias',
      category: 'system'
    },
    { 
      id: 'auditoria', 
      name: 'Auditoría del Sistema', 
      icon: Shield, 
      permission: 'auditoria',
      description: 'Logs de auditoría y usuarios conectados al sistema',
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
  system: 'Análisis y Sistema'
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
