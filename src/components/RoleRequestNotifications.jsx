import React, { useState, useEffect } from 'react';
import { Bell, Users, CheckCircle, XCircle, Eye, Clock, AlertTriangle } from 'lucide-react';
import roleRequestService from '../services/roleRequestService';
import { showSuccess, showError, promptTextarea, confirmAction } from '../utils/sweetAlert';

const RoleRequestNotifications = ({ userRole }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, total: 0 });

  // Solo mostrar para admin y superadmin
  const canManageRequests = ['admin', 'superadmin'].includes(userRole);

  useEffect(() => {
    if (canManageRequests) {
      loadPendingRequests();
      loadStats();
      
      // Usar intervalo configurado en variables de entorno
      const checkInterval = parseInt(import.meta.env.VITE_NOTIFICATION_CHECK_INTERVAL) || 30000;
      const interval = setInterval(() => {
        loadPendingRequests();
        loadStats();
      }, checkInterval);

      return () => clearInterval(interval);
    }
  }, [canManageRequests]);

  const loadPendingRequests = async () => {
    try {
      const result = await roleRequestService.getPendingRequests();
      if (result.success) {
        setPendingRequests(result.data);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await roleRequestService.getRequestsStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const result = await roleRequestService.approveRequest(requestId);
      if (result.success) {
        showSuccess('Solicitud aprobada', 'La solicitud ha sido aprobada exitosamente');
        loadPendingRequests();
        loadStats();
      } else {
        showError('Error al aprobar', result.error);
      }
    } catch (error) {
      showError('Error inesperado', 'No se pudo aprobar la solicitud');
    }
  };

  const handleReject = async (requestId) => {
    const result = await promptTextarea(
      'Rechazar solicitud',
      'Ingrese el motivo del rechazo (opcional):',
      'Motivo del rechazo...',
      { required: false }
    );
    
    if (result.isConfirmed) {
      try {
        const response = await roleRequestService.rejectRequest(requestId, result.value || '');
        if (response.success) {
          showSuccess('Solicitud rechazada', 'La solicitud ha sido rechazada');
          loadPendingRequests();
          loadStats();
        } else {
          showError('Error al rechazar', response.error);
        }
      } catch (error) {
        showError('Error inesperado', 'No se pudo rechazar la solicitud');
      }
    }
  };

  if (!canManageRequests) {
    return null;
  }

  return (
    <>
      {/* Botón de notificaciones */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Solicitudes de rol pendientes"
        >
          <Bell className="w-5 h-5" />
          {stats.pending > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {stats.pending > 9 ? '9+' : stats.pending}
            </span>
          )}
        </button>

        {/* Panel de notificaciones */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Solicitudes de Rol
                </h3>
                <span className="text-sm text-gray-500">
                  {stats.pending} pendientes
                </span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No hay solicitudes pendientes
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <p className="text-sm font-medium text-gray-900">
                              {request.user?.name} {request.user?.lastname}
                            </p>
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-3">
                            {request.user?.email}
                          </p>
                          
                          {request.justification && (
                            <p className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                              "{request.justification}"
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-400">
                            Solicitado: {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-3">
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          <XCircle className="w-3 h-3 inline mr-1" />
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-2 py-1 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Aprobar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pendingRequests.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    // Aquí podrías navegar a una página completa de gestión de solicitudes
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todas las solicitudes →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay para cerrar */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
};

export default RoleRequestNotifications;
