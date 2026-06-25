import { create } from 'zustand';
import { api } from '../lib/api';
import type { Transaction } from '../types/transaction';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  
  fetchTransactions: () => Promise<void>;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  updateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const data = await api.transactions.getAll();
      set({ transactions: data });
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (newTransaction) => {
    try {
      const created = await api.transactions.create(newTransaction);
      set((state) => ({
        transactions: [created, ...state.transactions],
      }));
    } catch (error) {
      console.error('Failed to add transaction', error);
      throw error;
    }
  },

  updateTransaction: async (id, updatedData) => {
    try {
      const updated = await api.transactions.update(id, updatedData);
      set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? updated : t
        ),
      }));
    } catch (error) {
      console.error('Failed to update transaction', error);
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      await api.transactions.delete(id);
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete transaction', error);
      throw error;
    }
  },
}));
