import { create } from 'zustand';
import { api } from '../lib/api';
import type { Debt } from '../types/debt';

interface DebtState {
  debts: Debt[];
  isLoading: boolean;

  fetchDebts: () => Promise<void>;
  addDebt: (data: any) => Promise<void>;
  addPayment: (id: number, amount: number) => Promise<void>;
  deleteDebt: (id: number) => Promise<void>;
}

export const useDebtStore = create<DebtState>((set) => ({
  debts: [],
  isLoading: false,

  fetchDebts: async () => {
    set({ isLoading: true });
    try {
      const data = await api.debts.getAll();
      set({ debts: data });
    } catch (error) {
      console.error('Failed to fetch debts', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addDebt: async (data) => {
    const newDebt = await api.debts.create(data);
    set((state) => ({ debts: [newDebt, ...state.debts] }));
  },

  addPayment: async (id, amount) => {
    const updatedDebt = await api.debts.addPayment(id, amount);
    
    // Оновлюємо конкретний борг у store
    set((state) => ({
      debts: state.debts.map((debt) =>
        debt.id === id ? updatedDebt : debt
      ),
    }));
  },

  deleteDebt: async (id) => {
    await api.debts.delete(id);
    set((state) => ({ debts: state.debts.filter((d) => d.id !== id) }));
  },
}));