import type { translate } from "./i18n";

export type TransactionType = "income" | "expense";

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investments", "Gift", "Other"] as const;
export const EXPENSE_CATEGORIES = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Other"] as const;

type Translator = typeof translate extends (...args: any[]) => any
  ? (key: Parameters<typeof translate>[1]) => string
  : (key: string) => string;

const CATEGORY_LABEL_KEYS = {
  Salary: "common.salary",
  Freelance: "common.freelance",
  Business: "common.business",
  Investments: "common.investments",
  Gift: "common.gift",
  Other: "common.other",
  Food: "common.food",
  Transport: "common.transport",
  Entertainment: "common.entertainment",
  Bills: "common.bills",
  Shopping: "common.shopping",
  Debt: "common.debt",
  "Mono Import": "transactions.monoOperation",
} as const;

export type TransactionCategory = keyof typeof CATEGORY_LABEL_KEYS;

export function getCategoriesForType(type: TransactionType) {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getMergedCategoriesForType(type: TransactionType, customCategories: Array<{ name: string; type: TransactionType }> = []) {
  const defaults = [...getCategoriesForType(type)];
  const custom = customCategories
    .filter((category) => category.type === type)
    .map((category) => category.name.trim())
    .filter(Boolean);

  return [...defaults, ...custom].filter(
    (category, index, categories) => categories.indexOf(category) === index,
  );
}

export function isCategoryForType(category: string, type: TransactionType) {
  return (getCategoriesForType(type) as readonly string[]).includes(category);
}

export function isCategoryAvailableForType(
  category: string,
  type: TransactionType,
  customCategories: Array<{ name: string; type: TransactionType }> = [],
) {
  return getMergedCategoriesForType(type, customCategories).includes(category);
}

export function getCategoryLabel(category: string, t: Translator) {
  const key = CATEGORY_LABEL_KEYS[category as TransactionCategory];
  return key ? t(key) : category;
}
