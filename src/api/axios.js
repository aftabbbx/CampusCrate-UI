import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3400',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach JWT token ───────────────────────────
API.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url?.startsWith('/admin');
    const token = isAdminRoute 
      ? localStorage.getItem('campuscrate_admin_token') 
      : localStorage.getItem('campuscrate_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 ────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRoute = error.config?.url?.startsWith('/admin');
      
      if (isAdminRoute) {
        localStorage.removeItem('campuscrate_admin_token');
        localStorage.removeItem('campuscrate_admin');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('campuscrate_token');
        localStorage.removeItem('campuscrate_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
