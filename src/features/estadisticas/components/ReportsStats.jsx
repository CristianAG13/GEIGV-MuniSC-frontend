// features/estadisticas/components/ReportsStats.jsx
import React from 'react';
import { 
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BarChart3,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ReportsStats = ({ data, isLoading, onRefresh }) => {
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

  // Datos simulados para estadísticas de reportes
  const reportsData = {
    totalReports: 1247,
    completedReports: 1089,
    pendingReports: 89,
    inProgressReports: 69,
    reportsThisMonth: 156,
    averageCompletionTime: 48, // horas
    completionRate: 96.8,
    reportsByType: {
      municipal: 687,
      alquiler: 560
    },
    reportsByStatus: {
      completado: 1089,
      pendiente: 89,
      en_progreso: 69
    },
    reportsByPriority: {
      alta: 234,
      media: 678,
      baja: 335
    },
    monthlyTrend: [
      { month: 'Ene', reports: 98, completed: 94 },
      { month: 'Feb', reports: 112, completed: 108 },
      { month: 'Mar', reports: 125, completed: 118 },
      { month: 'Abr', reports: 134, completed: 128 },
      { month: 'May', reports: 145, completed: 142 },
      { month: 'Jun', reports: 156, completed: 151 }
    ],
    topReporters: [
      { id: 1, name: 'Juan Pérez', reportsCount: 45, completionRate: 98.2 },
      { id: 2, name: 'María González', reportsCount: 42, completionRate: 96.8 },
      { id: 3, name: 'Carlos López', reportsCount: 38, completionRate: 95.5 },
      { id: 4, name: 'Ana Martínez', reportsCount: 35, completionRate: 94.1 },
      { id: 5, name: 'Luis Rodriguez', reportsCount: 33, completionRate: 93.7 }
    ],
    recentActivity: [
      { id: 1, type: 'municipal', title: 'Reparación Avenida Principal', status: 'completado', date: '2024-01-10', operator: 'Juan Pérez' },
      { id: 2, type: 'alquiler', title: 'Mantenimiento Equipo CAT-001', status: 'en_progreso', date: '2024-01-10', operator: 'María González' },
      { id: 3, type: 'municipal', title: 'Limpieza Sector Norte', status: 'pendiente', date: '2024-01-09', operator: 'Carlos López' }
    ],
    qualityMetrics: {
      averageQualityScore: 4.3,
      reportsWithErrors: 23,
      reworkRequired: 15,
      clientSatisfaction: 94.2
    }
  };

  if (!data) {
    data = reportsData;
  }

  const statusConfig = {
    completado: {
      label: 'Completados',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    pendiente: {
      label: 'Pendientes',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Clock
    },
    en_progreso: {
      label: 'En Progreso',
      color: 'bg-blue-100 text-blue-800',
      icon: BarChart3
    }
  };

  const priorityConfig = {
    alta: { label: 'Alta', color: 'bg-red-100 text-red-800' },
    media: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    baja: { label: 'Baja', color: 'bg-green-100 text-green-800' }
  };

  const typeConfig = {
    municipal: { label: 'Municipal', color: 'bg-blue-100 text-blue-800' },
    alquiler: { label: 'Alquiler', color: 'bg-purple-100 text-purple-800' }
  };

  return (
    <div className="space-y-6">
      {/* Header de Reportes */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Estadísticas de Reportes</h2>
            <p className="text-green-100">Análisis de reportes por tipo, tiempo y estado</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data.totalReports}</div>
            <div className="text-green-200 text-sm">Reportes Totales</div>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Reportes Completados</p>
                <p className="text-2xl font-bold text-green-600">{data.completedReports}</p>
                <p className="text-xs text-green-600 mt-1">
                  {data.completionRate}% de completitud
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
                <p className="text-sm font-medium text-gray-600 mb-1">En Progreso</p>
                <p className="text-2xl font-bold text-blue-600">{data.inProgressReports}</p>
                <p className="text-xs text-blue-600 mt-1">Activos actualmente</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{data.pendingReports}</p>
                <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Este Mes</p>
                <p className="text-2xl font-bold text-purple-600">{data.reportsThisMonth}</p>
                <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs mes anterior
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuciones por Tipo, Estado y Prioridad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.reportsByType && Object.entries(data.reportsByType).map(([type, count]) => {
                const config = typeConfig[type] || {
                  label: type,
                  color: 'bg-gray-100 text-gray-800'
                };
                const percentage = data.totalReports > 0 ? ((count / data.totalReports) * 100).toFixed(1) : '0';
                
                return (
                  <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{percentage}% del total</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{count || 0}</span>
                  </div>
                );
              })}
              {!data.reportsByType && (
                <div className="text-center py-4 text-gray-500">
                  <p>No hay datos de tipos disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Por Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.reportsByStatus && Object.entries(data.reportsByStatus).map(([status, count]) => {
                const config = statusConfig[status] || {
                  label: status,
                  color: 'bg-gray-100 text-gray-800',
                  icon: AlertTriangle
                };
                const IconComponent = config.icon;
                const percentage = data.totalReports > 0 ? ((count / data.totalReports) * 100).toFixed(1) : '0';
                
                return (
                  <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-gray-500" />
                      <div>
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{count || 0}</span>
                  </div>
                );
              })}
              {!data.reportsByStatus && (
                <div className="text-center py-4 text-gray-500">
                  <p>No hay datos de estados disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Por Prioridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Por Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.reportsByPriority && Object.entries(data.reportsByPriority).map(([priority, count]) => {
                const config = priorityConfig[priority] || {
                  label: priority,
                  color: 'bg-gray-100 text-gray-800'
                };
                const percentage = data.totalReports > 0 ? ((count / data.totalReports) * 100).toFixed(1) : '0';
                
                return (
                  <div key={priority} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{percentage}% del total</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{count || 0}</span>
                  </div>
                );
              })}
              {!data.reportsByPriority && (
                <div className="text-center py-4 text-gray-500">
                  <p>No hay datos de prioridad disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Reporters y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Reporters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mejores Reporteros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topReporters?.slice(0, 5).map((reporter, index) => (
                <div key={reporter.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{reporter.name}</p>
                      <p className="text-xs text-gray-500">{reporter.reportsCount} reportes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{reporter.completionRate}%</p>
                    <p className="text-xs text-gray-500">completitud</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity?.map((activity) => (
                <div key={activity.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-600">por {activity.operator}</p>
                    </div>
                    <Badge className={statusConfig[activity.status]?.color || 'bg-gray-100 text-gray-800'}>
                      {statusConfig[activity.status]?.label || activity.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={typeConfig[activity.type]?.color || 'bg-gray-100 text-gray-800'} variant="outline">
                      {typeConfig[activity.type]?.label || activity.type}
                    </Badge>
                    <span className="text-xs text-gray-500">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Calidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Métricas de Calidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {data.qualityMetrics?.averageQualityScore}/5
              </div>
              <p className="text-sm text-gray-600">Calidad Promedio</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {data.qualityMetrics?.clientSatisfaction}%
              </div>
              <p className="text-sm text-gray-600">Satisfacción Cliente</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {data.qualityMetrics?.reportsWithErrors}
              </div>
              <p className="text-sm text-gray-600">Reportes con Errores</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {data.qualityMetrics?.reworkRequired}
              </div>
              <p className="text-sm text-gray-600">Requieren Reelaboración</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tendencia Mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencia Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.monthlyTrend?.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-sm w-8">{month.month}</span>
                  <div className="text-xs text-gray-600">
                    Total: {month.reports}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-green-600">{month.completed}</span>
                  <span className="text-xs text-gray-500 ml-2">completados</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsStats;