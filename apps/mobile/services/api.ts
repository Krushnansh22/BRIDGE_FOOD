import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Basic auto-refresh logic mock (omitted for brevity, can be expanded)
    // The server returns success: false, error: { message: "jwt expired" } usually
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { token: refreshToken });
          if (res.data?.success && res.data.data?.token) {
            await SecureStore.setItemAsync('token', res.data.data.token);
            originalRequest.headers.Authorization = `Bearer ${res.data.data.token}`;
            return axios(originalRequest);
          }
        }
      } catch (e) {
        // Refresh failed, logout
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
