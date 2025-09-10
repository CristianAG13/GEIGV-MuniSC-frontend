import React, { useState, useEffect } from 'react';
import { UserPlus, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import roleRequestService from '../services/roleRequestService';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { showSuccess, showError, confirmAction } from '../utils/sweetAlert';

const RequestRoleComponent = ({ user, onRequestSent }) => {
  const { refreshUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    loadData();
    
    // Verificar cambios en el usuario cada 10 segundos si hay solicitudes pendientes
    const checkUserUpdates = setInterval(async () => {
      const isInvitado = user?.roles?.some(role => role.toLowerCase() === 'invitado') || 
                         user?.rol === 'invitado' || 
                         user?.role === 'invitado' || 
                         (!user?.rol && !user?.role);
      if (user && isInvitado) {
        try {
          console.log('Verificando actualizaciones del usuario...');
          if (onRequestSent) {
            onRequestSent(); // Esto debería activar refreshUser en el contexto padre
          }
        } catch (error) {
          console.error('Error verificando actualizaciones:', error);
        }
      }
    }, 10000); // Cada 10 segundos

    return () => clearInterval(checkUserUpdates);
  }, [user, onRequestSent]);

  const loadData = async () => {
    try {
      setLoadingRequests(true);
      setLoadingRoles(true);
      
      // Datos mock como fallback
      const mockRoles = [
        { id: 1, name: 'superadmin', description: 'Administrador con todos los permisos' },
        { id: 2, name: 'admin', description: 'Administrador del sistema' },
        { id: 3, name: 'ingeniero', description: 'Ingeniero con permisos de gestión' },
        { id: 4, name: 'operario', description: 'Operario con permisos de gestión' },
        { id: 5, name: 'invitado', description: 'Usuario invitado con permisos limitados' }
      ];
      
      // Intentar cargar datos reales del backend
      try {
        const [rolesResult, requestsResult] = await Promise.all([
          roleRequestService.getAvailableRoles(),
          roleRequestService.getMyRequests()
        ]);

        if (rolesResult.success && rolesResult.data.length > 0) {
          // Filtrar el rol "invitado" de los roles disponibles ya que el usuario ya lo tiene
          const filteredRoles = rolesResult.data.filter(role => 
            role.name.toLowerCase() !== 'invitado' && 
            role.name.toLowerCase() !== 'guest'
          );
          setAvailableRoles(filteredRoles);
        } else {
          console.log('No hay roles del backend, usando mock');
          // Filtrar también de los roles mock
          const filteredMockRoles = mockRoles.filter(role => 
            role.name.toLowerCase() !== 'invitado' && 
            role.name.toLowerCase() !== 'guest'
          );
          setAvailableRoles(filteredMockRoles);
        }
        
        if (requestsResult.success) {
          setMyRequests(requestsResult.data);
        } else {
          console.log('Error cargando mis solicitudes:', requestsResult.error);
          setMyRequests([]);
        }
      } catch (error) {
        console.log('Backend no disponible para cargar datos, usando mock:', error.message);
        setAvailableRoles(mockRoles);
        setMyRequests([]);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingRequests(false);
      setLoadingRoles(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedRole || !justification.trim()) {
      showError('Campos requeridos', 'Por favor complete todos los campos');
      return;
    }

    // Quitar restricción de longitud mínima
    if (justification.trim().length < 5) {
      showError('Justificación muy corta', 'La justificación debe tener al menos 5 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Intentar envío real al backend
      console.log('=== ENVIANDO SOLICITUD DE ROL ===');
      console.log('Usuario actual:', user);
      console.log('Rol seleccionado:', selectedRole);
      console.log('Justificación:', justification);
      
      const result = await roleRequestService.requestRole(selectedRole, justification);
      console.log('Resultado del servicio:', result);
      
      if (result.success) {
        showSuccess('Solicitud enviada', 'Su solicitud será revisada por un administrador. Recibirá una notificación cuando sea procesada.');
        setShowModal(false);
        setSelectedRole('');
        setJustification('');
        await loadData(); // Recargar datos
        
        // Notificar al componente padre para que actualice datos del usuario
        if (onRequestSent) {
          try {
            await onRequestSent();
            console.log('Componente padre notificado exitosamente');
          } catch (error) {
            console.error('Error notificando al componente padre:', error);
          }
        }
      } else {
        showError('Error al enviar solicitud', result.error || 'No se pudo enviar la solicitud');
        console.error('Error detallado:', result);
      }
      
    } catch (error) {
      console.error('Error inesperado en handleSubmitRequest:', error);
      showError('Error inesperado', `No se pudo enviar la solicitud: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    const result = await confirmAction('¿Cancelar solicitud?', '¿Está seguro de cancelar esta solicitud?');
    if (result.isConfirmed) {
      try {
        const response = await roleRequestService.cancelRequest(requestId);
        if (response.success) {
          showSuccess('Solicitud cancelada', 'La solicitud ha sido cancelada exitosamente');
          loadData();
        } else {
          showError('Error al cancelar', response.error);
        }
      } catch (error) {
        showError('Error inesperado', 'No se pudo cancelar la solicitud');
      }
    }
  };

  const hasPendingRequest = myRequests.some(request => request.status === 'pending');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Verificar si el usuario ya tiene un rol asignado
  console.log('=== VERIFICANDO ESTADO DEL USUARIO ===');
  console.log('Usuario completo:', user);
  console.log('user.rol:', user?.rol);
  console.log('user.role:', user?.role);
  console.log('user.roles:', user?.roles);
  
  // Verificar si el usuario es invitado o no tiene rol
  const isInvitado = user?.roles?.some(role => role.toLowerCase() === 'invitado') || 
                    user?.rol === 'invitado' || 
                    user?.role === 'invitado';
  
  // Si el usuario tiene un rol asignado y NO es invitado, no mostrar este componente
  if (!user || (user.rol && !isInvitado) || (user.role && !isInvitado) || 
      (user.roles && user.roles.length > 0 && !isInvitado)) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Usuario Invitado - Permisos Limitados
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Su cuenta está registrada con rol de invitado, con acceso limitado.
              Puede solicitar un rol con más permisos para acceder a más funcionalidades del sistema.
            </p>
            
            {availableRoles.length > 0 ? (
              !hasPendingRequest ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cambiar Rol
                </button>
              ) : (
                <div className="mt-3 flex items-center space-x-3">
                  <div className="inline-flex items-center px-3 py-2 text-sm text-yellow-800 bg-yellow-100 rounded-md">
                    <Clock className="w-4 h-4 mr-2" />
                    Ya tiene una solicitud pendiente
                  </div>
                  <button
                    onClick={async () => {
                      console.log('=== VERIFICACIÓN MANUAL DEL ROL ===');
                      try {
                        // Paso 1: Verificar estado de la solicitud
                        console.log('1. Verificando estado de solicitud...');
                        const requestResponse = await roleRequestService.getMyRequests();
                        console.log('Respuesta de solicitudes:', requestResponse);
                        
                        if (requestResponse.success && requestResponse.data && requestResponse.data.length > 0) {
                          // Buscar la solicitud más reciente
                          const request = requestResponse.data[0]; // Tomar la primera (más reciente)
                          console.log('Solicitud encontrada:', request);
                          console.log('Estado de solicitud:', request.status);
                          
                          if (request.status === 'approved') {
                            console.log('2. Solicitud aprobada, refrescando perfil...');
                            
                            // Paso 2: Forzar refresh del perfil
                            const result = await refreshUser();
                            console.log('Resultado de actualización manual:', result);
                            
                            // Paso 3: Verificar datos actualizados
                            const updatedUser = authService.getCurrentUser();
                            console.log('Usuario después de refresh:', updatedUser);
                            
                            // Paso 4: Verificar si el rol se reflejó
                            if (updatedUser && (updatedUser.rol || updatedUser.role || (updatedUser.roles && updatedUser.roles.length > 0))) {
                              showSuccess('¡Rol asignado!', `Su rol ha sido actualizado correctamente. Recargando página...`);
                              setTimeout(() => window.location.reload(), 1500);
                            } else {
                              // Paso 5: Si aún no se refleja, mostrar información detallada
                              showError('Problema de sincronización', 
                                `Su solicitud está aprobada pero el sistema no ha sincronizado el rol. 
                                Estado de solicitud: ${request.status}
                                Rol solicitado: ${request.requestedRole || request.role?.name}
                                Por favor contacte al administrador.`);
                              
                              console.log('=== PROBLEMA DE SINCRONIZACIÓN ===');
                              console.log('Solicitud aprobada pero rol no reflejado en usuario');
                              console.log('Datos de solicitud:', request);
                              console.log('Datos de usuario:', updatedUser);
                            }
                          } else {
                            showSuccess('Estado verificado', `Su solicitud está en estado: ${request.status}`);
                          }
                        } else {
                          // Si no hay solicitud, hacer refresh normal
                          console.log('2. No hay solicitud activa, haciendo refresh normal...');
                          const result = await refreshUser();
                          console.log('Resultado de refresh:', result);
                          
                          if (result.success) {
                            showSuccess('Estado verificado', 'Su información ha sido actualizada');
                          } else {
                            showError('Error', 'No se pudo verificar el estado del rol');
                          }
                        }
                      } catch (error) {
                        console.error('Error en verificación manual:', error);
                        showError('Error', 'Error al verificar el estado del rol');
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verificar Estado
                  </button>
                </div>
              )
            ) : (
              <div className="mt-3 p-3 bg-gray-100 rounded-md">
                <p className="text-sm text-gray-600">
                  {loadingRoles ? 'Cargando roles disponibles...' : 'No hay roles disponibles para solicitar. Contacte a un administrador.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {myRequests.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Mis Solicitudes de Rol
          </h4>
          
          {loadingRequests ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando solicitudes...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(request.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Rol solicitado: <span className="text-blue-600">{request.role?.name}</span>
                      </p>
                      
                      {request.justification && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Justificación:</strong> {request.justification}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        Solicitado: {new Date(request.createdAt).toLocaleString()}
                      </p>
                      
                      {request.admin_comments && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong className="text-gray-700">Comentarios del administrador:</strong>
                          <p className="text-gray-600 mt-1">{request.admin_comments}</p>
                        </div>
                      )}
                    </div>
                    
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Cambiar Rol
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
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
                  disabled={loadingRoles}
                >
                  <option value="">
                    {loadingRoles ? 'Cargando roles...' : 'Seleccione un rol...'}
                  </option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
                {availableRoles.length === 0 && !loadingRoles && (
                  <p className="text-sm text-red-600 mt-1">
                    No hay roles disponibles para solicitar
                  </p>
                )}
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
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={loading || !selectedRole || !justification.trim()}
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
      )}
    </div>
  );
};

export default RequestRoleComponent;
