import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Truck,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  Route,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const MachineryManagement: React.FC = () => {
  const { machinery, updateMachinery } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

  const filteredMachinery = machinery.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'en_uso':
        return 'bg-blue-100 text-blue-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'fuera_servicio':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disponible':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'en_uso':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'mantenimiento':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'fuera_servicio':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleStatusChange = (machineId: string, newStatus: string) => {
    updateMachinery(machineId, { status: newStatus as any });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Maquinaria</h1>
          <p className="text-gray-600 mt-1">Control y seguimiento del estado de la maquinaria vial</p>
        </div>
        {(user?.role === 'supervisor' || user?.role === 'administrador') && (
          <button className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Agregar Maquinaria</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o placa..."
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
              <option value="disponible">Disponible</option>
              <option value="en_uso">En uso</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="fuera_servicio">Fuera de servicio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Machinery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachinery.map((machine) => (
          <div key={machine.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{machine.name}</h3>
                    <p className="text-sm text-gray-600">{machine.plate}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(machine.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(machine.status)}`}>
                      {machine.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Horas trabajadas:</span>
                  <span className="text-sm font-medium text-gray-900">{machine.hoursWorked}h</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Último mantenimiento:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(machine.lastMaintenance).toLocaleDateString('es-CR')}
                  </span>
                </div>

                {machine.currentDriver && (
                  <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900">
                      Conductor: {machine.currentDriver}
                    </span>
                  </div>
                )}

                {machine.currentRoute && (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                    <Route className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-900">
                      Ruta: {machine.currentRoute}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions for supervisors and admins */}
              {(user?.role === 'supervisor' || user?.role === 'administrador') && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    <select
                      value={machine.status}
                      onChange={(e) => handleStatusChange(machine.id, e.target.value)}
                      className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="en_uso">En uso</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="fuera_servicio">Fuera de servicio</option>
                    </select>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                      Editar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMachinery.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró maquinaria</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'No hay maquinaria registrada en el sistema'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MachineryManagement;