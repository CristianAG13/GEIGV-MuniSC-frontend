import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";

function ForgotPassword() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-2">Recuperar contraseña</h1>
      <p className="text-gray-600">Aquí irá tu formulario de recuperación.</p>
    </div>
  );
}



export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    
  );
  
}
