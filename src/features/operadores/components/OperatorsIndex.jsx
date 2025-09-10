import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, Users, Loader, CheckCircle, X, UserPlus, UserMinus
} from 'lucide-react';
import operatorsService from '../../../services/operatorsService';
import usersService from '../../../services/usersService';
import { showSuccess, showError, confirmDelete, confirmAction } from '../../../utils/sweetAlert';

/**
 * Componente principal para gestión de operadores
 */
const OperatorsIndex = () => {
  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showAssociateBeforeCreateModal, setShowAssociateBeforeCreateModal] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);
  const [newOperator, setNewOperator] = useState({
    name: '',
    last: '',
    identification: '',
    phoneNumber: '',
    associatedToUser: false,
    userId: ''
  });
  const [users, setUsers] = useState([]);
  const [operatorUsers, setOperatorUsers] = useState([]); // Usuarios con rol de operador
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    loadOperators();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = operators.filter(operator => 
        operator.name.toLowerCase().includes(lowercasedSearch) || 
        operator.last.toLowerCase().includes(lowercasedSearch) ||
        operator.identification.toLowerCase().includes(lowercasedSearch) ||
        (operator.phoneNumber && operator.phoneNumber.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredOperators(filtered);
    } else {
      setFilteredOperators(operators);
    }
  }, [searchTerm, operators]);

  const loadOperators = async () => {
    try {
      setLoading(true);
      const data = await operatorsService.getAllOperators();
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
      const availableUsers = users.filter(user => 
        !operators.some(op => op.userId === user.id)
      );
      setUsers(availableUsers);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los usuarios disponibles');
      console.error('Error al cargar usuarios:', error);
    }
  };
  
  const loadOperatorUsers = async () => {
    try {
      const allUsers = await usersService.getAllUsers();
      // Filtrar usuarios que tienen rol de operador y no están asociados a ningún operador
      // Esto depende de cómo la API devuelve la información de roles, suponemos que tiene una propiedad roles
      const operatorUsers = allUsers.filter(user => 
        // Asume que los usuarios tienen una propiedad 'roles' que es un array de objetos con una propiedad 'name'
        // Y que el rol de operador se llama "operator" o "operador"
        user.roles?.some(role => 
          role.name?.toLowerCase() === "operario" || 
          role.name?.toLowerCase() === "operario"
        ) && 
        !operators.some(op => op.userId === user.id)
      );
      setOperatorUsers(operatorUsers);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los usuarios con rol de operador');
      console.error('Error al cargar usuarios con rol de operador:', error);
    }
  };

  const showCreateOperatorModal = () => {
    // Primero preguntamos si desea asociar un usuario existente
    loadOperatorUsers(); // Cargamos los usuarios con rol de operador
    setShowAssociateBeforeCreateModal(true);
  };

  const handleCreateOperator = async () => {
    try {
      // Validaciones básicas
      if (newOperator.associatedToUser) {
        // Si está asociado a un usuario, solo necesitamos ID y teléfono
        if (!newOperator.userId || !newOperator.identification.trim()) {
          showError('Campos incompletos', 'Usuario e identificación son obligatorios');
          return;
        }

        // Obtener información del usuario seleccionado
        const selectedUser = operatorUsers.find(user => user.id.toString() === newOperator.userId.toString());
        
        // Crear operador con datos mínimos
        const createdOperator = await operatorsService.createOperator({
          name: selectedUser.name,
          last: selectedUser.lastname,
          identification: newOperator.identification.trim(),
          phoneNumber: newOperator.phoneNumber.trim()
        });

        // Asociar operador con usuario
        await operatorsService.associateWithUser(createdOperator.id, newOperator.userId);
        
        showSuccess('Operador creado y asociado', 'El operador ha sido registrado y asociado al usuario correctamente');
      } else {
        // Creación normal con todos los campos
        if (!newOperator.name.trim() || !newOperator.last.trim() || !newOperator.identification.trim()) {
          showError('Campos incompletos', 'Nombre, apellido e identificación son obligatorios');
          return;
        }

        await operatorsService.createOperator({
          name: newOperator.name.trim(),
          last: newOperator.last.trim(),
          identification: newOperator.identification.trim(),
          phoneNumber: newOperator.phoneNumber.trim()
        });

        showSuccess('Operador creado', 'El operador ha sido registrado correctamente');
      }

      // Limpiar formulario y cerrar modales
      setShowCreateModal(false);
      setShowAssociateBeforeCreateModal(false);
      setNewOperator({
        name: '',
        last: '',
        identification: '',
        phoneNumber: '',
        associatedToUser: false,
        userId: ''
      });
      loadOperators();
    } catch (error) {
      const errorMsg = error.message || 'Ha ocurrido un error al crear el operador';
      showError('Error', errorMsg);
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

      await operatorsService.updateOperator(currentOperator.id, {
        name: currentOperator.name.trim(),
        last: currentOperator.last.trim(),
        identification: currentOperator.identification.trim(),
        phoneNumber: currentOperator.phoneNumber?.trim() || ''
      });

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
        await operatorsService.deleteOperator(id);
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
      await operatorsService.associateWithUser(currentOperator.id, selectedUserId);
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
        await operatorsService.dissociateFromUser(operatorId);
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
        <button 
          onClick={showCreateOperatorModal}
          className="bg-santa-cruz-blue-600 hover:bg-santa-cruz-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo operador
        </button>
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
              placeholder="Buscar por nombre, apellido, identificación o teléfono..."
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {operator.id}
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

      {/* Associate Before Create Modal */}
      {showAssociateBeforeCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">Creación de Operador</h2>
            <p className="text-sm text-gray-600 mb-4">
              ¿Desea asociar este operador a un usuario existente?
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  setNewOperator({...newOperator, associatedToUser: true});
                  setShowAssociateBeforeCreateModal(false);
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Sí, asociar a usuario
              </button>
              <button
                onClick={() => {
                  setNewOperator({...newOperator, associatedToUser: false});
                  setShowAssociateBeforeCreateModal(false);
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                No, crear nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Operator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">
              {newOperator.associatedToUser ? 'Asociar Operador a Usuario' : 'Crear Nuevo Operador'}
            </h2>

            <div className="space-y-4">
              {newOperator.associatedToUser ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuario *
                    </label>
                    <select
                      value={newOperator.userId}
                      onChange={(e) => setNewOperator({ ...newOperator, userId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccione un usuario</option>
                      {operatorUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.email} - {user.name} {user.lastname}
                        </option>
                      ))}
                    </select>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identificación *
                    </label>
                    <input
                      type="text"
                      value={newOperator.identification}
                      onChange={(e) => setNewOperator({ ...newOperator, identification: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Número de identificación"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={newOperator.phoneNumber}
                      onChange={(e) => setNewOperator({ ...newOperator, phoneNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={newOperator.name}
                      onChange={(e) => setNewOperator({ ...newOperator, name: e.target.value })}
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
                      value={newOperator.last}
                      onChange={(e) => setNewOperator({ ...newOperator, last: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ingrese el apellido"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identificación *
                    </label>
                    <input
                      type="text"
                      value={newOperator.identification}
                      onChange={(e) => setNewOperator({ ...newOperator, identification: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Número de identificación"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={newOperator.phoneNumber}
                      onChange={(e) => setNewOperator({ ...newOperator, phoneNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewOperator({
                    name: '',
                    last: '',
                    identification: '',
                    phoneNumber: '',
                    associatedToUser: false,
                    userId: ''
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateOperator}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {newOperator.associatedToUser ? 'Crear y Asociar Operador' : 'Crear Operador'}
              </button>
            </div>
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
                  {users.map(user => (
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
