import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import Register from "./pages/Register.jsx"; 



export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<Register />} />

      {/* catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    
  );
  
}
