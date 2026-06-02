import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Currency } from "./useSettingsStore";

export type CurrencyRates = Record<Currency, number>;

const defaultRates: CurrencyRates = {
  UAH: 1,
  USD: 0.027,
  EUR: 0.025,
};

interface CurrencyState {
  rates: CurrencyRates;
  lastUpdated: number;
  isLoading: boolean;
  error: string | null;
  fetchRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      rates: defaultRates,
      lastUpdated: 0,
      isLoading: false,
      error: null,
      fetchRates: async () => {
        const now = Date.now();
        if (now - get().lastUpdated < 3600000) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const res = await fetch(
            "https://api.exchangerate.host/latest?base=UAH&symbols=USD,EUR"
          );

          if (!res.ok) {
            throw new Error("Failed to fetch currency rates");
          }

          const data = await res.json();
          const rates: CurrencyRates = {
            UAH: 1,
            USD: data?.rates?.USD ?? defaultRates.USD,
            EUR: data?.rates?.EUR ?? defaultRates.EUR,
          };

          set({ rates, lastUpdated: now, isLoading: false, error: null });
        } catch (error: unknown) {
          set({ isLoading: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }),
    {
      name: "currency-storage",
      partialize: (state) => ({ rates: state.rates, lastUpdated: state.lastUpdated }),
    }
  )
);
