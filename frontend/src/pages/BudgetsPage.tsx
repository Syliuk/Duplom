import { useState, useMemo, useEffect, useRef } from "react";
import { useToast } from "../hooks/useToast";
import { useTransactionStore } from "../store/useTransactionStore";
import { useBudgetStore } from "../store/useBudgetStore";
import { useCategoryStore } from "../store/useCategoryStore";
import { useTranslation } from "../lib/i18n";
import { formatCurrency } from "../lib/utils";
import { getMergedCategoriesForType, getCategoryLabel, isDefaultCategory } from "../lib/transactionCategories";
import { Plus, Trash2, Edit2 } from "lucide-react";
import type { Budget } from "../types/budget";

function BudgetsPage() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const { budgets, fetchBudgets, deleteBudget, updateBudget } = useBudgetStore();
  const { categories, fetchCategories, addCategory, deleteCategory } = useCategoryStore();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newBudgetCategory, setNewBudgetCategory] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const pendingActionsRef = useRef<Set<string>>(new Set());

  // Завантажуємо бюджети при вході на сторінку
  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
    fetchCategories();
  }, [fetchTransactions, fetchBudgets, fetchCategories]);

  const expenseCategoryOptions = getMergedCategoriesForType("expense", categories);
  const customExpenseCategories = categories.filter(
    (item) => item.type === "expense" && !isDefaultCategory(item.name, item.type),
  );

  const startAction = (key: string) => {
    if (pendingActionsRef.current.has(key)) return false;
    pendingActionsRef.current.add(key);
    setPendingActions((actions) => ({ ...actions, [key]: true }));
    return true;
  };

  const finishAction = (key: string) => {
    pendingActionsRef.current.delete(key);
    setPendingActions((actions) => ({ ...actions, [key]: false }));
  };

  const spentByCategory = useMemo(() => {
    return transactions
      .filter(t => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
  }, [transactions]);

  const openBudgetModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setNewBudgetCategory(budget.category);
      setNewBudgetAmount(String(budget.amount));
    } else {
      setEditingBudget(null);
      setNewBudgetCategory("");
      setNewBudgetAmount("");
    }
    setNewCategoryName("");
    setIsModalOpen(true);
  };

  const handleAddBudgetCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    const actionKey = "add-budget-category";
    if (!startAction(actionKey)) return;
    try {
      const created = await addCategory({ name, type: "expense" });
      setNewBudgetCategory(created.name);
      setNewCategoryName("");
      success(t("categories.added"));
    } catch (err: any) {
      error(err.message || t("categories.addError"));
    } finally {
      finishAction(actionKey);
    }
  };

  const handleDeleteBudgetCategory = async (id: number, name: string) => {
    const actionKey = `delete-budget-category-${id}`;
    if (!startAction(actionKey)) return;
    try {
      await deleteCategory(id);
      if (newBudgetCategory === name) {
        setNewBudgetCategory("");
      }
      success(t("categories.deleted"));
    } catch (err: any) {
      error(err.message || t("categories.deleteError"));
    } finally {
      finishAction(actionKey);
    }
  };

  const handleSaveBudget = async () => {
    if (!newBudgetCategory || !newBudgetAmount) {
      error(t("budgets.required"));
      return;
    }
    if (Number(newBudgetAmount) <= 0) {
      error(t("common.amountPositive"));
      return;
    }

    const actionKey = editingBudget ? `edit-budget-${editingBudget.id}` : "add-budget";
    if (!startAction(actionKey)) return;

    try {
      const payload = {
        category: newBudgetCategory,
        amount: Number(newBudgetAmount),
        period: "monthly",
      };

      if (editingBudget) {
        await updateBudget(editingBudget.id, payload);
        success(t("budgets.updated"));
      } else {
        await useBudgetStore.getState().addBudget(payload);
        success(t("budgets.added"));
      }

      setNewBudgetCategory("");
      setNewBudgetAmount("");
      setEditingBudget(null);
      setIsModalOpen(false);
    } catch (err: any) {
      error(err.message || t("budgets.addError"));
    } finally {
      finishAction(actionKey);
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
          onClick={() => openBudgetModal()}
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
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-white">{getCategoryLabel(budget.category, t)}</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">{t("budgets.monthlyBudget")}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openBudgetModal(budget)} className="text-gray-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={async () => {
                      const actionKey = `delete-budget-${budget.id}`;
                      if (!startAction(actionKey)) return;

                      try {
                        await deleteBudget(budget.id);
                        success(t("budgets.deleted"));
                      } finally {
                        finishAction(actionKey);
                      }
                    }}
                    disabled={pendingActions[`delete-budget-${budget.id}`]}
                    className="text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingBudget ? t("budgets.edit") : t("budgets.new")}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.category")}</label>
                <select
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                >
                  <option value="">{t("budgets.chooseCategory")}</option>
                  {expenseCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryLabel(category, t)}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={t("categories.newPlaceholder")}
                    className="min-w-0 flex-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                  />
                  <button
                    type="button"
                    onClick={handleAddBudgetCategory}
                    disabled={pendingActions["add-budget-category"] || !newCategoryName.trim()}
                    className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {t("categories.add")}
                  </button>
                </div>
                {customExpenseCategories.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {customExpenseCategories.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-slate-700 px-3 py-2">
                        <span className="text-sm text-gray-700 dark:text-slate-200">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteBudgetCategory(item.id, item.name)}
                          disabled={pendingActions[`delete-budget-category-${item.id}`]}
                          className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={t("categories.delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("budgets.amount")} (₴)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                  placeholder={t("budgets.amountPlaceholder")}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBudget(null);
                  }}
                  className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleSaveBudget}
                  disabled={pendingActions["add-budget"] || Boolean(editingBudget && pendingActions[`edit-budget-${editingBudget.id}`])}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {editingBudget ? t("common.saveChanges") : t("common.add")}
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
