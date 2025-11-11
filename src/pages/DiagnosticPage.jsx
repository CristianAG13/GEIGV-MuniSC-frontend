import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatisticsDiagnostic from '@/components/StatisticsDiagnostic';
import BackendDiagnostic from '@/components/BackendDiagnostic';

const DiagnosticPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-2">🔧 Página de Diagnósticos</h1>
            <p className="text-blue-100">
              Herramientas para diagnosticar problemas de conectividad con el backend
            </p>
          </CardContent>
        </Card>

        {/* Diagnóstico de Estadísticas */}
        <StatisticsDiagnostic />

        {/* Diagnóstico General del Backend */}
        <BackendDiagnostic />
      </div>
    </div>
  );
};

export default DiagnosticPage;