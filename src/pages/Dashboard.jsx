
import React, { useState, useEffect } from 'react';
import { 
  LogOut, User, Users, Menu, X, Plus, Edit, Trash2,
  Home, MapPin, CheckCircle, Clock, UserCheck, Loader,
  FileText, Truck, BarChart3, Settings, UserPlus, HardHat,Shield,
  AlertCircle, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import rolesService from '../services/rolesService';
import usersService from '../services/usersService';
import roleRequestService from '../services/roleRequestService';
import operatorsService from '../services/operatorsService';
import { useAuditLogger } from '../hooks/useAuditLogger';
import { showSuccess, showError, confirmDelete, confirmAction } from '../utils/sweetAlert';
import { clearNavigationCache } from '@/utils/refreshNavigation';
import TransporteModule from '../features/transporte/TransporteModule';
import { OperadoresModule } from '../features/operadores';
import { AuditoriaModule } from '../features/auditoria';
import EstadisticasModule from '../features/estadisticas/EstadisticasModule';

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
  const { logCreate, logUpdate, logDelete } = useAuditLogger();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateOperatorModal, setShowCreateOperatorModal] = useState(false);
  const [showRoleRequestModal, setShowRoleRequestModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    lastname: '',
    email: '',
    password: ''
  });
  const [newOperator, setNewOperator] = useState({
    name: '',
    last: '',
    identification: '',
    phoneNumber: '',
    userId: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [justification, setJustification] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  // Estados para el sidebar que se actualizarán cuando el usuario esté disponible
  const [userPermissions, setUserPermissions] = useState([]);
  const [filteredSidebarData, setFilteredSidebarData] = useState({});

  // Efecto para actualizar permisos y sidebar cuando el usuario cambie
  useEffect(() => {
    // Forzar limpieza del caché de navegación al montar el componente
    const needsRefresh = sessionStorage.getItem('navigationUpdated');
    if (!needsRefresh) {
      clearNavigationCache();
    }
    
    if (user) {
      // Determinar el rol prioritario del usuario (usando .rol o el primer .roles o uno conocido)
      let userRole = null;
      
      if (user.rol) {
        // Si existe user.rol, usarlo como prioridad
        userRole = user.rol;
      } else if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        // Si hay roles en array, tomar el primero no "invitado"
        const nonGuestRoles = user.roles.filter(r => 
          typeof r === 'string' ? r !== 'invitado' : r.name !== 'invitado'
        );
        
        if (nonGuestRoles.length > 0) {
          // Usar el primer rol no invitado
          userRole = typeof nonGuestRoles[0] === 'string' ? 
            nonGuestRoles[0] : nonGuestRoles[0].name;
        } else {
          // Si solo hay rol invitado, usarlo
          userRole = typeof user.roles[0] === 'string' ? 
            user.roles[0] : user.roles[0].name;
        }
      }
      
      // Actualizar permisos y sidebar con el rol determinado
      const permissions = getUserPermissions(userRole);
      const sidebarItems = getFilteredSidebarByCategory(userRole);
      
      setUserPermissions(permissions);
      setFilteredSidebarData(sidebarItems);
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
  
  // Verificar si el usuario ya tiene solicitudes de rol pendientes
  useEffect(() => {
    if (user?.roles?.some(role => typeof role === 'string' && role.toLowerCase() === 'invitado')) {
      (async () => {
        try {
          const result = await roleRequestService.getMyRequests();
          if (result.success && result.data.length > 0) {
            const pendingRequest = result.data.find(req => req.status === 'pending');
            if (pendingRequest) {
              setHasPendingRequest(true);
            }
          }
        } catch (error) {
          console.error('Error al verificar solicitudes pendientes:', error);
        }
      })();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        usersService.getAllUsers(),
        rolesService.getActiveRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      
      // Console log para mostrar los roles disponibles
      console.log('=== ROLES DISPONIBLES EN USUARIOS ===');
      console.log('Total de roles cargados:', rolesData.length);
      console.log('Roles detallados:', rolesData);
      rolesData.forEach((role, index) => {
        console.log(`${index + 1}. ID: ${role.id}, Nombre: ${role.name}, Descripción: ${role.description || 'N/A'}, Activo: ${role.isActive}`);
      });
      console.log('=====================================');
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

  const handleCreateOperator = () => {
    setNewOperator({
      name: '',
      last: '',
      identification: '',
      phoneNumber: '',
      userId: ''
    });
    setShowCreateOperatorModal(true);
  };

  const handleSaveNewOperator = async () => {
    try {
      // Validaciones básicas
      if (!newOperator.name.trim() || !newOperator.last.trim() || !newOperator.identification.trim()) {
        showError('Campos requeridos', 'Nombre, apellido e identificación son obligatorios');
        return;
      }

      if (newOperator.identification.trim().length < 8) {
        showError('Identificación inválida', 'La identificación debe tener al menos 8 caracteres');
        return;
      }

      if (newOperator.phoneNumber.trim() && newOperator.phoneNumber.trim().length < 8) {
        showError('Teléfono inválido', 'El teléfono debe tener al menos 8 caracteres');
        return;
      }

      // Crear el operario
      const operatorData = {
        name: newOperator.name.trim(),
        last: newOperator.last.trim(),
        identification: newOperator.identification.trim(),
        phoneNumber: newOperator.phoneNumber.trim() || null
      };

      // Si se seleccionó un usuario, incluirlo
      if (newOperator.userId) {
        operatorData.userId = parseInt(newOperator.userId);
      }

      console.log('=== CREANDO OPERARIO ===');
      console.log('Datos del operario:', operatorData);

      const createdOperator = await operatorsService.createOperator(operatorData);
      console.log('Operario creado:', createdOperator);

      // Si se asoció con un usuario, cambiar su rol a "operario"
      if (newOperator.userId) {
        try {
          console.log('=== ASIGNANDO ROL DE OPERARIO AL USUARIO ===');
          console.log('Usuario ID seleccionado:', newOperator.userId);
          console.log('Todos los roles disponibles:', roles);
          
          // Buscar el rol "operario" de diferentes maneras
          let operarioRole = roles.find(r => r.name && r.name.toLowerCase() === 'operario');
          
          if (!operarioRole) {
            // Intentar otras variantes del nombre
            operarioRole = roles.find(r => 
              r.name && (
                r.name.toLowerCase() === 'operator' ||
                r.name.toLowerCase() === 'operador' ||
                r.name.toLowerCase().includes('operario')
              )
            );
          }
          
          console.log('Rol de operario encontrado:', operarioRole);
          
          if (operarioRole) {
            console.log('Asignando rol ID:', operarioRole.id, 'al usuario ID:', newOperator.userId);
            
            const assignResult = await usersService.assignRoles(parseInt(newOperator.userId), [operarioRole.id]);
            console.log('Resultado de asignación de rol:', assignResult);
            
            // Verificar que se asignó correctamente
            console.log('Esperando un momento antes de recargar datos...');
            setTimeout(async () => {
              await loadData();
              console.log('Datos recargados después de asignar rol');
            }, 1000);
            
          } else {
            console.error('No se encontró ningún rol de operario');
            console.log('Roles disponibles:', roles.map(r => ({ id: r.id, name: r.name })));
            showError('Advertencia', 'El operario fue creado pero no se encontró el rol "operario" para asignar automáticamente');
          }
        } catch (roleError) {
          console.error('Error completo asignando rol de operario:', roleError);
          console.error('Stack trace:', roleError.stack);
          showError('Advertencia', `El operario fue creado pero hubo un error al asignar el rol: ${roleError.message}`);
        }
      }

      // Recargar datos y limpiar formulario
      setShowCreateOperatorModal(false);
      setNewOperator({
        name: '',
        last: '',
        identification: '',
        phoneNumber: '',
        userId: ''
      });
      
      // Dar tiempo para que se procese la asignación de rol antes de recargar
      setTimeout(async () => {
        await loadData();
        console.log('=== DATOS RECARGADOS DESPUÉS DE CREAR OPERARIO ===');
      }, 1500);
      
      if (newOperator.userId) {
        showSuccess('Operario creado y rol asignado', 'El operario ha sido creado y el usuario ahora tiene rol de operario');
      } else {
        showSuccess('Operario creado', 'El operario ha sido creado exitosamente');
      }
    } catch (error) {
      showError('Error al crear operario', error.message);
    }
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
      const createdUser = await usersService.createUser({
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
      const originalUser = { ...editingUser };
      const updatedUser = await usersService.updateUser(editingUser.id, {
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
        // Obtener datos del usuario antes de eliminarlo
        const userToDelete = users.find(u => u.id === userId);
        
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
      console.log('=== CAMBIO DE ROL ===');
      console.log('Usuario ID:', userId);
      console.log('Rol seleccionado:', roleName);
      
      // Obtener datos del usuario antes del cambio
      const targetUser = users.find(u => u.id === userId);
      const oldRoles = targetUser?.roles || [];
      
      console.log('Usuario encontrado:', targetUser);
      console.log('Roles actuales:', oldRoles);
      
      if (roleName === '') {
        console.log('Removiendo todos los roles...');
        await usersService.assignRoles(userId, []);
      } else {
        const role = roles.find(r => r.name === roleName);
        console.log('Rol encontrado para asignar:', role);
        
        if (role) {
          console.log('Asignando rol ID:', role.id);
          await usersService.assignRoles(userId, [role.id]);
        } else {
          throw new Error(`No se encontró el rol: ${roleName}`);
        }
      }
      
      console.log('Recargando datos...');
      await loadData();
      showSuccess('Rol asignado', 'El rol ha sido asignado exitosamente');
      console.log('=== FIN CAMBIO DE ROL ===');
    } catch (error) {
      console.error('Error en handleRoleChange:', error);
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              Municipalidad de Santa Cruz
            </div>
            
            {/* Botón temporal para debug - solo para usuarios sin rol */}
            {!user?.rol && !user?.role && (
              <button
                onClick={async () => {
                  console.log('🔄 Forzando actualización de datos del usuario...');
                  try {
                    if (refreshUser) {
                      const result = await refreshUser();
                      if (result.success) {
                        console.log('✅ Actualización exitosa');
                        alert('Datos actualizados. Si tenía un rol aprobado, debería aparecer ahora.');
                      } else {
                        console.error('❌ Error en actualización:', result.error);
                        alert('Error al actualizar datos: ' + result.error);
                      }
                    }
                  } catch (error) {
                    console.error('❌ Error inesperado:', error);
                    alert('Error inesperado: ' + error.message);
                  }
                }}
                className="px-3 py-1 text-xs bg-santa-cruz-blue-600 text-white rounded hover:bg-santa-cruz-blue-700 transition-colors"
                title="Actualizar datos del usuario"
              >
                🔄 Verificar Rol
              </button>
            )}
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

        {/* Componente para solicitar rol si no tiene rol asignado - Solo para usuarios sin rol, no invitados */}
        {!user?.rol && !user?.role && !user?.roles?.some(role => typeof role === 'string' && role.toLowerCase() === 'invitado') && (
          <RequestRoleComponent 
            user={user} 
            onRequestSent={async () => {
              console.log('=== REFRESCANDO DATOS DEL USUARIO ===');
              try {
                if (refreshUser) {
                  const result = await refreshUser();
                  if (result.success) {
                    console.log('✅ Datos del usuario actualizados exitosamente');
                  } else {
                    console.error('❌ Error actualizando datos del usuario:', result.error);
                  }
                } else {
                  console.warn('⚠️ refreshUser no está disponible');
                }
              } catch (error) {
                console.error('❌ Error inesperado al refrescar usuario:', error);
              }
            }}
          />
        )}
        
        {/* Mensaje para usuarios con rol "invitado" */}
        {user?.roles?.some(role => typeof role === 'string' && role.toLowerCase() === 'invitado') && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">
                  Usuario con acceso restringido
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Como usuario con rol de <strong>invitado</strong>, solo tiene acceso al dashboard.
                    Si necesita acceder a más funcionalidades, puede cambiar a un rol con más permisos
                    utilizando el botón a continuación.
                  </p>
                  <div className="mt-4">
                    {hasPendingRequest ? (
                      <div className="flex items-center space-x-2 bg-yellow-100 p-3 rounded border border-yellow-300">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-800 font-medium">Ya tiene una solicitud pendiente de aprobación</span>
                      </div>
                    ) : (
                      <button
                        onClick={async () => {
                          // Verificar si el usuario ya tiene solicitudes pendientes
                          setLoading(true);
                          try {
                            const result = await roleRequestService.getMyRequests();
                            if (result.success && result.data.length > 0) {
                              const pendingRequest = result.data.find(req => req.status === 'pending');
                              if (pendingRequest) {
                                setHasPendingRequest(true);
                                showError('Solicitud en proceso', 'Ya tiene una solicitud de cambio de rol pendiente. No puede enviar otra hasta que esta sea procesada.');
                                return;
                              }
                            }
                            // No tiene solicitudes pendientes, mostrar modal
                            setHasPendingRequest(false);
                            setShowRoleRequestModal(true);
                          } catch (error) {
                            console.error('Error al verificar solicitudes:', error);
                            showError('Error', 'No se pudieron verificar sus solicitudes. Intente nuevamente.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Verificando...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Cambiar Rol
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Módulos Principales - Ordenados */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-santa-cruz-blue-600 pl-3">
            Gestión de Equipamiento y Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-stretch">
            {/* Maquinaria */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">Gestión de maquinarias</p>
                  <p className="text-sm text-gray-500 mt-2">Control de flota de maquinarias municipales</p>
                  <button 
                    onClick={() => setActiveSection('transporte')}
                    className="mt-4 px-4 py-2 bg-santa-cruz-blue-600 text-white rounded-lg hover:bg-santa-cruz-blue-700 transition-colors text-sm inline-flex items-center"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Acceder
                  </button>
                </div>
                <div className="p-3 bg-santa-cruz-blue-100 rounded-full">
                  <Truck className="w-8 h-8 text-santa-cruz-blue-600" />
                </div>
              </div>
            </div>

            {/* Operadores */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">Operadores</p>
                  <p className="text-sm text-gray-500 mt-2">Gestión de operadores de maquinaria</p>
                  <button 
                    onClick={() => setActiveSection('operadores')}
                    className="mt-4 px-4 py-2 bg-santa-cruz-green-600 text-white rounded-lg hover:bg-santa-cruz-green-700 transition-colors text-sm inline-flex items-center"
                  >
                    <HardHat className="w-4 h-4 mr-2" />
                    Acceder
                  </button>
                </div>
                <div className="p-3 bg-santa-cruz-green-100 rounded-full">
                  <HardHat className="w-8 h-8 text-santa-cruz-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Administrativas */}
        {(user?.rol === 'ingeniero' || user?.rol === 'superadmin') && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-gray-600 pl-3">
              Administración
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Gestión de Usuarios</p>
                    <p className="text-sm text-gray-500 mt-2">Administrar usuarios y roles del sistema</p>
                    <button 
                      onClick={() => setActiveSection('usuarios')}
                      className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm inline-flex items-center"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Gestionar Usuarios
                    </button>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Users className="w-8 h-8 text-gray-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Solicitudes de Rol</p>
                    <p className="text-sm text-gray-500 mt-2">Aprobar o rechazar solicitudes de acceso</p>
                    <button 
                      onClick={() => setActiveSection('solicitudes-rol')}
                      className="mt-4 px-4 py-2 bg-santa-cruz-blue-600 text-white rounded-lg hover:bg-santa-cruz-blue-700 transition-colors text-sm inline-flex items-center"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Ver Solicitudes
                    </button>
                  </div>
                  <div className="p-3 bg-santa-cruz-blue-100 rounded-full">
                    <UserCheck className="w-8 h-8 text-santa-cruz-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sistema de Análisis y Reportes */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-santa-cruz-green-600 pl-3">
            Análisis y Métricas del Sistema 
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estadísticas */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">Estadísticas del Sistema</p>
                  <p className="text-sm text-gray-500 mt-2">Dashboard completo con métricas, análisis de tendencias y estadísticas detalladas</p>
                  <button 
                    onClick={() => setActiveSection('estadisticas')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm inline-flex items-center"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Estadísticas
                  </button>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <BarChart3 className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Auditoría */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">Auditoría del Sistema</p>
                  <p className="text-sm text-gray-500 mt-2">Logs de auditoría, usuarios conectados y estadísticas avanzadas de seguridad</p>
                  <button 
                    onClick={() => setActiveSection('auditoria')}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm inline-flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Ver Auditoría
                  </button>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsuarios = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de usuarios</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleCreateUser}
            className="bg-santa-cruz-blue-600 hover:bg-santa-cruz-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo usuario
          </button>
          <button 
            onClick={handleCreateOperator}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <HardHat className="w-4 h-4" />
            Crear operario
          </button>
        </div>
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
                        {roles
                          .filter(role => {
                            const roleName = role.name.toLowerCase();
                            const userCurrentRole = user.roles && user.roles.length > 0 ? user.roles[0].name.toLowerCase() : '';
                            
                            // Si es operario y el usuario ya lo tiene, mostrarlo
                            if ((roleName === 'operario' || roleName === 'operator') && 
                                (userCurrentRole === 'operario' || userCurrentRole === 'operator')) {
                              return true;
                            }
                            
                            // Para otros casos, ocultar operario
                            if (roleName === 'operario' || roleName === 'operator') {
                              return false;
                            }
                            
                            return true;
                          })
                          .map(role => (
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

  // Componente para usuarios invitados que intentan acceder a secciones restringidas
  const InvitadoRestrictionMessage = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 max-w-xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md mb-6 w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                Acceso restringido
              </h3>
              <div className="mt-2 text-yellow-700">
                <p>
                  Como usuario con rol de <strong>invitado</strong>, solo puede acceder al dashboard 
                  principal del sistema. Para acceder a más funcionalidades, necesita solicitar un rol 
                  con más permisos.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setActiveSection('dashboard')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-santa-cruz-blue-600 hover:bg-santa-cruz-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-santa-cruz-blue-500"
        >
          <Home className="w-4 h-4 mr-2" />
          Volver al Dashboard
        </button>
      </div>
    );
  };

  const renderContent = () => {
    // Verificar si el usuario es "invitado" y está intentando acceder a una sección que no sea dashboard
    const isInvitado = user?.roles?.some(role => typeof role === 'string' && role.toLowerCase() === 'invitado');
    if (isInvitado && activeSection !== 'dashboard') {
      return <InvitadoRestrictionMessage />;
    }
    
    // Para otros roles o dashboard, mostrar el contenido normal
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'usuarios':
        return renderUsuarios();
      case 'solicitudes-rol':
        return <RoleRequestsManagement />;
      case 'transporte':
        return <TransporteModule />;
      case 'operadores':
        return <OperadoresModule />;
      case 'estadisticas':
        return <EstadisticasModule />;
      case 'configuracion':
        return <SweetAlertDemo />;
      case 'auditoria':
        return <AuditoriaModule />;
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
  {/* Header del Sidebar (NO SE MUEVE) */}
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
  <nav className="flex-1 px-4 pt-6 pb-4 overflow-y-auto flex flex-col">
    {/* Menú de navegación */}
    <div className="space-y-4">
      {Object.keys(filteredSidebarData).length > 0 ? (
        <>
          {/* Dashboard siempre primero */}
          {filteredSidebarData.main && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                Principal
              </h3>
              <div className="space-y-1">
                {filteredSidebarData.main.map((item) => (
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
            </div>
          )}

          {/* Módulos de Gestión - priorizar estos según solicitud */}
          {filteredSidebarData.management && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                Gestión
              </h3>
              <div className="space-y-1">
                {/* Priorizar estos tres módulos */}
                {filteredSidebarData.management
                  .filter(item => ['transporte', 'operadores'].includes(item.id))
                  .map((item) => (
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
                
                {/* Otros elementos de gestión */}
                {filteredSidebarData.management
                  .filter(item => !['transporte', 'operadores'].includes(item.id))
                  .map((item) => (
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
            </div>
          )}

          {/* Proyectos - destacarlos */}
          {filteredSidebarData.projects && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                Proyectos
              </h3>
              <div className="space-y-1">
                {filteredSidebarData.projects.map((item) => (
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
            </div>
          )}

          {/* Resto de categorías */}
          {Object.keys(filteredSidebarData)
            .filter(category => !['main', 'management', 'projects'].includes(category))
            .map(category => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  {categoryLabels[category] || category}
                </h3>
                <div className="space-y-1">
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
              </div>
            ))
          }
        </>
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

    {/* Línea divisoria */}
    <hr className="my-6 border-t border-gray-200" />

    {/* Información del usuario y botón de cerrar sesión */}
    <div>
      <div className="mb-4 p-3 bg-gradient-to-r from-santa-cruz-blue-50 to-santa-cruz-green-50 rounded-lg border border-santa-cruz-blue-200">
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
                if (refreshUser) {
                  const result = await refreshUser();
                  // ...feedback...
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

      {/* Botón para cerrar sesión */}
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

    {/* Create Operator Modal */}
    {showCreateOperatorModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h2 className="text-lg font-bold mb-4">Crear Nuevo Operario</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
                {newOperator.userId && <span className="text-xs text-blue-600 ml-2">(Auto-completado)</span>}
              </label>
              <input
                type="text"
                value={newOperator.name}
                onChange={(e) =>
                  setNewOperator({ ...newOperator, name: e.target.value })
                }
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  newOperator.userId ? 'bg-blue-50' : ''
                }`}
                placeholder="Ingrese el nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
                {newOperator.userId && <span className="text-xs text-blue-600 ml-2">(Auto-completado)</span>}
              </label>
              <input
                type="text"
                value={newOperator.last}
                onChange={(e) =>
                  setNewOperator({ ...newOperator, last: e.target.value })
                }
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  newOperator.userId ? 'bg-blue-50' : ''
                }`}
                placeholder="Ingrese el apellido"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Identificación *
              </label>
              <input
                type="text"
                value={newOperator.identification}
                onChange={(e) =>
                  setNewOperator({ ...newOperator, identification: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: 12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={newOperator.phoneNumber}
                onChange={(e) =>
                  setNewOperator({ ...newOperator, phoneNumber: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: 12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asociar con usuario (opcional)
              </label>
              <select
                value={newOperator.userId}
                onChange={(e) => {
                  const selectedUserId = e.target.value;
                  const selectedUser = users.find(u => u.id === parseInt(selectedUserId));
                  
                  if (selectedUser && selectedUserId) {
                    console.log('=== AUTO-COMPLETANDO DATOS DEL OPERARIO ===');
                    console.log('Usuario seleccionado:', selectedUser);
                    console.log('Nombre auto-completado:', selectedUser.name);
                    console.log('Apellido auto-completado:', selectedUser.lastname);
                    
                    // Auto-llenar nombre y apellido con los datos del usuario
                    setNewOperator({ 
                      ...newOperator, 
                      userId: selectedUserId,
                      name: selectedUser.name || '',
                      last: selectedUser.lastname || ''
                    });
                  } else {
                    console.log('=== LIMPIANDO CAMPOS DE OPERARIO ===');
                    // Si no hay usuario seleccionado, limpiar los campos
                    setNewOperator({ 
                      ...newOperator, 
                      userId: selectedUserId,
                      name: '',
                      last: ''
                    });
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Sin asociar</option>
                {users.filter(user => !user.roles || user.roles.length === 0 || user.roles.some(role => 
                  typeof role === 'string' ? role.toLowerCase() === 'invitado' : role.name?.toLowerCase() === 'invitado'
                )).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email} - {user.name} {user.lastname}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {newOperator.userId ? 
                  'Los campos nombre y apellido se llenaron automáticamente' : 
                  'Solo se muestran usuarios sin rol o con rol de invitado'
                }
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowCreateOperatorModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveNewOperator}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear Operario
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

    {/* Modal para solicitud de cambio de rol - Solo para usuarios invitados */}
    {showRoleRequestModal && user?.roles?.some(role => typeof role === 'string' && role.toLowerCase() === 'invitado') && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Cambiar Rol
            </h3>
            <button
              onClick={() => setShowRoleRequestModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol solicitado
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione un rol...</option>
                <option value="ingeniero">Ingeniero - Administrador del sistema</option>
                <option value="inspector">Inspector - Permisos de gestión</option>
                <option value="operario">Operario - Permisos limitados</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificación (mínimo 5 caracteres)
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Explique brevemente por qué necesita este rol..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRoleRequestModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!selectedRole || !justification.trim() || justification.trim().length < 5) {
                    showError('Campos requeridos', 'Por favor complete todos los campos correctamente');
                    return;
                  }
                  
                  setLoading(true);
                  try {
                    // Verificar nuevamente si hay solicitudes pendientes antes de enviar
                    const pendingResult = await roleRequestService.getMyRequests();
                    if (pendingResult.success && pendingResult.data.length > 0) {
                      const pendingRequest = pendingResult.data.find(req => req.status === 'pending');
                      if (pendingRequest) {
                        setHasPendingRequest(true);
                        showError('Solicitud en proceso', 'Ya tiene una solicitud de cambio de rol pendiente. No puede enviar otra hasta que esta sea procesada.');
                        setShowRoleRequestModal(false);
                        return;
                      }
                    }

                    // No hay solicitudes pendientes, proceder a enviar
                    const result = await roleRequestService.requestRole(selectedRole, justification);
                    if (result.success) {
                      showSuccess('Solicitud enviada', 'Su solicitud será revisada por un administrador.');
                      setShowRoleRequestModal(false);
                      setSelectedRole('');
                      setJustification('');
                      if (refreshUser) {
                        await refreshUser();
                      }
                    } else {
                      showError('Error', result.error || 'No se pudo enviar la solicitud');
                    }
                  } catch (error) {
                    showError('Error', 'Ocurrió un error al enviar la solicitud');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !selectedRole || !justification.trim() || justification.trim().length < 5}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}