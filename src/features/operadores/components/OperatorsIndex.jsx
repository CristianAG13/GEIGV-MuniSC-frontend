import React, { useState, useEffect } from 'react';
import { 
  Edit, Trash2, Search, Users, Loader, CheckCircle, X, UserPlus, UserMinus
} from 'lucide-react';
import operatorsService from '../../../services/operatorsService';
import usersService from '../../../services/usersService';
import { showSuccess, showError, confirmDelete, confirmAction } from '../../../utils/sweetAlert';
import { useAuditLogger } from '../../../hooks/useAuditLogger';

/**
 * Componente principal para gestión de operadores
 */
const OperatorsIndex = () => {
  // Hook de auditoría
  const { logCreate, logUpdate, logDelete } = useAuditLogger();
  
  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);
  const [users, setUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    loadOperators();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      console.log('Buscando:', lowercasedSearch);
      console.log('Operadores a filtrar:', operators);
      
      const filtered = operators.filter(operator => {
        console.log('Operador:', operator);
        const nameMatch = operator.name && operator.name.toLowerCase().includes(lowercasedSearch);
        const lastMatch = operator.last && operator.last.toLowerCase().includes(lowercasedSearch);
        const idMatch = operator.identification && operator.identification.toLowerCase().includes(lowercasedSearch);
        const phoneMatch = operator.phoneNumber && operator.phoneNumber.toLowerCase().includes(lowercasedSearch);
        const emailMatch = operator.email && operator.email.toLowerCase().includes(lowercasedSearch);
        
        console.log(`Matches para ${operator.name} ${operator.last}:`, {
          nameMatch, lastMatch, idMatch, phoneMatch, emailMatch
        });
        
        return nameMatch || lastMatch || idMatch || phoneMatch || emailMatch;
      });
      
      console.log('Resultados filtrados:', filtered);
      setFilteredOperators(filtered);
    } else {
      setFilteredOperators(operators);
    }
  }, [searchTerm, operators]);

  const loadOperators = async () => {
    try {
      setLoading(true);
      const data = await operatorsService.getAllOperators();
      console.log('Datos de operadores recibidos:', data);
      console.log('Primer operador:', data[0]);
      setOperators(data);
      setFilteredOperators(data);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los operadores');
      console.error('Error al cargar operadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const users = await usersService.getAllUsers();
      // Filtrar usuarios que no están ya asociados a operadores
      const filteredUsers = users.filter(user => 
        !operators.some(op => op.userId === user.id)
      );
      setAvailableUsers(filteredUsers);
      setUsers(users); // Mantener todos los usuarios para referencia
    } catch (error) {
      showError('Error', 'No se pudieron cargar los usuarios disponibles');
      console.error('Error al cargar usuarios:', error);
    }
  };
  






  const handleEditOperator = (operator) => {
    setCurrentOperator(operator);
    setShowEditModal(true);
  };

  const handleUpdateOperator = async () => {
    try {
      // Validaciones básicas
      if (!currentOperator.name.trim() || !currentOperator.last.trim() || !currentOperator.identification.trim()) {
        showError('Campos incompletos', 'Nombre, apellido e identificación son obligatorios');
        return;
      }

      // Capturar datos antes de la actualización
      const dataBefore = operators.find(op => op.id === currentOperator.id);

      const updatedData = {
        name: currentOperator.name.trim(),
        last: currentOperator.last.trim(),
        identification: currentOperator.identification.trim(),
        phoneNumber: currentOperator.phoneNumber?.trim() || ''
      };

      await operatorsService.updateOperator(currentOperator.id, updatedData);

      // Registrar en auditoría
      await logUpdate(
        'operadores',
        dataBefore,
        { ...dataBefore, ...updatedData },
        `Se actualizó el operador: ${updatedData.name} ${updatedData.last}`
      );

      showSuccess('Operador actualizado', 'Los datos del operador han sido actualizados correctamente');
      setShowEditModal(false);
      setCurrentOperator(null);
      loadOperators();
    } catch (error) {
      const errorMsg = error.message || 'Ha ocurrido un error al actualizar el operador';
      showError('Error', errorMsg);
    }
  };

  const handleDeleteOperator = async (id) => {
    const result = await confirmDelete('este operador');
    if (result.isConfirmed) {
      try {
        // Capturar datos del operador antes de eliminar
        const operatorToDelete = operators.find(op => op.id === id);

        await operatorsService.deleteOperator(id);

        // Registrar en auditoría
        await logDelete(
          'operadores',
          operatorToDelete,
          `Se eliminó el operador: ${operatorToDelete?.name} ${operatorToDelete?.last} (ID: ${operatorToDelete?.identification})`
        );

        showSuccess('Operador eliminado', 'El operador ha sido eliminado correctamente');
        loadOperators();
      } catch (error) {
        const errorMsg = error.message || 'Ha ocurrido un error al eliminar el operador';
        showError('Error', errorMsg);
      }
    }
  };

  const handleLinkToUser = (operator) => {
    setCurrentOperator(operator);
    setSelectedUserId('');
    loadAvailableUsers();
    setShowLinkModal(true);
  };

  const handleAssociateWithUser = async () => {
    if (!selectedUserId) {
      showError('Error', 'Debe seleccionar un usuario');
      return;
    }

    try {
      // Encontrar el usuario seleccionado
      const selectedUser = availableUsers.find(u => u.id === parseInt(selectedUserId));

      await operatorsService.associateWithUser(currentOperator.id, selectedUserId);

      // Registrar en auditoría
      await logUpdate(
        'operadores',
        currentOperator,
        { ...currentOperator, userId: selectedUserId },
        `Se asoció el operador ${currentOperator.name} ${currentOperator.last} con el usuario ${selectedUser?.username || selectedUserId}`
      );

      showSuccess('Usuario asociado', 'El usuario ha sido asociado al operador correctamente');
      setShowLinkModal(false);
      loadOperators();
    } catch (error) {
      const errorMsg = error.message || 'Ha ocurrido un error al asociar el usuario';
      showError('Error', errorMsg);
    }
  };

  const handleDissociateFromUser = async (operatorId) => {
    const result = await confirmAction(
      'Desasociar usuario',
      '¿Está seguro que desea desasociar el usuario de este operador?',
      {
        confirmButtonText: 'Sí, desasociar',
        cancelButtonText: 'Cancelar',
        icon: 'warning'
      }
    );

    if (result.isConfirmed) {
      try {
        // Capturar datos del operador antes de desasociar
        const operatorToUpdate = operators.find(op => op.id === operatorId);

        await operatorsService.dissociateFromUser(operatorId);

        // Registrar en auditoría
        await logUpdate(
          'operadores',
          operatorToUpdate,
          { ...operatorToUpdate, userId: null },
          `Se desasoció el usuario del operador: ${operatorToUpdate?.name} ${operatorToUpdate?.last}`
        );

        showSuccess('Usuario desasociado', 'El usuario ha sido desasociado del operador correctamente');
        loadOperators();
      } catch (error) {
        const errorMsg = error.message || 'Ha ocurrido un error al desasociar el usuario';
        showError('Error', errorMsg);
      }
    }
  };

  const handleViewDetails = async (operatorId) => {
    try {
      const operator = await operatorsService.getOperatorWithUserDetails(operatorId);
      
      // En vez de usar confirmAction, usamos directamente Swal.fire para poder usar HTML
      const Swal = (await import('sweetalert2')).default;
      
      await Swal.fire({
        title: 'Detalles del Operador',
        html: `
          <div class="text-left p-4">
            <div class="flex flex-col space-y-4">
              <div class="flex justify-center items-center mb-2">
                <div class="bg-santa-cruz-blue-100 rounded-full p-4 w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-santa-cruz-blue-600">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div class="grid grid-cols-2 gap-4">
                  <div class="col-span-2 md:col-span-1">
                    <p class="text-gray-500 text-sm">Nombre</p>
                    <p class="font-medium">${operator.name} ${operator.last}</p>
                  </div>
                  <div class="col-span-2 md:col-span-1">
                    <p class="text-gray-500 text-sm">Identificación</p>
                    <p class="font-medium">${operator.identification}</p>
                  </div>
                  <div class="col-span-2 md:col-span-1">
                    <p class="text-gray-500 text-sm">Teléfono</p>
                    <p class="font-medium">${operator.phoneNumber || 'No registrado'}</p>
                  </div>
                  <div class="col-span-2 md:col-span-1">
                    <p class="text-gray-500 text-sm">Email</p>
                    <p class="font-medium">
                      ${operator.email ? 
                        `<span class="text-santa-cruz-blue-600">${operator.email}</span>` : 
                        '<span class="text-gray-400 italic">No asociado a un usuario</span>'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3b82f6',
        showCancelButton: false,
        width: 'auto',
        customClass: {
          container: 'operator-modal-container',
          popup: 'operator-modal-popup',
          content: 'operator-modal-content'
        }
      });
    } catch (error) {
      showError('Error', 'No se pudieron cargar los detalles del operador');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Operadores</h1>
      </div>

      {/* Search and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-santa-cruz-blue-500 focus:border-santa-cruz-blue-500 sm:text-sm"
              placeholder="Buscar por email, nombre, apellido, identificación o teléfono..."
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-5 w-5" />
            <span>Total: {filteredOperators.length} operadores</span>
          </div>
        </div>
      </div>

      {/* Operators list */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader className="w-8 h-8 animate-spin text-santa-cruz-blue-600" />
          <span className="ml-2 text-gray-600">Cargando operadores...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apellido</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificación</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOperators.length > 0 ? (
                  filteredOperators.map((operator) => (
                    <tr key={operator.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operator.email || (operator.userId ? 'Email asociado' : 'Sin email')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operator.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operator.last}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operator.identification}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {operator.phoneNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {operator.userId ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" /> 
                              Asociado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              <X className="w-3 h-3 mr-1" /> 
                              No asociado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(operator.id)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors"
                            title="Ver detalles"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditOperator(operator)}
                            className="text-santa-cruz-blue-600 hover:text-santa-cruz-blue-800 p-2 rounded-md hover:bg-santa-cruz-blue-50 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOperator(operator.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {operator.userId ? (
                            <button
                              onClick={() => handleDissociateFromUser(operator.id)}
                              className="text-orange-600 hover:text-orange-800 p-2 rounded-md hover:bg-orange-50 transition-colors"
                              title="Desasociar usuario"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleLinkToUser(operator)}
                              className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50 transition-colors"
                              title="Asociar a un usuario"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500 text-sm">
                      {searchTerm ? 'No se encontraron operadores con los criterios de búsqueda' : 'No hay operadores registrados'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}





      {/* Edit Operator Modal */}
      {showEditModal && currentOperator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">Editar Operador</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={currentOperator.name}
                  onChange={(e) => setCurrentOperator({ ...currentOperator, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={currentOperator.last}
                  onChange={(e) => setCurrentOperator({ ...currentOperator, last: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identificación *
                </label>
                <input
                  type="text"
                  value={currentOperator.identification}
                  onChange={(e) => setCurrentOperator({ ...currentOperator, identification: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={currentOperator.phoneNumber || ''}
                  onChange={(e) => setCurrentOperator({ ...currentOperator, phoneNumber: e.target.value })}
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
                onClick={handleUpdateOperator}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link to User Modal */}
      {showLinkModal && currentOperator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">Asociar Operador a Usuario</h2>
            <p className="text-sm text-gray-600 mb-4">
              Seleccione un usuario para asociar al operador {currentOperator.name} {currentOperator.last}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un usuario</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email} - {user.name} {user.lastname}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssociateWithUser}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Asociar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorsIndex;
