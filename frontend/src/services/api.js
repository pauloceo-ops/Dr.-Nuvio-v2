import axios from 'axios';

// Em produção usa a URL do Render, localmente usa /api
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@drnuvio:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@drnuvio:token');
      localStorage.removeItem('@drnuvio:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
