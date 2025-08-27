
import React, { useState, useEffect } from 'react';
import { 
  LogOut, User, Users, Menu, X, Plus, Edit, Trash2,
  Home, MapPin, CheckCircle, Clock, UserCheck, Loader,
  FileText, Truck, BarChart3, Settings, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import rolesService from '../services/rolesService';
import usersService from '../services/usersService';
import { showSuccess, showError, confirmDelete, confirmAction } from '../utils/sweetAlert';
import TransporteModule from '../features/transporte/TransporteModule';
import RequestRoleComponent from '../components/RequestRoleComponent';
import RoleRequestNotifications from '../components/RoleRequestNotifications';
import RoleRequestsManagement from '../components/RoleRequestsManagement';
import SweetAlertDemo from '../components/SweetAlertDemo';
import { 
  sidebarData, 
  categoryLabels, 
  getUserPermissions, 
  getFilteredSidebarByCategory 
} from '../config/navigation';
import logo from '../assets/logo.png';


export default function Dashboard() {
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    lastname: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

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

  // Cargar datos cuando se active la sección de usuarios
  useEffect(() => {
    if (activeSection === 'usuarios') {
      loadData();
    }
  }, [activeSection]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        usersService.getAllUsers(),
        rolesService.getActiveRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await confirmAction(
      '¿Cerrar sesión?',
      '¿Está seguro que desea cerrar su sesión actual?',
      {
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        icon: 'question'
      }
    );
    
    if (result.isConfirmed) {
      logout();
      showSuccess(
        'Sesión cerrada',
        'Ha cerrado sesión exitosamente',
        {
          timer: 2000,
          showConfirmButton: false
        }
      );
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      nombre: user.name,
      apellido: user.lastname
    });
    setShowEditModal(true);
  };

  const handleCreateUser = () => {
    setNewUser({
      name: '',
      lastname: '',
      email: '',
      password: ''
    });
    setShowCreateModal(true);
  };

  const handleSaveNewUser = async () => {
    try {
      // Validaciones básicas
      if (!newUser.name.trim() || !newUser.lastname.trim() || !newUser.email.trim() || !newUser.password.trim()) {
        showError('Campos requeridos', 'Todos los campos son obligatorios');
        return;
      }

      if (newUser.password.length < 6) {
        showError('Contraseña inválida', 'La contraseña debe tener al menos 6 caracteres');
        return;
      }

      // Crear el usuario usando el endpoint de administración
      await usersService.createUser({
        name: newUser.name.trim(),
        lastname: newUser.lastname.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
      });

      await loadData();
      setShowCreateModal(false);
      setNewUser({
        name: '',
        lastname: '',
        email: '',
        password: ''
      });
      showSuccess('Usuario creado', 'El usuario ha sido creado exitosamente');
    } catch (error) {
      showError('Error al crear usuario', error.message);
    }
  };

  const handleSaveUser = async () => {
    try {
      await usersService.updateUser(editingUser.id, {
        email: editingUser.email,
        name: editingUser.nombre,
        lastname: editingUser.apellido,
      });
      await loadData();
      setShowEditModal(false);
      setEditingUser(null);
      showSuccess('Usuario actualizado', 'El usuario ha sido actualizado exitosamente');
    } catch (error) {
      showError('Error al actualizar', error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await confirmDelete('este usuario');
    if (result.isConfirmed) {
      try {
        await usersService.deleteUser(userId);
        await loadData();
        showSuccess('Usuario eliminado', 'El usuario ha sido eliminado exitosamente');
      } catch (error) {
        showError('Error al eliminar', error.message);
      }
    }
  };

  const handleRoleChange = async (userId, roleName) => {
    try {
      if (roleName === '') {
        await usersService.assignRoles(userId, []);
      } else {
        const role = roles.find(r => r.name === roleName);
        if (role) {
          await usersService.assignRoles(userId, [role.id]);
        }
      }
      await loadData();
      showSuccess('Rol asignado', 'El rol ha sido asignado exitosamente');
    } catch (error) {
      showError('Error al asignar rol', error.message);
    }
  };

  const getStatusBadge = (user) => {
    let estado;
    const hasBeenProcessed = user.updatedAt !== user.createdAt;
    
    if (!user.roles || user.roles.length === 0) {
      if (hasBeenProcessed) {
        estado = 'inactivo';
      } else {
        estado = 'pendiente';
      }
    } else if (user.isActive) {
      estado = 'activo';
    } else {
      estado = 'inactivo';
    }

    const styles = {
      activo: 'bg-green-100 text-green-800 border-green-200',
      inactivo: 'bg-red-100 text-red-800 border-red-200',
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    const icons = {
      activo: <CheckCircle className="w-3 h-3" />,
      inactivo: <X className="w-3 h-3" />,
      pendiente: <Clock className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[estado]}`}>
        {icons[estado]}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
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
        <div className="bg-gradient-to-r from-santa-cruz-blue-600 to-santa-cruz-green-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1">
              <img 
                src={logo} 
                alt="Logo Municipalidad Santa Cruz" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                ¡Bienvenido, {user?.name || 'Usuario'} {user?.lastname || ''}!
              </h2>
              <p className="text-santa-cruz-gold-200 text-lg">
                Sistema de Gestión Vial - Municipalidad de Santa Cruz
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-santa-cruz-gold-500 bg-opacity-20 px-3 py-1 rounded-full border border-santa-cruz-gold-400 border-opacity-30">
              Email: {user?.email || 'No disponible'}
            </span>
            <span className="bg-santa-cruz-gold-500 bg-opacity-20 px-3 py-1 rounded-full border border-santa-cruz-gold-400 border-opacity-30">
              Rol: {user?.rol ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1) : 'Sin rol'}
            </span>
          </div>
          {!user?.rol && (
            <div className="mt-3 p-3 bg-santa-cruz-gold-500 bg-opacity-20 rounded-lg border border-santa-cruz-gold-400 border-opacity-30">
              <p className="text-santa-cruz-gold-100 text-sm">
                ⚠️ Su cuenta está pendiente de aprobación. Contacte al administrador para obtener acceso completo.
              </p>
            </div>
          )}
        </div>

        {/* Componente para solicitar rol si no tiene rol asignado */}
        {!user?.rol && !user?.role && (
          <RequestRoleComponent 
            user={user} 
            onRequestSent={() => {
              // Opcional: actualizar datos del usuario después de enviar solicitud
              if (refreshUser) {
                refreshUser();
              }
            }}
          />
        )}

        {/* Sistema Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gestión de Transporte</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">Vehículos y Maquinaria</p>
                <p className="text-sm text-gray-500 mt-2">Control de flota vehicular municipal</p>
              </div>
              <div className="p-3 bg-santa-cruz-blue-100 rounded-full">
                <Truck className="w-6 h-6 text-santa-cruz-blue-600" />
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
              <div className="p-3 bg-santa-cruz-green-100 rounded-full">
                <FileText className="w-6 h-6 text-santa-cruz-green-600" />
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
              <div className="p-3 bg-santa-cruz-gold-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-santa-cruz-gold-600" />
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

  const renderUsuarios = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de usuarios</h1>
        <button 
          onClick={handleCreateUser}
          className="bg-santa-cruz-blue-600 hover:bg-santa-cruz-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-santa-cruz-blue-600" />
          <span className="ml-2 text-gray-600">Cargando usuarios...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-72">EMAIL</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">NOMBRE</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">APELLIDO</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">ROL</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ESTADO</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-20">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-72">
                      <div className="truncate max-w-xs" title={user.email}>
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-40">
                      <div className="truncate" title={user.name || 'N/A'}>
                        {user.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-40">
                      <div className="truncate" title={user.lastname || 'N/A'}>
                        {user.lastname || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-40">
                      <select
                        value={user.roles && user.roles.length > 0 ? user.roles[0].name : ''}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sin rol</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-32">
                      <div className="flex justify-center">
                        {getStatusBadge(user)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-santa-cruz-blue-600 hover:text-santa-cruz-blue-800 p-2 rounded-md hover:bg-santa-cruz-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'usuarios':
        return renderUsuarios();
      case 'solicitudes-rol':
        return <RoleRequestsManagement />;
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
        return <SweetAlertDemo />;
      default:
        return renderDashboard();
    }
  };

  // Mostrar loading mientras se cargan los datos del usuario o la autenticación
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-santa-cruz-blue-600" />
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
      <div className="flex items-center justify-between h-16 px-4 border-b border-santa-cruz-blue-200 bg-gradient-to-r from-santa-cruz-blue-500 to-santa-cruz-green-600 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
            <img 
              src={logo} 
              alt="Logo Municipalidad Santa Cruz" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Sistema Vial</h1>
            <p className="text-xs text-santa-cruz-gold-200">Municipalidad Santa Cruz</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-md text-white hover:text-santa-cruz-gold-200 hover:bg-white hover:bg-opacity-20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 pt-6 pb-4 overflow-y-auto">
        {/* Información del usuario */}
        <div className="mb-6 p-3 bg-gradient-to-r from-santa-cruz-blue-50 to-santa-cruz-green-50 rounded-lg border border-santa-cruz-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-santa-cruz-blue-600 to-santa-cruz-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'Usuario'} {user?.lastname || ''}
              </p>
              <p className="text-xs text-santa-cruz-blue-600 truncate">
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
                className="p-1 text-santa-cruz-blue-600 hover:text-santa-cruz-blue-800 hover:bg-santa-cruz-blue-50 rounded"
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
                        ? 'bg-gradient-to-r from-santa-cruz-blue-50 to-santa-cruz-green-50 text-santa-cruz-blue-700 shadow-sm border border-santa-cruz-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${
                      activeSection === item.id ? 'text-santa-cruz-blue-600' : 'text-gray-400 group-hover:text-gray-600'
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
              <div className="w-4 h-4 bg-gradient-to-br from-santa-cruz-blue-500 to-santa-cruz-green-500 rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              </div>
              <span>Sistema de Gestión Vial - Municipalidad de Santa Cruz</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notificaciones de solicitudes de rol para admins */}
            <RoleRequestNotifications userRole={user?.rol} />
            
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
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
    </div>

    {/* Edit User Modal */}
    {showEditModal && editingUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h2 className="text-lg font-bold mb-4">Editar Usuario</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={editingUser.nombre || ''}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, nombre: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                value={editingUser.apellido || ''}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, apellido: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Create User Modal */}
    {showCreateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h2 className="text-lg font-bold mb-4">Crear Nuevo Usuario</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={newUser.lastname}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastname: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el apellido"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveNewUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Usuario
            </button>
          </div>
        </div>
      </div>
    )}

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