import { create } from 'zustand';
import { api } from '../lib/api';
import type { Budget } from '../types/budget';

interface BudgetState {
  budgets: Budget[];
  isLoading: boolean;

  fetchBudgets: () => Promise<void>;
  addBudget: (data: any) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  isLoading: false,

  fetchBudgets: async () => {
    set({ isLoading: true });
    try {
      const data = await api.budgets.getAll();
      set({ budgets: data });
    } catch (error) {
      console.error('Failed to fetch budgets', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addBudget: async (data) => {
    const newBudget = await api.budgets.create(data);
    set((state) => ({ budgets: [...state.budgets, newBudget] }));
  },

  deleteBudget: async (id) => {
    await api.budgets.delete(id);
    set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) }));
  },
}));