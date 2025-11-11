import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import statisticsService from '@/services/statisticsService';
import apiClient from '@/config/api';

const StatisticsDiagnostic = () => {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const testStatisticsEndpoint = async (name, serviceMethod) => {
    const startTime = Date.now();
    try {
      console.log(`🔍 Probando ${name}...`);
      
      const result = await serviceMethod();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ ${name} - Éxito en ${duration}ms:`, result);
      
      return {
        success: result.success,
        duration,
        data: result.data,
        error: result.error,
        message: result.success ? `Éxito - ${duration}ms` : `Error: ${result.error} - ${duration}ms`
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error(`❌ ${name} - Error en ${duration}ms:`, error);
      
      return {
        success: false,
        duration,
        error: error.message,
        message: `Error de red - ${duration}ms`
      };
    }
  };

  const testDirectEndpoint = async (name, endpoint) => {
    const startTime = Date.now();
    try {
      console.log(`🔍 Probando directo ${endpoint}...`);
      
      const response = await apiClient.get(endpoint);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ ${endpoint} - Éxito en ${duration}ms:`, response);
      
      return {
        success: true,
        status: response.status,
        duration,
        data: response.data,
        message: `Éxito HTTP ${response.status} - ${duration}ms`
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error(`❌ ${endpoint} - Error en ${duration}ms:`, error);
      
      return {
        success: false,
        duration,
        error: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        message: `Error HTTP ${error.response?.status || 'RED'} - ${duration}ms`
      };
    }
  };

  const runStatisticsDiagnostics = async () => {
    setIsLoading(true);
    setResults({});
    
    console.log('📊 Iniciando diagnósticos de estadísticas...');
    
    const tests = [
      // Tests usando el servicio
      {
        type: 'service',
        name: 'Dashboard Stats (Servicio)',
        method: () => statisticsService.getDashboardStats()
      },
      {
        type: 'service', 
        name: 'Overview Stats (Servicio)',
        method: () => statisticsService.getOverviewStats()
      },
      {
        type: 'service',
        name: 'Users Stats (Servicio)', 
        method: () => statisticsService.getUsersStats()
      },
      {
        type: 'service',
        name: 'Machinery Stats (Servicio)',
        method: () => statisticsService.getMachineryStats()
      },
      {
        type: 'service',
        name: 'Operators Stats (Servicio)',
        method: () => statisticsService.getOperatorsStats()
      },
      {
        type: 'service',
        name: 'Reports Stats (Servicio)',
        method: () => statisticsService.getReportsStats()
      },
      
      // Tests directos
      {
        type: 'direct',
        name: 'Dashboard Stats (Directo)',
        endpoint: '/statistics/dashboard'
      },
      {
        type: 'direct',
        name: 'Overview Stats (Directo)',
        endpoint: '/statistics/overview'
      },
      {
        type: 'direct',
        name: 'Users Stats (Directo)',
        endpoint: '/statistics/users'
      },
      {
        type: 'direct',
        name: 'Machinery Stats (Directo)',
        endpoint: '/statistics/machinery'
      }
    ];

    const testResults = {};
    
    for (const test of tests) {
      console.log(`\n--- Probando: ${test.name} ---`);
      
      if (test.type === 'service') {
        testResults[test.name] = await testStatisticsEndpoint(test.name, test.method);
      } else {
        testResults[test.name] = await testDirectEndpoint(test.name, test.endpoint);
      }
      
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Test de datos simulados
    console.log(`\n--- Probando: Datos Simulados ---`);
    const startTime = Date.now();
    const simulatedResult = statisticsService.getSimulatedDashboardStats();
    const endTime = Date.now();
    
    testResults['Datos Simulados'] = {
      success: true,
      duration: endTime - startTime,
      data: simulatedResult.data,
      message: `Datos simulados generados - ${endTime - startTime}ms`
    };
    
    console.log('\n📊 Resultados finales de estadísticas:', testResults);
    setResults(testResults);
    setIsLoading(false);
  };

  const getStatusColor = (result) => {
    if (!result) return 'bg-gray-100';
    if (result.success) return 'bg-green-100 text-green-800';
    if (result.status === 401 || result.status === 403) return 'bg-yellow-100 text-yellow-800';
    if (result.status === 500) return 'bg-red-100 text-red-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getStatusBadge = (result) => {
    if (!result) return <Badge variant="secondary">Sin probar</Badge>;
    if (result.success) return <Badge variant="default" className="bg-green-600">✓ Éxito</Badge>;
    if (result.status === 401) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">401 Auth</Badge>;
    if (result.status === 403) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">403 Forbidden</Badge>;
    if (result.status === 500) return <Badge variant="destructive">500 Server</Badge>;
    return <Badge variant="destructive">Error</Badge>;
  };

  return (
    <Card className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">📊 Diagnóstico de Estadísticas</h2>
          <p className="text-gray-600 mt-2">
            Prueba la conectividad de todos los endpoints de estadísticas del sistema.
          </p>
        </div>
        
        <Button 
          onClick={runStatisticsDiagnostics} 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Ejecutando...' : 'Ejecutar Diagnósticos'}
        </Button>
      </div>

      {/* Información de configuración */}
      <Card className="p-4 mb-6 bg-blue-50">
        <h3 className="font-semibold text-blue-800 mb-2">Configuración Actual:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <strong>API Base URL:</strong> {import.meta.env.VITE_API_URL || 'No configurado'}
          </div>
          <div>
            <strong>Token presente:</strong> {localStorage.getItem('access_token') ? 'Sí' : 'No'}
          </div>
        </div>
      </Card>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resultados de Pruebas:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results).map(([testName, result]) => (
              <Card key={testName} className={`p-4 ${getStatusColor(result)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">{testName}</h4>
                      {getStatusBadge(result)}
                    </div>
                    
                    <p className="text-xs mb-2">{result.message}</p>
                    
                    {result.error && (
                      <div className="text-xs">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                    
                    {result.responseData && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer">Ver respuesta del servidor</summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                          {JSON.stringify(result.responseData, null, 2)}
                        </pre>
                      </details>
                    )}
                    
                    {result.success && result.data && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer">Ver datos recibidos</summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto max-h-32">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  
                  <div className="text-right text-xs ml-2">
                    {result.status && <div>HTTP {result.status}</div>}
                    <div>{result.duration}ms</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Card className="p-4 bg-blue-50">
            <h4 className="font-medium text-blue-800 mb-2">Interpretación de Resultados:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <ul className="space-y-1">
                  <li><strong className="text-green-700">✓ Éxito:</strong> Endpoint funcionando correctamente</li>
                  <li><strong className="text-yellow-700">401 Auth:</strong> Requiere autenticación (normal si no logueado)</li>
                  <li><strong className="text-yellow-700">403 Forbidden:</strong> Sin permisos (verificar rol de usuario)</li>
                </ul>
              </div>
              <div>
                <ul className="space-y-1">
                  <li><strong className="text-red-700">500 Server:</strong> Error interno del servidor backend</li>
                  <li><strong className="text-orange-700">Error de Red:</strong> Problema de conectividad</li>
                  <li><strong className="text-blue-700">Datos Simulados:</strong> Fallback local (siempre funciona)</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default StatisticsDiagnostic;