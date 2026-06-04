import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,

      updateProfile: async (data: { name?: string; email?: string }) => {
        const response = await api.auth.updateProfile(data);

        set((state) => ({
          user: state.user ? { ...state.user, ...response.user } : null,
        }));
      },

      login: async (email, password) => {
        const response = await api.auth.login({ email, password });
        localStorage.setItem('access_token', response.access_token);
        
        set({
          user: response.user,
          isAuthenticated: true,
          accessToken: response.access_token,
        });
      },

      register: async (name, email, password) => {
        const response = await api.auth.register({ name, email, password });
        localStorage.setItem('access_token', response.access_token);
        
        set({
          user: response.user,
          isAuthenticated: true,
          accessToken: response.access_token,
        });
      },

      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false, accessToken: null });
      },
    }),
    {
      name: 'finance-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken 
      }),
    }
  )
);
