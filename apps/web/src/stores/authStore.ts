import { create } from 'zustand';
import * as authService from '@/services/authService';
import { User } from '@/packages/shared/types/user';

interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (credentials: authService.LoginCredentials) => Promise<void>;
  register: (credentials: authService.RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'unauthenticated',
  login: async (credentials) => {
    set({ status: 'loading' });
    try {
      const user = await authService.login(credentials);
      set({ user, status: 'authenticated' });
    } catch (error) {
      set({ user: null, status: 'unauthenticated' });
      throw error;
    }
  },
  register: async (credentials) => {
    set({ status: 'loading' });
    try {
      const user = await authService.register(credentials);
      // After registering, we treat them as logged in
      set({ user, status: 'authenticated' });
    } catch (error) {
      set({ user: null, status: 'unauthenticated' });
      throw error;
    }
  },
  logout: async () => {
    set({ status: 'loading' });
    try {
      await authService.logout();
      set({ user: null, status: 'unauthenticated' });
    } catch (error) {
      // Even if logout API fails, we force the client to be unauthenticated
      set({ user: null, status: 'unauthenticated' });
    }
  },
  checkAuth: async () => {
    try {
      const user = await authService.getMe();
      if (user) {
        set({ user, status: 'authenticated' });
      } else {
        set({ user: null, status: 'unauthenticated' });
      }
    } catch (error) {
      set({ user: null, status: 'unauthenticated' });
    }
  },
}));
