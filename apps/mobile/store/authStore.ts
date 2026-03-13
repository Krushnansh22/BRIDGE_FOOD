import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'ngo' | 'admin';
  isVerified: boolean;
  isApproved: boolean;
  coordinates?: number[];
  address?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        const { token, refreshToken, user } = data.data;
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        set({ user, token, isLoading: false });
      } else {
        set({ error: data.error?.message || 'Login failed', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.error?.message || 'Login failed', isLoading: false });
      throw err;
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, token: null });
  },
  
  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await SecureStore.getItemAsync('user');
      
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  }
}));
