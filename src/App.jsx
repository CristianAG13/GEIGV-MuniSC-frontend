import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx"; 


export default function App() {
  return (

    <AuthProvider>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
         
        

        {/* Protegidas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
                {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />


    
      </Routes>
    </AuthProvider>
  );
}
