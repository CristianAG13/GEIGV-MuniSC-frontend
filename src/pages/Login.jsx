// "use client"

// import { useState } from "react"

// import { useNavigate, Link } from 'react-router-dom'


// export default function Login() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState("")
//   const [loading, setLoading] = useState(false)
//   const router = useRouter()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError("")
//     setLoading(true)

//     try {
//       // Simulación de login - aquí conectarías con tu backend
//       if (email && password === "password") {
//         // Simular éxito
//         router.push("/dashboard")
//       } else {
//         setError("Credenciales inválidas")
//       }
//     } catch (err) {
//       setError("Error al iniciar sesión")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const demoUsers = [
//     { email: "juan.perez@santacruz.go.cr", role: "Conductor" },
//     { email: "maria.rodriguez@santacruz.go.cr", role: "Supervisor" },
//     { email: "carlos.jimenez@santacruz.go.cr", role: "Analista" },
//     { email: "ana.gonzalez@santacruz.go.cr", role: "Administrador" },
//   ]

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center p-4 relative"
//       style={{
//         backgroundImage: `url('/images/login-background.png')`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       {/* Background overlay */}
//       <div className="absolute inset-0 bg-black bg-opacity-40"></div>

//       <div className="max-w-md w-full relative z-10">
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center space-x-3 mb-4">
//             <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
//               <MapPin className="w-7 h-7 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-white drop-shadow-lg">Sistema de Gestión Vial</h1>
//               <p className="text-sm text-gray-200 drop-shadow">Municipalidad de Santa Cruz</p>
//             </div>
//           </div>
//           <p className="text-gray-200 drop-shadow">
//             Plataforma integral para la gestión y control de actividades viales
//           </p>
//         </div>

//         <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-6 mb-6">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Correo Electrónico
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="usuario@santacruz.go.cr"
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Contraseña
//               </label>
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="••••••••"
//                 required
//               />
//             </div>

//             {error && (
//               <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
//                 <AlertCircle className="w-4 h-4" />
//                 <span className="text-sm">{error}</span>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
//             </button>

//             <div className="text-center">
//               <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
//                 ¿Olvidaste tu contraseña?
//               </Link>
//             </div>
//           </form>
//         </div>

//         <div className="text-center mt-6">
//           <Link href="/" className="text-white hover:text-gray-200 text-sm drop-shadow">
//             ← Volver al inicio
//           </Link>
//         </div>

//         {/* Demo credentials */}
//         <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
//           <h3 className="text-sm font-medium text-gray-700 mb-3">Credenciales de Demostración:</h3>
//           <div className="space-y-2 text-xs">
//             {demoUsers.map((user, index) => (
//               <div key={index} className="flex justify-between items-center p-2 bg-white bg-opacity-70 rounded border">
//                 <span className="text-gray-600">{user.email}</span>
//                 <span className="text-blue-600 font-medium">{user.role}</span>
//               </div>
//             ))}
//             <div className="text-center text-gray-500 mt-2">
//               <p>
//                 Contraseña para todos: <strong>password</strong>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Demo: cualquier email + password "password" => entra
      if (email && password === "password") {
        navigate("/dashboard"); // cámbialo a donde corresponda
      } else {
        setError("Credenciales inválidas");
      }
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { email: "juan.perez@santacruz.go.cr", role: "Conductor" },
    { email: "maria.rodriguez@santacruz.go.cr", role: "Supervisor" },
    { email: "carlos.jimenez@santacruz.go.cr", role: "Analista" },
    { email: "ana.gonzalez@santacruz.go.cr", role: "Administrador" },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('\assets\Monumento.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Sistema de Gestión Vial</h1>
              <p className="text-sm text-gray-200 drop-shadow">Municipalidad de Santa Cruz</p>
            </div>
          </div>
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
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-white hover:text-gray-200 text-sm drop-shadow">
            ← Volver al inicio
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Credenciales de Demostración:</h3>
          <div className="space-y-2 text-xs">
            {demoUsers.map((u, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-white/70 rounded border">
                <span className="text-gray-600">{u.email}</span>
                <span className="text-blue-600 font-medium">{u.role}</span>
              </div>
            ))}
            <div className="text-center text-gray-500 mt-2">
              Contraseña para todos: <strong>password</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
