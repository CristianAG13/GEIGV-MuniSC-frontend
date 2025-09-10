import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se requieren roles específicos, verificar que el usuario los tenga
  if (roles.length > 0) {
    // Verificar si el usuario es "invitado" y está intentando acceder a una ruta que no es "dashboard"
    const isInvitado = user?.roles?.some(role => role.toLowerCase() === 'invitado');
    
    // Si es invitado y no está en una ruta dashboard, redirigirlo al dashboard
    if (isInvitado && !window.location.pathname.includes("/dashboard")) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // Para otras rutas, verificar si el usuario tiene alguno de los roles requeridos
    const userHasRequiredRole = user?.roles?.some(role => 
      roles.includes(role.toLowerCase())
    );

    if (!userHasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si está autenticado y tiene los roles necesarios, mostrar el contenido
  return children;
}
