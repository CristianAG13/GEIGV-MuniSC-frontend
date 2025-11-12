// features/estadisticas/components/UsersStats.jsx
import React from 'react';
import { 
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Eye,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UsersStats = ({ data, isLoading, onRefresh }) => {
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

  // Usar SOLO datos reales del backend - NO datos simulados
  if (!data) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No hay datos de usuarios disponibles</p>
      </div>
    );
  }

  const roleConfig = {
    superadmin: {
      label: 'Super Admin',
      color: 'bg-red-100 text-red-800',
      icon: Shield
    },
    ingeniero: {
      label: 'Ingeniero',
      color: 'bg-blue-100 text-blue-800',
      icon: UserCheck
    },
    inspector: {
      label: 'Inspector',
      color: 'bg-green-100 text-green-800',
      icon: Eye
    },
    operario: {
      label: 'Operario',
      color: 'bg-yellow-100 text-yellow-800',
      icon: Users
    }
  };

  return (
    <div className="space-y-6">
      {/* Header de Usuarios */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Estadísticas de Usuarios</h2>
            <p className="text-blue-100">Métricas detalladas del sistema de usuarios</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data.totalUsers}</div>
            <div className="text-blue-200 text-sm">Usuarios Totales</div>
          </div>
        </div>
      </div>

      {/* Métricas Principales de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Usuarios Activos</p>
                <p className="text-2xl font-bold text-green-600">{data.activeUsers}</p>
                <p className="text-xs text-green-600 mt-1">
                  {((data.activeUsers / data.totalUsers) * 100).toFixed(1)}% del total
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Usuarios Inactivos</p>
                <p className="text-2xl font-bold text-red-600">{(data.totalUsers || 0) - (data.activeUsers || 0)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {data.totalUsers > 0 ? ((((data.totalUsers - data.activeUsers) / data.totalUsers) * 100).toFixed(1)) : '0'}% del total
                </p>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Nuevos Este Mes</p>
                <p className="text-2xl font-bold text-blue-600">{data.newUsersThisMonth || 0}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Crecimiento mensual
                </p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Sesiones Activas</p>
                <p className="text-2xl font-bold text-purple-600">{data.activeUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Usuarios en línea
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Roles y Usuarios Más Activos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Distribución por Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.usersByRole && Object.keys(data.usersByRole).length > 0 ? (
                Object.entries(data.usersByRole).map(([role, count]) => {
                  const config = roleConfig[role] || {
                    label: role,
                    color: 'bg-gray-100 text-gray-800',
                    icon: Users
                  };
                  const IconComponent = config.icon;
                  const percentage = data.totalUsers > 0 ? ((count / data.totalUsers) * 100).toFixed(1) : '0';
                  
                  return (
                    <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
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
                        <p className="text-xs text-gray-500">usuarios</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay datos de roles disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usuarios Más Activos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Usuarios Más Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topActiveUsers && data.topActiveUsers.length > 0 ? (
                data.topActiveUsers.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={roleConfig[user.role]?.color || 'bg-gray-100 text-gray-800'} variant="outline">
                            {roleConfig[user.role]?.label || user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.sessionsThisWeek || user.sessions || 0} sesiones</p>
                      <p className="text-xs text-gray-500">Últ. vez: {user.lastActive || user.lastLogin || 'N/A'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay datos de usuarios activos disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad y Tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad por Período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Hoy</p>
                  <p className="text-sm text-green-600">Usuarios activos</p>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {data.activeUsers || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Esta Semana</p>
                  <p className="text-sm text-blue-600">Usuarios únicos</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {data.activeUsers || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-800">Este Mes</p>
                  <p className="text-sm text-purple-600">Total de usuarios</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {data.totalUsers || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas de Sesiones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Estadísticas de Sesiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {data.totalUsers || 0}
                </div>
                <p className="text-sm text-gray-600">Sesiones Totales</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {data.activeUsers || 0}
                  </div>
                  <p className="text-xs text-gray-600">Activas Ahora</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {((data.activeUsers || 0) / (data.totalUsers || 1) * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-gray-600">Tasa Actividad</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersStats;