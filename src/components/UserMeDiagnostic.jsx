import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCurrentUser, useCurrentUserAsOperator } from '@/hooks/useCurrentUser';
import usersService from '@/services/usersService';

/**
 * Componente de diagnóstico para validar la integración del endpoint /users/me
 * 
 * Este componente muestra:
 * - Información del usuario desde el contexto (AuthContext)
 * - Información del usuario desde el endpoint /users/me
 * - Comparación entre ambos
 * - Estado del hook useCurrentUser
 */
export default function UserMeDiagnostic() {
  const { user } = useAuth();
  const { currentUser, loading: hookLoading, error: hookError } = useCurrentUser();
  const { userId, userFullName, userEmail, loading: operatorLoading } = useCurrentUserAsOperator();
  
  const [directApiData, setDirectApiData] = useState(null);
  const [directApiError, setDirectApiError] = useState(null);
  const [directApiLoading, setDirectApiLoading] = useState(false);

  // Función para probar la llamada directa a la API
  const testDirectApiCall = async () => {
    setDirectApiLoading(true);
    setDirectApiError(null);
    setDirectApiData(null);

    try {
      const data = await usersService.getMe();
      setDirectApiData(data);
      console.log('✅ Llamada directa a /users/me exitosa:', data);
    } catch (error) {
      setDirectApiError(error.message);
      console.error('❌ Error en llamada directa a /users/me:', error);
    } finally {
      setDirectApiLoading(false);
    }
  };

  useEffect(() => {
    console.log('='.repeat(60));
    console.log('🔍 UserMeDiagnostic - Información del usuario');
    console.log('='.repeat(60));
    console.log('📍 Desde AuthContext:', user);
    console.log('📍 Desde hook useCurrentUser:', currentUser);
    console.log('📍 Hook loading:', hookLoading);
    console.log('📍 Hook error:', hookError);
    console.log('='.repeat(60));
  }, [user, currentUser, hookLoading, hookError]);

  const isSuperAdmin = user?.roles?.some(role => 
    typeof role === 'string' 
      ? role.toLowerCase() === 'superadmin' 
      : role?.name?.toLowerCase() === 'superadmin'
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <span>🧪</span>
            <span>Diagnóstico de Usuario Actual (/users/me)</span>
          </CardTitle>
          <CardDescription>
            Validación de la integración del endpoint GET /users/me
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          
          {/* 1. Información desde AuthContext */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">
              📍 Usuario desde AuthContext
            </h3>
            {user ? (
              <div className="bg-gray-50 p-4 rounded space-y-1 font-mono text-sm">
                <div><strong>ID:</strong> {user.id || 'N/A'}</div>
                <div><strong>Name:</strong> {user.name || 'N/A'}</div>
                <div><strong>Lastname:</strong> {user.last || user.lastname || 'N/A'}</div>
                <div><strong>Email:</strong> {user.email || 'N/A'}</div>
                <div><strong>Roles:</strong> {JSON.stringify(user.roles)}</div>
                <div><strong>Es SuperAdmin:</strong> {isSuperAdmin ? '✅ Sí' : '❌ No'}</div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No hay usuario en el contexto</div>
            )}
          </div>

          {/* 2. Hook useCurrentUser */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">
              🎣 Hook: useCurrentUser()
            </h3>
            {hookLoading ? (
              <div className="text-blue-600">⏳ Cargando desde /users/me...</div>
            ) : hookError ? (
              <div className="bg-red-50 text-red-700 p-4 rounded">
                ❌ Error: {hookError}
              </div>
            ) : currentUser ? (
              <div className="bg-green-50 p-4 rounded space-y-1 font-mono text-sm">
                <div><strong>ID:</strong> {currentUser.id}</div>
                <div><strong>Name:</strong> {currentUser.name}</div>
                <div><strong>Lastname:</strong> {currentUser.lastname}</div>
                <div><strong>Email:</strong> {currentUser.email}</div>
                <div><strong>Roles:</strong> {JSON.stringify(currentUser.roles)}</div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No hay datos del usuario</div>
            )}
          </div>

          {/* 3. Hook useCurrentUserAsOperator */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">
              👤 Hook: useCurrentUserAsOperator()
            </h3>
            {operatorLoading ? (
              <div className="text-blue-600">⏳ Cargando...</div>
            ) : (
              <div className="bg-purple-50 p-4 rounded space-y-1 font-mono text-sm">
                <div><strong>User ID:</strong> {userId || 'N/A'}</div>
                <div><strong>Full Name:</strong> {userFullName || 'N/A'}</div>
                <div><strong>Email:</strong> {userEmail || 'N/A'}</div>
              </div>
            )}
          </div>

          {/* 4. Prueba directa de API */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">
              🔧 Llamada Directa a usersService.getMe()
            </h3>
            <Button 
              onClick={testDirectApiCall}
              disabled={directApiLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {directApiLoading ? '⏳ Llamando API...' : '🚀 Probar GET /users/me'}
            </Button>
            
            {directApiError && (
              <div className="bg-red-50 text-red-700 p-4 rounded mt-2">
                ❌ Error: {directApiError}
              </div>
            )}
            
            {directApiData && (
              <div className="bg-yellow-50 p-4 rounded mt-2 space-y-1 font-mono text-sm">
                <div className="font-semibold mb-2">✅ Respuesta exitosa:</div>
                <pre className="whitespace-pre-wrap overflow-auto max-h-64">
                  {JSON.stringify(directApiData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* 5. Comparación y validación */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">
              ✅ Validación de Consistencia
            </h3>
            <div className="space-y-2">
              {user && currentUser ? (
                <>
                  <ComparisonRow 
                    label="ID"
                    contextValue={user.id}
                    apiValue={currentUser.id}
                  />
                  <ComparisonRow 
                    label="Email"
                    contextValue={user.email}
                    apiValue={currentUser.email}
                  />
                  <ComparisonRow 
                    label="Name"
                    contextValue={user.name}
                    apiValue={currentUser.name}
                  />
                </>
              ) : (
                <div className="text-gray-500 italic">
                  Esperando datos completos para comparar...
                </div>
              )}
            </div>
          </div>

          {/* 6. Uso recomendado en formularios */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">
              💡 Uso en Formularios
            </h3>
            <div className="bg-blue-50 p-4 rounded space-y-2">
              <p className="font-medium">Para usuarios NO superadmin:</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li>Se debe usar <code className="bg-blue-200 px-1 rounded">currentUser.id</code> como encargado/inspector</li>
                <li>El campo debe estar <strong>deshabilitado</strong> (no pueden cambiarlo)</li>
                <li>Se precarga automáticamente al cargar el formulario</li>
              </ul>
              
              <p className="font-medium mt-3">Para superadmin:</p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                <li>Mostrar lista completa de operadores</li>
                <li>Permitir selección libre</li>
                <li>No preseleccionar automáticamente</li>
              </ul>

              {currentUser && !isSuperAdmin && (
                <div className="mt-4 p-3 bg-green-100 border-l-4 border-green-600 text-sm">
                  <strong>🎯 Tu ID para usar en boletas:</strong> {currentUser.id}
                </div>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Instrucciones de debugging */}
      <Card className="border-yellow-200">
        <CardHeader className="bg-yellow-50">
          <CardTitle>🐛 Debugging</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2 text-sm">
            <p><strong>Si hay errores:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Verifica que el backend tenga el endpoint <code className="bg-gray-200 px-1">GET /users/me</code></li>
              <li>Revisa que el token esté en <code className="bg-gray-200 px-1">localStorage.access_token</code></li>
              <li>Abre la consola del navegador (F12) para ver los logs detallados</li>
              <li>Verifica que el header <code className="bg-gray-200 px-1">Authorization: Bearer ...</code> esté correcto</li>
            </ol>
            
            <p className="mt-4"><strong>Verificación rápida en consola:</strong></p>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-auto">
              <div>{'// Verificar token'}</div>
              <div>{"console.log(localStorage.getItem('access_token'));"}</div>
              <div className="mt-2">{'// Llamar endpoint manualmente'}</div>
              <div>{"const response = await fetch('http://localhost:3000/users/me', {"}</div>
              <div>{"  headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }"}</div>
              <div>{'});'}</div>
              <div>{'console.log(await response.json());'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente auxiliar para comparar valores
function ComparisonRow({ label, contextValue, apiValue }) {
  const isEqual = contextValue === apiValue;
  
  return (
    <div className={`p-2 rounded ${isEqual ? 'bg-green-50' : 'bg-orange-50'}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}:</span>
        <span className="text-sm">
          {isEqual ? (
            <span className="text-green-600">✅ Coinciden</span>
          ) : (
            <span className="text-orange-600">⚠️ Diferentes</span>
          )}
        </span>
      </div>
      <div className="flex gap-4 mt-1 text-xs font-mono">
        <div>
          <span className="text-gray-500">Context:</span> {String(contextValue)}
        </div>
        <div>
          <span className="text-gray-500">API:</span> {String(apiValue)}
        </div>
      </div>
    </div>
  );
}
