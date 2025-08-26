import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para monitorear el estado del token de autenticación
 * @param {number} warningThreshold - Tiempo en segundos para mostrar advertencia antes de expirar (default: 300 = 5 minutos)
 * @returns {Object} Estado del token con información útil
 */
const useTokenMonitor = (warningThreshold = 300) => {
  const { getTokenInfo, isAuthenticated } = useAuth();
  const [tokenStatus, setTokenStatus] = useState({
    timeRemaining: 0,
    isExpired: true,
    isExpiringSoon: false,
    minutesRemaining: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setTokenStatus({
        timeRemaining: 0,
        isExpired: true,
        isExpiringSoon: false,
        minutesRemaining: 0,
      });
      return;
    }

    const updateTokenStatus = () => {
      const tokenInfo = getTokenInfo();
      const minutesRemaining = Math.floor(tokenInfo.timeRemaining / 60);
      
      setTokenStatus({
        timeRemaining: tokenInfo.timeRemaining,
        isExpired: tokenInfo.isExpired,
        isExpiringSoon: !tokenInfo.isExpired && tokenInfo.timeRemaining <= warningThreshold,
        minutesRemaining,
      });
    };

    // Actualizar inmediatamente
    updateTokenStatus();

    // Actualizar cada minuto
    const interval = setInterval(updateTokenStatus, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, warningThreshold, getTokenInfo]);

  return tokenStatus;
};

export default useTokenMonitor;
