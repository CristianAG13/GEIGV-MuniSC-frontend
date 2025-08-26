// features/transporte/components/VehiculoForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

const VehiculoForm = ({ vehiculo, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    año: '',
    color: '',
    tipo: 'Camión',
    numeroChasis: '',
    numeroMotor: '',
    combustible: 'Diesel',
    capacidadTanque: '',
    kilometraje: '',
    fechaAdquisicion: '',
    valorAdquisicion: '',
    estado: 'activo',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        placa: vehiculo.placa || '',
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        año: vehiculo.año || '',
        color: vehiculo.color || '',
        tipo: vehiculo.tipo || 'Camión',
        numeroChasis: vehiculo.numeroChasis || '',
        numeroMotor: vehiculo.numeroMotor || '',
        combustible: vehiculo.combustible || 'Diesel',
        capacidadTanque: vehiculo.capacidadTanque || '',
        kilometraje: vehiculo.kilometraje || '',
        fechaAdquisicion: vehiculo.fechaAdquisicion ? vehiculo.fechaAdquisicion.split('T')[0] : '',
        valorAdquisicion: vehiculo.valorAdquisicion || '',
        estado: vehiculo.estado || 'activo',
        observaciones: vehiculo.observaciones || ''
      });
    }
  }, [vehiculo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.placa.trim()) {
      newErrors.placa = 'La placa es requerida';
    }
    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es requerida';
    }
    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es requerido';
    }
    if (!formData.año.trim()) {
      newErrors.año = 'El año es requerido';
    } else if (isNaN(formData.año) || formData.año < 1900 || formData.año > new Date().getFullYear() + 1) {
      newErrors.año = 'Ingrese un año válido';
    }
    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo de vehículo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      ...formData,
      año: parseInt(formData.año),
      kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : 0,
      capacidadTanque: formData.capacidadTanque ? parseFloat(formData.capacidadTanque) : 0,
      valorAdquisicion: formData.valorAdquisicion ? parseFloat(formData.valorAdquisicion) : 0
    };

    onSave(dataToSend);
  };

  const tiposVehiculo = [
    'Camión',
    'Camioneta',
    'Automóvil',
    'Motocicleta',
    'Bus',
    'Microbus',
    'Volqueta',
    'Cisterna',
    'Otro'
  ];

  const tiposCombustible = [
    'Gasolina',
    'Diesel',
    'GLP',
    'Eléctrico',
    'Híbrido'
  ];

  const estadosVehiculo = [
    { value: 'activo', label: 'Activo' },
    { value: 'mantenimiento', label: 'En Mantenimiento' },
    { value: 'inactivo', label: 'Inactivo' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placa *
          </label>
          <input
            type="text"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.placa ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="ABC-123"
          />
          {errors.placa && <p className="text-red-500 text-xs mt-1">{errors.placa}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Vehículo *
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tipo ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {tiposVehiculo.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca *
          </label>
          <input
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.marca ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Toyota, Ford, etc."
          />
          {errors.marca && <p className="text-red-500 text-xs mt-1">{errors.marca}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo *
          </label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.modelo ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Hilux, F-150, etc."
          />
          {errors.modelo && <p className="text-red-500 text-xs mt-1">{errors.modelo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Año *
          </label>
          <input
            type="number"
            name="año"
            value={formData.año}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear() + 1}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.año ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="2020"
          />
          {errors.año && <p className="text-red-500 text-xs mt-1">{errors.año}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Blanco, Azul, etc."
          />
        </div>
      </div>

      {/* Información técnica */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Técnica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Chasis
            </label>
            <input
              type="text"
              name="numeroChasis"
              value={formData.numeroChasis}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Motor
            </label>
            <input
              type="text"
              name="numeroMotor"
              value={formData.numeroMotor}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Combustible
            </label>
            <select
              name="combustible"
              value={formData.combustible}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {tiposCombustible.map(combustible => (
                <option key={combustible} value={combustible}>{combustible}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad del Tanque (Litros)
            </label>
            <input
              type="number"
              name="capacidadTanque"
              value={formData.capacidadTanque}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilometraje Actual
            </label>
            <input
              type="number"
              name="kilometraje"
              value={formData.kilometraje}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {estadosVehiculo.map(estado => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Información de adquisición */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Adquisición</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Adquisición
            </label>
            <input
              type="date"
              name="fechaAdquisicion"
              value={formData.fechaAdquisicion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor de Adquisición (Bs.)
            </label>
            <input
              type="number"
              name="valorAdquisicion"
              value={formData.valorAdquisicion}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Observaciones adicionales sobre el vehículo..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Guardar
        </button>
      </div>
    </form>
  );
};

export default VehiculoForm;
