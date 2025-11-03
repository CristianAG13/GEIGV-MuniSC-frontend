import React, { useState } from 'react';
import { X, User, Phone, CreditCard } from 'lucide-react';

/**
 * Modal para recopilar datos adicionales del operario cuando se aprueba una solicitud de rol
 */
const OperatorDataModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  userData, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    identification: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identification.trim()) {
      newErrors.identification = 'La identificación es obligatoria';
    } else if (formData.identification.trim().length < 8) {
      newErrors.identification = 'La identificación debe tener al menos 8 caracteres';
    }

    if (formData.phoneNumber.trim() && formData.phoneNumber.trim().length < 8) {
      newErrors.phoneNumber = 'El teléfono debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        name: userData.name,
        last: userData.lastname,
        identification: formData.identification.trim(),
        phoneNumber: formData.phoneNumber.trim() || null
      });
    }
  };

  const handleClose = () => {
    setFormData({
      identification: '',
      phoneNumber: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Datos del Operario
          </h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Información del usuario */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Información del Usuario
          </h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p><span className="font-medium">Nombre:</span> {userData?.name} {userData?.lastname}</p>
            <p><span className="font-medium">Email:</span> {userData?.email}</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Número de Identificación *
            </label>
            <input
              type="text"
              value={formData.identification}
              onChange={(e) => setFormData(prev => ({ ...prev, identification: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.identification ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: 12345678"
              disabled={loading}
            />
            {errors.identification && (
              <p className="mt-1 text-sm text-red-600">{errors.identification}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Número de Teléfono (Opcional)
            </label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: 71234567"
              disabled={loading}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Estos datos son necesarios para registrar al usuario como operario 
              en el sistema de gestión de operadores.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                'Aprobar y Crear Operario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperatorDataModal;