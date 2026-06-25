import { create } from 'zustand';
import { api } from '../lib/api';
import type { RecurringTransaction } from '../types/recurring';

interface RecurringState {
  recurring: RecurringTransaction[];
  isLoading: boolean;

  fetchRecurring: () => Promise<void>;
  addRecurring: (data: any) => Promise<void>;
  toggleActive: (id: number) => Promise<void>;
  deleteRecurring: (id: number) => Promise<void>;
}

export const useRecurringStore = create<RecurringState>((set) => ({
  recurring: [],
  isLoading: false,

  fetchRecurring: async () => {
    set({ isLoading: true });
    try {
      const data = await api.recurring.getAll();
      set({ recurring: data });
    } catch (error) {
      console.error('Failed to fetch recurring', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addRecurring: async (data) => {
    const newItem = await api.recurring.create(data);
    set((state) => ({ recurring: [newItem, ...state.recurring] }));
  },

  toggleActive: async (id) => {
    await api.recurring.toggle(id);
    set((state) => ({
      recurring: state.recurring.map(item =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    }));
  },

  deleteRecurring: async (id) => {
    await api.recurring.delete(id);
    set((state) => ({ recurring: state.recurring.filter(r => r.id !== id) }));
  },
}));