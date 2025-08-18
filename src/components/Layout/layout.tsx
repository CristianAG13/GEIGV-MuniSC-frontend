// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   LayoutDashboard,
//   Truck,
//   FileText,
//   Users,
//   BarChart3,
//   Shield,
//   LogOut,
//   Menu,
//   X,
//   MapPin
// } from 'lucide-react';

// interface LayoutProps {
//   children: React.ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const navigation = [
//     { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
//     { name: 'Maquinaria', href: '/machinery', icon: Truck },
//     { name: 'Reportes de Campo', href: '/reports', icon: FileText },
//     { name: 'Personal', href: '/personnel', icon: Users },
//     { name: 'Análisis', href: '/analytics', icon: BarChart3 },
//     { name: 'Auditoría', href: '/audit', icon: Shield }
//   ];

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const roleColors = {
//     conductor: 'bg-blue-100 text-blue-800',
//     supervisor: 'bg-green-100 text-green-800',
//     analista: 'bg-purple-100 text-purple-800',
//     administrador: 'bg-red-100 text-red-800'
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`
//         fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
//         lg:translate-x-0 lg:static lg:inset-0
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//       `}>
//         <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
//           <div className="flex items-center space-x-2">
//             <MapPin className="w-8 h-8 text-white" />
//             <div className="text-white">
//               <h1 className="text-sm font-bold">Gestión Vial</h1>
//               <p className="text-xs opacity-90">Santa Cruz</p>
//             </div>
//           </div>
//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="lg:hidden text-white hover:bg-blue-700 rounded p-1"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <nav className="flex-1 px-4 py-4 space-y-2">
//           {navigation.map((item) => {
//             const isActive = location.pathname === item.href;
//             return (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={`
//                   flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
//                   ${isActive 
//                     ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                   }
//                 `}
//                 onClick={() => setSidebarOpen(false)}
//               >
//                 <item.icon className="w-5 h-5" />
//                 <span>{item.name}</span>
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="p-4 border-t">
//           <div className="flex items-center space-x-3 mb-3">
//             <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
//               <span className="text-sm font-medium text-gray-700">
//                 {user?.name.charAt(0)}
//               </span>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-900">{user?.name}</p>
//               <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleColors[user?.role || 'conductor']}`}>
//                 {user?.role}
//               </span>
//             </div>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <LogOut className="w-4 h-4" />
//             <span>Cerrar Sesión</span>
//           </button>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top navigation */}
//         <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="lg:hidden text-gray-500 hover:text-gray-700"
//             >
//               <Menu className="w-6 h-6" />
//             </button>
//             <h2 className="text-xl font-semibold text-gray-900">
//               {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
//             </h2>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <div className="hidden sm:block text-sm text-gray-500">
//               {new Date().toLocaleDateString('es-CR', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//               })}
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 overflow-auto p-4 lg:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   LayoutDashboard,
//   Truck,
//   FileText,
//   Users,
//   BarChart3,
//   Shield,
//   LogOut,
//   Menu,
//   X,
//   MapPin
// } from 'lucide-react';

// interface LayoutProps {
//   children: React.ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const navigation = [
//     { name: 'Dashboard', href: '/dashboard/', icon: LayoutDashboard },
//     { name: 'Maquinaria', href: '/dashboard/machinery', icon: Truck },
//     { name: 'Reportes de Campo', href: '/dashboard/reports', icon: FileText },
//     { name: 'Personal', href: '/dashboard/personnel', icon: Users },
//     { name: 'Análisis', href: '/dashboard/analytics', icon: BarChart3 },
//     { name: 'Auditoría', href: '/dashboard/audit', icon: Shield }
//   ];

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const roleColors = {
//     conductor: 'bg-blue-100 text-blue-800',
//     supervisor: 'bg-green-100 text-green-800',
//     analista: 'bg-purple-100 text-purple-800',
//     administrador: 'bg-red-100 text-red-800'
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`
//         fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
//         lg:translate-x-0 lg:static lg:inset-0
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//       `}>
//         <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
//           <div className="flex items-center space-x-2">
//             <MapPin className="w-8 h-8 text-white" />
//             <div className="text-white">
//               <h1 className="text-sm font-bold">Gestión Vial</h1>
//               <p className="text-xs opacity-90">Santa Cruz</p>
//             </div>
//           </div>
//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="lg:hidden text-white hover:bg-blue-700 rounded p-1"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <nav className="flex-1 px-4 py-4 space-y-2">
//           {navigation.map((item) => {
//             const isActive = location.pathname === item.href;
//             return (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={`
//                   flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
//                   ${isActive 
//                     ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                   }
//                 `}
//                 onClick={() => setSidebarOpen(false)}
//               >
//                 <item.icon className="w-5 h-5" />
//                 <span>{item.name}</span>
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="p-4 border-t">
//           <div className="flex items-center space-x-3 mb-3">
//             <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
//               <span className="text-sm font-medium text-gray-700">
//                 {user?.name.charAt(0)}
//               </span>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-900">{user?.name}</p>
//               <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleColors[user?.role || 'conductor']}`}>
//                 {user?.role}
//               </span>
//             </div>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <LogOut className="w-4 h-4" />
//             <span>Cerrar Sesión</span>
//           </button>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top navigation */}
//         <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="lg:hidden text-gray-500 hover:text-gray-700"
//             >
//               <Menu className="w-6 h-6" />
//             </button>
//             <h2 className="text-xl font-semibold text-gray-900">
//               {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
//             </h2>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <div className="hidden sm:block text-sm text-gray-500">
//               {new Date().toLocaleDateString('es-CR', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//               })}
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 overflow-auto p-4 lg:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   LayoutDashboard,
//   Truck,
//   FileText,
//   Users,
//   BarChart3,
//   Shield,
//   LogOut,
//   Menu,
//   X,
//   MapPin
// } from 'lucide-react';

// interface LayoutProps {
//   children: React.ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const navigation = [
//     { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
//     { name: 'Maquinaria', href: '/machinery', icon: Truck },
//     { name: 'Reportes de Campo', href: '/reports', icon: FileText },
//     { name: 'Personal', href: '/personnel', icon: Users },
//     { name: 'Análisis', href: '/analytics', icon: BarChart3 },
//     { name: 'Auditoría', href: '/audit', icon: Shield }
//   ];

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const roleColors = {
//     conductor: 'bg-blue-100 text-blue-800',
//     supervisor: 'bg-green-100 text-green-800',
//     analista: 'bg-purple-100 text-purple-800',
//     administrador: 'bg-red-100 text-red-800'
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`
//         fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
//         lg:translate-x-0 lg:static lg:inset-0
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//       `}>
//         <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
//           <div className="flex items-center space-x-2">
//             <MapPin className="w-8 h-8 text-white" />
//             <div className="text-white">
//               <h1 className="text-sm font-bold">Gestión Vial</h1>
//               <p className="text-xs opacity-90">Santa Cruz</p>
//             </div>
//           </div>
//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="lg:hidden text-white hover:bg-blue-700 rounded p-1"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <nav className="flex-1 px-4 py-4 space-y-2">
//           {navigation.map((item) => {
//             const isActive = location.pathname === item.href;
//             return (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={`
//                   flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
//                   ${isActive 
//                     ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                   }
//                 `}
//                 onClick={() => setSidebarOpen(false)}
//               >
//                 <item.icon className="w-5 h-5" />
//                 <span>{item.name}</span>
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="p-4 border-t">
//           <div className="flex items-center space-x-3 mb-3">
//             <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
//               <span className="text-sm font-medium text-gray-700">
//                 {user?.name.charAt(0)}
//               </span>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-900">{user?.name}</p>
//               <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleColors[user?.role || 'conductor']}`}>
//                 {user?.role}
//               </span>
//             </div>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <LogOut className="w-4 h-4" />
//             <span>Cerrar Sesión</span>
//           </button>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top navigation */}
//         <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="lg:hidden text-gray-500 hover:text-gray-700"
//             >
//               <Menu className="w-6 h-6" />
//             </button>
//             <h2 className="text-xl font-semibold text-gray-900">
//               {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
//             </h2>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <div className="hidden sm:block text-sm text-gray-500">
//               {new Date().toLocaleDateString('es-CR', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//               })}
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 overflow-auto p-4 lg:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import {
//   LayoutDashboard,
//   Truck,
//   FileText,
//   Users,
//   BarChart3,
//   Shield,
//   LogOut,
//   Menu,
//   X,
//   MapPin
// } from 'lucide-react';

// interface LayoutProps {
//   children: React.ReactNode;
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const navigation = [
//     { name: 'Dashboard', href: '/dashboard/', icon: LayoutDashboard },
//     { name: 'Maquinaria', href: '/dashboard/machinery', icon: Truck },
//     { name: 'Reportes de Campo', href: '/dashboard/reports', icon: FileText },
//     { name: 'Personal', href: '/dashboard/personnel', icon: Users },
//     { name: 'Análisis', href: '/dashboard/analytics', icon: BarChart3 },
//     { name: 'Auditoría', href: '/dashboard/audit', icon: Shield }
//   ];

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const roleColors = {
//     conductor: 'bg-blue-100 text-blue-800',
//     supervisor: 'bg-green-100 text-green-800',
//     analista: 'bg-purple-100 text-purple-800',
//     administrador: 'bg-red-100 text-red-800'
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`
//         fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
//         lg:translate-x-0 lg:static lg:inset-0
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//       `}>
//         <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
//           <div className="flex items-center space-x-2">
//             <MapPin className="w-8 h-8 text-white" />
//             <div className="text-white">
//               <h1 className="text-sm font-bold">Gestión Vial</h1>
//               <p className="text-xs opacity-90">Santa Cruz</p>
//             </div>
//           </div>
//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="lg:hidden text-white hover:bg-blue-700 rounded p-1"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <nav className="flex-1 px-4 py-4 space-y-2">
//           {navigation.map((item) => {
//             const isActive = location.pathname === item.href;
//             return (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={`
//                   flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
//                   ${isActive 
//                     ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
//                     : 'text-gray-700 hover:bg-gray-100'
//                   }
//                 `}
//                 onClick={() => setSidebarOpen(false)}
//               >
//                 <item.icon className="w-5 h-5" />
//                 <span>{item.name}</span>
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="p-4 border-t">
//           <div className="flex items-center space-x-3 mb-3">
//             <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
//               <span className="text-sm font-medium text-gray-700">
//                 {user?.name.charAt(0)}
//               </span>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-900">{user?.name}</p>
//               <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleColors[user?.role || 'conductor']}`}>
//                 {user?.role}
//               </span>
//             </div>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <LogOut className="w-4 h-4" />
//             <span>Cerrar Sesión</span>
//           </button>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top navigation */}
//         <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="lg:hidden text-gray-500 hover:text-gray-700"
//             >
//               <Menu className="w-6 h-6" />
//             </button>
//             <h2 className="text-xl font-semibold text-gray-900">
//               {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
//             </h2>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             <div className="hidden sm:block text-sm text-gray-500">
//               {new Date().toLocaleDateString('es-CR', {
//                 weekday: 'long',
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//               })}
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 overflow-auto p-4 lg:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Truck,
  FileText,
  Users,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  MapPin
} from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Maquinaria', href: '/dashboard/machinery', icon: Truck },
    { name: 'Reportes de Campo', href: '/dashboard/reports', icon: FileText },
    { name: 'Personal', href: '/dashboard/personnel', icon: Users },
    { name: 'Análisis', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Auditoría', href: '/dashboard/audit', icon: Shield }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors: Record<string, string> = {
    conductor: 'bg-blue-100 text-blue-800',
    supervisor: 'bg-green-100 text-green-800',
    analista: 'bg-purple-100 text-purple-800',
    administrador: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
          <div className="flex items-center space-x-2">
            <MapPin className="w-8 h-8 text-white" />
            <div className="text-white">
              <h1 className="text-sm font-bold">Gestión Vial</h1>
              <p className="text-xs opacity-90">Santa Cruz</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-blue-700 rounded p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  roleColors[user?.role || 'conductor']
                }`}
              >
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {navigation.find(item => location.pathname.startsWith(item.href))?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="hidden sm:block text-sm text-gray-500">
            {new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {/* 👉 Aquí se pintan las páginas anidadas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
