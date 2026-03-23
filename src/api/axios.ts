import axios from 'axios';
import { API_URL } from '../config/env';
import { useAuthStore } from '../features/auth/store/useAuthStore';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpia la sesión si el servidor rechaza el token.
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
