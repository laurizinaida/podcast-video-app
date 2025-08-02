import { create } from 'zustand';
import * as authService from '@/services/authService';

interface AuthState {
  user: authService.User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (credentials: authService.LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  login: async (credentials) => {
    try {
      const user = await authService.login(credentials);
      set({ user, status: 'authenticated' });
    } catch (error) {
      console.error("Login failed:", error);
      set({ user: null, status: 'unauthenticated' });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, status: 'unauthenticated' });
  },

  checkAuth: async () => {
    try {
      const session = await authService.getCurrentUser();
      if (session && session.user) {
        set({ user: session.user, status: 'authenticated' });
      } else {
        set({ user: null, status: 'unauthenticated' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ user: null, status: 'unauthenticated' });
    }
  },
}));