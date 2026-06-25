import { useEffect } from "react";
import { useTranslation } from "../../lib/i18n";
import { MIN_TRANSACTION_DATE, getTodayDateInputValue } from "../../lib/dateLimits";
import { useCategoryStore } from "../../store/useCategoryStore";
import { getMergedCategoriesForType, getCategoryLabel, isCategoryAvailableForType } from "../../lib/transactionCategories";

interface TransactionFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterType: "all" | "income" | "expense";
  setFilterType: (value: "all" | "income" | "expense") => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  sortOrder: "desc" | "asc";
  setSortOrder: (value: "desc" | "asc") => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  resetFilters: () => void;
}

function TransactionFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  sortOrder,
  setSortOrder,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  resetFilters,
}: TransactionFiltersProps) {
  const { t } = useTranslation();
  const { categories, fetchCategories } = useCategoryStore();
  const maxTransactionDate = getTodayDateInputValue();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const categoryOptions = filterType === "all"
    ? [...getMergedCategoriesForType("income", categories), ...getMergedCategoriesForType("expense", categories)].filter(
        (category, index, categories) => categories.indexOf(category) === index,
      )
    : getMergedCategoriesForType(filterType, categories);

  const handleTypeChange = (nextType: "all" | "income" | "expense") => {
    setFilterType(nextType);
    if (nextType !== "all" && filterCategory !== "all" && !isCategoryAvailableForType(filterCategory, nextType, categories)) {
      setFilterCategory("all");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 flex-1">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200">{t("transactions.search")}</label>
            <input
              type="text"
              placeholder={t("transactions.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200">{t("common.type")}</label>
            <select
              value={filterType}
              onChange={(e) => handleTypeChange(e.target.value as "all" | "income" | "expense")}
              className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="all">{t("transactions.allTypes")}</option>
              <option value="income">{t("common.incomePlural")}</option>
              <option value="expense">{t("common.expensePlural")}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200">{t("common.category")}</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="all">{t("transactions.allCategories")}</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category, t)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-end justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-gray-50 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          >
            {t("transactions.resetFilters")}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-200">Сортування за датою</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="desc">Спочатку новіші</option>
            <option value="asc">Спочатку старіші</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-200">{t("transactions.dateFrom")}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            min={MIN_TRANSACTION_DATE}
            max={dateTo || maxTransactionDate}
            className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-200">{t("transactions.dateTo")}</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || MIN_TRANSACTION_DATE}
            max={maxTransactionDate}
            className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default TransactionFilters;
