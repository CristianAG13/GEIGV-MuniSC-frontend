// features/transporte/components/DetalleVehiculo.jsx
import React from 'react';
import { 
  Car, Calendar, Fuel, Gauge, MapPin, 
  DollarSign, FileText, AlertTriangle, CheckCircle 
} from 'lucide-react';

const DetalleVehiculo = ({ vehiculo, onClose }) => {
  if (!vehiculo) return null;

  const getStatusBadge = (estado) => {
    const styles = {
      activo: 'bg-green-100 text-green-800 border-green-200',
      mantenimiento: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      inactivo: 'bg-red-100 text-red-800 border-red-200'
    };

    const icons = {
      activo: <CheckCircle className="w-4 h-4" />,
      mantenimiento: <AlertTriangle className="w-4 h-4" />,
      inactivo: <AlertTriangle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${styles[estado] || styles.inactivo}`}>
        {icons[estado] || icons.inactivo}
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">{vehiculo.marca} {vehiculo.modelo}</h2>
              <p className="text-blue-100">Placa: {vehiculo.placa}</p>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(vehiculo.estado)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Información Básica</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Tipo:</span> {vehiculo.tipo}</div>
              <div><span className="font-medium">Año:</span> {vehiculo.año}</div>
              <div><span className="font-medium">Color:</span> {vehiculo.color || 'No especificado'}</div>
              <div><span className="font-medium">Combustible:</span> {vehiculo.combustible}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Kilometraje</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Actual:</span> {vehiculo.kilometraje?.toLocaleString() || 0} km</div>
              <div><span className="font-medium">Tanque:</span> {vehiculo.capacidadTanque || 0} L</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Valor</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Adquisición:</span> Bs. {vehiculo.valorAdquisicion?.toLocaleString() || 0}</div>
              <div><span className="font-medium">Fecha:</span> {vehiculo.fechaAdquisicion ? new Date(vehiculo.fechaAdquisicion).toLocaleDateString() : 'No registrada'}</div>
            </div>
          </div>
        </div>

        {/* Información técnica */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Información Técnica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Número de Chasis:</span>
              <p className="text-gray-600">{vehiculo.numeroChasis || 'No registrado'}</p>
            </div>
            <div>
              <span className="font-medium">Número de Motor:</span>
              <p className="text-gray-600">{vehiculo.numeroMotor || 'No registrado'}</p>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {vehiculo.observaciones && (
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Observaciones</h3>
            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
              {vehiculo.observaciones}
            </p>
          </div>
        )}

        {/* Historial reciente (placeholder) */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historial Reciente
          </h3>
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No hay historial disponible</p>
            <p className="text-xs">Los registros de asignaciones y mantenimientos aparecerán aquí</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DetalleVehiculo;
