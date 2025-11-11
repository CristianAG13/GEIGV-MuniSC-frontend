// features/estadisticas/components/MachineryStats.jsx
import React from 'react';
import { 
  Truck,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  Wrench,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MachineryStats = ({ data, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Datos simulados para estadísticas de maquinaria
  const machineryData = {
    totalMachinery: 45,
    activeMachinery: 38,
    inMaintenanceMachinery: 4,
    outOfServiceMachinery: 3,
    utilizationRate: 84.4,
    averageOperatingHours: 287,
    maintenanceScheduled: 8,
    fuelConsumption: 1247, // litros por día
    machineryByType: {
      excavadora: 12,
      retroexcavadora: 8,
      camion: 15,
      volqueta: 10
    },
    machineryByStatus: {
      operativa: 38,
      mantenimiento: 4,
      fuera_servicio: 3
    },
    topPerformers: [
      { id: 1, name: 'Excavadora CAT-001', type: 'excavadora', hours: 287, utilization: 89.2, status: 'operativa' },
      { id: 2, name: 'Camión VOL-015', type: 'camion', hours: 245, utilization: 82.3, status: 'operativa' },
      { id: 3, name: 'Retroexcavadora RET-008', type: 'retroexcavadora', hours: 223, utilization: 78.9, status: 'operativa' },
      { id: 4, name: 'Volqueta VOQ-022', type: 'volqueta', hours: 201, utilization: 76.5, status: 'operativa' },
      { id: 5, name: 'Excavadora EXC-012', type: 'excavadora', hours: 189, utilization: 74.2, status: 'operativa' }
    ],
    maintenanceSchedule: [
      { id: 1, name: 'Camión CAM-008', type: 'Mantenimiento Preventivo', scheduledDate: '2024-01-15', status: 'programado' },
      { id: 2, name: 'Excavadora EXC-003', type: 'Revisión General', scheduledDate: '2024-01-18', status: 'en_proceso' },
      { id: 3, name: 'Volqueta VOQ-016', type: 'Cambio de Aceite', scheduledDate: '2024-01-20', status: 'programado' }
    ],
    operatingCosts: {
      fuel: 15420, // por mes
      maintenance: 8750,
      repairs: 3200,
      total: 27370
    }
  };

  if (!data) {
    data = machineryData;
  }

  const statusConfig = {
    operativa: {
      label: 'Operativa',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    mantenimiento: {
      label: 'Mantenimiento',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Settings
    },
    fuera_servicio: {
      label: 'Fuera de Servicio',
      color: 'bg-red-100 text-red-800',
      icon: AlertTriangle
    }
  };

  const typeConfig = {
    excavadora: { label: 'Excavadoras', color: 'bg-blue-100 text-blue-800' },
    retroexcavadora: { label: 'Retroexcavadoras', color: 'bg-green-100 text-green-800' },
    camion: { label: 'Camiones', color: 'bg-orange-100 text-orange-800' },
    volqueta: { label: 'Volquetas', color: 'bg-purple-100 text-purple-800' }
  };

  return (
    <div className="space-y-6">
      {/* Header de Maquinaria */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Estadísticas de Maquinaria</h2>
            <p className="text-orange-100">Métricas de maquinaria y reportes de utilización</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data.totalMachinery}</div>
            <div className="text-orange-200 text-sm">Máquinas Totales</div>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Maquinaria Activa</p>
                <p className="text-2xl font-bold text-green-600">{data.activeMachinery}</p>
                <p className="text-xs text-green-600 mt-1">
                  {((data.activeMachinery / data.totalMachinery) * 100).toFixed(1)}% del total
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Utilización</p>
                <p className="text-2xl font-bold text-blue-600">{data.utilizationRate}%</p>
                <p className="text-xs text-blue-600 mt-1">Promedio general</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">En Mantenimiento</p>
                <p className="text-2xl font-bold text-yellow-600">{data.inMaintenanceMachinery}</p>
                <p className="text-xs text-gray-500 mt-1">{data.maintenanceScheduled} programados</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Horas Promedio</p>
                <p className="text-2xl font-bold text-purple-600">{data.averageOperatingHours}h</p>
                <p className="text-xs text-purple-600 mt-1">Por máquina/mes</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Tipo y Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Distribución por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.machineryByType).map(([type, count]) => {
                const config = typeConfig[type] || {
                  label: type,
                  color: 'bg-gray-100 text-gray-800'
                };
                const percentage = ((count / data.totalMachinery) * 100).toFixed(1);
                
                return (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Truck className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{percentage}% del total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                      <p className="text-xs text-gray-500">unidades</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Estado de Maquinaria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Estado de Maquinaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.machineryByStatus).map(([status, count]) => {
                const config = statusConfig[status] || {
                  label: status,
                  color: 'bg-gray-100 text-gray-800',
                  icon: AlertTriangle
                };
                const IconComponent = config.icon;
                const percentage = ((count / data.totalMachinery) * 100).toFixed(1);
                
                return (
                  <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{percentage}% del total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                      <p className="text-xs text-gray-500">máquinas</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers y Mantenimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maquinaria con Mejor Rendimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Mejor Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topPerformers?.slice(0, 5).map((machine, index) => (
                <div key={machine.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{machine.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={typeConfig[machine.type]?.color || 'bg-gray-100 text-gray-800'} variant="outline">
                          {typeConfig[machine.type]?.label || machine.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{machine.utilization}%</p>
                    <p className="text-xs text-gray-500">{machine.hours}h trabajadas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Programación de Mantenimiento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Mantenimiento Programado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.maintenanceSchedule?.map((maintenance) => {
                const statusColors = {
                  programado: 'bg-yellow-100 text-yellow-800',
                  en_proceso: 'bg-blue-100 text-blue-800',
                  completado: 'bg-green-100 text-green-800'
                };
                
                return (
                  <div key={maintenance.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{maintenance.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{maintenance.type}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={statusColors[maintenance.status] || 'bg-gray-100 text-gray-800'}>
                        {maintenance.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{maintenance.scheduledDate}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Costos Operativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Costos Operativos Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Fuel className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">
                ${data.operatingCosts?.fuel?.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Combustible</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                ${data.operatingCosts?.maintenance?.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Mantenimiento</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                ${data.operatingCosts?.repairs?.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Reparaciones</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                ${data.operatingCosts?.total?.toLocaleString()}
              </div>
              <p className="text-sm text-blue-600 font-medium">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineryStats;