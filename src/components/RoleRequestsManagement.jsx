import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, Clock, Eye, Filter, 
  Search, Calendar, AlertTriangle, RefreshCw 
} from 'lucide-react';
import roleRequestService from '../services/roleRequestService';
import operatorsService from '../services/operatorsService';
import { showSuccess, showError, promptTextarea, confirmAction } from '../utils/sweetAlert';
import OperatorDataModal from './OperatorDataModal';

const RoleRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [operatorApprovalLoading, setOperatorApprovalLoading] = useState(false);

  useEffect(() => {
    loadAllRequests();
    loadStats();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filterStatus, searchTerm]);

  const loadAllRequests = async () => {
    try {
      setLoading(true);
      const result = await roleRequestService.getAllRequests();
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
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

  const filterRequests = () => {
    let filtered = [...requests];

    // Filtrar por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus);
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.user?.name?.toLowerCase().includes(term) ||
        req.user?.lastname?.toLowerCase().includes(term) ||
        req.user?.email?.toLowerCase().includes(term)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async (requestId) => {
    // Obtener los detalles de la solicitud para verificar si es de operario
    const request = requests.find(req => req.id === requestId);
    
    const requestedRoleName = getRequestedRoleName(request).toLowerCase();
    if (requestedRoleName === 'operario') {
      // Si es una solicitud de operario, mostrar el modal para datos adicionales
      setSelectedRequest(request);
      setShowOperatorModal(true);
    } else {
      // Para otros roles, proceder con la aprobación normal
      const result = await confirmAction('¿Aprobar solicitud?', '¿Está seguro de aprobar esta solicitud?');
      if (result.isConfirmed) {
        try {
          const response = await roleRequestService.approveRequest(requestId);
          if (response.success) {
            showSuccess('Solicitud aprobada', 'La solicitud ha sido aprobada exitosamente');
            loadAllRequests();
            loadStats();
          } else {
            showError('Error al aprobar', response.error);
          }
        } catch (error) {
          showError('Error inesperado', 'No se pudo aprobar la solicitud');
        }
      }
    }
  };

  const handleApproveOperator = async (operatorData) => {
    try {
      setOperatorApprovalLoading(true);
      
      // Primero crear el operador
      const operatorResult = await operatorsService.createOperator({
        ...operatorData,
        userId: selectedRequest.user.id
      });

      if (!operatorResult) {
        throw new Error('No se pudo crear el registro del operario');
      }

      // Luego aprobar la solicitud de rol
      const response = await roleRequestService.approveRequest(selectedRequest.id);
      
      if (response.success) {
        showSuccess(
          'Operario creado exitosamente', 
          'La solicitud ha sido aprobada y el operario ha sido registrado en el sistema'
        );
        setShowOperatorModal(false);
        setSelectedRequest(null);
        loadAllRequests();
        loadStats();
      } else {
        // Si falló la aprobación del rol, mostrar error pero el operador ya fue creado
        showError('Error parcial', 'El operario fue creado pero hubo un error al aprobar el rol. Contacte al administrador.');
        setShowOperatorModal(false);
        setSelectedRequest(null);
        loadAllRequests();
        loadStats();
      }
    } catch (error) {
      console.error('Error approving operator:', error);
      showError('Error', error.message || 'Error al crear el operario y aprobar la solicitud');
    } finally {
      setOperatorApprovalLoading(false);
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
          loadAllRequests();
          loadStats();
        } else {
          showError('Error al rechazar', response.error);
        }
      } catch (error) {
        showError('Error inesperado', 'No se pudo rechazar la solicitud');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  // Normalizar el nombre del rol solicitado (el backend puede devolver un string o un objeto)
  const getRequestedRoleName = (request) => {
    if (!request) return '';
    const rr = request.requestedRole ?? request.role ?? null;
    if (!rr) return '';
    if (typeof rr === 'string') return rr;
    if (typeof rr === 'object' && rr.name) return rr.name;
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Solicitudes de Rol
        </h1>
        <button
          onClick={() => {
            loadAllRequests();
            loadStats();
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rechazadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando solicitudes...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron solicitudes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol Solicitado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.user?.name} {request.user?.lastname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        getRequestedRoleName(request).toLowerCase() === 'operario'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {getRequestedRoleName(request) || 'No especificado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-800 p-1 rounded"
                              title="Aprobar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded"
                              title="Rechazar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Detalles de la Solicitud
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="text-sm text-gray-900">
                    {selectedRequest.user?.name} {selectedRequest.user?.lastname}
                  </p>
                  <p className="text-xs text-gray-500">{selectedRequest.user?.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol Solicitado</label>
                <p className="text-sm text-gray-900 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getRequestedRoleName(selectedRequest).toLowerCase() === 'operario'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {getRequestedRoleName(selectedRequest) || 'No especificado'}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(selectedRequest.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusText(selectedRequest.status)}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Justificación</label>
                <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">
                  {selectedRequest.justification || 'No se proporcionó justificación'}
                </p>
              </div>
              
              {selectedRequest.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Motivo del Rechazo</label>
                  <p className="text-sm text-red-600 mt-1 p-2 bg-red-50 rounded">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <label className="block font-medium">Fecha de Solicitud</label>
                  <p>{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block font-medium">Última Actualización</label>
                  <p>{new Date(selectedRequest.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleReject(selectedRequest.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  >
                    Aprobar
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de datos del operario */}
      <OperatorDataModal
        isOpen={showOperatorModal}
        onClose={() => {
          setShowOperatorModal(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleApproveOperator}
        userData={selectedRequest?.user}
        loading={operatorApprovalLoading}
      />
    </div>
  );
};

export default RoleRequestsManagement;
