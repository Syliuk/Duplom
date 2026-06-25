import { useState, useEffect, useRef } from "react";
import { useToast } from "../../hooks/useToast";
import { useTransactionStore } from "../../store/useTransactionStore";
import { useTranslation } from "../../lib/i18n";
import { MIN_TRANSACTION_DATE, getTodayDateInputValue, isDateInRange } from "../../lib/dateLimits";
import type { Transaction } from "../../types/transaction";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
}

function AddTransactionModal({ isOpen, onClose, editingTransaction }: AddTransactionModalProps) {
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { success, error, loading, dismiss } = useToast();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const maxTransactionDate = getTodayDateInputValue();

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
    }
  }, [editingTransaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;

    if (!title || !amount || !date) {
      error(t("common.requiredFields"));
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
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required
                className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.type")}</label>
              <select value={type} onChange={(e) => setType(e.target.value as "income" | "expense")}
                className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3">
                <option value="income">{t("common.incomePlural")}</option>
                <option value="expense">{t("common.expensePlural")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("common.category")}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3">
<option value="Salary">{t("common.salary")}</option>
                <option value="Food">{t("common.food")}</option>
                <option value="Transport">{t("common.transport")}</option>
                <option value="Entertainment">{t("common.entertainment")}</option>
                <option value="Bills">{t("common.bills")}</option>
                <option value="Shopping">{t("common.shopping")}</option>
            </select>
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

