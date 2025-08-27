// features/transporte/components/BoletaMunicipal.jsx
import React, { useState, useEffect } from 'react';
import { Save, X, FileText, Calendar } from 'lucide-react';
import { MAQUINARIA_MUNICIPAL, ACTIVIDADES_POR_TIPO } from '../../../config/maquinariaMunicipal';

const BoletaMunicipal = ({ onSave, onCancel, operador }) => {
  const [formData, setFormData] = useState({
    tipoEquipo: '',
    placa: '',
    horasMaquina: '',
    horimetroInicial: '',
    horimetroFinal: '',
    kilometrajeInicial: '',
    kilometrajeFinal: '',
    litrosDiesel: '',
    actividad: '',
    cantidad: '',
    estacionInicio: '',
    estacionFin: '',
    fecha: new Date().toISOString().split('T')[0],
    operadorId: operador?.id || '',
    operadorNombre: operador?.nombre || '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});
  const [placasDisponibles, setPlacasDisponibles] = useState([]);
  const [actividadesDisponibles, setActividadesDisponibles] = useState([]);

  useEffect(() => {
    if (formData.tipoEquipo) {
      setPlacasDisponibles(MAQUINARIA_MUNICIPAL[formData.tipoEquipo] || []);
      setActividadesDisponibles(ACTIVIDADES_POR_TIPO[formData.tipoEquipo] || []);
      // Limpiar selecciones cuando cambia el tipo
      setFormData(prev => ({
        ...prev,
        placa: '',
        actividad: ''
      }));
    }
  }, [formData.tipoEquipo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tipoEquipo) {
      newErrors.tipoEquipo = 'Debe seleccionar el tipo de equipo';
    }
    if (!formData.placa) {
      newErrors.placa = 'Debe seleccionar la placa del equipo';
    }
    if (!formData.horasMaquina) {
      newErrors.horasMaquina = 'Las horas máquina son requeridas';
    }
    if (!formData.litrosDiesel) {
      newErrors.litrosDiesel = 'Los litros de diesel son requeridos';
    }
    if (!formData.actividad) {
      newErrors.actividad = 'La actividad es requerida';
    }
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    // Validaciones específicas por tipo
    if (formData.tipoEquipo === 'VAGONETA') {
      if (!formData.kilometrajeInicial || !formData.kilometrajeFinal) {
        newErrors.kilometraje = 'El kilometraje inicial y final son requeridos para vagonetas';
      }
      if (!formData.cantidad) {
        newErrors.cantidad = 'La cantidad (m³) es requerida para vagonetas';
      }
    } else {
      if (!formData.horimetroInicial || !formData.horimetroFinal) {
        newErrors.horimetro = 'El horímetro inicial y final son requeridos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dataToSend = {
      ...formData,
      tipo: 'MUNICIPAL',
      horasMaquina: parseFloat(formData.horasMaquina),
      horimetroInicial: parseFloat(formData.horimetroInicial || 0),
      horimetroFinal: parseFloat(formData.horimetroFinal || 0),
      kilometrajeInicial: parseFloat(formData.kilometrajeInicial || 0),
      kilometrajeFinal: parseFloat(formData.kilometrajeFinal || 0),
      litrosDiesel: parseFloat(formData.litrosDiesel),
      cantidad: parseFloat(formData.cantidad || 0)
    };

    onSave(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Boleta Municipal</h3>
      </div>

      {/* Tipo de Equipo y Placa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Equipo *
          </label>
          <select
            name="tipoEquipo"
            value={formData.tipoEquipo}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tipoEquipo ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar tipo</option>
            <option value="NIVELADORA">Niveladora</option>
            <option value="VAGONETA">Vagoneta</option>
            <option value="COMPACTADORA">Compactadora</option>
          </select>
          {errors.tipoEquipo && <p className="text-red-500 text-xs mt-1">{errors.tipoEquipo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placa del Equipo *
          </label>
          <select
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            disabled={!formData.tipoEquipo}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.placa ? 'border-red-300' : 'border-gray-300'
            } ${!formData.tipoEquipo ? 'bg-gray-100' : ''}`}
          >
            <option value="">Seleccionar placa</option>
            {placasDisponibles.map(maq => (
              <option key={maq.id} value={maq.placa}>
                {maq.placa} - {maq.codigo}
              </option>
            ))}
          </select>
          {errors.placa && <p className="text-red-500 text-xs mt-1">{errors.placa}</p>}
        </div>
      </div>

      {/* Horas y Lecturas */}
      <div className="border-t pt-4">
        <h4 className="text-md font-medium text-gray-900 mb-3">Lecturas del Equipo</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horas Máquina *
            </label>
            <input
              type="number"
              name="horasMaquina"
              value={formData.horasMaquina}
              onChange={handleChange}
              step="0.5"
              min="0"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.horasMaquina ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.horasMaquina && <p className="text-red-500 text-xs mt-1">{errors.horasMaquina}</p>}
          </div>

          {formData.tipoEquipo !== 'VAGONETA' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horímetro Inicial *
                </label>
                <input
                  type="number"
                  name="horimetroInicial"
                  value={formData.horimetroInicial}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.horimetro ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horímetro Final *
                </label>
                <input
                  type="number"
                  name="horimetroFinal"
                  value={formData.horimetroFinal}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.horimetro ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometraje Inicial *
                </label>
                <input
                  type="number"
                  name="kilometrajeInicial"
                  value={formData.kilometrajeInicial}
                  onChange={handleChange}
                  min="0"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.kilometraje ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometraje Final *
                </label>
                <input
                  type="number"
                  name="kilometrajeFinal"
                  value={formData.kilometrajeFinal}
                  onChange={handleChange}
                  min="0"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.kilometraje ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
            </>
          )}
        </div>

        {errors.horimetro && <p className="text-red-500 text-xs mt-1">{errors.horimetro}</p>}
        {errors.kilometraje && <p className="text-red-500 text-xs mt-1">{errors.kilometraje}</p>}
      </div>

      {/* Actividad y Consumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actividad Realizada *
          </label>
          <select
            name="actividad"
            value={formData.actividad}
            onChange={handleChange}
            disabled={!formData.tipoEquipo}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.actividad ? 'border-red-300' : 'border-gray-300'
            } ${!formData.tipoEquipo ? 'bg-gray-100' : ''}`}
          >
            <option value="">Seleccionar actividad</option>
            {actividadesDisponibles.map(actividad => (
              <option key={actividad} value={actividad}>
                {actividad}
              </option>
            ))}
          </select>
          {errors.actividad && <p className="text-red-500 text-xs mt-1">{errors.actividad}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Litros de Diesel *
          </label>
          <input
            type="number"
            name="litrosDiesel"
            value={formData.litrosDiesel}
            onChange={handleChange}
            step="0.1"
            min="0"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.litrosDiesel ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.litrosDiesel && <p className="text-red-500 text-xs mt-1">{errors.litrosDiesel}</p>}
        </div>
      </div>

      {/* Cantidad y Estación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formData.tipoEquipo === 'VAGONETA' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad (m³) *
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              step="0.5"
              min="0"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.cantidad ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Metros cúbicos"
            />
            {errors.cantidad && <p className="text-red-500 text-xs mt-1">{errors.cantidad}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estación Inicio
          </label>
          <input
            type="text"
            name="estacionInicio"
            value={formData.estacionInicio}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 0+000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estación Fin
          </label>
          <input
            type="text"
            name="estacionFin"
            value={formData.estacionFin}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: 0+100"
          />
        </div>
      </div>

      {/* Fecha y Operador */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha *
          </label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fecha ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operador
          </label>
          <input
            type="text"
            value={formData.operadorNombre || 'No asignado'}
            disabled
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
          />
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
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
          Guardar Boleta
        </button>
      </div>
    </form>
  );
};

export default BoletaMunicipal;