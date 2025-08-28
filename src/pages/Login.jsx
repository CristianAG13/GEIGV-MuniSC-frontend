import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { MapPin, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import bgImg from '../assets/Monumento.jpg'; // ajusta el ../ según tu carpeta
import { useAuth } from "../context/AuthContext.jsx";
import apiClient from "../config/api.js";
import muniLogo from "../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking"); // checking, connected, disconnected
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { login, loading } = useAuth();
  
  // Verificar si el usuario fue redirigido por expiración del token
  useEffect(() => {
    const expired = searchParams.get('expired') === 'true';
    if (expired) {
      setSessionExpired(true);
    }
  }, [searchParams]);

  // Verificar conexión con el backend al cargar el componente
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Usar la ruta específica de prueba de conexión
        const response = await apiClient.get('/auth/connection', { timeout: 3000 });
        console.log('✅ Se ha conectado:', response.data);
        setBackendStatus("connected");
      } catch (error) {
        console.error('❌ Error de conexión:', error);
        setBackendStatus("disconnected");
      }
    };

    checkBackendConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, complete todos los campos");
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate("/dashboard"); // Redirigir al dashboard después del login exitoso
      } else {
        setError(result.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error inesperado al iniciar sesión");
    }
  };

  const getStatusIcon = () => {
    switch (backendStatus) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "disconnected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case "connected":
        return "Conectado";
      case "disconnected":
        return "Desconectado";
      default:
        return "Verificando...";
    }
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case "connected":
        return "text-green-600";
      case "disconnected":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  // Función para probar la conexión manualmente
  const testConnection = async () => {
    setBackendStatus("checking");
    try {
      const response = await apiClient.get('/auth/connection', { timeout: 5000 });
      console.log('✅ Se ha conectado:', response.data);
      setBackendStatus("connected");
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setBackendStatus("disconnected");
    }
  };

  return (
    <div
       className="min-h-screen flex items-center justify-center p-4 relative"
       style={{
       backgroundImage: `url(${bgImg})`,
       backgroundSize: "cover",
       backgroundPosition: "center",
       backgroundRepeat: "no-repeat",
  }}
>

      <div className="absolute inset-0 bg-black/40" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-full max-w-5xl px-4 sm:px-6 mx-auto">
             <div className="flex items-center gap-4 justify-start"></div>
            <img
              src={muniLogo}
              alt="Municipalidad de Santa Cruz"
              className="mx-auto block h-16 w-auto object-contain" // ← tamaño y centrado
            />
            <div>
              <h1 className="text-2xl font-bold text-black drop-shadow-lg">Sistema de Gestión Vial</h1>
              <h1 className="text-2xl font-bold text-black drop-shadow-lg">Municipalidad de Santa Cruz</h1>
            </div>
          </div>
          <br />
          <p className="text-gray-200 drop-shadow">
            Plataforma integral para la gestión y control de actividades viales
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="usuario@santacruz.go.cr"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            {sessionExpired && (
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-300">
                <Clock className="w-5 h-5" />
                <div>
                  <p className="font-medium">Sesión finalizada</p>
                  <p className="text-sm">Su sesión ha expirado por motivos de seguridad. Por favor inicie sesión nuevamente.</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || backendStatus === "disconnected"}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>

            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="text-center">
              <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">
            ← Volver al inicio
          </Link>
            </div>
          </form>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Estado del Sistema:</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 bg-white/70 rounded border">
              <span className="text-gray-600">Backend URL:</span>
              <span className="text-blue-600 font-medium">GET http://localhost:3001/api/v1/auth/connection</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/70 rounded border">
              <span className="text-gray-600">Estado:</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
              </div>
            </div>
            <div className="text-center text-gray-500 mt-2">
              {backendStatus === "connected" 
                ? "Utilice sus credenciales del sistema" 
                : backendStatus === "disconnected"
                ? "Verifique que el backend esté ejecutándose"
                : "Verificando conexión..."}
            </div>
            <div className="text-center mt-3">
              <button
                onClick={testConnection}
                disabled={backendStatus === "checking"}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
              >
                {backendStatus === "checking" ? "Probando..." : "Probar Conexión"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
