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

  // Datos simulados para estadísticas de usuarios
  const usersData = {
    totalUsers: 125,
    activeUsers: 89,
    inactiveUsers: 36,
    newUsersThisMonth: 12,
    usersByRole: {
      superadmin: 2,
      ingeniero: 8,
      inspector: 25,
      operario: 90
    },
    userActivity: {
      daily: 45,
      weekly: 89,
      monthly: 125
    },
    userGrowth: {
      thisMonth: 12.5,
      lastMonth: 8.3,
      trend: 'up'
    },
    topActiveUsers: [
      { id: 1, name: 'Juan Pérez', role: 'ingeniero', sessionsThisWeek: 28, lastActive: '2 min ago' },
      { id: 2, name: 'María González', role: 'inspector', sessionsThisWeek: 24, lastActive: '5 min ago' },
      { id: 3, name: 'Carlos López', role: 'operario', sessionsThisWeek: 22, lastActive: '15 min ago' },
      { id: 4, name: 'Ana Martínez', role: 'inspector', sessionsThisWeek: 20, lastActive: '1 hour ago' },
      { id: 5, name: 'Luis Rodriguez', role: 'operario', sessionsThisWeek: 18, lastActive: '2 hours ago' }
    ],
    registrationTrend: [
      { month: 'Ene', count: 8 },
      { month: 'Feb', count: 12 },
      { month: 'Mar', count: 15 },
      { month: 'Abr', count: 10 },
      { month: 'May', count: 18 },
      { month: 'Jun', count: 22 }
    ],
    sessionStats: {
      averageSessionDuration: '2h 15m',
      totalSessions: 1847,
      activeSessions: 28
    }
  };

  if (!data) {
    // Usar datos simulados si no hay datos reales
    data = usersData;
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
                <p className="text-2xl font-bold text-red-600">{data.inactiveUsers || (data.totalUsers - data.activeUsers)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(((data.totalUsers - data.activeUsers) / data.totalUsers) * 100).toFixed(1)}% del total
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
                <p className="text-2xl font-bold text-blue-600">{data.newUsersThisMonth}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +{data.userGrowth?.thisMonth || 12.5}% crecimiento
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
                <p className="text-2xl font-bold text-purple-600">{data.sessionStats?.activeSessions || 28}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Promedio: {data.sessionStats?.averageSessionDuration || '2h 15m'}
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
              {Object.entries(data.usersByRole).map(([role, count]) => {
                const config = roleConfig[role] || {
                  label: role,
                  color: 'bg-gray-100 text-gray-800',
                  icon: Users
                };
                const IconComponent = config.icon;
                const percentage = ((count / data.totalUsers) * 100).toFixed(1);
                
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
              })}
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
              {data.topActiveUsers?.slice(0, 5).map((user, index) => (
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
                    <p className="text-sm font-medium text-gray-900">{user.sessionsThisWeek} sesiones</p>
                    <p className="text-xs text-gray-500">Últ. vez: {user.lastActive}</p>
                  </div>
                </div>
              ))}
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
                  {data.userActivity?.daily || 45}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Esta Semana</p>
                  <p className="text-sm text-blue-600">Usuarios únicos</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {data.userActivity?.weekly || 89}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-800">Este Mes</p>
                  <p className="text-sm text-purple-600">Total de usuarios</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {data.userActivity?.monthly || 125}
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
                  {data.sessionStats?.totalSessions || 1847}
                </div>
                <p className="text-sm text-gray-600">Sesiones Totales</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {data.sessionStats?.activeSessions || 28}
                  </div>
                  <p className="text-xs text-gray-600">Activas Ahora</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 mb-1">
                    {data.sessionStats?.averageSessionDuration || '2h 15m'}
                  </div>
                  <p className="text-xs text-gray-600">Duración Promedio</p>
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