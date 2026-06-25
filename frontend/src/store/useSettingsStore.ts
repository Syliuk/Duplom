import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "uk" | "en";
export type Currency = "UAH" | "USD" | "EUR";

interface SettingsState {
  language: Language;
  currency: Currency;

  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "uk",
      currency: "UAH",

      setLanguage: (language) => {
        document.documentElement.lang = language;
        set({ language });
      },
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "settings-storage",
    }
  )
);
