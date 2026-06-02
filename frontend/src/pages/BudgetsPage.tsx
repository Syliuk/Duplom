import { useState, useMemo, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { useTransactionStore } from "../store/useTransactionStore";
import { useBudgetStore } from "../store/useBudgetStore";
import { useTranslation } from "../lib/i18n";
import { formatCurrency } from "../lib/utils";
import { Plus, Trash2, Edit2 } from "lucide-react";

function BudgetsPage() {
  const { transactions } = useTransactionStore();
  const { budgets, fetchBudgets, deleteBudget } = useBudgetStore();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");

  // Завантажуємо бюджети при вході на сторінку
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const spentByCategory = useMemo(() => {
    return transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  const handleAddBudget = async () => {
    if (!newBudgetCategory || !newBudgetAmount) {
      error(t("budgets.required"));
      return;
    }

    try {
      await useBudgetStore.getState().addBudget({
        category: newBudgetCategory,
        amount: Number(newBudgetAmount),
        period: "monthly",
      });

      setNewBudgetCategory("");
      setNewBudgetAmount("");
      setIsModalOpen(false);
      success(t("budgets.added"));
    } catch (err: any) {
      error(err.message || t("budgets.addError"));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("budgets.title")}</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">{t("budgets.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          {t("budgets.add")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const spent = spentByCategory[budget.category] || 0;
          const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
          const isOverBudget = spent > budget.amount;

          return (
            <div key={budget.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white">{budget.category}</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">{t("budgets.monthlyBudget")}</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={async () => {
                      await deleteBudget(budget.id);
                      success(t("budgets.deleted"));
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>{t("budgets.spent")}</span>
                  <span className="font-medium">
                    {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>

                <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${isOverBudget ? "bg-red-500" : "bg-blue-600"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{percentage}% {t("budgets.used")}</span>
                  {isOverBudget && <span className="text-red-500 font-medium">{t("budgets.overBudget")}</span>}
                </div>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-400 dark:text-slate-500">
            {t("budgets.empty")}
          </div>
        )}
      </div>

      {/* Modal — залишається без змін */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t("budgets.new")}</h2>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.category")}</label>
                <select
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                >
                  <option value="">{t("budgets.chooseCategory")}</option>
                  <option value="Food">{t("common.food")}</option>
                  <option value="Transport">{t("common.transport")}</option>
                  <option value="Entertainment">{t("common.entertainment")}</option>
                  <option value="Bills">{t("common.bills")}</option>
                  <option value="Shopping">{t("common.shopping")}</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("budgets.amount")} (₴)</label>
                <input
                  type="number"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                  placeholder={t("budgets.amountPlaceholder")}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleAddBudget}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold"
                >
                  {t("common.add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetsPage;