// features/auditoria/components/AuditStats.jsx
import React from 'react';
import { 
  Activity, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield, 
  Users, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AuditStats = ({ stats, isLoading = false, dateRange = null }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const {
    totalEvents = 0,
    actionCounts = {},
    entityCounts = {},
    userCounts = {},
    recentActivity = [],
    criticalEvents = 0,
    topUsers = [],
    dailyActivity = []
  } = stats;

  // Configuración de iconos y colores para acciones
  const actionConfig = {
    CREATE: { 
      icon: Plus, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      label: 'Creaciones' 
    },
    UPDATE: { 
      icon: Edit3, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      label: 'Actualizaciones' 
    },
    DELETE: { 
      icon: Trash2, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      label: 'Eliminaciones' 
    },
    AUTH: { 
      icon: Shield, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      label: 'Autenticación' 
    },
    SYSTEM: { 
      icon: Activity, 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-50',
      label: 'Sistema' 
    }
  };

  // Calcular porcentaje de cambio si hay datos históricos
  const getChangePercentage = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de eventos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents.toLocaleString()}</p>
                {dateRange && (
                  <p className="text-xs text-gray-500 mt-1">
                    {dateRange.startDate} - {dateRange.endDate}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eventos críticos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Críticos</p>
                <p className="text-2xl font-bold text-gray-900">{criticalEvents}</p>
                <p className="text-xs text-gray-500 mt-1">Eliminaciones y errores</p>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usuarios activos */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(userCounts).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Con actividad registrada</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tendencia */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actividad Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailyActivity.length > 0 
                    ? Math.round(dailyActivity.reduce((a, b) => a + b.count, 0) / dailyActivity.length)
                    : 0
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">Eventos por día</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(actionCounts).map(([action, count]) => {
                const config = actionConfig[action] || actionConfig.SYSTEM;
                const percentage = totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(1) : 0;
                const IconComponent = config.icon;
                
                return (
                  <div key={action} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{config.label}</p>
                        <p className="text-sm text-gray-500">{percentage}% del total</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {count.toLocaleString()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad por Entidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(entityCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([entity, count]) => {
                  const percentage = totalEvents > 0 ? ((count / totalEvents) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={entity} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium capitalize">{entity}</p>
                          <span className="text-sm text-gray-500">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-3 font-mono">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usuarios más activos */}
      {topUsers && topUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Más Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topUsers.slice(0, 6).map((user, index) => (
                <div key={user.userId} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.userEmail}</p>
                    <p className="text-xs text-gray-500">
                      {user.eventCount} eventos
                    </p>
                  </div>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actividad reciente */}
      {recentActivity && recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((event, index) => {
                const config = actionConfig[event.action] || actionConfig.SYSTEM;
                const IconComponent = config.icon;
                const datetime = new Date(event.timestamp).toLocaleString('es-ES');
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className={`h-8 w-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                      <IconComponent className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.description}</p>
                      <p className="text-xs text-gray-500">
                        {event.userEmail} • {datetime}
                      </p>
                    </div>
                    <Badge variant="outline" className={config.color}>
                      {event.action}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditStats;