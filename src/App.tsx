
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import { DataProvider } from './contexts/DataContext';
// import Layout from './components/Layout/layout';
// import Homepage from './pages/Homepage';
// import Login from './pages/Login';
// import ForgotPassword from './pages/ForgotPassword';
// import Dashboard from './pages/Dasboard';
// import MachineryManagement from './pages/MachineryManagement';
// import FieldReports from './pages/FieldReports';
// import Personnel from './pages/Personnel';
// import Analytics from './pages/Analytics';
// import Audit from './pages/Audit';
// import './App.css';
// import PrivateRoute from './pages/PrivateRoute'; 

// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user } = useAuth();
//   return user ? <>{children}</> : <Navigate to="/login" />;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <DataProvider>
//         <Router>
//           <div className="min-h-screen bg-gray-50">
//             <Routes>
//               <Route path="/" element={<Homepage />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/forgot-password" element={<ForgotPassword />} />
//               <Route
//                 path="/dashboard/*"
//                 element={
//                   <ProtectedRoute>
//                     <Layout>
//                       <Routes>
//                         <Route path="/" element={<Dashboard />} />
//                         <Route path="/machinery" element={<MachineryManagement />} />
//                         <Route path="/reports" element={<FieldReports />} />
//                         <Route path="/personnel" element={<Personnel />} />
//                         <Route path="/analytics" element={<Analytics />} />
//                         <Route path="/audit" element={<Audit />} />
//                       </Routes>
//                     </Layout>
//                   </ProtectedRoute>
//                 }
//               />
//             </Routes>
//           </div>

//         </Router>
//       </DataProvider>
//     </AuthProvider>
    
//   );
// }

// export default App;


// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import { DataProvider } from './contexts/DataContext';
// import Layout from './components/Layout/layout';
// import Homepage from './pages/Homepage';
// import Login from './pages/Login';
// import ForgotPassword from './pages/ForgotPassword';
// import Dashboard from './pages/Dasboard';
// import MachineryManagement from './pages/MachineryManagement';
// import FieldReports from './pages/FieldReports';
// import Personnel from './pages/Personnel';
// import Analytics from './pages/Analytics';
// import Audit from './pages/Audit';
// import './App.css';
// import PrivateRoute from './pages/PrivateRoute'; 

// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user } = useAuth();
//   return user ? <>{children}</> : <Navigate to="/login" />;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <DataProvider>
//         <Router>
//           <div className="min-h-screen bg-gray-50">
//             <Routes>
//               <Route path="/" element={<Homepage />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/forgot-password" element={<ForgotPassword />} />
//               <Route
//                 path="/dashboard/*"
//                 element={
//                   <ProtectedRoute>
//                     <Layout>
//                       <Routes>
//                         <Route path="/" element={<Dashboard />} />
//                         <Route path="/machinery" element={<MachineryManagement />} />
//                         <Route path="/reports" element={<FieldReports />} />
//                         <Route path="/personnel" element={<Personnel />} />
//                         <Route path="/analytics" element={<Analytics />} />
//                         <Route path="/audit" element={<Audit />} />
//                       </Routes>
//                     </Layout>
//                   </ProtectedRoute>
//                 }
//               />
//             </Routes>
//           </div>

//         </Router>
//       </DataProvider>
//     </AuthProvider>
    
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

import Layout from './components/Layout/layout';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dasboard';
import MachineryManagement from './pages/MachineryManagement';
import FieldReports from './pages/FieldReports';
import Personnel from './pages/Personnel';
import Analytics from './pages/Analytics';
import Audit from './pages/Audit';
import NewFieldReport from './pages/NewFieldReport';
import './App.css';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6 text-gray-600">Cargando sesión...</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Privadas: Layout + páginas anidadas */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/machinery" element={<MachineryManagement />} />
              <Route path="/dashboard/reports" element={<FieldReports />} />
               //<Route path="/dashboard/reports/new" element={<NewFieldReport />} /> {/* <--- nueva */}
              <Route path="/dashboard/personnel" element={<Personnel />} />
              <Route path="/dashboard/analytics" element={<Analytics />} />
              <Route path="/dashboard/audit" element={<Audit />} />
              {/* Probar rápidamente que pinta algo */}
              <Route path="/dashboard/ping" element={<div>Ping</div>} />
            </Route>

            {/* catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
