import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Truck,
  User
} from 'lucide-react';

const FieldReports: React.FC = () => {
  const { fieldReports, updateFieldReport, addFieldReport } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showNewReportModal, setShowNewReportModal] = useState(false);

  const filteredReports = fieldReports.filter(report => {
    const matchesSearch = report.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.workType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.driverName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </span>
        );
      case 'aprobado':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazado
          </span>
        );
      default:
        return null;
    }
  };

  const handleApproveReport = (reportId: string) => {
    if (user?.role === 'supervisor' || user?.role === 'administrador') {
      updateFieldReport(reportId, {
        status: 'aprobado',
        reviewedBy: user.name,
        reviewDate: new Date().toISOString(),
        reviewComments: 'Reporte aprobado automáticamente'
      });
    }
  };

  const handleRejectReport = (reportId: string) => {
    if (user?.role === 'supervisor' || user?.role === 'administrador') {
      const reason = prompt('Ingrese la razón del rechazo:');
      if (reason) {
        updateFieldReport(reportId, {
          status: 'rechazado',
          reviewedBy: user.name,
          reviewDate: new Date().toISOString(),
          reviewComments: reason
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes de Campo</h1>
          <p className="text-gray-600 mt-1">Gestión y seguimiento de reportes de actividades viales</p>
        </div>
        {user?.role === 'conductor' && (
          // <button
          //   onClick={() => setShowNewReportModal(true)}
          //   className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          // >
          //   <Plus className="w-4 h-4" />
          //   <span>Nuevo Reporte</span>
          // </button>
          <Link
    to="/dashboard/reports/new"
    className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
  >
    <span className="text-xl mr-2">+</span>
    Nuevo Reporte
  </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reportes Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {fieldReports.filter(r => r.status === 'pendiente').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reportes Aprobados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {fieldReports.filter(r => r.status === 'aprobado').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reportes Rechazados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {fieldReports.filter(r => r.status === 'rechazado').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reporte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conductor/Maquinaria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.workType}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {report.route}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {report.driverName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Truck className="w-4 h-4 mr-1" />
                        {report.machineryName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {new Date(report.startTime).toLocaleDateString('es-CR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(report.startTime).toLocaleTimeString('es-CR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {report.status === 'pendiente' && (user?.role === 'supervisor' || user?.role === 'administrador') && (
                        <>
                          <button
                            onClick={() => handleApproveReport(report.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectReport(report.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
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
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Detalle del Reporte</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Trabajo</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.workType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Conductor</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.driverName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maquinaria</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.machineryName}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ruta</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.route}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReport.observations}</p>
              </div>
              {selectedReport.materialsUsed && selectedReport.materialsUsed.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Materiales Utilizados</label>
                  <div className="mt-1 space-y-1">
                    {selectedReport.materialsUsed.map((material: any, index: number) => (
                      <p key={index} className="text-sm text-gray-900">
                        • {material.name}: {material.quantity} {material.unit}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {selectedReport.reviewComments && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comentarios de Revisión</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.reviewComments}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

     <div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold text-gray-900">Reportes de Campo</h1>

  
</div>
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron reportes</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'No hay reportes registrados en el sistema'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FieldReports;