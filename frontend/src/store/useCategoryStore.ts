import { create } from "zustand";
import { api } from "../lib/api";
import type { Category } from "../types/category";
import type { TransactionType } from "../lib/transactionCategories";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (data: { name: string; type: TransactionType }) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const data = await api.categories.getAll();
      set({ categories: data });
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (data) => {
    const name = data.name.trim();
    if (!name) {
      throw new Error("Category name is required");
    }

    try {
      const created = await api.categories.create({
        name,
        category: name,
        categoryName: name,
        type: data.type,
      });
      set((state) => ({
        categories: [...state.categories, created],
      }));
      return created;
    } catch (error) {
      console.error("Failed to add category", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.categories.delete(id);
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete category", error);
      throw error;
    }
  },
}));
