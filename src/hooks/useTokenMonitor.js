

// src/hooks/useTokenMonitor.js
import { useEffect, useMemo, useState } from "react";

function safeDecodeJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload || null;
  } catch (e) {
    return null;
  }
}

/**
 * Monitorea el token JWT y devuelve su estado.
 * @param {number} warningThreshold - segundos para avisar antes de expirar (default: 300 = 5 min)
 */
const useTokenMonitor = (warningThreshold = 300) => {
  const [status, setStatus] = useState({
    timeRemaining: 0,
    minutesRemaining: 0,
    isExpired: true,
    isExpiringSoon: false,
    // info opcional que puede servir
    expMs: 0,
    nowMs: Date.now(),
  });

  const tick = useMemo(() => {
    return () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setStatus({
          timeRemaining: 0,
          minutesRemaining: 0,
          isExpired: true,
          isExpiringSoon: false,
          expMs: 0,
          nowMs: Date.now(),
        });
        return;
      }

      const payload = safeDecodeJwt(token);
      if (!payload || !payload.exp) {
        setStatus({
          timeRemaining: 0,
          minutesRemaining: 0,
          isExpired: true,
          isExpiringSoon: false,
          expMs: 0,
          nowMs: Date.now(),
        });
        return;
      }

      const now = Date.now();
      const expMs = payload.exp * 1000;
      const deltaSec = Math.floor((expMs - now) / 1000);

      setStatus({
        timeRemaining: Math.max(0, deltaSec),
        minutesRemaining: Math.max(0, Math.floor(Math.max(0, deltaSec) / 60)),
        isExpired: deltaSec <= 0,
        isExpiringSoon: deltaSec > 0 && deltaSec <= warningThreshold,
        expMs,
        nowMs: now,
      });
    };
  }, [warningThreshold]);

  useEffect(() => {
    // actualizar inmediatamente
    tick();

    // actualizar cada 30s (suficiente para UX sin ser pesado)
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [tick]);

  return status;
};

export default useTokenMonitor;
