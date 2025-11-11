// features/estadisticas/components/StatisticsDiagnostic.jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  Database,
  Wifi,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import statisticsService from '@/services/statisticsService';

const StatisticsDiagnostic = () => {
  const [diagnosticData, setDiagnosticData] = useState({
    backendConnection: null,
    endpoints: {},
    lastCheck: null,
    isChecking: false
  });

  const endpoints = [
    { 
      key: 'test', 
      name: 'Prueba de Conectividad', 
      method: 'testConnection',
      description: 'Verificar que el backend esté disponible'
    },
    { 
      key: 'overview', 
      name: 'Resumen General', 
      method: 'getOverviewStats',
      description: 'Estadísticas básicas del sistema'
    },
    { 
      key: 'dashboard', 
      name: 'Dashboard Completo', 
      method: 'getDashboardStats',
      description: 'Todas las estadísticas combinadas'
    },
    { 
      key: 'users', 
      name: 'Estadísticas de Usuarios', 
      method: 'getUsersStats',
      description: 'Métricas de usuarios del sistema'
    },
    { 
      key: 'machinery', 
      name: 'Estadísticas de Maquinaria', 
      method: 'getMachineryStats',
      description: 'Métricas de maquinaria y equipos'
    },
    { 
      key: 'operators', 
      name: 'Estadísticas de Operadores', 
      method: 'getOperatorsStats',
      description: 'Métricas de operadores'
    },
    { 
      key: 'reports', 
      name: 'Estadísticas de Reportes', 
      method: 'getReportsStats',
      description: 'Análisis de reportes del sistema'
    },
    { 
      key: 'audit', 
      name: 'Estadísticas de Auditoría', 
      method: 'getAuditStats',
      description: 'Métricas avanzadas de auditoría'
    },
    { 
      key: 'trends', 
      name: 'Tendencias del Sistema', 
      method: 'getTrendsStats',
      description: 'Análisis de tendencias y crecimiento'
    }
  ];

  const checkAllEndpoints = async () => {
    setDiagnosticData(prev => ({ ...prev, isChecking: true }));
    
    const results = {};
    let backendConnected = false;

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const result = await statisticsService[endpoint.method]();
        const responseTime = Date.now() - startTime;
        
        results[endpoint.key] = {
          status: result.success ? 'success' : 'error',
          success: result.success,
          error: result.error || null,
          responseTime,
          hasData: result.data ? Object.keys(result.data).length > 0 : false,
          timestamp: new Date().toISOString()
        };

        // Si al menos uno funciona, el backend está conectado
        if (result.success && endpoint.key === 'test') {
          backendConnected = true;
        }
      } catch (error) {
        results[endpoint.key] = {
          status: 'error',
          success: false,
          error: error.message,
          responseTime: null,
          hasData: false,
          timestamp: new Date().toISOString()
        };
      }
    }

    setDiagnosticData({
      backendConnection: backendConnected,
      endpoints: results,
      lastCheck: new Date().toISOString(),
      isChecking: false
    });
  };

  useEffect(() => {
    checkAllEndpoints();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const successCount = Object.values(diagnosticData.endpoints).filter(e => e.success).length;
  const totalCount = endpoints.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="h-6 w-6 text-blue-600" />
            Diagnóstico de Estadísticas
          </h2>
          <p className="text-gray-600 mt-1">
            Estado de conectividad y disponibilidad de endpoints
          </p>
        </div>
        <Button 
          onClick={checkAllEndpoints} 
          disabled={diagnosticData.isChecking}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${diagnosticData.isChecking ? 'animate-spin' : ''}`} />
          {diagnosticData.isChecking ? 'Verificando...' : 'Verificar Nuevamente'}
        </Button>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estado del Backend</p>
                <p className="text-2xl font-bold text-gray-900">
                  {diagnosticData.backendConnection === null ? '...' : 
                   diagnosticData.backendConnection ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
              {diagnosticData.backendConnection === null ? (
                <Database className="h-8 w-8 text-gray-400" />
              ) : diagnosticData.backendConnection ? (
                <Database className="h-8 w-8 text-green-600" />
              ) : (
                <Database className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Endpoints Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {successCount}/{totalCount}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Porcentaje de Éxito</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Verificación</p>
                <p className="text-sm font-medium text-gray-900">
                  {diagnosticData.lastCheck ? 
                    new Date(diagnosticData.lastCheck).toLocaleTimeString('es-CR') : 
                    'N/A'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalle de endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Detallado de Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endpoints.map((endpoint) => {
              const result = diagnosticData.endpoints[endpoint.key];
              
              return (
                <div key={endpoint.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result ? getStatusIcon(result.status) : <AlertCircle className="h-5 w-5 text-gray-400" />}
                    <div>
                      <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                      <p className="text-sm text-gray-600">{endpoint.description}</p>
                      {result?.error && (
                        <p className="text-xs text-red-600 mt-1">Error: {result.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {result?.responseTime && (
                      <span className="text-xs text-gray-500">
                        {result.responseTime}ms
                      </span>
                    )}
                    <Badge className={result ? getStatusColor(result.status) : 'bg-gray-100 text-gray-800'}>
                      {result ? 
                        (result.success ? 'Disponible' : 'Error') : 
                        'Pendiente'
                      }
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Configuración Actual</h4>
              <ul className="space-y-1 text-gray-600">
                <li>API Base URL: {import.meta.env.VITE_API_URL || 'No configurada'}</li>
                <li>Modo: {import.meta.env.MODE}</li>
                <li>Fallback: Datos simulados disponibles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recomendaciones</h4>
              <ul className="space-y-1 text-gray-600">
                {diagnosticData.backendConnection === false && (
                  <li>• Verificar que el backend esté ejecutándose</li>
                )}
                {successCount < totalCount && successCount > 0 && (
                  <li>• Algunos endpoints están en desarrollo</li>
                )}
                {successCount === 0 && (
                  <li>• Usando datos simulados para demostración</li>
                )}
                <li>• Los datos simulados están disponibles como fallback</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDiagnostic;