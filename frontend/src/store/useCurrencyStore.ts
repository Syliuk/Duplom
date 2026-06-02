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

        // кеш 1 година
        if (now - get().lastUpdated < 3600000) return;

        set({ isLoading: true, error: null });

        try {
          const controller = new AbortController();

          const timeout = setTimeout(() => {
            controller.abort();
          }, 8000);

          const res = await fetch(
            "https://api.exchangerate.host/latest?base=UAH&symbols=USD,EUR",
            { signal: controller.signal }
          );

          clearTimeout(timeout);

          if (!res.ok) {
            throw new Error("Failed to fetch currency rates");
          }

          const data = await res.json();

          const rates: CurrencyRates = {
            UAH: 1,
            USD: Number(data?.rates?.USD) || defaultRates.USD,
            EUR: Number(data?.rates?.EUR) || defaultRates.EUR,
          };

          set({
            rates,
            lastUpdated: now,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error?.name === "AbortError"
                ? "Request timeout"
                : error?.message || "Unknown error",
          });
        }
      },
    }),
    {
      name: "currency-storage",
      partialize: (state) => ({
        rates: state.rates,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
