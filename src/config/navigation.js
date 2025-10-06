
// config/navigation.js
import { 
  Home, Users, Truck, FileText, BarChart3, Settings,
  UserCheck, HardHat, Wrench, ClipboardList, Shield
} from 'lucide-react';

// ========================
// CONFIG DE PERMISOS POR ROL
// ========================
export const rolePermissions = {
  user: ['dashboard'], // usuario normal solo ve su dashboard
  operator: ['dashboard', 'reportes-maquinaria'], // operadores solo reportes
  ingeniero: [
    'dashboard', 
    'usuarios', 
    'transporte', 
    'proyectos-cuadrilla', 
    'reportes', 
    'solicitudes-rol', 
    'operadores',
    'reportes-maquinaria'
  ],
  superadmin: [
    'dashboard', 
    'usuarios', 
    'transporte', 
    'proyectos-cuadrilla', 
    'reportes', 
    'configuracion', 
    'solicitudes-rol', 
    'operadores',
    'reportes-maquinaria',
    'auditoria'
  ],
  guest: ['dashboard'],
  invitado: ['dashboard'], // Usuario invitado solo tiene acceso al dashboard
  inspector: [
    'dashboard', 
    'transporte', 
    'proyectos-cuadrilla', 
    'reportes', 
    'operadores',
    'reportes-maquinaria'
  ],
  operario: [
    'dashboard',
    'reportes-maquinaria',
    'transporte'
  ],
  manager: [
    'dashboard', 
    'usuarios', 
    'transporte', 
    'proyectos-cuadrilla', 
    'reportes', 
    'operadores',
    'reportes-maquinaria'
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
  projects: [
    { 
      id: 'proyectos-cuadrilla', 
      name: 'Proyectos Cuadrilla', 
      icon: FileText, 
      permission: 'proyectos-cuadrilla',
      description: 'Gestión de proyectos con personal manual',
      category: 'projects'
    }
  ],
  reports: [
    { 
      id: 'reportes', 
      name: 'Reportes y Análisis', 
      icon: BarChart3, 
      permission: 'reportes',
      description: 'Generación de reportes y estadísticas',
      category: 'reports'
    },
    { 
      id: 'reportes-maquinaria', 
      name: 'Reportes de Maquinaria', 
      icon: ClipboardList, 
      permission: 'reportes-maquinaria',
      description: 'Reportes creados por operadores sobre maquinaria',
      category: 'reports'
    }
  ],
  system: [
    { 
      id: 'configuracion', 
      name: 'Configuración', 
      icon: Settings, 
      permission: 'configuracion',
      description: 'Configuración del sistema',
      category: 'system'
    },
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
  projects: 'Proyectos',
  reports: 'Reportes',
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
    ...sidebarData.projects,
    ...sidebarData.reports,
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
