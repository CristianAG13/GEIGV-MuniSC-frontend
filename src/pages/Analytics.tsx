// import React, { useState } from 'react';
// import { useData } from '../contexts/DataContext';
// import { analyticsService } from '../services/analyticsService';

// import {
//   BarChart3,
//   TrendingUp,
//   Download,
//   Calendar,
//   Filter,
//   Truck,
//   Clock,
//   DollarSign,
//   Activity
// } from 'lucide-react';

// const Analytics: React.FC = () => {
//   const { machinery, fieldReports } = useData();
//   const [dateRange, setDateRange] = useState('last30days');
//   const [selectedMetric, setSelectedMetric] = useState('machinery_usage');

//   // Mock analytics data - in real app, this would come from your backend
//   const analyticsData = {
//     machinaryUsage: {
//       labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
//       data: [1200, 1350, 1100, 1450, 1300, 1500]
//     },
//     materialConsumption: {
//       labels: ['Mezcla Asfáltica', 'Lastre', 'Sellador', 'Concreto'],
//       data: [45, 30, 15, 10]
//     },
//     routePerformance: {
//       'Ruta Nacional 21': { efficiency: 85, completedTasks: 24, avgTime: '4.2h' },
//       'Camino Rural Los Ángeles': { efficiency: 92, completedTasks: 18, avgTime: '3.8h' },
//       'Ruta Provincial 160': { efficiency: 78, completedTasks: 15, avgTime: '5.1h' }
//     }
//   };

//   const kpiData = [
//     {
//       title: 'Eficiencia Promedio',
//       value: '85%',
//       change: '+5%',
//       trend: 'up',
//       icon: TrendingUp,
//       color: 'text-green-600'
//     },
//     {
//       title: 'Horas Trabajadas',
//       value: '2,847h',
//       change: '+12%',
//       trend: 'up',
//       icon: Clock,
//       color: 'text-blue-600'
//     },
//     {
//       title: 'Costo por Kilómetro',
//       value: '₡15,420',
//       change: '-8%',
//       trend: 'down',
//       icon: DollarSign,
//       color: 'text-purple-600'
//     },
//     {
//       title: 'Reportes Procesados',
//       value: fieldReports.length.toString(),
//       change: '+18%',
//       trend: 'up',
//       icon: Activity,
//       color: 'text-orange-600'
//     }
//   ];

//   const handleExportData = (format: 'pdf' | 'excel') => {
//     // Mock export functionality
//     alert(`Exportando datos a ${format.toUpperCase()}...`);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Análisis y Reportes</h1>
//           <p className="text-gray-600 mt-1">Métricas y visualizaciones del desempeño vial</p>
//         </div>
//         <div className="flex items-center space-x-4 mt-4 lg:mt-0">
//           <select
//             value={dateRange}
//             onChange={(e) => setDateRange(e.target.value)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="last7days">Últimos 7 días</option>
//             <option value="last30days">Últimos 30 días</option>
//             <option value="last90days">Últimos 90 días</option>
//             <option value="lastyear">Último año</option>
//           </select>
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => handleExportData('pdf')}
//               className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
//             >
//               <Download className="w-4 h-4" />
//               <span>PDF</span>
//             </button>
//             <button
//               onClick={() => handleExportData('excel')}
//               className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//             >
//               <Download className="w-4 h-4" />
//               <span>Excel</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {kpiData.map((kpi, index) => (
//           <div key={index} className="bg-white rounded-lg shadow-sm p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
//                 <p className={`text-sm mt-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
//                   {kpi.change} vs mes anterior
//                 </p>
//               </div>
//               <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center`}>
//                 <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Machinery Usage Chart */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-semibold text-gray-900">Uso de Maquinaria</h2>
//             <BarChart3 className="w-5 h-5 text-gray-400" />
//           </div>
//           <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
//             <div className="text-center text-gray-500">
//               <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
//               <p>Gráfico de uso de maquinaria por mes</p>
//               <p className="text-sm">(Se integraría con librería de gráficos)</p>
//             </div>
//           </div>
//         </div>

//         {/* Material Consumption Chart */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-semibold text-gray-900">Consumo de Materiales</h2>
//             <TrendingUp className="w-5 h-5 text-gray-400" />
//           </div>
//           <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
//             <div className="text-center text-gray-500">
//               <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
//               <p>Gráfico de consumo de materiales</p>
//               <p className="text-sm">(Se integraría con librería de gráficos)</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Route Performance Table */}
//       <div className="bg-white rounded-lg shadow-sm p-6">
//         <h2 className="text-lg font-semibold text-gray-900 mb-6">Rendimiento por Ruta</h2>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Ruta
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Eficiencia
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Tareas Completadas
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Tiempo Promedio
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Estado
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {Object.entries(analyticsData.routePerformance).map(([route, data]) => (
//                 <tr key={route} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{route}</div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
//                         <div
//                           className="bg-green-600 h-2 rounded-full"
//                           style={{ width: `${data.efficiency}%` }}
//                         ></div>
//                       </div>
//                       <span className="text-sm text-gray-900">{data.efficiency}%</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {data.completedTasks}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {data.avgTime}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                       data.efficiency >= 90 ? 'bg-green-100 text-green-800' :
//                       data.efficiency >= 80 ? 'bg-yellow-100 text-yellow-800' :
//                       'bg-red-100 text-red-800'
//                     }`}>
//                       {data.efficiency >= 90 ? 'Excelente' :
//                        data.efficiency >= 80 ? 'Bueno' : 'Necesita Atención'}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Detailed Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de Maquinaria</h2>
//           <div className="space-y-4">
//             {machinery.map((machine) => (
//               <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <Truck className="w-5 h-5 text-gray-600" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">{machine.name}</p>
//                     <p className="text-xs text-gray-600">{machine.hoursWorked}h trabajadas</p>
//                   </div>
//                 </div>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   machine.status === 'disponible' ? 'bg-green-100 text-green-800' :
//                   machine.status === 'en_uso' ? 'bg-blue-100 text-blue-800' :
//                   machine.status === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
//                   'bg-red-100 text-red-800'
//                 }`}>
//                   {machine.status.replace('_', ' ')}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Reportes</h2>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Reportes Pendientes</span>
//               <span className="text-2xl font-bold text-yellow-600">
//                 {fieldReports.filter(r => r.status === 'pendiente').length}
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Reportes Aprobados</span>
//               <span className="text-2xl font-bold text-green-600">
//                 {fieldReports.filter(r => r.status === 'aprobado').length}
//               </span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Reportes Rechazados</span>
//               <span className="text-2xl font-bold text-red-600">
//                 {fieldReports.filter(r => r.status === 'rechazado').length}
//               </span>
//             </div>
//             <div className="pt-4 border-t">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-gray-900">Tasa de Aprobación</span>
//                 <span className="text-lg font-bold text-blue-600">
//                   {fieldReports.length > 0 
//                     ? Math.round((fieldReports.filter(r => r.status === 'aprobado').length / fieldReports.length) * 100)
//                     : 0}%
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Analytics;

import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { analyticsService } from '../services/analyticsService';

import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  Truck,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';

const Analytics: React.FC = () => {
  const { machinery, fieldReports } = useData();
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedMetric, setSelectedMetric] = useState('machinery_usage');

  // Mock analytics data - in real app, this would come from your backend
  const analyticsData = {
    machinaryUsage: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      data: [1200, 1350, 1100, 1450, 1300, 1500]
    },
    materialConsumption: {
      labels: ['Mezcla Asfáltica', 'Lastre', 'Sellador', 'Concreto'],
      data: [45, 30, 15, 10]
    },
    routePerformance: {
      'Ruta Nacional 21': { efficiency: 85, completedTasks: 24, avgTime: '4.2h' },
      'Camino Rural Los Ángeles': { efficiency: 92, completedTasks: 18, avgTime: '3.8h' },
      'Ruta Provincial 160': { efficiency: 78, completedTasks: 15, avgTime: '5.1h' }
    }
  };

  const kpiData = [
    {
      title: 'Eficiencia Promedio',
      value: '85%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Horas Trabajadas',
      value: '2,847h',
      change: '+12%',
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Costo por Kilómetro',
      value: '₡15,420',
      change: '-8%',
      trend: 'down',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      title: 'Reportes Procesados',
      value: fieldReports.length.toString(),
      change: '+18%',
      trend: 'up',
      icon: Activity,
      color: 'text-orange-600'
    }
  ];

  const handleExportData = (format: 'pdf' | 'excel') => {
    // Mock export functionality
    alert(`Exportando datos a ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análisis y Reportes</h1>
          <p className="text-gray-600 mt-1">Métricas y visualizaciones del desempeño vial</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="last7days">Últimos 7 días</option>
            <option value="last30days">Últimos 30 días</option>
            <option value="last90days">Últimos 90 días</option>
            <option value="lastyear">Último año</option>
          </select>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExportData('pdf')}
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExportData('excel')}
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                <p className={`text-sm mt-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change} vs mes anterior
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machinery Usage Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Uso de Maquinaria</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Gráfico de uso de maquinaria por mes</p>
              <p className="text-sm">(Se integraría con librería de gráficos)</p>
            </div>
          </div>
        </div>

        {/* Material Consumption Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Consumo de Materiales</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Gráfico de consumo de materiales</p>
              <p className="text-sm">(Se integraría con librería de gráficos)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Performance Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Rendimiento por Ruta</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eficiencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tareas Completadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo Promedio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(analyticsData.routePerformance).map(([route, data]) => (
                <tr key={route} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{route}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${data.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{data.efficiency}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.completedTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.avgTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      data.efficiency >= 90 ? 'bg-green-100 text-green-800' :
                      data.efficiency >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.efficiency >= 90 ? 'Excelente' :
                       data.efficiency >= 80 ? 'Bueno' : 'Necesita Atención'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de Maquinaria</h2>
          <div className="space-y-4">
            {machinery.map((machine) => (
              <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{machine.name}</p>
                    <p className="text-xs text-gray-600">{machine.hoursWorked}h trabajadas</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  machine.status === 'disponible' ? 'bg-green-100 text-green-800' :
                  machine.status === 'en_uso' ? 'bg-blue-100 text-blue-800' :
                  machine.status === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {machine.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Reportes</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reportes Pendientes</span>
              <span className="text-2xl font-bold text-yellow-600">
                {fieldReports.filter(r => r.status === 'pendiente').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reportes Aprobados</span>
              <span className="text-2xl font-bold text-green-600">
                {fieldReports.filter(r => r.status === 'aprobado').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reportes Rechazados</span>
              <span className="text-2xl font-bold text-red-600">
                {fieldReports.filter(r => r.status === 'rechazado').length}
              </span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Tasa de Aprobación</span>
                <span className="text-lg font-bold text-blue-600">
                  {fieldReports.length > 0 
                    ? Math.round((fieldReports.filter(r => r.status === 'aprobado').length / fieldReports.length) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;