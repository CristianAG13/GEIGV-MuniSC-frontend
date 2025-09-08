
// src/components/TokenExpirationWarning.jsx
import useTokenMonitor from '../hooks/useTokenMonitor';
import { useAuth } from '../context/AuthContext';
import apiClient from '../config/api';
import { confirmAction, showSuccess, showToast } from '../utils/sweetAlert';

const TokenExpirationWarning = () => {
  const { logout } = useAuth();
  const tokenStatus = useTokenMonitor(300); // 5 minutos

  const handleExtendSession = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id) {
        showToast('No se pudo identificar el usuario para refrescar sesión', 'error');
        return;
      }

      // Pide nuevo token al backend
      const res = await apiClient.post('/auth/refresh', { userId: user.id });
      const newToken = res?.data?.access_token;

      if (!newToken) {
        showToast('No se recibió un nuevo token', 'error');
        return;
      }

      localStorage.setItem('access_token', newToken);

      // Notificar a quien escuche (por si tienes otras partes que reaccionen)
      window.dispatchEvent(new Event('token-updated'));

      showToast('Sesión extendida exitosamente', 'success');
    } catch (error) {
      console.error('Error al extender sesión:', error);
      showToast('Error al extender sesión', 'error');
    }
  };

  const handleLogout = async () => {
    const result = await confirmAction(
      'Su sesión está por expirar',
      '¿Desea cerrar sesión ahora o extender su tiempo?',
      {
        confirmButtonText: 'Cerrar sesión',
        cancelButtonText: 'Extender sesión',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      }
    );

    if (result.isConfirmed) {
      logout();
      showSuccess(
        'Sesión cerrada',
        'Su sesión ha sido cerrada por seguridad',
        { timer: 2000, showConfirmButton: false }
      );
    } else if (result.isDismissed) {
      handleExtendSession();
    }
  };

  // 💡 Protecciones para evitar la pantalla en blanco:
  if (!tokenStatus) return null;
  if (tokenStatus.isExpired || !tokenStatus.isExpiringSoon) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-3 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">
            Su sesión expirará en {tokenStatus.minutesRemaining} minuto{tokenStatus.minutesRemaining !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExtendSession}
            className="bg-white text-yellow-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Extender sesión
          </button>
          <button
            onClick={handleLogout}
            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpirationWarning;
