import { create } from 'zustand';
import { api } from '../lib/api';
import type { Goal } from '../types/goal';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;

  fetchGoals: () => Promise<void>;
  addGoal: (data: any) => Promise<void>;
  addContribution: (id: number, amount: number) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set) => ({
  goals: [],
  isLoading: false,

  fetchGoals: async () => {
    set({ isLoading: true });
    try {
      const data = await api.goals.getAll();
      set({ goals: data });
    } catch (error) {
      console.error('Failed to fetch goals', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addGoal: async (data) => {
    const newGoal = await api.goals.create(data);
    set((state) => ({ goals: [...state.goals, newGoal] }));
  },

  addContribution: async (id, amount) => {
    const updated = await api.goals.addContribution(id, amount);
    set((state) => ({
      goals: state.goals.map(g => g.id === id ? updated : g)
    }));
  },

  deleteGoal: async (id) => {
    await api.goals.delete(id);
    set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));
  },
}));