import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Currency } from "./useSettingsStore";

export type CurrencyRates = Record<Currency, number>;

const defaultRates: CurrencyRates = {
  UAH: 1,
  USD: 0.027,
  EUR: 0.025,
};

// UAH не підтримується Frankfurter (ECB не публікує UAH),
// тому беремо EUR як базу і перераховуємо через крос-курс.
// fawazahmed0 підтримує UAH напряму — він іде першим.

async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function tryFawazahmed(): Promise<CurrencyRates | null> {
  // https://github.com/fawazahmed0/exchange-api — без ключа, jsDelivr CDN
  const url =
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/uah.json";
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  const uah = data?.uah;
  if (!uah?.usd || !uah?.eur) return null;
  return {
    UAH: 1,
    USD: Number(uah.usd) || defaultRates.USD,
    EUR: Number(uah.eur) || defaultRates.EUR,
  };
}

async function tryFrankfurter(): Promise<CurrencyRates | null> {
  // https://frankfurter.dev — ECB дані, без ключа, без ліміту
  // Frankfurter не має UAH, тому беремо EUR→USD і EUR→UAH через USD
  // Насправді Frankfurter має UAH з версії v2
  const res = await fetchWithTimeout(
    "https://api.frankfurter.dev/v2/rates?base=UAH&symbols=USD,EUR"
  );
  if (!res.ok) return null;
  const data = await res.json();
  const rates = data?.rates;
  if (!rates?.USD || !rates?.EUR) return null;
  return {
    UAH: 1,
    USD: Number(rates.USD) || defaultRates.USD,
    EUR: Number(rates.EUR) || defaultRates.EUR,
  };
}

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
        if (now - get().lastUpdated < 3_600_000) return;

        set({ isLoading: true, error: null });

        try {
          // Спочатку fawazahmed (підтримує UAH напряму),
          // якщо впав — Frankfurter як резерв
          const rates =
            (await tryFawazahmed().catch(() => null)) ??
            (await tryFrankfurter().catch(() => null));

          if (!rates) {
            throw new Error("All currency API providers failed");
          }

          set({ rates, lastUpdated: now, isLoading: false, error: null });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err?.name === "AbortError"
                ? "Request timeout"
                : err?.message ?? "Unknown error",
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
