// features/transporte/TransporteModule.jsx
import React, { useState, useEffect } from 'react';
import { 
  Truck, Car, Plus, Edit, Trash2, Wrench, MapPin, 
  Calendar, Clock, Fuel, AlertTriangle, CheckCircle,
  Filter, Search, Download, Eye, Settings
} from 'lucide-react';
import transporteService from '../../services/transporteService';
import VehiculoForm from './components/VehiculoForm';
import MaquinariaForm from './components/MaquinariaForm';
import AsignacionForm from './components/AsignacionForm';
import BoletaMunicipal from './components/BoletaMunicipal';
import BoletaAlquiler from './components/BoletaAlquiler';
import { Receipt, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TransporteModule = () => {
  const [activeTab, setActiveTab] = useState('vehiculos');
  const [vehiculos, setVehiculos] = useState([]);
  const [maquinaria, setMaquinaria] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'vehiculo', 'maquinaria', 'asignacion'
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [asignacionActiva, setAsignacionActiva] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'vehiculos':
          const vehiculosData = await transporteService.getAllVehiculos();
          setVehiculos(vehiculosData);
          break;
        case 'maquinaria':
          const maquinariaData = await transporteService.getAllMaquinaria();
          setMaquinaria(maquinariaData);
          break;
        case 'asignaciones':
          const asignacionesData = await transporteService.getAsignaciones();
          setAsignaciones(asignacionesData);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  
  
  // Al abrir el modal de boleta, primero verificar si hay asignación
  const handleOpenBoletaMunicipal = async (maquinariaId) => {
    try {
      const asignacion = await transporteService.getAsignacionActiva(maquinariaId);
      setAsignacionActiva(asignacion);
      handleOpenModal('boletaMunicipal');
    } catch (error) {
      // Si no hay asignación, usar el usuario actual
      handleOpenModal('boletaMunicipal');
    }
  };
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
  };

  const handleSave = async (data) => {
    try {
      switch (modalType) {
        case 'vehiculo':
          if (editingItem) {
            await transporteService.updateVehiculo(editingItem.id, data);
          } else {
            await transporteService.createVehiculo(data);
          }
          break;
        case 'maquinaria':
          if (editingItem) {
            await transporteService.updateMaquinaria(editingItem.id, data);
          } else {
            await transporteService.createMaquinaria(data);
          }
          break;
        case 'asignacion':
          if (editingItem) {
            // Actualizar asignación si es necesario
          } else {
            await transporteService.createAsignacion(data);
          }
          break;

          case 'boletaMunicipal':
        await transporteService.createBoletaMunicipal(data);
        // Mostrar notificación de éxito
        alert('Boleta municipal guardada exitosamente');
        break;
        
      case 'boletaAlquiler':
        await transporteService.createBoletaAlquiler(data);
        // Mostrar notificación de éxito
        alert('Boleta de alquiler guardada exitosamente');
        break;
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('¿Está seguro de eliminar este elemento?')) {
      try {
        switch (type) {
          case 'vehiculo':
            await transporteService.deleteVehiculo(id);
            break;
          case 'maquinaria':
            await transporteService.deleteMaquinaria(id);
            break;
        }
        loadData();
      } catch (error) {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const getStatusBadge = (estado) => {
    const styles = {
      activo: 'bg-green-100 text-green-800 border-green-200',
      mantenimiento: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      inactivo: 'bg-red-100 text-red-800 border-red-200',
      asignado: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const icons = {
      activo: <CheckCircle className="w-3 h-3" />,
      mantenimiento: <Wrench className="w-3 h-3" />,
      inactivo: <AlertTriangle className="w-3 h-3" />,
      asignado: <MapPin className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[estado] || styles.inactivo}`}>
        {icons[estado] || icons.inactivo}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  const tabs = [
    { id: 'vehiculos', name: 'Vehículos', icon: Car },
    { id: 'maquinaria', name: 'Maquinaria', icon: Truck },
    { id: 'asignaciones', name: 'Asignaciones', icon: MapPin },
    { id: 'mantenimientos', name: 'Mantenimientos', icon: Wrench },
    { id: 'reportes', name: 'Reportes', icon: Download }
  ];

  const renderVehiculos = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Vehículos</h2>
        <button
          onClick={() => handleOpenModal('vehiculo')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Vehículo
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por placa, marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="mantenimiento">En mantenimiento</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      {/* Tabla de vehículos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kilometraje</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehiculos.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={7}>
                    No hay vehículos registrados
                  </td>
                </tr>
              ) : (
                vehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehiculo.placa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehiculo.marca} {vehiculo.modelo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehiculo.año}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehiculo.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vehiculo.kilometraje?.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(vehiculo.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal('vehiculo', vehiculo)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Ver detalles */}}
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Ver mantenimientos */}}
                          className="text-yellow-600 hover:text-yellow-800 p-1 rounded"
                          title="Mantenimientos"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehiculo.id, 'vehiculo')}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMaquinaria = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Maquinaria</h2>
        <div className="flex gap-2">
        <button
          onClick={() => handleOpenModal('boletaMunicipal')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Receipt className="w-4 h-4" />
          Boleta Municipal
        </button>
        <button
          onClick={() => handleOpenModal('boletaAlquiler')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Boleta Alquiler
        </button>
        <button
          onClick={() => handleOpenModal('maquinaria')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Maquinaria
        </button>
      </div>
    </div>
        
      

      {/* Filtros y búsqueda */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por código, tipo o marca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Operativa</option>
          <option value="mantenimiento">En mantenimiento</option>
          <option value="inactivo">Fuera de servicio</option>
        </select>
      </div>

      {/* Tabla de maquinaria */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo/Modelo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horas Máquina</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Mantención</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maquinaria.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={7}>
                    No hay maquinaria registrada
                  </td>
                </tr>
              ) : (
                maquinaria.map((maq) => (
                  <tr key={maq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {maq.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {maq.tipo} - {maq.modelo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {maq.marca}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {maq.horasMaquina?.toLocaleString()} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {maq.ultimaMantencion ? new Date(maq.ultimaMantencion).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(maq.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal('maquinaria', maq)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Ver detalles */}}
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Ver mantenimientos */}}
                          className="text-yellow-600 hover:text-yellow-800 p-1 rounded"
                          title="Mantenimientos"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(maq.id, 'maquinaria')}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAsignaciones = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Asignaciones de Transporte</h2>
        <button
          onClick={() => handleOpenModal('asignacion')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Asignación
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transporte</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Asignación</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asignaciones.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    No hay asignaciones registradas
                  </td>
                </tr>
              ) : (
                asignaciones.map((asignacion) => (
                  <tr key={asignacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {asignacion.transporte?.placa || asignacion.transporte?.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asignacion.proyecto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asignacion.responsable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(asignacion.fechaAsignacion).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(asignacion.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {/* Ver detalles */}}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {/* Finalizar asignación */}}
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title="Finalizar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'vehiculos':
        return renderVehiculos();
      case 'maquinaria':
        return renderMaquinaria();
      case 'asignaciones':
        return renderAsignaciones();
      case 'mantenimientos':
        return (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Mantenimientos</h2>
            <p className="text-gray-600">Módulo en desarrollo - Gestión de mantenimientos preventivos y correctivos</p>
          </div>
        );
      case 'reportes':
        return (
          <div className="text-center py-12">
            <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Reportes</h2>
            <p className="text-gray-600">Módulo en desarrollo - Reportes de uso, combustible y costos</p>
          </div>
        );
      default:
        return renderVehiculos();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Transporte</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Truck className="w-4 h-4" />
          Módulo de Transporte y Maquinaria
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando...</span>
        </div>
      ) : (
        renderContent()
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
              { /* {editingItem ? 'Editar' : 'Nuevo'} {modalType === 'vehiculo' ? 'Vehículo' : modalType === 'maquinaria' ? 'Maquinaria' : 'Asignación'}*/}
                 {/* Actualizar el título según el tipo de modal */}
          {modalType === 'vehiculo' && (editingItem ? 'Editar' : 'Nuevo') + ' Vehículo'}
          {modalType === 'maquinaria' && (editingItem ? 'Editar' : 'Nueva') + ' Maquinaria'}
          {modalType === 'asignacion' && 'Nueva Asignación'}
          {modalType === 'boletaMunicipal' && 'Nueva Boleta Municipal'}
          {modalType === 'boletaAlquiler' && 'Nueva Boleta de Alquiler'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            {modalType === 'vehiculo' && (
              <VehiculoForm
                vehiculo={editingItem}
                onSave={handleSave}
                onCancel={handleCloseModal}
              />
            )}
            
            {modalType === 'maquinaria' && (
              <MaquinariaForm
                maquinaria={editingItem}
                onSave={handleSave}
                onCancel={handleCloseModal}
              />
            )}
            
            {modalType === 'asignacion' && (
              <AsignacionForm
                asignacion={editingItem}
                onSave={handleSave}
                onCancel={handleCloseModal}
              />
            )}

            

   {modalType === 'boletaMunicipal' && (
  <BoletaMunicipal
    onSave={handleSave}
    onCancel={handleCloseModal}
    operador={{
      id: user?.id,
      nombre: `${user?.name} ${user?.lastname}`
    }}
  />
)}

{modalType === 'boletaAlquiler' && (
  <BoletaAlquiler
    onSave={handleSave}
    onCancel={handleCloseModal}
    operador={{
      id: user?.id,
      nombre: `${user?.name} ${user?.lastname}`
    }}
  />
)}

          </div>
        </div>
      )}
    </div>
  );
};

export default TransporteModule;


// {modalType === 'boletaAlquiler' && (
//         <BoletaAlquiler
//           onSave={handleSave}
//           onCancel={handleCloseModal}
//           operador={/* Aquí debes pasar el operador actual */}
//         />
//       )}