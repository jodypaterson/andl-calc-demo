import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User, LoginResponse } from '../types/auth.types';
import apiClient from '../lib/api-client';

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      try {
        const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
        const { user, accessToken } = response.data;
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await apiClient.post('/auth/logout');
        get().clearAuth();
      } catch (error) {
        // Clear auth even if logout request fails
        get().clearAuth();
      }
    },

    refreshToken: async (): Promise<boolean> => {
      try {
        const response = await apiClient.post<LoginResponse>('/auth/refresh');
        const { user, accessToken } = response.data;
        set({ user, accessToken, isAuthenticated: true });
        return true;
      } catch (error) {
        get().clearAuth();
        return false;
      }
    },

    setUser: (user: User | null) => {
      set({ user, isAuthenticated: !!user });
    },

    clearAuth: () => {
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    },
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({
      user: state.user,
      // Do NOT persist tokens for security
    }),
  }
));
