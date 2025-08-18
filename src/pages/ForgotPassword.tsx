import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión Vial</h1>
                <p className="text-sm text-gray-600">Municipalidad de Santa Cruz</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Correo Enviado
            </h2>
            <p className="text-gray-600 mb-6">
              Se ha enviado un enlace de recuperación de contraseña a <strong>{email}</strong>. 
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block"
              >
                Volver al Login
              </Link>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="w-full text-blue-600 hover:text-blue-800 py-2 px-4 text-sm"
              >
                Enviar a otro correo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión Vial</h1>
              <p className="text-sm text-gray-600">Municipalidad de Santa Cruz</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Recuperar Contraseña
            </h2>
            <p className="text-gray-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="usuario@santacruz.go.cr"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Login</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { MapPin, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
// import { authService } from '../services/authService';

// const ForgotPassword: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
    
//     try {
//       await authService.forgotPassword({ email });
//       setLoading(false);
//       setIsSubmitted(true);
//     } catch (err) {
//       setError('Error al enviar el correo de recuperación');
//       setLoading(false);
//     }
//   };

//   if (isSubmitted) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
//         <div className="max-w-md w-full">
//           <div className="text-center mb-8">
//             <div className="flex items-center justify-center space-x-3 mb-4">
//               <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
//                 <MapPin className="w-7 h-7 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión Vial</h1>
//                 <p className="text-sm text-gray-600">Municipalidad de Santa Cruz</p>
//               </div>
//             </div>
//           </div>

//           {error && (
//             <div className="text-red-600 text-sm text-center">
//               {error}
//             </div>
//           )}

//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <CheckCircle className="w-8 h-8 text-green-600" />
//             </div>
//             <h2 className="text-xl font-bold text-gray-900 mb-4">
//               Correo Enviado
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Se ha enviado un enlace de recuperación de contraseña a <strong>{email}</strong>. 
//               Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
//             </p>
//             <div className="space-y-3">
//               <Link
//                 to="/login"
//                 className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block"
//               >
//                 Volver al Login
//               </Link>
//               <button
//                 onClick={() => {
//                   setIsSubmitted(false);
//                   setEmail('');
//                 }}
//                 className="w-full text-blue-600 hover:text-blue-800 py-2 px-4 text-sm"
//               >
//                 Enviar a otro correo
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
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
//         </div>

//         <div className="bg-white rounded-lg shadow-md p-6">
//           <div className="text-center mb-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-2">
//               Recuperar Contraseña
//             </h2>
//             <p className="text-gray-600 text-sm">
//               Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Correo Electrónico
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="email"
//                   id="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="usuario@santacruz.go.cr"
//                   required
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <Link
//               to="/login"
//               className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               <span>Volver al Login</span>
//             </Link>
//           </div>
//         </div>

//         <div className="mt-6 text-center">
//           <Link
//             to="/"
//             className="text-gray-600 hover:text-gray-800 text-sm"
//           >
//             ← Volver al inicio
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;