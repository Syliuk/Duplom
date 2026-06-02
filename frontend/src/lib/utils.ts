import { useSettingsStore } from "../store/useSettingsStore";
import { useCurrencyStore, type CurrencyRates } from "../store/useCurrencyStore";

const convertCurrency = (amount: number, currency: string, rates: CurrencyRates): number => {
  if (currency === "UAH") {
    return amount;
  }

  const rate = rates[currency as keyof CurrencyRates] ?? 1;
  return amount * rate;
};

export const formatCurrency = (amount: number): string => {
  const { language, currency } = useSettingsStore.getState();
  const { rates } = useCurrencyStore.getState();
  const convertedAmount = convertCurrency(amount, currency, rates);

  return new Intl.NumberFormat(language === "uk" ? "uk-UA" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "UAH" ? 0 : 2,
    maximumFractionDigits: currency === "UAH" ? 0 : 2,
  }).format(convertedAmount);
};

export const formatDate = (dateString: string): string => {
  const { language } = useSettingsStore.getState();

  return new Intl.DateTimeFormat(language === "uk" ? "uk-UA" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
};
