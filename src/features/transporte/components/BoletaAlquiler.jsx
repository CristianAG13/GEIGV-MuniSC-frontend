// features/transporte/components/BoletaAlquiler.jsx
import React, { useState } from 'react';
import { Save, X, FileText } from 'lucide-react';
import { ACTIVIDADES_POR_TIPO } from '../../../config/maquinariaMunicipal';

const BoletaAlquiler = ({ onSave, onCancel, operador }) => {
  const [formData, setFormData] = useState({
    numeroBoleta: '',
    tipoEquipo: '',
    placaManual: '', // Placa ingresada manualmente
    horas: '',
    actividad: '',
    cantidad: '',
    estacionInicio: '',
    estacionFin: '',
    fecha: new Date().toISOString().split('T')[0],
    proveedor: '',
    operadorId: operador?.id || '',
    operadorNombre: operador?.nombre || '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.numeroBoleta) {
      newErrors.numeroBoleta = 'El número de boleta es requerido';
    }
    if (!formData.tipoEquipo) {
      newErrors.tipoEquipo = 'El tipo de equipo es requerido';
    }
    if (!formData.placaManual) {
      newErrors.placaManual = 'La placa del equipo es requerida';
    }
    if (!formData.horas) {
      newErrors.horas = 'Las horas trabajadas son requeridas';
    }
    if (!formData.actividad) {
      newErrors.actividad = 'La actividad es requerida';
    }
    if (formData.tipoEquipo === 'VAGONETA' && !formData.cantidad) {
      newErrors.cantidad = 'La cantidad es requerida para vagonetas';
    }
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    if (!formData.proveedor) {
      newErrors.proveedor = 'El proveedor es requerido';
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
      tipo: 'ALQUILER',
      placa: formData.placaManual,
      horas: parseFloat(formData.horas),
      cantidad: parseFloat(formData.cantidad || 0)
    };

    onSave(dataToSend);
  };

  const actividadesDisponibles = formData.tipoEquipo 
    ? ACTIVIDADES_POR_TIPO[formData.tipoEquipo] || []
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-900">Boleta de Alquiler</h3>
      </div>

      {/* Número de Boleta y Proveedor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Boleta *
          </label>
          <input
            type="text"
            name="numeroBoleta"
            value={formData.numeroBoleta}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.numeroBoleta ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ej: ALQ-2024-001"
          />
          {errors.numeroBoleta && <p className="text-red-500 text-xs mt-1">{errors.numeroBoleta}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor del Equipo *
          </label>
          <input
            type="text"
            name="proveedor"
            value={formData.proveedor}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.proveedor ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nombre del proveedor"
          />
          {errors.proveedor && <p className="text-red-500 text-xs mt-1">{errors.proveedor}</p>}
        </div>
      </div>

      {/* Tipo de Equipo y Placa Manual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Equipo *
          </label>
          <select
            name="tipoEquipo"
            value={formData.tipoEquipo}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.tipoEquipo ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar tipo</option>
            <option value="NIVELADORA">Niveladora</option>
            <option value="VAGONETA">Vagoneta</option>
            <option value="COMPACTADORA">Compactadora</option>
            <option value="EXCAVADORA">Excavadora</option>
            <option value="RETROEXCAVADORA">Retroexcavadora</option>
            <option value="OTRO">Otro</option>
          </select>
          {errors.tipoEquipo && <p className="text-red-500 text-xs mt-1">{errors.tipoEquipo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placa del Equipo *
          </label>
          <input
            type="text"
            name="placaManual"
            value={formData.placaManual}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.placaManual ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ingresar placa"
          />
          {errors.placaManual && <p className="text-red-500 text-xs mt-1">{errors.placaManual}</p>}
        </div>
      </div>

      {/* Horas y Actividad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horas Trabajadas *
          </label>
          <input
            type="number"
            name="horas"
            value={formData.horas}
            onChange={handleChange}
            step="0.5"
            min="0"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.horas ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.horas && <p className="text-red-500 text-xs mt-1">{errors.horas}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Actividad Realizada *
          </label>
          {actividadesDisponibles.length > 0 ? (
            <select
              name="actividad"
              value={formData.actividad}
             onChange={handleChange}
             className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
               errors.actividad ? 'border-red-300' : 'border-gray-300'
             }`}
           >
             <option value="">Seleccionar actividad</option>
             {actividadesDisponibles.map(actividad => (
               <option key={actividad} value={actividad}>
                 {actividad}
               </option>
             ))}
           </select>
         ) : (
           <input
             type="text"
             name="actividad"
             value={formData.actividad}
             onChange={handleChange}
             className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
               errors.actividad ? 'border-red-300' : 'border-gray-300'
             }`}
             placeholder="Describir actividad realizada"
           />
         )}
         {errors.actividad && <p className="text-red-500 text-xs mt-1">{errors.actividad}</p>}
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
             className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
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
           className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
           className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
           className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
             errors.fecha ? 'border-red-300' : 'border-gray-300'
           }`}
         />
         {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
           Operador Responsable
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
         className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
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
         className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
       >
         <Save className="w-4 h-4" />
         Guardar Boleta
       </button>
     </div>
   </form>
 );
};

export default BoletaAlquiler;