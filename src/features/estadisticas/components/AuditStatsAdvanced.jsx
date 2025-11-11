// features/estadisticas/components/AuditStatsAdvanced.jsx
import React from 'react';
import { 
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  Users,
  Lock,
  Database,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AuditStatsAdvanced = ({ data, isLoading, onRefresh }) => {
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

  // Datos simulados para estadísticas avanzadas de auditoría
  const auditData = {
    totalAuditEvents: 2847,
    criticalEvents: 23,
    securityViolations: 8,
    successfulLogins: 1456,
    failedLogins: 67,
    dataIntegrityChecks: 245,
    systemHealthScore: 96.8,
    auditByModule: {
      usuarios: 687,
      maquinaria: 542,
      operadores: 398,
      reportes: 423,
      auditoria: 267,
      sistema: 530
    },
    auditByAction: {
      CREATE: 567,
      UPDATE: 892,
      DELETE: 123,
      LOGIN: 456,
      LOGOUT: 389,
      VIEW: 420
    },
    securityEvents: {
      unauthorized_access: 12,
      permission_denied: 23,
      suspicious_activity: 8,
      password_failures: 15
    },
    complianceMetrics: {
      dataRetention: 98.5,
      accessControl: 97.2,
      auditTrail: 99.1,
      encryption: 96.8
    },
    topAuditedUsers: [
      { id: 1, name: 'Juan Pérez', events: 245, riskLevel: 'low', lastActivity: '2 min ago' },
      { id: 2, name: 'María González', events: 198, riskLevel: 'low', lastActivity: '15 min ago' },
      { id: 3, name: 'Carlos López', events: 167, riskLevel: 'medium', lastActivity: '1 hour ago' },
      { id: 4, name: 'Ana Martínez', events: 145, riskLevel: 'low', lastActivity: '2 hours ago' },
      { id: 5, name: 'Luis Rodriguez', events: 134, riskLevel: 'high', lastActivity: '3 hours ago' }
    ],
    recentSecurityEvents: [
      { id: 1, type: 'unauthorized_access', user: 'Unknown', details: 'Intento de acceso con credenciales inválidas', severity: 'high', timestamp: '2024-01-10 14:30' },
      { id: 2, type: 'permission_denied', user: 'Carlos López', details: 'Intento de acceso a módulo sin permisos', severity: 'medium', timestamp: '2024-01-10 13:45' },
      { id: 3, type: 'suspicious_activity', user: 'Ana Martínez', details: 'Múltiples intentos de acceso fallidos', severity: 'medium', timestamp: '2024-01-10 12:20' }
    ],
    systemMetrics: {
      databaseConnections: 45,
      activeSessions: 28,
      averageResponseTime: 145, // ms
      errorRate: 0.02 // %
    },
    auditRetention: {
      last30Days: 2847,
      last90Days: 8234,
      lastYear: 32456,
      archived: 125789
    }
  };

  if (!data) {
    data = auditData;
  }

  const riskLevelConfig = {
    low: { label: 'Bajo', color: 'bg-green-100 text-green-800' },
    medium: { label: 'Medio', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'Alto', color: 'bg-red-100 text-red-800' }
  };

  const severityConfig = {
    low: { label: 'Baja', color: 'bg-blue-100 text-blue-800' },
    medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'Alta', color: 'bg-red-100 text-red-800' }
  };

  const actionConfig = {
    CREATE: { label: 'Creación', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    UPDATE: { label: 'Actualización', color: 'bg-blue-100 text-blue-800', icon: Activity },
    DELETE: { label: 'Eliminación', color: 'bg-red-100 text-red-800', icon: XCircle },
    LOGIN: { label: 'Inicio Sesión', color: 'bg-purple-100 text-purple-800', icon: Lock },
    LOGOUT: { label: 'Cierre Sesión', color: 'bg-gray-100 text-gray-800', icon: Lock },
    VIEW: { label: 'Visualización', color: 'bg-indigo-100 text-indigo-800', icon: Eye }
  };

  return (
    <div className="space-y-6">
      {/* Header de Auditoría Avanzada */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Auditoría Avanzada</h2>
            <p className="text-red-100">Métricas avanzadas de auditoría y seguridad</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data.systemHealthScore}%</div>
            <div className="text-red-200 text-sm">Salud del Sistema</div>
          </div>
        </div>
      </div>

      {/* Métricas de Seguridad Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Eventos Críticos</p>
                <p className="text-2xl font-bold text-red-600">{data.criticalEvents}</p>
                <p className="text-xs text-red-600 mt-1">Requieren atención inmediata</p>
              </div>
              <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Violaciones de Seguridad</p>
                <p className="text-2xl font-bold text-orange-600">{data.securityViolations}</p>
                <p className="text-xs text-gray-500 mt-1">Este mes</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Logins Exitosos</p>
                <p className="text-2xl font-bold text-green-600">{data.successfulLogins}</p>
                <p className="text-xs text-green-600 mt-1">
                  vs {data.failedLogins} fallidos
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
                <p className="text-sm font-medium text-gray-600 mb-1">Eventos Totales</p>
                <p className="text-2xl font-bold text-blue-600">{data.totalAuditEvents}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Tendencia estable
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auditoría por Módulo y Acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auditoría por Módulo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Auditoría por Módulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.auditByModule).map(([module, count]) => {
                const percentage = ((count / data.totalAuditEvents) * 100).toFixed(1);
                
                return (
                  <div key={module} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm capitalize">{module}</p>
                      <p className="text-xs text-gray-500">{percentage}% del total</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                      <p className="text-xs text-gray-500">eventos</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por Acciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribución por Acciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.auditByAction).map(([action, count]) => {
                const config = actionConfig[action] || {
                  label: action,
                  color: 'bg-gray-100 text-gray-800',
                  icon: Activity
                };
                const IconComponent = config.icon;
                const percentage = ((count / data.totalAuditEvents) * 100).toFixed(1);
                
                return (
                  <div key={action} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usuarios Más Auditados y Eventos de Seguridad Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios Más Auditados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuarios Más Auditados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topAuditedUsers?.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={riskLevelConfig[user.riskLevel]?.color || 'bg-gray-100 text-gray-800'} variant="outline">
                          Riesgo {riskLevelConfig[user.riskLevel]?.label || user.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.events} eventos</p>
                    <p className="text-xs text-gray-500">Últ: {user.lastActivity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Eventos de Seguridad Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Eventos de Seguridad Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentSecurityEvents?.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.details}</p>
                      <p className="text-xs text-gray-600 mt-1">Usuario: {event.user}</p>
                    </div>
                    <Badge className={severityConfig[event.severity]?.color || 'bg-gray-100 text-gray-800'}>
                      {severityConfig[event.severity]?.label || event.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {event.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Cumplimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Métricas de Cumplimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data.complianceMetrics?.dataRetention}%
              </div>
              <p className="text-sm text-gray-600">Retención de Datos</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data.complianceMetrics?.accessControl}%
              </div>
              <p className="text-sm text-gray-600">Control de Acceso</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {data.complianceMetrics?.auditTrail}%
              </div>
              <p className="text-sm text-gray-600">Rastro de Auditoría</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {data.complianceMetrics?.encryption}%
              </div>
              <p className="text-sm text-gray-600">Encriptación</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas del Sistema y Retención */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Métricas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Conexiones BD</p>
                  <p className="text-sm text-blue-600">Activas</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {data.systemMetrics?.databaseConnections}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Sesiones Activas</p>
                  <p className="text-sm text-green-600">Usuarios conectados</p>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {data.systemMetrics?.activeSessions}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-800">Tiempo Respuesta</p>
                  <p className="text-sm text-yellow-600">Promedio (ms)</p>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {data.systemMetrics?.averageResponseTime}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-800">Tasa de Errores</p>
                  <p className="text-sm text-red-600">Porcentaje</p>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {data.systemMetrics?.errorRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Retención de Auditorías */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Retención de Auditorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {data.auditRetention?.last30Days?.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Últimos 30 días</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {data.auditRetention?.last90Days?.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Últimos 90 días</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {data.auditRetention?.lastYear?.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Último año</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {data.auditRetention?.archived?.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Archivados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditStatsAdvanced;