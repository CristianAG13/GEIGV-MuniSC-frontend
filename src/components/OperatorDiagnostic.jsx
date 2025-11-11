import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import operatorsService from '@/services/operatorsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Componente de diagnóstico para problemas de operadores
 */
const OperatorDiagnostic = () => {
  const { user } = useAuth();
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostic = async () => {
      try {
        const operators = await operatorsService.getAllOperators();
        const userRoles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
        const isOperario = userRoles.some(r => String(r).toLowerCase() === 'operario');
        const myOperator = operators.find(op => op.userId === user?.id);

        setDiagnosticData({
          user: user,
          userRoles: userRoles,
          isOperario: isOperario,
          operators: operators,
          myOperator: myOperator,
          totalOperators: operators?.length || 0
        });
      } catch (error) {
        console.error('Error en diagnóstico:', error);
        setDiagnosticData({
          error: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      runDiagnostic();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div>Cargando diagnóstico...</div>;

  if (!user) return <div>No hay usuario autenticado</div>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Diagnóstico de Operador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Información del Usuario */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">👤 Usuario Actual</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Nombre:</strong> {user?.name} {user?.lastname}</p>
              <p><strong>Roles Raw:</strong> {JSON.stringify(user?.roles)}</p>
            </div>
          </div>

          {/* Análisis de Roles */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">🎭 Análisis de Roles</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Roles Procesados:</strong> {JSON.stringify(diagnosticData?.userRoles)}</p>
              <p><strong>Es Operario:</strong> {diagnosticData?.isOperario ? '✅ SÍ' : '❌ NO'}</p>
              <p><strong>Tipo de roles:</strong> {Array.isArray(user?.roles) ? 'Array' : 'String/Other'}</p>
            </div>
          </div>

          {/* Información de Operadores */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">👷 Operadores Disponibles</h3>
            <div className="bg-gray-50 p-3 rounded">
              <p><strong>Total Operadores:</strong> {diagnosticData?.totalOperators}</p>
              {diagnosticData?.error && (
                <p className="text-red-600"><strong>Error:</strong> {diagnosticData.error}</p>
              )}
            </div>
          </div>

          {/* Mi Operador */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">🔗 Mi Operador Asociado</h3>
            <div className="bg-gray-50 p-3 rounded">
              {diagnosticData?.myOperator ? (
                <div>
                  <p className="text-green-600"><strong>✅ ENCONTRADO</strong></p>
                  <p><strong>ID:</strong> {diagnosticData.myOperator.id}</p>
                  <p><strong>Nombre:</strong> {diagnosticData.myOperator.name} {diagnosticData.myOperator.last}</p>
                  <p><strong>UserID:</strong> {diagnosticData.myOperator.userId}</p>
                </div>
              ) : (
                <p className="text-red-600"><strong>❌ NO ENCONTRADO</strong></p>
              )}
            </div>
          </div>
        </div>

        {/* Lista de todos los operadores */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">📋 Lista Completa de Operadores</h3>
          <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
            {diagnosticData?.operators?.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-1">ID</th>
                    <th className="text-left p-1">Nombre</th>
                    <th className="text-left p-1">UserID</th>
                    <th className="text-left p-1">¿Es Mío?</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosticData.operators.map(op => (
                    <tr key={op.id} className={op.userId === user?.id ? 'bg-green-100' : ''}>
                      <td className="p-1">{op.id}</td>
                      <td className="p-1">{op.name} {op.last}</td>
                      <td className="p-1">{op.userId || 'N/A'}</td>
                      <td className="p-1">{op.userId === user?.id ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay operadores disponibles</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperatorDiagnostic;