import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3400',
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
    if (error.response?.status === 401) {
      localStorage.removeItem('campuscrate_token');
      localStorage.removeItem('campuscrate_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
