import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Eye,
  Clock,
  FileText
} from 'lucide-react';

const Audit: React.FC = () => {
  const { auditLogs } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Mock audit logs for demonstration
  const mockAuditLogs = [
    {
      id: '1',
      userId: '2',
      userName: 'María Rodríguez',
      action: 'Aprobó reporte de campo',
      resourceType: 'field_report',
      resourceId: '1',
      timestamp: '2024-01-20T14:30:00',
      details: 'Reporte de reparación de baches en Ruta Nacional 21',
      beforeData: { status: 'pendiente' },
      afterData: { status: 'aprobado', reviewedBy: 'María Rodríguez' }
    },
    {
      id: '2',
      userId: '1',
      userName: 'Juan Pérez',
      action: 'Creó reporte de campo',
      resourceType: 'field_report',
      resourceId: '2',
      timestamp: '2024-01-20T10:15:00',
      details: 'Nuevo reporte de nivelación en Camino Rural Los Ángeles',
      afterData: { workType: 'Nivelación de vía', route: 'Camino Rural Los Ángeles' }
    },
    {
      id: '3',
      userId: '2',
      userName: 'María Rodríguez',
      action: 'Actualizó estado de maquinaria',
      resourceType: 'machinery',
      resourceId: '1',
      timestamp: '2024-01-20T09:45:00',
      details: 'Cambió estado de Retroexcavadora CAT 320 a mantenimiento',
      beforeData: { status: 'disponible' },
      afterData: { status: 'mantenimiento' }
    },
    {
      id: '4',
      userId: '4',
      userName: 'Ana González',
      action: 'Exportó reporte analítico',
      resourceType: 'analytics',
      resourceId: 'monthly_report',
      timestamp: '2024-01-19T16:20:00',
      details: 'Exportó reporte mensual de eficiencia a PDF',
      afterData: { format: 'PDF', period: 'January 2024' }
    },
    {
      id: '5',
      userId: '3',
      userName: 'Carlos Jiménez',
      action: 'Rechazó reporte de campo',
      resourceType: 'field_report',
      resourceId: '3',
      timestamp: '2024-01-19T11:30:00',
      details: 'Reporte rechazado por información incompleta',
      beforeData: { status: 'pendiente' },
      afterData: { status: 'rechazado', reviewComments: 'Falta información sobre materiales utilizados' }
    }
  ];

  const [logs] = useState(mockAuditLogs);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    const matchesUser = userFilter === 'all' || log.userName === userFilter;
    return matchesSearch && matchesAction && matchesUser;
  });

  const uniqueUsers = [...new Set(logs.map(log => log.userName))];

  const getActionIcon = (action: string) => {
    if (action.includes('Creó') || action.includes('Agregó')) {
      return <Activity className="w-4 h-4 text-green-600" />;
    } else if (action.includes('Actualizó') || action.includes('Modificó')) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    } else if (action.includes('Eliminó') || action.includes('Rechazó')) {
      return <Shield className="w-4 h-4 text-red-600" />;
    } else if (action.includes('Exportó')) {
      return <Eye className="w-4 h-4 text-purple-600" />;
    }
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('Creó') || action.includes('Agregó') || action.includes('Aprobó')) {
      return 'bg-green-50 border-green-200';
    } else if (action.includes('Actualizó') || action.includes('Modificó')) {
      return 'bg-blue-50 border-blue-200';
    } else if (action.includes('Eliminó') || action.includes('Rechazó')) {
      return 'bg-red-50 border-red-200';
    } else if (action.includes('Exportó')) {
      return 'bg-purple-50 border-purple-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Auditoría</h1>
          <p className="text-gray-600 mt-1">Registro completo de actividades y cambios en el sistema</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Últimas actividades en tiempo real</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{logs.length}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eventos Hoy</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {logs.filter(log => 
                  new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{uniqueUsers.length}</p>
            </div>
            <User className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cambios Críticos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {logs.filter(log => 
                  log.action.includes('Eliminó') || log.action.includes('Rechazó')
                ).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en logs de auditoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las acciones</option>
              <option value="creó">Creaciones</option>
              <option value="actualizó">Actualizaciones</option>
              <option value="eliminó">Eliminaciones</option>
              <option value="aprobó">Aprobaciones</option>
              <option value="rechazó">Rechazos</option>
            </select>
          </div>
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los usuarios</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Registro de Actividades</h2>
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`border rounded-lg p-4 ${getActionColor(log.action)} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">{log.action}</h3>
                      <span className="text-xs text-gray-500">
                        por {log.userName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleDateString('es-CR')}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleTimeString('es-CR')}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(log)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Detalle del Evento de Auditoría</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Acción</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.userName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedLog.timestamp).toLocaleString('es-CR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Recurso</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.resourceType}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLog.details}</p>
              </div>
              {selectedLog.beforeData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Datos Anteriores</label>
                  <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-2 rounded">
                    {JSON.stringify(selectedLog.beforeData, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.afterData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Datos Posteriores</label>
                  <pre className="mt-1 text-xs text-gray-900 bg-gray-50 p-2 rounded">
                    {JSON.stringify(selectedLog.afterData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
          <p className="text-gray-600">
            {searchTerm || actionFilter !== 'all' || userFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay eventos de auditoría registrados'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Audit;