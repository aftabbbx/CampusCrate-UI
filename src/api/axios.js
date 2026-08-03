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
    const token = localStorage.getItem('campuscrate_token');

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
    // Network error — backend not reachable
    if (!error.response) {
      console.error('🔴 Network Error: Cannot reach backend at', API.defaults.baseURL);
      console.error('   Make sure the backend server is running on the correct port.');
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('campuscrate_token');
      localStorage.removeItem('campuscrate_user');
      window.location.href = '/login';
    }

    if (error.response?.status === 500) {
      console.error('🔴 Server Error:', error.response.data?.message || 'Internal server error');
    }

    return Promise.reject(error);
  }
);

export default API;
