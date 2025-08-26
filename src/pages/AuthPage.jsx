import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  AlertCircle, Eye, EyeOff, Loader2 
} from "lucide-react";
import bgImg from '../assets/Monumento.jpg';
import muniLogo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext.jsx";
import authService from "../services/authService";
import apiClient from "../config/api.js";

export default function AuthPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuth();

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('Usuario ya autenticado, redirigiendo al dashboard');
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Detectar la pestaña según la URL
  useEffect(() => {
    if (location.pathname === "/register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [location.pathname]);

  // Estados para Login
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [loginError, setLoginError] = useState("");

  // Estados para Register
  const [registerData, setRegisterData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verificar conexión con el backend (mantenemos la verificación pero sin mostrar la UI)
  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        await apiClient.get('/auth/connection', { timeout: 3000 });
        console.log('✅ Backend conectado');
      } catch (error) {
        console.warn('⚠️ Backend no disponible:', error.message);
      }
    };

    checkBackendConnection();
  }, []);

  // Handlers para Login
  const handleLoginChange = (e) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginData.email || !loginData.password) {
      setLoginError("Por favor, complete todos los campos");
      return;
    }

    try {
      const result = await login(loginData.email, loginData.password);
      
      if (result.success) {
        navigate("/dashboard");
      } else {
        setLoginError(result.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setLoginError("Error inesperado al iniciar sesión");
    }
  };

  // Handlers para Register
  const handleRegisterChange = (e) => {
    setRegisterData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");
    setSuccessMessage("");

    // Validaciones
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Las contraseñas no coinciden");
      return;
    }
    if (registerData.password.length < 6) {
      setRegisterError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!registerData.name.trim()) {
      setRegisterError("El nombre es requerido");
      return;
    }
    if (!registerData.lastname.trim()) {
      setRegisterError("El apellido es requerido");
      return;
    }
    if (!registerData.email.trim()) {
      setRegisterError("El email es requerido");
      return;
    }

    setIsRegistering(true);

    try {
      const result = await authService.register({
        name: registerData.name.trim(),
        lastname: registerData.lastname.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
      });

      if (result.success) {
        setSuccessMessage("Cuenta creada exitosamente. Cambiando a login...");
        setTimeout(() => {
          setActiveTab("login");
          navigate("/login", { replace: true });
          setLoginData({ email: registerData.email, password: "" });
          setSuccessMessage("");
        }, 2000);
      } else {
        setRegisterError(result.error || "Error al crear la cuenta");
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      setRegisterError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsRegistering(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación inicial
  if (loading) {
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
        <div className="relative z-10 text-center">
          <div className="w-full max-w-5xl px-4 sm:px-6 mx-auto mb-8">
            <img
              src={muniLogo}
              alt="Municipalidad de Santa Cruz"
              className="mx-auto block h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Sistema de Gestión Vial</h1>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Municipalidad de Santa Cruz</h1>
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8 max-w-md mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-full max-w-5xl px-4 sm:px-6 mx-auto">
            <img
              src={muniLogo}
              alt="Municipalidad de Santa Cruz"
              className="mx-auto block h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Sistema de Gestión Vial</h1>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Municipalidad de Santa Cruz</h1>
            </div>
          </div>
          <br />
          <p className="text-gray-200 drop-shadow">
            Plataforma integral para la gestión y control de actividades viales
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden mb-6">
          <div className="flex">
            <button
              onClick={() => {
                setActiveTab("login");
                navigate("/login", { replace: true });
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "login"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                navigate("/register", { replace: true });
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <div className="p-6">
            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="usuario@santacruz.go.cr"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {loginError && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>

                <div className="text-center">
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {registerError && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                    {registerError}
                  </div>
                )}

                {successMessage && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
                    {successMessage}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      name="name"
                      autoComplete="given-name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Tu nombre"
                      required
                      disabled={isRegistering}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      name="lastname"
                      autoComplete="family-name"
                      value={registerData.lastname}
                      onChange={handleRegisterChange}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Tu apellido"
                      required
                      disabled={isRegistering}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="tu@email.com"
                    required
                    disabled={isRegistering}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="new-password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="w-full px-3 py-2 border rounded-md pr-10 focus:ring-2 focus:ring-blue-500"
                      placeholder="Mínimo 6 caracteres"
                      required
                      disabled={isRegistering}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      disabled={isRegistering}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className="w-full px-3 py-2 border rounded-md pr-10 focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirma tu contraseña"
                      required
                      disabled={isRegistering}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      disabled={isRegistering}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
