// features/transporte/components/MaquinariaForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

const MaquinariaForm = ({ maquinaria, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    tipo: 'Excavadora',
    marca: '',
    modelo: '',
    año: '',
    numeroSerie: '',
    horasMaquina: '',
    capacidadOperacion: '',
    combustible: 'Diesel',
    consumoPorHora: '',
    fechaAdquisicion: '',
    valorAdquisicion: '',
    ubicacion: '',
    estado: 'activo',
    proximoMantenimiento: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (maquinaria) {
      setFormData({
        codigo: maquinaria.codigo || '',
        tipo: maquinaria.tipo || 'Excavadora',
        marca: maquinaria.marca || '',
        modelo: maquinaria.modelo || '',
        año: maquinaria.año || '',
        numeroSerie: maquinaria.numeroSerie || '',
        horasMaquina: maquinaria.horasMaquina || '',
        capacidadOperacion: maquinaria.capacidadOperacion || '',
        combustible: maquinaria.combustible || 'Diesel',
        consumoPorHora: maquinaria.consumoPorHora || '',
        fechaAdquisicion: maquinaria.fechaAdquisicion ? maquinaria.fechaAdquisicion.split('T')[0] : '',
        valorAdquisicion: maquinaria.valorAdquisicion || '',
        ubicacion: maquinaria.ubicacion || '',
        estado: maquinaria.estado || 'activo',
        proximoMantenimiento: maquinaria.proximoMantenimiento ? maquinaria.proximoMantenimiento.split('T')[0] : '',
        observaciones: maquinaria.observaciones || ''
      });
    }
  }, [maquinaria]);

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

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }
    if (!formData.tipo.trim()) {
      newErrors.tipo = 'El tipo de maquinaria es requerido';
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
      horasMaquina: formData.horasMaquina ? parseInt(formData.horasMaquina) : 0,
      consumoPorHora: formData.consumoPorHora ? parseFloat(formData.consumoPorHora) : 0,
      valorAdquisicion: formData.valorAdquisicion ? parseFloat(formData.valorAdquisicion) : 0
    };

    onSave(dataToSend);
  };

  const tiposMaquinaria = [
    'Excavadora',
    'Retroexcavadora',
    'Bulldozer',
    'Motoniveladora',
    'Compactadora',
    'Rodillo',
    'Cargadora Frontal',
    'Volqueta',
    'Cisterna',
    'Grúa',
    'Mixer',
    'Perforadora',
    'Fresadora',
    'Pavimentadora',
    'Barredora',
    'Otro'
  ];

  const tiposCombustible = [
    'Diesel',
    'Gasolina',
    'Eléctrico',
    'Hidráulico'
  ];

  const estadosMaquinaria = [
    { value: 'activo', label: 'Operativa' },
    { value: 'mantenimiento', label: 'En Mantenimiento' },
    { value: 'inactivo', label: 'Fuera de Servicio' },
    { value: 'reparacion', label: 'En Reparación' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código *
          </label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.codigo ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="EXC-001"
          />
          {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Maquinaria *
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tipo ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            {tiposMaquinaria.map(tipo => (
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
            placeholder="Caterpillar, Komatsu, etc."
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
            placeholder="320D, PC200, etc."
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
            Número de Serie
          </label>
          <input
            type="text"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Información operativa */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Operativa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horas Máquina Actuales
            </label>
            <input
              type="number"
              name="horasMaquina"
              value={formData.horasMaquina}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad de Operación
            </label>
            <input
              type="text"
              name="capacidadOperacion"
              value={formData.capacidadOperacion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 1.5 m³, 20 ton, etc."
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
              Consumo por Hora (Litros)
            </label>
            <input
              type="number"
              name="consumoPorHora"
              value={formData.consumoPorHora}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación Actual
            </label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Taller, Proyecto X, etc."
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
              {estadosMaquinaria.map(estado => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Información de adquisición y mantenimiento */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Adquisición y Mantenimiento</h3>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Próximo Mantenimiento
            </label>
            <input
              type="date"
              name="proximoMantenimiento"
              value={formData.proximoMantenimiento}
              onChange={handleChange}
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
          placeholder="Observaciones adicionales sobre la maquinaria..."
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

export default MaquinariaForm;
