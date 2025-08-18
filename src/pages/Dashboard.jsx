import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, User, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Sistema de Gestión Vial</h1>
                <p className="text-sm text-gray-500">Municipalidad de Santa Cruz</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">{user?.nombre || user?.email}</p>
                  <p className="text-gray-500">{user?.rol || 'Usuario'}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Bienvenido al Dashboard!
              </h2>
              <p className="text-gray-600 mb-6">
                Has iniciado sesión exitosamente. El sistema está conectado al backend en el puerto 3000.
              </p>
              
              <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nombre:</span>
                    <span className="text-gray-900">{user?.nombre || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rol:</span>
                    <span className="text-gray-900">{user?.rol || 'Usuario'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID:</span>
                    <span className="text-gray-900">{user?.id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Aquí irán los módulos del sistema de gestión vial
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
