// import React from 'react';
// import { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { useData } from '../contexts/DataContext';
// import { analyticsService, DashboardStats } from '../services/analyticsService';



// import {
//   Truck,
//   FileText,
//   Users,
//   TrendingUp,
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   XCircle
// } from 'lucide-react';

// interface StatCardProps {
//   title: string;
//   value: string | number;
//   icon: React.ElementType;
//   color: string;
//   change?: string;
//   trend?: 'up' | 'down';
// }

// const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change, trend }) => {
//   return (
//     <div className="bg-white rounded-lg shadow-sm p-6 border-l-4" style={{ borderLeftColor: color }}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600">{title}</p>
//           <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
//           {change && (
//             <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
//               {change}
//             </p>
//           )}
//         </div>
//         <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
//           <Icon className="w-6 h-6" style={{ color }} />
//         </div>
//       </div>
//     </div>
//   );
// };

// const Dashboard: React.FC = () => {
//   const { user } = useAuth();
//   const { machinery, fieldReports } = useData();
//   const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadDashboardStats();
//   }, []);

//   const loadDashboardStats = async () => {
//     try {
//       const stats = await analyticsService.getDashboardStats();
//       setDashboardStats(stats);
//     } catch (error) {
//       console.error('Error cargando estadísticas:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Usar stats del backend o fallback a datos locales
//   const stats = dashboardStats ? {
//     totalMachinery: dashboardStats.machinery.total,
//     activeMachinery: dashboardStats.machinery.inUse,
//     pendingReports: dashboardStats.reports.pending,
//     approvedReports: dashboardStats.reports.approved,
//     rejectedReports: dashboardStats.reports.rejected,
//     maintenanceMachinery: dashboardStats.machinery.maintenance
//   } : {
//     totalMachinery: machinery.length,
//     activeMachinery: machinery.filter(m => m.status === 'en_uso').length,
//     pendingReports: fieldReports.filter(r => r.status === 'pendiente').length,
//     approvedReports: fieldReports.filter(r => r.status === 'aprobado').length,
//     rejectedReports: fieldReports.filter(r => r.status === 'rechazado').length,
//     maintenanceMachinery: machinery.filter(m => m.status === 'mantenimiento').length
//   };

//   const recentReports = fieldReports.slice(0, 5);

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'pendiente':
//         return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//           <Clock className="w-3 h-3 mr-1" />
//           Pendiente
//         </span>;
//       case 'aprobado':
//         return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//           <CheckCircle className="w-3 h-3 mr-1" />
//           Aprobado
//         </span>;
//       case 'rechazado':
//         return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
//           <XCircle className="w-3 h-3 mr-1" />
//           Rechazado
//         </span>;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {loading && (
//         <div className="text-center py-4">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
//         </div>
//       )}

//       {/* Welcome Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
//         <h1 className="text-2xl font-bold mb-2">
//           ¡Bienvenido, {user?.name}!
//         </h1>
//         <p className="text-blue-100">
//           Panel de control del Sistema de Gestión Vial - Municipalidad de Santa Cruz
//         </p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           title="Total Maquinaria"
//           value={stats.totalMachinery}
//           icon={Truck}
//           color="#2563EB"
//         />
//         <StatCard
//           title="Maquinaria Activa"
//           value={stats.activeMachinery}
//           icon={TrendingUp}
//           color="#059669"
//         />
//         <StatCard
//           title="Reportes Pendientes"
//           value={stats.pendingReports}
//           icon={Clock}
//           color="#D97706"
//         />
//         <StatCard
//           title="En Mantenimiento"
//           value={stats.maintenanceMachinery}
//           icon={AlertTriangle}
//           color="#DC2626"
//         />
//       </div>

//       {/* Quick Actions based on role */}
//       {user?.role === 'conductor' && (
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-blue-200 transition-colors">
//               <FileText className="w-8 h-8 text-blue-600 mb-2" />
//               <h3 className="font-medium text-blue-900">Nuevo Reporte de Campo</h3>
//               <p className="text-sm text-blue-600 mt-1">Registrar actividades realizadas</p>
//             </button>
//             <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-dashed border-green-200 transition-colors">
//               <Truck className="w-8 h-8 text-green-600 mb-2" />
//               <h3 className="font-medium text-green-900">Reportar Estado de Maquinaria</h3>
//               <p className="text-sm text-green-600 mt-1">Actualizar estado operativo</p>
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Recent Reports */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-900">Reportes Recientes</h2>
//             <FileText className="w-5 h-5 text-gray-400" />
//           </div>
//           <div className="space-y-4">
//             {recentReports.map((report) => (
//               <div key={report.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex-1">
//                   <h3 className="font-medium text-gray-900 text-sm">{report.workType}</h3>
//                   <p className="text-sm text-gray-600">{report.route}</p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {report.driverName} • {new Date(report.startTime).toLocaleDateString('es-CR')}
//                   </p>
//                 </div>
//                 <div className="ml-4">
//                   {getStatusBadge(report.status)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Machinery Status */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-gray-900">Estado de Maquinaria</h2>
//             <Truck className="w-5 h-5 text-gray-400" />
//           </div>
//           <div className="space-y-4">
//             {machinery.map((machine) => (
//               <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div>
//                   <h3 className="font-medium text-gray-900 text-sm">{machine.name}</h3>
//                   <p className="text-sm text-gray-600">{machine.plate}</p>
//                 </div>
//                 <div className="text-right">
//                   <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
//                     machine.status === 'disponible' ? 'bg-green-100 text-green-800' :
//                     machine.status === 'en_uso' ? 'bg-blue-100 text-blue-800' :
//                     machine.status === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-red-100 text-red-800'
//                   }`}>
//                     {machine.status.replace('_', ' ')}
//                   </span>
//                   <p className="text-xs text-gray-500 mt-1">{machine.hoursWorked}h trabajadas</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Reports Summary */}
//       <div className="bg-white rounded-lg shadow-sm p-6">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Reportes</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="text-center p-4 bg-yellow-50 rounded-lg">
//             <div className="text-2xl font-bold text-yellow-700">{stats.pendingReports}</div>
//             <div className="text-sm text-yellow-600 font-medium">Pendientes de Revisión</div>
//           </div>
//           <div className="text-center p-4 bg-green-50 rounded-lg">
//             <div className="text-2xl font-bold text-green-700">{stats.approvedReports}</div>
//             <div className="text-sm text-green-600 font-medium">Reportes Aprobados</div>
//           </div>
//           <div className="text-center p-4 bg-red-50 rounded-lg">
//             <div className="text-2xl font-bold text-red-700">{stats.rejectedReports}</div>
//             <div className="text-sm text-red-600 font-medium">Reportes Rechazados</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { analyticsService, DashboardStats } from '../services/analyticsService';
import { useNavigate } from 'react-router-dom';


import {
  Truck,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: string;
  trend?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change, trend }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { machinery, fieldReports } = useData();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const stats = await analyticsService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Usar stats del backend o fallback a datos locales
  const stats = dashboardStats ? {
    totalMachinery: dashboardStats.machinery.total,
    activeMachinery: dashboardStats.machinery.inUse,
    pendingReports: dashboardStats.reports.pending,
    approvedReports: dashboardStats.reports.approved,
    rejectedReports: dashboardStats.reports.rejected,
    maintenanceMachinery: dashboardStats.machinery.maintenance
  } : {
    totalMachinery: machinery.length,
    activeMachinery: machinery.filter(m => m.status === 'en_uso').length,
    pendingReports: fieldReports.filter(r => r.status === 'pendiente').length,
    approvedReports: fieldReports.filter(r => r.status === 'aprobado').length,
    rejectedReports: fieldReports.filter(r => r.status === 'rechazado').length,
    maintenanceMachinery: machinery.filter(m => m.status === 'mantenimiento').length
  };

  const recentReports = fieldReports.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pendiente
        </span>;
      case 'aprobado':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprobado
        </span>;
      case 'rechazado':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Rechazado
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Panel de control del Sistema de Gestión Vial - Municipalidad de Santa Cruz
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Maquinaria"
          value={stats.totalMachinery}
          icon={Truck}
          color="#2563EB"
        />
        <StatCard
          title="Maquinaria Activa"
          value={stats.activeMachinery}
          icon={TrendingUp}
          color="#059669"
        />
        <StatCard
          title="Reportes Pendientes"
          value={stats.pendingReports}
          icon={Clock}
          color="#D97706"
        />
        <StatCard
          title="En Mantenimiento"
          value={stats.maintenanceMachinery}
          icon={AlertTriangle}
          color="#DC2626"
        />
      </div>

      {/* Quick Actions based on role */}
      {user?.role === 'conductor' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <button
                 type="button"
                onClick={() => navigate('/dashboard/reports/new')}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-blue-200 transition-colors"
            >
                <FileText className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-blue-900">Nuevo Reporte de Campo</h3>
              <p className="text-sm text-blue-600 mt-1">Registrar actividades realizadas</p>
           </button>

            <button
                   type="button"
                   onClick={() => navigate('/dashboard/machinery')}
                   className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-dashed border-green-200 transition-colors"
            >
                 <Truck className="w-8 h-8 text-green-600 mb-2" />
                 <h3 className="font-medium text-green-900">Reportar Estado de Maquinaria</h3>
                 <p className="text-sm text-green-600 mt-1">Actualizar estado operativo</p>
            </button>

          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reportes Recientes</h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{report.workType}</h3>
                  <p className="text-sm text-gray-600">{report.route}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {report.driverName} • {new Date(report.startTime).toLocaleDateString('es-CR')}
                  </p>
                </div>
                <div className="ml-4">
                  {getStatusBadge(report.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Machinery Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Estado de Maquinaria</h2>
            <Truck className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {machinery.map((machine) => (
              <div key={machine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{machine.name}</h3>
                  <p className="text-sm text-gray-600">{machine.plate}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    machine.status === 'disponible' ? 'bg-green-100 text-green-800' :
                    machine.status === 'en_uso' ? 'bg-blue-100 text-blue-800' :
                    machine.status === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {machine.status.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{machine.hoursWorked}h trabajadas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Reportes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700">{stats.pendingReports}</div>
            <div className="text-sm text-yellow-600 font-medium">Pendientes de Revisión</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{stats.approvedReports}</div>
            <div className="text-sm text-green-600 font-medium">Reportes Aprobados</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{stats.rejectedReports}</div>
            <div className="text-sm text-red-600 font-medium">Reportes Rechazados</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;