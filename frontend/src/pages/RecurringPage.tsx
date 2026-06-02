import { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { useRecurringStore } from "../store/useRecurringStore";
import { useTranslation } from "../lib/i18n";
import { formatCurrency, formatDate } from "../lib/utils";
import { Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

function RecurringPage() {
  const { recurring, fetchRecurring, addRecurring, toggleActive, deleteRecurring } = useRecurringStore();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "Bills",
    frequency: "monthly" as "monthly" | "weekly" | "yearly",
    startDate: "",
  });

  // Завантажуємо регулярні платежі при вході на сторінку
  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.startDate) {
      error(t("recurring.required"));
      return;
    }

    try {
      await addRecurring({
        title: form.title,
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        frequency: form.frequency,
        startDate: form.startDate,
        isActive: true,
      });

      setForm({ 
        title: "", 
        amount: "", 
        type: "expense", 
        category: "Bills", 
        frequency: "monthly", 
        startDate: "" 
      });
      setIsModalOpen(false);
      success(t("recurring.added"));
    } catch (err: any) {
      error(err.message || t("recurring.addError"));
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
          onClick={() => setIsModalOpen(true)}
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
                  {item.category} • {item.frequency === "monthly" ? t("recurring.monthly") : item.frequency === "weekly" ? t("recurring.weekly") : t("recurring.yearly")}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{t("recurring.next")}: {formatDate(item.nextDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className={`font-bold text-xl ${item.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {item.type === "income" ? "+" : ""}{formatCurrency(item.amount)}
              </div>

              <button
                onClick={async () => {
                  await toggleActive(item.id);
                  success(item.isActive ? t("recurring.disabled") : t("recurring.enabled"));
                }}
                className="text-gray-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {item.isActive ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} />}
              </button>

              <button
                onClick={async () => {
                  await deleteRecurring(item.id);
                  success(t("recurring.deleted"));
                }}
                className="text-gray-400 hover:text-red-600"
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
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t("recurring.new")}</h2>
            
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
                    onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense" })}
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
                  <option value="Salary">{t("common.salary")}</option>
                  <option value="Bills">{t("common.bills")}</option>
                  <option value="Food">{t("common.food")}</option>
                  <option value="Transport">{t("common.transport")}</option>
                  <option value="Entertainment">{t("common.entertainment")}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("recurring.frequency")}</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                  >
                    <option value="monthly">{t("recurring.monthly")}</option>
                    <option value="weekly">{t("recurring.weekly")}</option>
                    <option value="yearly">{t("recurring.yearly")}</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("recurring.startDate")}</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold"
                >
                  {t("common.add")}
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