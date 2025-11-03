import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor request → adjuntar token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔁 Interceptor response → refrescar token si está expirado
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no hemos reintentado ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // pedir refresh al backend
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          throw new Error("No user data found");
        }
        
        const user = JSON.parse(userStr);
        if (!user || !user.id) {
          throw new Error("Invalid user data");
        }
        
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          userId: user.id,
        });

        const newToken = res.data.access_token;
        if (!newToken) {
          throw new Error("No access token received");
        }
        
        localStorage.setItem("access_token", newToken);

        // actualizar el header y reintentar la request original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh token falló:", refreshError);
        console.error("❌ Detalles del error:", refreshError.response?.data || refreshError.message);
        // redirigir al login si falla el refresh
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.setItem("sessionExpiredReason", "token_refresh_failed");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
