// features/transporte/components/AsignacionForm.jsx
import React, { useState, useEffect } from 'react';
import { Save, X, Search } from 'lucide-react';
import transporteService from '../../../services/transporteService';

const AsignacionForm = ({ asignacion, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    transporteId: '',
    tipoTransporte: 'vehiculo', // 'vehiculo' o 'maquinaria'
    proyecto: '',
    responsable: '',
    conductor: '',
    fechaAsignacion: '',
    fechaFinEstimada: '',
    ubicacionInicial: '',
    ubicacionDestino: '',
    proposito: '',
    kilometrajeInicial: '',
    horasInicial: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});
  const [transporteDisponible, setTransporteDisponible] = useState([]);
  const [loadingTransporte, setLoadingTransporte] = useState(false);

  useEffect(() => {
    if (asignacion) {
      setFormData({
        transporteId: asignacion.transporteId || '',
        tipoTransporte: asignacion.tipoTransporte || 'vehiculo',
        proyecto: asignacion.proyecto || '',
        responsable: asignacion.responsable || '',
        conductor: asignacion.conductor || '',
        fechaAsignacion: asignacion.fechaAsignacion ? asignacion.fechaAsignacion.split('T')[0] : '',
        fechaFinEstimada: asignacion.fechaFinEstimada ? asignacion.fechaFinEstimada.split('T')[0] : '',
        ubicacionInicial: asignacion.ubicacionInicial || '',
        ubicacionDestino: asignacion.ubicacionDestino || '',
        proposito: asignacion.proposito || '',
        kilometrajeInicial: asignacion.kilometrajeInicial || '',
        horasInicial: asignacion.horasInicial || '',
        observaciones: asignacion.observaciones || ''
      });
    } else {
      // Valores por defecto para nueva asignación
      setFormData(prev => ({
        ...prev,
        fechaAsignacion: new Date().toISOString().split('T')[0]
      }));
    }
    
    loadTransporteDisponible();
  }, [asignacion]);

  const loadTransporteDisponible = async () => {
    setLoadingTransporte(true);
    try {
      const [vehiculos, maquinaria] = await Promise.all([
        transporteService.getAllVehiculos(),
        transporteService.getAllMaquinaria()
      ]);

      // Filtrar solo los que están disponibles (activos y no asignados)
      const vehiculosDisponibles = vehiculos.filter(v => v.estado === 'activo');
      const maquinariaDisponible = maquinaria.filter(m => m.estado === 'activo');

      setTransporteDisponible({
        vehiculos: vehiculosDisponibles,
        maquinaria: maquinariaDisponible
      });
    } catch (error) {
      console.error('Error loading transporte:', error);
    } finally {
      setLoadingTransporte(false);
    }
  };

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

    // Si cambió el tipo de transporte, limpiar la selección
    if (name === 'tipoTransporte') {
      setFormData(prev => ({
        ...prev,
        transporteId: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.transporteId) {
      newErrors.transporteId = 'Debe seleccionar un vehículo o maquinaria';
    }
    if (!formData.proyecto.trim()) {
      newErrors.proyecto = 'El proyecto es requerido';
    }
    if (!formData.responsable.trim()) {
      newErrors.responsable = 'El responsable es requerido';
    }
    if (!formData.fechaAsignacion) {
      newErrors.fechaAsignacion = 'La fecha de asignación es requerida';
    }
    if (!formData.proposito.trim()) {
      newErrors.proposito = 'El propósito es requerido';
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
      kilometrajeInicial: formData.kilometrajeInicial ? parseInt(formData.kilometrajeInicial) : 0,
      horasInicial: formData.horasInicial ? parseInt(formData.horasInicial) : 0,
    };

    onSave(dataToSend);
  };

  const getTransporteOptions = () => {
    if (!transporteDisponible) return [];
    
    if (formData.tipoTransporte === 'vehiculo') {
      return transporteDisponible.vehiculos || [];
    } else {
      return transporteDisponible.maquinaria || [];
    }
  };

  const getTransporteLabel = (item) => {
    if (formData.tipoTransporte === 'vehiculo') {
      return `${item.placa} - ${item.marca} ${item.modelo}`;
    } else {
      return `${item.codigo} - ${item.tipo} ${item.marca}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selección de transporte */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Transporte *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="tipoTransporte"
                value="vehiculo"
                checked={formData.tipoTransporte === 'vehiculo'}
                onChange={handleChange}
                className="mr-2"
              />
              Vehículo
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="tipoTransporte"
                value="maquinaria"
                checked={formData.tipoTransporte === 'maquinaria'}
                onChange={handleChange}
                className="mr-2"
              />
              Maquinaria
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar {formData.tipoTransporte === 'vehiculo' ? 'Vehículo' : 'Maquinaria'} *
          </label>
          <select
            name="transporteId"
            value={formData.transporteId}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.transporteId ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={loadingTransporte}
          >
            <option value="">
              {loadingTransporte ? 'Cargando...' : `Seleccionar ${formData.tipoTransporte}`}
            </option>
            {getTransporteOptions().map(item => (
              <option key={item.id} value={item.id}>
                {getTransporteLabel(item)}
              </option>
            ))}
          </select>
          {errors.transporteId && <p className="text-red-500 text-xs mt-1">{errors.transporteId}</p>}
        </div>
      </div>

      {/* Información del proyecto */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Proyecto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proyecto *
            </label>
            <input
              type="text"
              name="proyecto"
              value={formData.proyecto}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.proyecto ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nombre del proyecto"
            />
            {errors.proyecto && <p className="text-red-500 text-xs mt-1">{errors.proyecto}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsable *
            </label>
            <input
              type="text"
              name="responsable"
              value={formData.responsable}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.responsable ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nombre del responsable del proyecto"
            />
            {errors.responsable && <p className="text-red-500 text-xs mt-1">{errors.responsable}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductor/Operador
            </label>
            <input
              type="text"
              name="conductor"
              value={formData.conductor}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre del conductor/operador"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Propósito *
            </label>
            <input
              type="text"
              name="proposito"
              value={formData.proposito}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.proposito ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Transporte de material, excavación, etc."
            />
            {errors.proposito && <p className="text-red-500 text-xs mt-1">{errors.proposito}</p>}
          </div>
        </div>
      </div>

      {/* Fechas y ubicaciones */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas y Ubicaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Asignación *
            </label>
            <input
              type="date"
              name="fechaAsignacion"
              value={formData.fechaAsignacion}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fechaAsignacion ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.fechaAsignacion && <p className="text-red-500 text-xs mt-1">{errors.fechaAsignacion}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin Estimada
            </label>
            <input
              type="date"
              name="fechaFinEstimada"
              value={formData.fechaFinEstimada}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación Inicial
            </label>
            <input
              type="text"
              name="ubicacionInicial"
              value={formData.ubicacionInicial}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Punto de partida"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación Destino
            </label>
            <input
              type="text"
              name="ubicacionDestino"
              value={formData.ubicacionDestino}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Destino final"
            />
          </div>
        </div>
      </div>

      {/* Lecturas iniciales */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lecturas Iniciales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.tipoTransporte === 'vehiculo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kilometraje Inicial
              </label>
              <input
                type="number"
                name="kilometrajeInicial"
                value={formData.kilometrajeInicial}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kilometraje actual del vehículo"
              />
            </div>
          )}

          {formData.tipoTransporte === 'maquinaria' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas Máquina Inicial
              </label>
              <input
                type="number"
                name="horasInicial"
                value={formData.horasInicial}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Horas máquina actuales"
              />
            </div>
          )}
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
          placeholder="Observaciones adicionales sobre la asignación..."
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
          Crear Asignación
        </button>
      </div>
    </form>
  );
};

export default AsignacionForm;
