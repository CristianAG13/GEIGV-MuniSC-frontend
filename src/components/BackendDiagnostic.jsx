import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import apiClient from '@/config/api';

const BackendDiagnostic = () => {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoint = async (endpoint, method = 'GET', data = null) => {
    const startTime = Date.now();
    try {
      console.log(`🔍 Probando ${method} ${endpoint}`);
      
      let response;
      if (method === 'POST') {
        response = await apiClient.post(endpoint, data);
      } else {
        response = await apiClient.get(endpoint);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ ${endpoint} - Éxito en ${duration}ms:`, response);
      
      return {
        success: true,
        status: response.status,
        duration,
        data: response.data,
        message: `Éxito (${response.status}) - ${duration}ms`
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error(`❌ ${endpoint} - Error en ${duration}ms:`, error);
      
      let errorInfo = {
        success: false,
        duration,
        error: error.message,
        code: error.code,
        status: error.response?.status,
        message: `Error - ${duration}ms`
      };

      if (error.code === 'ECONNABORTED') {
        errorInfo.message = `Timeout después de ${duration}ms`;
        errorInfo.type = 'timeout';
      } else if (error.code === 'ECONNREFUSED') {
        errorInfo.message = `Conexión rechazada - ${duration}ms`;
        errorInfo.type = 'connection_refused';
      } else if (error.response) {
        errorInfo.message = `HTTP ${error.response.status} - ${duration}ms`;
        errorInfo.type = 'http_error';
        errorInfo.responseData = error.response.data;
      } else if (error.request) {
        errorInfo.message = `Sin respuesta - ${duration}ms`;
        errorInfo.type = 'no_response';
      }

      return errorInfo;
    }
  };

  const runDiagnostics = async () => {
    setIsLoading(true);
    setResults({});
    
    console.log('🚀 Iniciando diagnósticos del backend...');
    
    const tests = [
      {
        name: 'Health Check',
        endpoint: '/health',
        method: 'GET'
      },
      {
        name: 'Auth Status',
        endpoint: '/auth/status',
        method: 'GET'
      },
      {
        name: 'Forgot Password (Test Email)',
        endpoint: '/auth/forgot-password',
        method: 'POST',
        data: { email: 'test@example.com' }
      },
      {
        name: 'Users Endpoint (Puede dar 401)',
        endpoint: '/users',
        method: 'GET'
      },
      {
        name: 'Operators Endpoint (Puede dar 401)',
        endpoint: '/operators',
        method: 'GET'
      }
    ];

    const testResults = {};
    
    for (const test of tests) {
      console.log(`\n--- Probando: ${test.name} ---`);
      testResults[test.name] = await testEndpoint(test.endpoint, test.method, test.data);
      
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Resultados finales:', testResults);
    setResults(testResults);
    setIsLoading(false);
  };

  const getStatusColor = (result) => {
    if (!result) return 'bg-gray-100';
    if (result.success) return 'bg-green-100 text-green-800';
    if (result.type === 'timeout') return 'bg-red-100 text-red-800';
    if (result.type === 'connection_refused') return 'bg-red-100 text-red-800';
    if (result.status === 401 || result.status === 403) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Diagnóstico del Backend</h2>
      <p className="text-gray-600 mb-6">
        Esta herramienta prueba la conectividad y disponibilidad de los endpoints del backend.
      </p>
      
      <Button 
        onClick={runDiagnostics} 
        disabled={isLoading}
        className="mb-6"
      >
        {isLoading ? 'Ejecutando diagnósticos...' : 'Ejecutar Diagnósticos'}
      </Button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resultados:</h3>
          
          {Object.entries(results).map(([testName, result]) => (
            <Card key={testName} className={`p-4 ${getStatusColor(result)}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{testName}</h4>
                  <p className="text-sm mt-1">{result.message}</p>
                  
                  {result.error && (
                    <div className="mt-2 text-sm">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.code && (
                    <div className="text-sm">
                      <strong>Código:</strong> {result.code}
                    </div>
                  )}
                  
                  {result.responseData && (
                    <div className="mt-2 text-sm">
                      <strong>Respuesta:</strong> {JSON.stringify(result.responseData, null, 2)}
                    </div>
                  )}
                </div>
                
                <div className="text-right text-sm">
                  {result.status && <div>HTTP {result.status}</div>}
                  <div>{result.duration}ms</div>
                </div>
              </div>
            </Card>
          ))}
          
          <Card className="p-4 bg-blue-50">
            <h4 className="font-medium text-blue-800 mb-2">Interpretación de Resultados:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><strong>Verde:</strong> Endpoint funcionando correctamente</li>
              <li><strong>Amarillo:</strong> Endpoint disponible pero requiere autenticación (esperado)</li>
              <li><strong>Rojo (Timeout):</strong> El servidor tarda demasiado en responder</li>
              <li><strong>Rojo (Connection Refused):</strong> El servidor no está disponible</li>
              <li><strong>Rojo (HTTP Error):</strong> Error específico del servidor</li>
            </ul>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default BackendDiagnostic;