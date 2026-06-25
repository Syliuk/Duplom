import { useState, useEffect, useRef } from "react";
import { useToast } from "../hooks/useToast";
import { useRecurringStore } from "../store/useRecurringStore";
import { useCategoryStore } from "../store/useCategoryStore";
import { useTranslation } from "../lib/i18n";
import { formatCurrency, formatDate } from "../lib/utils";
import { MIN_HISTORICAL_DATE, MAX_PLANNING_DATE, isDateInRange } from "../lib/dateLimits";
import { getCategoriesForType, getCategoryLabel, getMergedCategoriesForType, isDefaultCategory } from "../lib/transactionCategories";
import { Edit2, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import type { RecurringTransaction } from "../types/recurring";

function RecurringPage() {
  const { recurring, fetchRecurring, addRecurring, updateRecurring, toggleActive, deleteRecurring } = useRecurringStore();
  const { categories, fetchCategories, addCategory, deleteCategory } = useCategoryStore();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [customFrequency, setCustomFrequency] = useState("");
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const pendingActionsRef = useRef<Set<string>>(new Set());

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "Bills",
    frequency: "monthly",
    startDate: "",
  });
  const categoryOptions = getMergedCategoriesForType(form.type, categories);
  const customCategoryOptions = categories.filter(
    (item) => item.type === form.type && !isDefaultCategory(item.name, item.type),
  );

  // Завантажуємо регулярні платежі при вході на сторінку
  useEffect(() => {
    fetchRecurring();
    fetchCategories();
  }, [fetchRecurring, fetchCategories]);

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

  const openRecurringModal = (item?: RecurringTransaction) => {
    if (item) {
      setEditingRecurring(item);
      setForm({
        title: item.title,
        amount: String(item.amount),
        type: item.type,
        category: item.category,
        frequency: item.frequency,
        startDate: item.startDate,
      });
      setCustomFrequency(["monthly", "weekly", "yearly"].includes(item.frequency) ? "" : item.frequency);
    } else {
      setEditingRecurring(null);
      setForm({ title: "", amount: "", type: "expense", category: "Bills", frequency: "monthly", startDate: "" });
      setCustomFrequency("");
    }
    setNewCategoryName("");
    setIsModalOpen(true);
  };

  const handleAddRecurringCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const actionKey = "add-recurring-category";
    if (!startAction(actionKey)) return;
    try {
      const created = await addCategory({ name, type: form.type });
      setForm({ ...form, category: created.name });
      setNewCategoryName("");
      success(t("categories.added"));
    } catch (err: any) {
      error(err.message || t("categories.addError"));
    } finally {
      finishAction(actionKey);
    }
  };

  const handleDeleteRecurringCategory = async (id: number, name: string) => {
    const actionKey = `delete-recurring-category-${id}`;
    if (!startAction(actionKey)) return;
    try {
      await deleteCategory(id);
      if (form.category === name) {
        setForm({ ...form, category: getCategoriesForType(form.type)[0] });
      }
      success(t("categories.deleted"));
    } catch (err: any) {
      error(err.message || t("categories.deleteError"));
    } finally {
      finishAction(actionKey);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.startDate) {
      error(t("recurring.required"));
      return;
    }
    if (Number(form.amount) <= 0) {
      error(t("common.amountPositive"));
      return;
    }
    if (form.frequency === "custom" || !form.frequency.trim()) {
      error(t("recurring.frequencyRequired"));
      return;
    }

    if (!isDateInRange(form.startDate, MIN_HISTORICAL_DATE, MAX_PLANNING_DATE)) {
      error(`Дата початку має бути в межах від ${MIN_HISTORICAL_DATE} до ${MAX_PLANNING_DATE}.`);
      return;
    }

    const actionKey = editingRecurring ? `edit-recurring-${editingRecurring.id}` : "add-recurring";
    if (!startAction(actionKey)) return;

    try {
      const payload = {
        title: form.title,
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        frequency: form.frequency,
        startDate: form.startDate,
        isActive: true,
      };

      if (editingRecurring) {
        await updateRecurring(editingRecurring.id, payload);
        success(t("recurring.updated"));
      } else {
        await addRecurring(payload);
        success(t("recurring.added"));
      }

      setForm({ 
        title: "", 
        amount: "", 
        type: "expense", 
        category: "Bills", 
        frequency: "monthly", 
        startDate: "" 
      });
      setEditingRecurring(null);
      setIsModalOpen(false);
    } catch (err: any) {
      error(err.message || t("recurring.addError"));
    } finally {
      finishAction(actionKey);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("recurring.title")}</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">{t("recurring.subtitle")}</p>
        </div>
        <button
          onClick={() => openRecurringModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700"
        >
          <Plus size={20} />
          {t("recurring.add")}
        </button>
      </div>

      <div className="grid gap-4">
        {recurring.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                {item.type === "income" ? "↑" : "↓"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {getCategoryLabel(item.category, t)} - {item.frequency === "monthly" ? t("recurring.monthly") : item.frequency === "weekly" ? t("recurring.weekly") : item.frequency === "yearly" ? t("recurring.yearly") : item.frequency}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{t("recurring.next")}: {formatDate(item.nextDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className={`font-bold text-xl ${item.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
              </div>

              <button
                onClick={() => openRecurringModal(item)}
                className="text-gray-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Edit2 size={20} />
              </button>

              <button
                onClick={async () => {
                  const actionKey = `toggle-recurring-${item.id}`;
                  if (!startAction(actionKey)) return;

                  try {
                    await toggleActive(item.id);
                    success(item.isActive ? t("recurring.disabled") : t("recurring.enabled"));
                  } finally {
                    finishAction(actionKey);
                  }
                }}
                disabled={pendingActions[`toggle-recurring-${item.id}`]}
                className="text-gray-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {item.isActive ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} />}
              </button>

              <button
                onClick={async () => {
                  const actionKey = `delete-recurring-${item.id}`;
                  if (!startAction(actionKey)) return;

                  try {
                    await deleteRecurring(item.id);
                    success(t("recurring.deleted"));
                  } finally {
                    finishAction(actionKey);
                  }
                }}
                disabled={pendingActions[`delete-recurring-${item.id}`]}
                className="text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {recurring.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            {t("recurring.empty")}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingRecurring ? t("recurring.edit") : t("recurring.new")}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("recurring.titleField")}</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.amount")}</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.type")}</label>
                  <select
                    value={form.type}
                    onChange={(e) => {
                      const nextType = e.target.value as "income" | "expense";
                      setForm({ ...form, type: nextType, category: getCategoriesForType(nextType)[0] });
                    }}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                  >
                    <option value="expense">{t("common.expense")}</option>
                    <option value="income">{t("common.income")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.category")}</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                >
                  {categoryOptions.map((category) => (
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
                    onClick={handleAddRecurringCategory}
                    disabled={pendingActions["add-recurring-category"] || !newCategoryName.trim()}
                    className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {t("categories.add")}
                  </button>
                </div>
                {customCategoryOptions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {customCategoryOptions.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-slate-700 px-3 py-2">
                        <span className="text-sm text-gray-700 dark:text-slate-200">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecurringCategory(item.id, item.name)}
                          disabled={pendingActions[`delete-recurring-category-${item.id}`]}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("recurring.frequency")}</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => {
                      const nextFrequency = e.target.value;
                      setForm({ ...form, frequency: nextFrequency });
                      if (nextFrequency !== "custom") setCustomFrequency("");
                    }}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                  >
                    <option value="monthly">{t("recurring.monthly")}</option>
                    <option value="weekly">{t("recurring.weekly")}</option>
                    <option value="yearly">{t("recurring.yearly")}</option>
                    {!["monthly", "weekly", "yearly", "custom"].includes(form.frequency) && (
                      <option value={form.frequency}>{form.frequency}</option>
                    )}
                    <option value="custom">{t("recurring.customFrequency")}</option>
                  </select>
                  {(form.frequency === "custom" || customFrequency) && (
                    <input
                      type="text"
                      value={customFrequency}
                      onChange={(e) => {
                        setCustomFrequency(e.target.value);
                        setForm({ ...form, frequency: e.target.value || "custom" });
                      }}
                      placeholder={t("recurring.customFrequencyPlaceholder")}
                      className="mt-3 w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                    />
                  )}
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("recurring.startDate")}</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    min={MIN_HISTORICAL_DATE}
                    max={MAX_PLANNING_DATE}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRecurring(null);
                  }}
                  className="flex-1 py-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={pendingActions["add-recurring"] || Boolean(editingRecurring && pendingActions[`edit-recurring-${editingRecurring.id}`])}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {editingRecurring ? t("common.saveChanges") : t("common.add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecurringPage;
