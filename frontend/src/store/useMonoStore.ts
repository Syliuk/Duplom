import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MonoAccount {
  id: string;
  balance: number;
  creditLimit: number;
  maskedPan: string[];
  type: string;
  currencyCode: number;
}

interface MonoState {
  monoToken: string | null;
  accounts: MonoAccount[];
  isLoading: boolean;
  lastFetchTime: number;

  setMonoToken: (token: string) => void;
  removeMonoToken: () => void;
  fetchClientInfo: () => Promise<void>;
  fetchStatement: (accountId: string, days?: number) => Promise<any[]>;
}

export const useMonoStore = create<MonoState>()(
  persist(
    (set, get) => ({
      monoToken: null,
      accounts: [],
      isLoading: false,
      lastFetchTime: 0,

      setMonoToken: (token) => {
        localStorage.setItem('mono_token', token);
        set({ monoToken: token, accounts: [], lastFetchTime: 0 });
      },

      removeMonoToken: () => {
        localStorage.removeItem('mono_token');
        set({ monoToken: null, accounts: [], lastFetchTime: 0 });
      },

      fetchClientInfo: async () => {
        const { monoToken, lastFetchTime, isLoading } = get();
        if (!monoToken) return;
        if (isLoading) return;

        const now = Date.now();
        if (now - lastFetchTime < 30000) {
          console.log("Monobank: надто рано для нового запиту (кеш)");
          return;
        }

        set({ isLoading: true });
        try {
          const res = await fetch('https://api.monobank.ua/personal/client-info', {
            headers: { 'X-Token': monoToken }
          });

          if (res.status === 429) {
            throw new Error("Занадто багато запитів. Почекайте 1 хвилину.");
          }
          if (!res.ok) {
            throw new Error("Невірний токен або помилка API");
          }

          const data = await res.json();
          const accounts = data.accounts?.map((acc: any) => ({
            id: acc.id,
            balance: acc.balance / 100,
            creditLimit: acc.creditLimit / 100,
            maskedPan: acc.maskedPan || [],
            type: acc.type,
            currencyCode: acc.currencyCode,
          })) || [];

          set({ accounts, lastFetchTime: now });
        } catch (err: any) {
          console.error(err);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchStatement: async (accountId: string, days = 31) => {
        const { monoToken } = get();
        if (!monoToken) throw new Error("Токен не знайдено");

        const to = Math.floor(Date.now() / 1000);
        const from = to - Math.min(days, 31) * 24 * 60 * 60;

        const res = await fetch(
          `https://api.monobank.ua/personal/statement/${accountId}/${from}/${to}`,
          {
            headers: { 'X-Token': monoToken },
            method: 'GET'
          }
        );

        if (res.status === 429) {
          throw new Error("Занадто багато запитів. Почекайте 30-60 секунд.");
        }

        if (!res.ok) {
          throw new Error(`Monobank API Error: ${res.status}`);
        }

        return res.json();
      },
    }),
    {
      name: 'mono-storage',
      partialize: (state) => ({
        monoToken: state.monoToken,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
);