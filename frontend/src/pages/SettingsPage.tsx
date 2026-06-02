import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Download, Trash2 } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { useSettingsStore, type Currency, type Language } from "../store/useSettingsStore";
import { useTransactionStore } from "../store/useTransactionStore";
import { useBudgetStore } from "../store/useBudgetStore";
import { useDebtStore } from "../store/useDebtStore";
import { useGoalStore } from "../store/useGoalStore";
import { useRecurringStore } from "../store/useRecurringStore";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../lib/i18n";
import { exportJsonData, exportDataToCSV } from "../lib/exportUtils";
import MonoIntegration from "../components/common/MonoIntegration";

function SettingsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { theme, toggleTheme } = useThemeStore();
  const { currency, language, setCurrency, setLanguage } = useSettingsStore();
  const { t } = useTranslation();
  const { success, error } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);

  const { transactions, fetchTransactions } = useTransactionStore();
  const { budgets, fetchBudgets } = useBudgetStore();
  const { debts, fetchDebts } = useDebtStore();
  const { goals, fetchGoals } = useGoalStore();
  const { recurring, fetchRecurring } = useRecurringStore();

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
    fetchDebts();
    fetchGoals();
    fetchRecurring();
  }, [fetchTransactions, fetchBudgets, fetchDebts, fetchGoals, fetchRecurring]);

  const handleDeleteAccount = () => {
    if (confirm(t("settings.deleteConfirm"))) {
      logout();
      navigate("/login");
      success(t("settings.deleteSuccess"));
    }
  };

  const handleExportJSON = () => {
    try {
      const rawData = {
        transactions,
        budgets,
        goals,
        debts,
        recurring,
        exportedAt: new Date().toISOString(),
      };

      exportJsonData(rawData, `financeflow-data-${new Date().toISOString().slice(0, 10)}.json`);
      success(t("settings.exportJsonSuccess"));
    } catch (err) {
      error(t("settings.exportJsonError"));
    }
  };

  const handleExportCSV = () => {
    try {
      exportDataToCSV(
        transactions,
        budgets,
        goals,
        debts,
        recurring,
        `financeflow-data-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      success(t("settings.exportCsvSuccess"));
    } catch (err) {
      error(t("settings.exportCsvError"));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("settings.title")}</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">{t("settings.subtitle")}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{t("settings.profile")}</h2>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center">
            <span className="text-4xl text-white font-medium">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-gray-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>

      <MonoIntegration />

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 space-y-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("settings.general")}</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{t("settings.currency")}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("settings.currencyHint")}</p>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-2.5"
          >
            <option value="UAH">{t("settings.hryvnia")} (UAH)</option>
            <option value="USD">{t("settings.dollar")} (USD)</option>
            <option value="EUR">{t("settings.euro")} (EUR)</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{t("settings.language")}</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-2.5"
          >
            <option value="uk">{t("settings.ukrainian")}</option>
            <option value="en">{t("settings.english")}</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{t("settings.theme")}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("settings.themeHint")}</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-800 transition text-gray-900 dark:text-white"
            aria-label={t("settings.theme")}
          >
            {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{t("settings.email")}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("settings.emailHint")}</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("settings.dataSecurity")}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 rounded-2xl hover:bg-black transition"
          >
            <Download size={20} />
            {t("settings.exportJson")}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 transition"
          >
            <Download size={20} />
            {t("settings.exportCsv")}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-center gap-3 text-red-600 hover:text-red-700 py-4 border border-red-200 dark:border-red-700 rounded-2xl bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950 transition"
          >
            <Trash2 size={20} />
            {t("settings.deleteAccount")}
          </button>
          <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-3">
            {t("settings.deleteHint")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
