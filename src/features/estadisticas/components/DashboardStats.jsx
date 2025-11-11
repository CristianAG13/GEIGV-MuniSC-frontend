// features/estadisticas/components/DashboardStats.jsx
import React from 'react';
import { 
  Activity, 
  Users, 
  Truck, 
  HardHat,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DashboardStats = ({ data, isLoading, onRefresh }) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  const {
    totalUsers = 0,
    activeUsers = 0,
    totalMachinery = 0,
    activeMachinery = 0,
    totalOperators = 0,
    activeOperators = 0,
    totalReports = 0,
    reportsThisMonth = 0,
    userGrowth = 0,
    machineryUtilization = 0,
    operatorEfficiency = 0,
    reportCompletionRate = 0,
    usersByRole = {},
    machineryByType = {},
    reportsByStatus = {},
    topOperators = [],
    mostUsedMachinery = []
  } = data;

  // TEMPORAL: Componente simplificado para evitar el error de renderización
  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Dashboard del Sistema</h2>
            <p className="text-blue-100">Vista completa de métricas y estadísticas</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold">{String(totalUsers)}</div>
              <div className="text-blue-200 text-sm">Usuarios Totales</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{String(totalReports)}</div>
              <div className="text-blue-200 text-sm">Reportes Totales</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Métricas principales simplificadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{String(activeUsers)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maquinaria Activa</p>
                <p className="text-2xl font-bold text-gray-900">{String(activeMachinery)}</p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operadores Activos</p>
                <p className="text-2xl font-bold text-gray-900">{String(activeOperators)}</p>
              </div>
              <HardHat className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reportes Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{String(reportsThisMonth)}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center py-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-800 font-medium">⚠️ Dashboard temporalmente simplificado</p>
        <p className="text-sm text-yellow-600 mt-1">
          Se está solucionando un error de renderización de objetos. El dashboard completo se restaurará pronto.
        </p>
      </div>
    </div>
  );
};

export default DashboardStats;