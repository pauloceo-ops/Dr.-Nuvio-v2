import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
