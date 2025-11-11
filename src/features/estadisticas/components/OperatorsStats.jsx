// features/estadisticas/components/OperatorsStats.jsx
import React from 'react';
import { 
  HardHat,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const OperatorsStats = ({ data, isLoading, onRefresh }) => {
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

  // Datos simulados para estadísticas de operadores
  const operatorsData = {
    totalOperators: 67,
    activeOperators: 52,
    availableOperators: 45,
    onBreakOperators: 7,
    averageEfficiency: 91.2,
    totalHoursWorked: 2847,
    completedTasks: 1589,
    averageTaskTime: 45, // minutos
    operatorsByShift: {
      matutino: 22,
      vespertino: 20,
      nocturno: 10
    },
    operatorsByExperience: {
      junior: 18,
      intermedio: 35,
      senior: 14
    },
    topPerformers: [
      { id: 1, name: 'Juan Pérez', efficiency: 98.2, tasksCompleted: 45, hoursWorked: 168, experience: 'senior' },
      { id: 2, name: 'María González', efficiency: 96.8, tasksCompleted: 42, hoursWorked: 165, experience: 'senior' },
      { id: 3, name: 'Carlos López', efficiency: 95.5, tasksCompleted: 38, hoursWorked: 160, experience: 'intermedio' },
      { id: 4, name: 'Ana Martínez', efficiency: 94.1, tasksCompleted: 35, hoursWorked: 155, experience: 'senior' },
      { id: 5, name: 'Luis Rodriguez', efficiency: 93.7, tasksCompleted: 33, hoursWorked: 152, experience: 'intermedio' }
    ],
    performanceMetrics: {
      onTimeCompletion: 94.5,
      safetyCompliance: 98.9,
      qualityScore: 92.3,
      attendanceRate: 96.7
    },
    certifications: {
      operador_basico: 67,
      operador_avanzado: 28,
      supervisor: 12,
      instructor: 4
    },
    weeklyActivity: [
      { day: 'Lun', tasks: 45, hours: 352 },
      { day: 'Mar', tasks: 42, hours: 338 },
      { day: 'Mié', tasks: 47, hours: 361 },
      { day: 'Jue', tasks: 44, hours: 348 },
      { day: 'Vie', tasks: 41, hours: 332 },
      { day: 'Sáb', tasks: 28, hours: 215 },
      { day: 'Dom', tasks: 15, hours: 118 }
    ]
  };

  if (!data) {
    data = operatorsData;
  }

  const experienceConfig = {
    junior: {
      label: 'Junior',
      color: 'bg-yellow-100 text-yellow-800',
      description: '< 2 años'
    },
    intermedio: {
      label: 'Intermedio',
      color: 'bg-blue-100 text-blue-800',
      description: '2-5 años'
    },
    senior: {
      label: 'Senior',
      color: 'bg-green-100 text-green-800',
      description: '> 5 años'
    }
  };

  const shiftConfig = {
    matutino: { label: 'Matutino', time: '06:00-14:00', color: 'bg-yellow-100 text-yellow-800' },
    vespertino: { label: 'Vespertino', time: '14:00-22:00', color: 'bg-blue-100 text-blue-800' },
    nocturno: { label: 'Nocturno', time: '22:00-06:00', color: 'bg-purple-100 text-purple-800' }
  };

  return (
    <div className="space-y-6">
      {/* Header de Operadores */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Estadísticas de Operadores</h2>
            <p className="text-purple-100">Métricas de operadores y rendimiento</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data.totalOperators}</div>
            <div className="text-purple-200 text-sm">Operadores Totales</div>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Operadores Activos</p>
                <p className="text-2xl font-bold text-green-600">{data.activeOperators}</p>
                <p className="text-xs text-green-600 mt-1">
                  {((data.activeOperators / data.totalOperators) * 100).toFixed(1)}% del total
                </p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <HardHat className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Eficiencia Promedio</p>
                <p className="text-2xl font-bold text-blue-600">{data.averageEfficiency}%</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.5% vs mes pasado
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tareas Completadas</p>
                <p className="text-2xl font-bold text-purple-600">{data.completedTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Este mes</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Horas Trabajadas</p>
                <p className="text-2xl font-bold text-orange-600">{data.totalHoursWorked}</p>
                <p className="text-xs text-orange-600 mt-1">Promedio: {data.averageTaskTime}min/tarea</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Turno y Experiencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Turno */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Distribución por Turno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.operatorsByShift).map(([shift, count]) => {
                const config = shiftConfig[shift] || {
                  label: shift,
                  time: '',
                  color: 'bg-gray-100 text-gray-800'
                };
                const percentage = ((count / data.totalOperators) * 100).toFixed(1);
                
                return (
                  <div key={shift} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{config.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por Experiencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Distribución por Experiencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.operatorsByExperience).map(([experience, count]) => {
                const config = experienceConfig[experience] || {
                  label: experience,
                  color: 'bg-gray-100 text-gray-800',
                  description: ''
                };
                const percentage = ((count / data.totalOperators) * 100).toFixed(1);
                
                return (
                  <div key={experience} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Award className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <Badge className={config.color}>
                          {config.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Operadores con Mejor Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.topPerformers?.slice(0, 6).map((operator, index) => (
              <div key={operator.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{operator.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={experienceConfig[operator.experience]?.color || 'bg-gray-100 text-gray-800'} variant="outline">
                        {experienceConfig[operator.experience]?.label || operator.experience}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{operator.efficiency}%</p>
                  <p className="text-xs text-gray-500">{operator.tasksCompleted} tareas</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Métricas de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data.performanceMetrics?.onTimeCompletion}%
              </div>
              <p className="text-sm text-gray-600">Completado a Tiempo</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data.performanceMetrics?.safetyCompliance}%
              </div>
              <p className="text-sm text-gray-600">Cumplimiento Seguridad</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {data.performanceMetrics?.qualityScore}%
              </div>
              <p className="text-sm text-gray-600">Calidad del Trabajo</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {data.performanceMetrics?.attendanceRate}%
              </div>
              <p className="text-sm text-gray-600">Asistencia</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificaciones y Actividad Semanal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.certifications).map(([cert, count]) => {
                const certLabels = {
                  operador_basico: 'Operador Básico',
                  operador_avanzado: 'Operador Avanzado',
                  supervisor: 'Supervisor',
                  instructor: 'Instructor'
                };
                
                const certColors = {
                  operador_basico: 'bg-yellow-100 text-yellow-800',
                  operador_avanzado: 'bg-blue-100 text-blue-800',
                  supervisor: 'bg-green-100 text-green-800',
                  instructor: 'bg-purple-100 text-purple-800'
                };
                
                return (
                  <div key={cert} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Badge className={certColors[cert] || 'bg-gray-100 text-gray-800'}>
                        {certLabels[cert] || cert}
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actividad Semanal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.weeklyActivity?.map((day) => (
                <div key={day.day} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm w-8">{day.day}</span>
                    <div className="text-xs text-gray-600">
                      {day.tasks} tareas
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-medium">{day.hours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OperatorsStats;