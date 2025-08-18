// import React, { useState } from 'react';
// import { useNavigate, Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { MapPin, AlertCircle } from 'lucide-react';

// const Login: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login, user } = useAuth();
//   const navigate = useNavigate();

//   // If user is already logged in, redirect to dashboard
//   if (user) {
//     return <Navigate to="/dashboard" />;
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const success = await login(email, password);
//       if (success) {
//         navigate('/dashboard');
//       } else {
//         setError('Credenciales inválidas');
//       }
//     } catch (err) {
//       setError('Error al iniciar sesión');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const demoUsers = [
//     { email: 'juan.perez@santacruz.go.cr', role: 'Conductor' },
//     { email: 'maria.rodriguez@santacruz.go.cr', role: 'Supervisor' },
//     { email: 'carlos.jimenez@santacruz.go.cr', role: 'Analista' },
//     { email: 'ana.gonzalez@santacruz.go.cr', role: 'Administrador' }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4"
//     style={{ backgroundImage: "url('/image/Monumento.jpg')" }}
//     >
//       <div className="max-w-md w-full">
//         <div className="text-center mb-8">
//           <div className="flex items-center justify-center space-x-3 mb-4">
//             <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
//               <MapPin className="w-7 h-7 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión Vial</h1>
//               <p className="text-sm text-gray-600">Municipalidad de Santa Cruz</p>
//             </div>
//           </div>
//           <p className="text-gray-600">
//             Plataforma integral para la gestión y control de actividades viales
//           </p>
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
//               {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
//             </button>
//           </form>
//         </div>

//         {/* Demo credentials */}
//         <div className="bg-gray-50 rounded-lg p-4">
//           <h3 className="text-sm font-medium text-gray-700 mb-3">
//             Credenciales de Demostración:
//           </h3>
//           <div className="space-y-2 text-xs">
//             {demoUsers.map((user, index) => (
//               <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
//                 <span className="text-gray-600">{user.email}</span>
//                 <span className="text-blue-600 font-medium">{user.role}</span>
//               </div>
//             ))}
//             <div className="text-center text-gray-500 mt-2">
//               <p>Contraseña para todos: <strong>password</strong></p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

//export default Login;

import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard/');
      } else {
        setError('Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { email: 'juan.perez@santacruz.go.cr', role: 'Conductor' },
    { email: 'maria.rodriguez@santacruz.go.cr', role: 'Supervisor' },
    { email: 'carlos.jimenez@santacruz.go.cr', role: 'Analista' },
    { email: 'ana.gonzalez@santacruz.go.cr', role: 'Administrador' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4"
    style={{ backgroundImage: "url('/image/Monumento.jpg')" }}
    >

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
           <div className="w-15 h-14 rounded-full overflow-hidden flex items-center justify-center">
            <img src="/image/logo.png" alt="Logo Gestión Vial" className="w-full h-full object-cover" />
           </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión Vial</h1>
              <p className="text-sm text-gray-600">Municipalidad de Santa Cruz</p>
            </div>
          </div>
          <p className="text-gray-600">
            Plataforma integral para la gestión y control de actividades viales
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="usuario@santacruz.go.cr"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Volver al inicio
          </Link>
        </div>
      </form>
        </div>

        {/* Demo credentials */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Credenciales de Demostración:
          </h3>
          <div className="space-y-2 text-xs">
            {demoUsers.map((user, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                <span className="text-gray-600">{user.email}</span>
                <span className="text-blue-600 font-medium">{user.role}</span>
              </div>
            ))}
            <div className="text-center text-gray-500 mt-2">
              <p>Contraseña para todos: <strong>password</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { authService } from '../services/authService';
// import api from '../services/api';

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   const onSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorMsg(null);
//     setLoading(true);
//     try {
//       const resp = await authService.login({ email, password });
//       // resp = { access_token, user: {...} }
//       localStorage.setItem('token', resp.access_token);            // OJO: sin JSON.stringify
//       localStorage.setItem('user', JSON.stringify(resp.user));

//       // Garantiza que desde aquí todas las requests lleven el Authorization
//       api.defaults.headers.common['Authorization'] = `Bearer ${resp.access_token}`;

//       navigate('/dashboard'); // o la ruta que uses
//     } catch (err: any) {
//       setErrorMsg('Credenciales inválidas');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={onSubmit}>
//       <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
//       <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
//       <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
//       {errorMsg && <p style={{color:'red'}}>{errorMsg}</p>}
//     </form>
//   );
// }
