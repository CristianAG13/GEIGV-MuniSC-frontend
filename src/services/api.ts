// // import axios from 'axios';

// // // Configuración base de la API
// // const API_BASE_URL = 'http://localhost:3000/api/v1'; // Cambiar según sea necesario

// // // Crear instancia de axios
// // const api = axios.create({
// //   baseURL: API_BASE_URL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// // });

// // // Interceptor para agregar token JWT a las peticiones
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => {
// //     return Promise.reject(error);
// //   }
// // );

// // // Interceptor para manejar respuestas y errores
// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response?.status === 401) {
// //       // Token expirado o inválido
// //       localStorage.removeItem('token');
// //       localStorage.removeItem('user');
// //       window.location.href = '/login';
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export default api; cualquier cosa este es el orginal

// import axios, {
//   AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig
// } from 'axios';

// const API_BASE_URL = 'http://localhost:3000/api/v1';

// const api: AxiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// let redirecting = false; // evita múltiples redirecciones

// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const raw = localStorage.getItem('token');
//     const token = raw?.replace(/^"|"$/g, ''); // por si alguna vez quedó con comillas
//     if (token) {
//       config.headers = {
//         ...config.headers,
//         Authorization: `Bearer ${token}`,
//       };
//     }
//     return config;
//   },
//   (error: AxiosError) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (res: AxiosResponse) => res,
//   (error: AxiosError) => {
//     const status = error.response?.status;
//     const url = error.config?.url || '';
//     const path = window.location.pathname;
//     const hadToken = !!localStorage.getItem('token');
//     const isAuthEndpoint =
//       url.includes('/auth/login') ||
//       url.includes('/auth/register') ||
//       url.includes('/auth/refresh');

//     // Solo redirige si:
//     // - hay token (sesión previa),
//     // - NO es un endpoint de auth,
//     // - NO estás ya en /login,
//     // - y todavía no redirigimos en este ciclo.
//     if (status === 401 && hadToken && !isAuthEndpoint && path !== '/login' && !redirecting) {
//       redirecting = true;
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.assign('/login');
//       return; // corta aquí
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
// import axios, {
//   AxiosError,
//   AxiosInstance,
//   AxiosResponse,
//   InternalAxiosRequestConfig,
// } from 'axios';

// const API_BASE_URL = 'http://localhost:3000/api/v1';

// const api: AxiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// let redirecting = false; // evita bucles de redirección

// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const raw = localStorage.getItem('token');
//     const token = raw?.replace(/^"|"$/g, ''); // limpia comillas si alguna vez se guardó mal

//     if (token) {
//       // Axios v1: si headers es AxiosHeaders, usa .set; si es objeto, asigna propiedad
//       if (config.headers && typeof (config.headers as any).set === 'function') {
//         (config.headers as any).set('Authorization', `Bearer ${token}`);
//       } else {
//         (config.headers as Record<string, any> | undefined) ??= {};
//         (config.headers as Record<string, any>)['Authorization'] = `Bearer ${token}`;
//       }
//     }

//     return config;
//   },
//   (error: AxiosError) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (res: AxiosResponse) => res,
//   (error: AxiosError) => {
//     const status = error.response?.status;
//     const url = error.config?.url || '';
//     const path = window.location.pathname;

//     const hadToken = !!localStorage.getItem('token');
//     const isAuthEndpoint =
//       url.includes('/auth/login') ||
//       url.includes('/auth/register') ||
//       url.includes('/auth/refresh');

//     if (status === 401 && hadToken && !isAuthEndpoint && path !== '/login' && !redirecting) {
//       redirecting = true;
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.assign('/login');
//       return;
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

// src/services/api.ts
// import axios, {
//   AxiosError,
//   AxiosResponse,
//   InternalAxiosRequestConfig,
// } from 'axios';

// const API_BASE_URL = 'http://localhost:3000/api/v1';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       // Si headers tiene .set (AxiosHeaders), úsalo
//       const anyHeaders = config.headers as any;
//       if (anyHeaders && typeof anyHeaders.set === 'function') {
//         anyHeaders.set('Authorization', `Bearer ${token}`);
//       } else {
//         // fallback seguro para objeto plano
//         config.headers = {
//           ...(config.headers as any),
//           Authorization: `Bearer ${token}`,
//         } as any;
//       }
//     }
//     return config;
//   },
//   (error: AxiosError) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (res: AxiosResponse) => res,
//   (error: AxiosError) => {
//     if (error.response?.status === 401 && window.location.pathname !== '/login') {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

// src/services/api.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Asegura objeto headers y usa AxiosHeaders para tipado correcto
    if (!config.headers) config.headers = new AxiosHeaders();
    (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
  }
  return config; // ¡OJO! devolver InternalAxiosRequestConfig
});

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
