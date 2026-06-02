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
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error("Не авторизований");

        const response = await fetch('http://localhost:3001/auth/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || 'Помилка оновлення профілю');
        }

        const result = await response.json();

        set((state) => ({
          user: state.user ? { ...state.user, ...result.user } : null,
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