// features/estadisticas/components/TrendsStats.jsx
import React from 'react';
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Activity,
  Users,
  Truck,
  FileText,
  Clock,
  Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TrendsStats = ({ data, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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

  // Datos simulados para análisis de tendencias
  const trendsData = {
    overallTrend: {
      direction: 'up',
      percentage: 12.5,
      description: 'Crecimiento general del sistema'
    },
    userGrowthTrend: {
      last6Months: [
        { month: 'Jul', users: 95, growth: 5.2 },
        { month: 'Ago', users: 102, growth: 7.4 },
        { month: 'Sep', users: 108, growth: 5.9 },
        { month: 'Oct', users: 115, growth: 6.5 },
        { month: 'Nov', users: 121, growth: 5.2 },
        { month: 'Dic', users: 125, growth: 3.3 }
      ],
      projected: 135,
      trend: 'stable_growth'
    },
    machineryUtilization: {
      trend: [
        { month: 'Jul', utilization: 78.2, efficiency: 89.1 },
        { month: 'Ago', utilization: 80.5, efficiency: 91.2 },
        { month: 'Sep', utilization: 82.1, efficiency: 90.8 },
        { month: 'Oct', utilization: 84.4, efficiency: 92.3 },
        { month: 'Nov', utilization: 83.9, efficiency: 91.7 },
        { month: 'Dic', utilization: 84.4, efficiency: 91.2 }
      ],
      peakMonth: 'Oct',
      averageGrowth: 2.1
    },
    reportsVolume: {
      trend: [
        { month: 'Jul', completed: 98, pending: 12, efficiency: 89.1 },
        { month: 'Ago', completed: 112, pending: 15, efficiency: 88.2 },
        { month: 'Sep', completed: 125, pending: 18, efficiency: 87.4 },
        { month: 'Oct', completed: 134, pending: 21, efficiency: 86.5 },
        { month: 'Nov', completed: 145, pending: 16, efficiency: 90.1 },
        { month: 'Dic', completed: 156, pending: 14, efficiency: 91.8 }
      ],
      seasonalPatterns: {
        highSeason: ['Nov', 'Dic', 'Ene'],
        lowSeason: ['Jun', 'Jul', 'Ago']
      }
    },
    operatorPerformance: {
      efficiencyTrend: [
        { month: 'Jul', efficiency: 87.5, satisfaction: 4.1 },
        { month: 'Ago', efficiency: 88.9, satisfaction: 4.2 },
        { month: 'Sep', efficiency: 89.8, satisfaction: 4.3 },
        { month: 'Oct', efficiency: 91.2, satisfaction: 4.4 },
        { month: 'Nov', efficiency: 90.8, satisfaction: 4.3 },
        { month: 'Dic', efficiency: 91.2, satisfaction: 4.5 }
      ],
      trainingImpact: 5.7, // % mejora después de capacitación
      retentionRate: 94.2
    },
    seasonalAnalysis: {
      busyPeriods: [
        { period: 'Ene-Mar', activity: 'high', description: 'Inicio de año - alta actividad de mantenimiento' },
        { period: 'Abr-Jun', activity: 'medium', description: 'Período medio - actividad estable' },
        { period: 'Jul-Sep', activity: 'low', description: 'Temporada baja - menos proyectos' },
        { period: 'Oct-Dic', activity: 'high', description: 'Fin de año - cierre de proyectos' }
      ]
    },
    predictiveAnalysis: {
      nextMonth: {
        expectedUsers: 130,
        expectedReports: 165,
        predictedUtilization: 85.2,
        confidenceLevel: 87.3
      },
      maintenanceSchedule: {
        critical: 3,
        planned: 12,
        overdue: 1
      },
      resourceNeeds: {
        additionalOperators: 2,
        machineryUpgrade: 1,
        trainingRequired: 8
      }
    },
    keyPerformanceIndicators: {
      systemAvailability: { current: 99.2, target: 99.5, trend: 'up' },
      userSatisfaction: { current: 4.3, target: 4.5, trend: 'up' },
      operationalEfficiency: { current: 91.2, target: 92.0, trend: 'stable' },
      costOptimization: { current: 85.7, target: 88.0, trend: 'up' }
    }
  };

  if (!data) {
    data = trendsData;
  }

  const getTrendIcon = (direction) => {
    return direction === 'up' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (direction) => {
    return direction === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getActivityColor = (activity) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[activity] || 'bg-gray-100 text-gray-800';
  };

  const getKPIStatus = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 98) return { status: 'excellent', color: 'text-green-600' };
    if (percentage >= 90) return { status: 'good', color: 'text-blue-600' };
    if (percentage >= 80) return { status: 'fair', color: 'text-yellow-600' };
    return { status: 'poor', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      {/* Header de Tendencias */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Análisis de Tendencias</h2>
            <p className="text-indigo-100">Métricas de tendencias y análisis temporal del sistema</p>
          </div>
          <div className="text-right flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            <div>
              <div className="text-3xl font-bold">{data.overallTrend.percentage}%</div>
              <div className="text-indigo-200 text-sm">Crecimiento General</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicadores Clave de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(data.keyPerformanceIndicators).map(([kpi, values]) => {
              const status = getKPIStatus(values.current, values.target);
              const TrendIcon = getTrendIcon(values.trend === 'up' ? 'up' : values.trend === 'down' ? 'down' : 'up');
              const kpiLabels = {
                systemAvailability: 'Disponibilidad del Sistema',
                userSatisfaction: 'Satisfacción del Usuario',
                operationalEfficiency: 'Eficiencia Operacional',
                costOptimization: 'Optimización de Costos'
              };
              
              return (
                <div key={kpi} className="text-center p-4 border rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    {kpiLabels[kpi] || kpi}
                  </h4>
                  <div className={`text-2xl font-bold mb-1 ${status.color}`}>
                    {values.current}%
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <span>Meta: {values.target}%</span>
                    <TrendIcon className={`h-3 w-3 ${getTrendColor(values.trend === 'up' ? 'up' : 'down')}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tendencias de Crecimiento de Usuarios y Utilización de Maquinaria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crecimiento de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tendencia de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-800">Proyección Próximo Mes</p>
                  <p className="text-sm text-blue-600">Usuarios esperados</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {data.predictiveAnalysis.nextMonth.expectedUsers}
                </span>
              </div>
              
              <div className="space-y-2">
                {data.userGrowthTrend.last6Months.slice(-3).map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm w-8">{month.month}</span>
                      <div className="text-xs text-gray-600">
                        {month.users} usuarios
                      </div>
                    </div>
                    <div className={`text-sm flex items-center gap-1 ${getTrendColor('up')}`}>
                      <TrendingUp className="h-3 w-3" />
                      +{month.growth}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilización de Maquinaria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Utilización de Maquinaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">Mes Pico</p>
                  <p className="text-sm text-green-600">{data.machineryUtilization.peakMonth}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    {data.machineryUtilization.trend.find(t => t.month === data.machineryUtilization.peakMonth)?.utilization}%
                  </span>
                  <p className="text-xs text-green-600">utilización</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {data.machineryUtilization.trend.slice(-3).map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm w-8">{month.month}</span>
                      <div className="text-xs text-gray-600">
                        {month.utilization}% utilización
                      </div>
                    </div>
                    <div className="text-sm text-purple-600">
                      {month.efficiency}% eficiencia
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis Estacional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Análisis Estacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {data.seasonalAnalysis.busyPeriods.map((period, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{period.period}</h4>
                  <Badge className={getActivityColor(period.activity)}>
                    {period.activity}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{period.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volumen de Reportes y Rendimiento de Operadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volumen de Reportes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tendencia de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-800">Proyección Próximo Mes</p>
                  <p className="text-sm text-purple-600">Reportes esperados</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {data.predictiveAnalysis.nextMonth.expectedReports}
                </span>
              </div>
              
              <div className="space-y-2">
                {data.reportsVolume.trend.slice(-3).map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm w-8">{month.month}</span>
                      <div className="text-xs text-gray-600">
                        {month.completed} completados
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600">{month.efficiency}%</div>
                      <div className="text-xs text-gray-500">{month.pending} pendientes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rendimiento de Operadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Rendimiento de Operadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-orange-800">Impacto Capacitación</p>
                  <p className="text-sm text-orange-600">Mejora en eficiencia</p>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  +{data.operatorPerformance.trainingImpact}%
                </span>
              </div>
              
              <div className="space-y-2">
                {data.operatorPerformance.efficiencyTrend.slice(-3).map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm w-8">{month.month}</span>
                      <div className="text-xs text-gray-600">
                        {month.efficiency}% eficiencia
                      </div>
                    </div>
                    <div className="text-sm text-yellow-600">
                      ⭐ {month.satisfaction}/5
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Retención</span>
                <span className="text-sm font-medium text-green-600">
                  {data.operatorPerformance.retentionRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis Predictivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análisis Predictivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mantenimiento Programado */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Mantenimiento Programado</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-800">Crítico</span>
                  <Badge className="bg-red-100 text-red-800">
                    {data.predictiveAnalysis.maintenanceSchedule.critical}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm text-blue-800">Planificado</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {data.predictiveAnalysis.maintenanceSchedule.planned}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-yellow-800">Atrasado</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {data.predictiveAnalysis.maintenanceSchedule.overdue}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Necesidades de Recursos */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Necesidades de Recursos</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm text-gray-600">Operadores Adicionales</span>
                  <span className="font-medium">{data.predictiveAnalysis.resourceNeeds.additionalOperators}</span>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm text-gray-600">Actualización Maquinaria</span>
                  <span className="font-medium">{data.predictiveAnalysis.resourceNeeds.machineryUpgrade}</span>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm text-gray-600">Capacitación Requerida</span>
                  <span className="font-medium">{data.predictiveAnalysis.resourceNeeds.trainingRequired}</span>
                </div>
              </div>
            </div>

            {/* Confiabilidad de Predicciones */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Confiabilidad</h4>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {data.predictiveAnalysis.nextMonth.confidenceLevel}%
                </div>
                <p className="text-sm text-gray-600">Nivel de Confianza</p>
                <p className="text-xs text-gray-500 mt-2">
                  Basado en datos históricos y patrones identificados
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendsStats;