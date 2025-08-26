// config/navigation.js
import { 
  Home, Users, Truck, FileText, BarChart3, Settings,
  MapPin, CheckCircle, Clock, UserCheck, Wrench
} from 'lucide-react';

// Configuración de permisos por rol
export const rolePermissions = {
  user: ['dashboard', 'transporte', 'proyectos-cuadrilla'],
  admin: ['dashboard', 'usuarios', 'transporte', 'proyectos-cuadrilla', 'reportes'],
  manager: ['dashboard', 'usuarios', 'transporte', 'proyectos-cuadrilla', 'reportes'],
  guest: ['dashboard'],
  superadmin: ['dashboard', 'usuarios', 'transporte', 'proyectos-cuadrilla', 'reportes', 'configuracion']
};

// Datos de navegación del sidebar organizados por categorías
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
      id: 'transporte', 
      name: 'Gestión de Transporte', 
      icon: Truck, 
      permission: 'transporte',
      description: 'Administrar vehículos y maquinaria',
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
    }
  ]
};

// Etiquetas de categorías para el sidebar
export const categoryLabels = {
  main: 'Panel Principal',
  management: 'Gestión',
  projects: 'Proyectos',
  reports: 'Reportes',
  system: 'Sistema'
};

// Función para obtener permisos de un usuario
export const getUserPermissions = (userRole) => {
  // Si no hay rol, devolver permisos mínimos
  if (!userRole) {
    return ['dashboard'];
  }
  
  const permissions = rolePermissions[userRole] || ['dashboard'];
  return permissions;
};

// Función para obtener todos los elementos del sidebar en formato plano
export const getAllSidebarItems = () => {
  return [
    ...sidebarData.main,
    ...sidebarData.management,
    ...sidebarData.projects,
    ...sidebarData.reports,
    ...sidebarData.system
  ];
};

// Función para filtrar elementos según permisos del usuario
export const getFilteredSidebarItems = (userRole) => {
  const permissions = getUserPermissions(userRole);
  return getAllSidebarItems().filter(item => permissions.includes(item.permission));
};

// Función para obtener elementos filtrados por categoría
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
