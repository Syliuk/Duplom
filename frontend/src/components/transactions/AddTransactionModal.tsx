import { useState, useEffect, useRef } from "react";
import { useToast } from "../../hooks/useToast";
import { useTransactionStore } from "../../store/useTransactionStore";
import { useCategoryStore } from "../../store/useCategoryStore";
import { useTranslation } from "../../lib/i18n";
import { MIN_TRANSACTION_DATE, getTodayDateInputValue, isDateInRange } from "../../lib/dateLimits";
import { getCategoriesForType, getMergedCategoriesForType, isCategoryAvailableForType, getCategoryLabel, isDefaultCategory } from "../../lib/transactionCategories";
import { Trash2 } from "lucide-react";
import type { Transaction } from "../../types/transaction";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

function AddTransactionModal({ isOpen, onClose, editingTransaction }: AddTransactionModalProps) {
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { categories, fetchCategories, addCategory, deleteCategory } = useCategoryStore();
  const { success, error, loading, dismiss } = useToast();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const maxTransactionDate = getTodayDateInputValue();
  const categoryOptions = getMergedCategoriesForType(type, categories);
  const customCategoryOptions = categories.filter(
    (item) => item.type === type && !isDefaultCategory(item.name, item.type),
  );

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [fetchCategories, isOpen]);

  useEffect(() => {
    isSubmittingRef.current = false;
    setIsSubmitting(false);

    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || "");
    } else {
      // Reset form
      setTitle("");
      setAmount("");
      setType("expense");
      setCategory("Food");
      setDate("");
      setNote("");
      setNewCategoryName("");
    }
  }, [editingTransaction, isOpen]);

  useEffect(() => {
    if (!isCategoryAvailableForType(category, type, categories)) {
      setCategory(getCategoriesForType(type)[0]);
    }
  }, [categories, category, type]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    if (!title || !amount || !date) {
      error(t("common.requiredFields"));
      return;
    }
    if (Number(amount) <= 0) {
      error(t("common.amountPositive"));
      return;
    }

    if (!isDateInRange(date, MIN_TRANSACTION_DATE, maxTransactionDate)) {
      error(`Дата транзакції має бути в межах від ${MIN_TRANSACTION_DATE} до ${maxTransactionDate}.`);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const transactionData = {
      title,
      amount: Number(amount),
      type,
      category,
      date,
      note: note || undefined,
    };

    const toastId = loading(editingTransaction ? t("transactions.editing") : t("transactions.adding"));

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
        success(t("transactions.updated"));
      } else {
        await addTransaction(transactionData);
        success(t("transactions.added"));
      }
      onClose();
    } catch (err: any) {
      error(err.message || t("transactions.saveError"));
    } finally {
      dismiss(toastId);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    setIsAddingCategory(true);
    try {
      const created = await addCategory({ name, type });
      setCategory(created.name);
      setNewCategoryName("");
      success(t("categories.added"));
    } catch (err: any) {
      error(err.message || t("categories.addError"));
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    setDeletingCategoryId(id);
    try {
      await deleteCategory(id);
      if (category === name) {
        setCategory(getCategoriesForType(type)[0]);
      }
      success(t("categories.deleted"));
    } catch (err: any) {
      error(err.message || t("categories.deleteError"));
    } finally {
      setDeletingCategoryId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white w-full max-w-lg rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {editingTransaction ? t("transactions.edit") : t("transactions.new")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ... (С„РѕСЂРјР° Р·Р°Р»РёС€Р°С”С‚СЊСЃСЏ С‚Р°РєР° Р¶, СЏРє Р±СѓР»Р° СЂР°РЅС–С€Рµ) */}
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.title")}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.amount")}</label>
              <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required
                className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.type")}</label>
              <select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}
                className="w-full bg-white text-slate-950 dark:bg-slate-800 dark:text-white border border-gray-400 dark:border-slate-600 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="income">{t("common.incomePlural")}</option>
                <option value="expense">{t("common.expensePlural")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.category")}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3">
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {getCategoryLabel(option, t)}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t("categories.newPlaceholder")}
                className="min-w-0 flex-1 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={isAddingCategory || !newCategoryName.trim()}
                className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isAddingCategory ? t("categories.adding") : t("categories.add")}
              </button>
            </div>
            {customCategoryOptions.length > 0 && (
              <div className="mt-3 space-y-2">
                {customCategoryOptions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-slate-700 px-3 py-2">
                    <span className="text-sm text-gray-700 dark:text-slate-200">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(item.id, item.name)}
                      disabled={deletingCategoryId === item.id}
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
            <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.date")}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={MIN_TRANSACTION_DATE} max={maxTransactionDate} required
              className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3" />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.note")}</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 resize-y" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 dark:border-slate-700 py-3.5 rounded-2xl font-medium bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-semibold">
              {editingTransaction ? t("common.saveChanges") : t("transactions.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransactionModal;

