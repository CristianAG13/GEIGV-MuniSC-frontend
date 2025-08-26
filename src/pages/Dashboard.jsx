
import React, { useState, useEffect } from 'react';
import { 
  LogOut, User, Menu, X,
  Home, MapPin, CheckCircle, Loader,
  FileText, Truck, BarChart3, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TransporteModule from '../features/transporte/TransporteModule';
import { 
  sidebarData, 
  categoryLabels, 
  getUserPermissions, 
  getFilteredSidebarByCategory 
} from '../config/navigation';


export default function Dashboard() {
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Estados para el sidebar que se actualizarán cuando el usuario esté disponible
  const [userPermissions, setUserPermissions] = useState([]);
  const [filteredSidebarData, setFilteredSidebarData] = useState({});

  // Efecto para actualizar permisos y sidebar cuando el usuario cambie
  useEffect(() => {
    if (user && user.rol) {
      const permissions = getUserPermissions(user.rol);
      const sidebarData = getFilteredSidebarByCategory(user.rol);
      
      setUserPermissions(permissions);
      setFilteredSidebarData(sidebarData);
      
      console.log('Usuario cargado:', user);
      console.log('Permisos:', permissions);
      console.log('Sidebar data:', sidebarData);
    } else if (user) {
      // Usuario sin rol definido, asignar permisos mínimos
      console.log('Usuario sin rol, asignando permisos mínimos');
      const permissions = ['dashboard'];
      const sidebarData = getFilteredSidebarByCategory(null);
      
      setUserPermissions(permissions);
      setFilteredSidebarData(sidebarData);
    } else {
      // Si no hay usuario, limpiar permisos
      setUserPermissions([]);
      setFilteredSidebarData({});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            Municipalidad de Santa Cruz
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">
            ¡Bienvenido, {user?.name || 'Usuario'} {user?.lastname || ''}!
          </h2>
          <p className="text-blue-100 text-lg mb-2">
            Sistema de Gestión Vial - Municipalidad de Santa Cruz
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full">
              Email: {user?.email || 'No disponible'}
            </span>
            <span className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full">
              Rol: {user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'Sin rol'}
            </span>
          </div>
          {!user?.rol && (
            <div className="mt-3 p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
              <p className="text-yellow-100 text-sm">
                ⚠️ Su cuenta está pendiente de aprobación. Contacte al administrador para obtener acceso completo.
              </p>
            </div>
          )}
        </div>

        {/* Sistema Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gestión de Transporte</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">Vehículos y Maquinaria</p>
                <p className="text-sm text-gray-500 mt-2">Control de flota vehicular municipal</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Proyectos Viales</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">Cuadrillas y Obras</p>
                <p className="text-sm text-gray-500 mt-2">Gestión de proyectos de infraestructura</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reportes y Análisis</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">Estadísticas</p>
                <p className="text-sm text-gray-500 mt-2">Informes de gestión y rendimiento</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setActiveSection('transporte')}
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Ver Transporte</p>
                <p className="text-sm text-gray-600">Gestionar vehículos</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveSection('proyectos-cuadrilla')}
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div className="p-2 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Ver Proyectos</p>
                <p className="text-sm text-gray-600">Gestionar cuadrillas</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveSection('reportes')}
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="p-2 bg-purple-600 rounded-lg group-hover:bg-purple-700 transition-colors">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Ver Reportes</p>
                <p className="text-sm text-gray-600">Análisis y estadísticas</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveSection('configuracion')}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <div className="p-2 bg-gray-600 rounded-lg group-hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Configuración</p>
                <p className="text-sm text-gray-600">Ajustes del sistema</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'transporte':
        return <TransporteModule />;
      case 'proyectos-cuadrilla':
        return (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Proyectos Cuadrilla Manual</h2>
            <p className="text-gray-600">Módulo en desarrollo - Gestión de proyectos con personal manual</p>
          </div>
        );
      case 'reportes':
        return (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Reportes</h2>
            <p className="text-gray-600">Módulo en desarrollo - Generación de reportes y estadísticas</p>
          </div>
        );
      case 'configuracion':
        return (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuración</h2>
            <p className="text-gray-600">Módulo en desarrollo - Configuración del sistema</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  // Mostrar loading mientras se cargan los datos del usuario o la autenticación
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          {authLoading ? "Verificando autenticación..." : "Cargando usuario..."}
        </span>
      </div>
    );
  }

  return (
  
    <div className="h-screen flex bg-gray-50">
      
    {/* Sidebar */}
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
    >
      {/* Header del Sidebar */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Sistema Vial</h1>
            <p className="text-xs text-gray-600">Santa Cruz</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 pt-6 pb-4 overflow-y-auto">
        {/* Información del usuario */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'Usuario'} {user?.lastname || ''}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'Sin rol'}
              </p>
            </div>
            {/* Botón de actualización temporal */}
            {!user?.rol && (
              <button
                onClick={async () => {
                  console.log('Actualizando datos del usuario...');
                  if (refreshUser) {
                    const result = await refreshUser();
                    if (result.success) {
                      console.log('Datos actualizados exitosamente');
                    } else {
                      console.error('Error actualizando datos:', result.error);
                    }
                  }
                }}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="Actualizar datos del usuario"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Menú de navegación */}
        <div className="space-y-1">
          {Object.keys(filteredSidebarData).length > 0 ? (
            Object.keys(filteredSidebarData).map(category => (
              <div key={category}>
                {filteredSidebarData[category].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    title={item.description}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${
                      activeSection === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Cargando módulos...</p>
              <p className="text-xs text-gray-400 mt-1">
                {user?.rol ? `Rol: ${user.rol}` : 'Verificando permisos...'}
              </p>
            </div>
          )}
        </div>

        {/* Botón de cerrar sesión en el sidebar */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </div>

    {/* Contenido principal */}
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Sistema de Gestión Vial - Municipalidad de Santa Cruz</span>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Usuario'} {user?.lastname || ''}
              </p>
              <p className="text-xs text-gray-600">
                {user?.rol
                  ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1)
                  : 'Sin rol'}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
    </div>

    {/* Overlay para mobile */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      ></div>
    )}
  </div>
  );
}