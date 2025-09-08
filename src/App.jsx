
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Maquinaria from "./pages/Maquinaria.jsx";
import Dashboard from "./pages/Dashboard.jsx"; 
import TokenExpirationWarning from "./components/TokenExpirationWarning.jsx";

import TransporteModule from "./features/transporte/TransporteModule.jsx";
import OperatorsPage from "./features/operadores/components/OperatorsIndex.jsx"; // <- si lo tienes

 import CreateMachineryForm from "./features/transporte/components/forms/create-machinery-form.jsx";
import CreateMaterialReportForm from "./features/transporte/components/forms/create-material-report-form.jsx";
import CreateRentalReportForm from "./features/transporte/components/forms/create-rental-report-form.jsx";
import CreateReportForm from "./features/transporte/components/forms/create-report-form.jsx";
import HourAmPmPickerDialog from "@/features/transporte/components/HourAmPmPickerDialog";

import { Toaster } from "@/components/ui/sonner";
export default function App() {
  return (
    <AuthProvider>
      <TokenExpirationWarning />
      <Toaster />
      <Routes>
        {/* Público */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/maquinaria" element={<Maquinaria />} />
        <Route path="/hour-picker" element={<HourAmPmPickerDialog />} />

        {/* Protegidas */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute roles={["user","operator","admin","superadmin","manager"]}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Reportes generales (admin/superadmin) 
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={["admin", "superadmin"]}>
              <ReportsAdmin />
            </ProtectedRoute>
          }
        />*/}
        <Route
            path="/transporte/*"
            element={
           <ProtectedRoute roles={["admin", "superadmin"]}>
            <TransporteModule />
          </ProtectedRoute>
        }
       />
         <Route
          path="/operators"
          element={
            <ProtectedRoute roles={["admin", "superadmin"]}>
              <OperatorsPage />
            </ProtectedRoute>
          }
        /> 

        <Route
  path="/transporte/create-machinery"
  element={
    <ProtectedRoute roles={["admin", "superadmin"]}>
      <CreateMachineryForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/transporte/create-material-report"
  element={
    <ProtectedRoute roles={["admin", "superadmin"]}>
      <CreateMaterialReportForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/transporte/create-rental-report"
  element={
    <ProtectedRoute roles={["admin", "superadmin"]}>
      <CreateRentalReportForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/transporte/create-report"
  element={
    <ProtectedRoute roles={["admin", "superadmin"]}>
      <CreateReportForm />
    </ProtectedRoute>
  }
/>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
