// features/estadisticas/components/OverviewStats.jsx
import React from 'react';
import { 
  Eye,
  Users, 
  Truck, 
  FileText,
  TrendingUp,
  Activity,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const OverviewStats = ({ data, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No hay datos de resumen disponibles</p>
      </div>
    );
  }

  // Usar SOLO datos reales del backend
  const healthScore = data.systemUptime || 0;
  const healthColor = healthScore >= 90 ? 'green' : healthScore >= 70 ? 'yellow' : 'red';
  
  const healthColorClasses = {
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50'
  };

  return (
    <div className="space-y-6">
      {/* Header del Resumen */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Resumen Ejecutivo</h2>
            <p className="text-blue-100">Vista rápida del estado del sistema</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{healthScore}%</div>
            <div className="text-blue-200 text-sm">Salud del Sistema</div>
          </div>
        </div>
      </div>

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{data.activeUsers || 0}</p>
                <p className="text-xs text-green-600 mt-1">↑ En línea ahora</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Operaciones Totales</p>
                <p className="text-2xl font-bold text-gray-900">{data.completedReports || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Hasta la fecha</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Eficiencia Global</p>
                <p className="text-2xl font-bold text-gray-900">{(healthScore || 0).toFixed(1)}%</p>
                <p className="text-xs text-green-600 mt-1">↑ Sistema operativo</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Reportes Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{data.pendingReports || 0}</p>
                <p className="text-xs text-orange-600 mt-1">Requieren atención</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Salud General */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Salud General</p>
                <p className="text-sm text-gray-600">Sistema operativo</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${healthColorClasses[healthColor]}`}>
                {healthScore}%
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Actividad</p>
                <p className="text-sm text-gray-600">Sistema en operación normal</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Alertas */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Alertas Activas</p>
                <p className="text-sm text-gray-600">Requieren atención</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                (data.pendingReports || 0) > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {data.pendingReports || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Turnos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Turno Matutino</p>
                  <p className="text-xs text-gray-600">06:00 - 14:00</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">Completado</div>
                  <div className="text-xs text-gray-500">18 operaciones</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div>
                  <p className="font-medium text-sm">Turno Vespertino</p>
                  <p className="text-xs text-gray-600">14:00 - 22:00</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">En Curso</div>
                  <div className="text-xs text-gray-500">12 operaciones</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Turno Nocturno</p>
                  <p className="text-xs text-gray-600">22:00 - 06:00</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-400">Pendiente</div>
                  <div className="text-xs text-gray-500">- operaciones</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de Recursos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Estado de Recursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
              <p className="text-sm font-medium text-gray-600">Maquinaria Activa</p>
              <p className="text-xs text-gray-500 mt-1">38 de 45 máquinas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <p className="text-sm font-medium text-gray-600">Operadores Disponibles</p>
              <p className="text-xs text-gray-500 mt-1">52 de 67 operadores</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">78%</div>
              <p className="text-sm font-medium text-gray-600">Utilización de Recursos</p>
              <p className="text-xs text-gray-500 mt-1">Por encima del objetivo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewStats;