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
    dailyActivity = [],
    topOperators = [],
    mostUsedMachinery = []
  } = data;

  // Métricas principales
  const mainMetrics = [
    {
      title: 'Usuarios Totales',
      value: totalUsers,
      active: activeUsers,
      change: userGrowth,
      icon: Users,
      color: 'blue',
      description: `${activeUsers} activos`
    },
    {
      title: 'Maquinaria Total',
      value: totalMachinery,
      active: activeMachinery,
      change: machineryUtilization,
      icon: Truck,
      color: 'green',
      description: `${machineryUtilization.toFixed(1)}% utilización`
    },
    {
      title: 'Operadores',
      value: totalOperators,
      active: activeOperators,
      change: operatorEfficiency,
      icon: HardHat,
      color: 'purple',
      description: `${operatorEfficiency.toFixed(1)}% eficiencia`
    },
    {
      title: 'Reportes',
      value: totalReports,
      active: reportsThisMonth,
      change: reportCompletionRate,
      icon: FileText,
      color: 'orange',
      description: `${reportsThisMonth} este mes`
    }
  ];

  const getColorClasses = (color) => ({
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-600'
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      text: 'text-orange-600'
    }
  })[color];

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colors = getColorClasses(metric.color);
          const changeIcon = metric.change >= 0 ? TrendingUp : TrendingDown;
          const ChangeIcon = changeIcon;
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {metric.value.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">{metric.description}</span>
                      {metric.change !== 0 && (
                        <div className={`flex items-center gap-1 ${
                          metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <ChangeIcon className="h-3 w-3" />
                          <span className="font-medium">
                            {Math.abs(metric.change).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <IconComponent className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Distribuciones y Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usuarios por Rol */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuarios por Rol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(usersByRole).map(([role, count]) => {
                const percentage = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : 0;
                const roleLabels = {
                  superadmin: 'Super Admin',
                  ingeniero: 'Ingeniero',
                  inspector: 'Inspector',
                  operario: 'Operario'
                };
                
                const roleColors = {
                  superadmin: 'bg-red-100 text-red-800',
                  ingeniero: 'bg-blue-100 text-blue-800',
                  inspector: 'bg-green-100 text-green-800',
                  operario: 'bg-yellow-100 text-yellow-800'
                };
                
                return (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
                        {roleLabels[role] || role}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{count}</span>
                      <span className="text-gray-500 text-sm ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Operadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5" />
              Top Operadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topOperators.slice(0, 5).map((operator, index) => (
                <div key={operator.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{operator.name}</p>
                      <p className="text-xs text-gray-500">{operator.reports} reportes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-green-600">
                        {operator.efficiency}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estado de Reportes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Estado de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(reportsByStatus).map(([status, count]) => {
                const percentage = totalReports > 0 ? ((count / totalReports) * 100).toFixed(1) : 0;
                
                const statusConfig = {
                  completed: {
                    label: 'Completados',
                    icon: CheckCircle,
                    color: 'text-green-600',
                    bg: 'bg-green-50'
                  },
                  pending: {
                    label: 'Pendientes',
                    icon: Clock,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-50'
                  },
                  in_progress: {
                    label: 'En Progreso',
                    icon: Activity,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50'
                  }
                };
                
                const config = statusConfig[status] || {
                  label: status,
                  icon: AlertTriangle,
                  color: 'text-gray-600',
                  bg: 'bg-gray-50'
                };
                
                const IconComponent = config.icon;
                
                return (
                  <div key={status} className={`flex items-center justify-between p-3 rounded-lg ${config.bg}`}>
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${config.color}`} />
                      <div>
                        <p className="font-medium text-sm">{config.label}</p>
                        <p className="text-xs text-gray-600">{percentage}% del total</p>
                      </div>
                    </div>
                    <span className={`font-bold text-lg ${config.color}`}>
                      {count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maquinaria Más Utilizada */}
      {mostUsedMachinery.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Maquinaria Más Utilizada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mostUsedMachinery.slice(0, 6).map((machine, index) => (
                <div key={machine.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{machine.name}</p>
                    <p className="text-xs text-gray-500">{machine.hours}h trabajadas</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      machine.utilization >= 80 ? 'text-green-600' :
                      machine.utilization >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {machine.utilization}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardStats;