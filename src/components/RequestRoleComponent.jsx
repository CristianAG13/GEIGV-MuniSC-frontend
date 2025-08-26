import React, { useState, useEffect } from 'react';
import { UserPlus, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import roleRequestService from '../services/roleRequestService';

const RequestRoleComponent = ({ user, onRequestSent }) => {
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
  }, []);

  const loadData = async () => {
    try {
      setLoadingRequests(true);
      setLoadingRoles(true);
      
      // Datos mock como fallback
      const mockRoles = [
        { id: 2, name: 'admin', description: 'Administrador del sistema' },
        { id: 3, name: 'usuario', description: 'Usuario estándar' },
        { id: 4, name: 'invitado', description: 'Usuario invitado con permisos limitados' }
      ];
      
      // Intentar cargar datos reales del backend
      try {
        const [rolesResult, requestsResult] = await Promise.all([
          roleRequestService.getAvailableRoles(),
          roleRequestService.getMyRequests()
        ]);

        if (rolesResult.success && rolesResult.data.length > 0) {
          setAvailableRoles(rolesResult.data);
        } else {
          console.log('No hay roles del backend, usando mock');
          setAvailableRoles(mockRoles);
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
      alert('Por favor complete todos los campos');
      return;
    }

    // Quitar restricción de longitud mínima
    if (justification.trim().length < 5) {
      alert('La justificación debe tener al menos 5 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Intentar envío real al backend
      console.log('Datos que se envían:');
      console.log('- selectedRole (valor del select):', selectedRole);
      console.log('- selectedRole.toLowerCase():', selectedRole.toLowerCase());
      console.log('- justification:', justification);
      console.log('- Payload completo:', { 
        requestedRole: selectedRole.toLowerCase(), 
        justification 
      });
      
      const result = await roleRequestService.requestRole(selectedRole, justification);
      console.log('Resultado del envío:', result);
      
      if (result.success) {
        alert('Solicitud enviada exitosamente. Será revisada por un administrador.');
        setShowModal(false);
        setSelectedRole('');
        setJustification('');
        loadData();
        if (onRequestSent) onRequestSent();
      } else {
        alert('Error al enviar solicitud: ' + result.error);
        console.error('Error detallado:', result);
      }
      
    } catch (error) {
      console.error('Error inesperado:', error);
      alert('Error inesperado al enviar solicitud: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm('¿Está seguro de cancelar esta solicitud?')) {
      try {
        const result = await roleRequestService.cancelRequest(requestId);
        if (result.success) {
          alert('Solicitud cancelada exitosamente');
          loadData();
        } else {
          alert('Error al cancelar solicitud: ' + result.error);
        }
      } catch (error) {
        alert('Error inesperado al cancelar solicitud');
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
  if (!user || user.rol || user.role) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Cuenta sin permisos asignados
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Su cuenta está registrada pero aún no tiene permisos asignados. 
              Puede solicitar un rol específico para acceder a las funcionalidades del sistema.
            </p>
            
            {availableRoles.length > 0 ? (
              !hasPendingRequest ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Solicitar Rol
                </button>
              ) : (
                <div className="mt-3 inline-flex items-center px-3 py-2 text-sm text-yellow-800 bg-yellow-100 rounded-md">
                  <Clock className="w-4 h-4 mr-2" />
                  Ya tiene una solicitud pendiente
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
                Solicitar Rol de Usuario
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