import axios from 'axios';

// Get API base URL from Vite environment variables for production (e.g. Render backend URL)
// Defaults to '/api' for local development with Vite proxy
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

let baseURL = '/api';
if (rawBaseUrl) {
  const trimmed = rawBaseUrl.replace(/\/$/, '');
  baseURL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('talentbridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept responses to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login or register endpoints
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('talentbridge_token');
        localStorage.removeItem('talentbridge_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
