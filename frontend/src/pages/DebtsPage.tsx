import { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { useDebtStore } from "../store/useDebtStore";
import { useTranslation } from "../lib/i18n";
import { formatCurrency, formatDate } from "../lib/utils";
import { Plus, Trash2, TrendingUp } from "lucide-react";

function DebtsPage() {
  const { debts, fetchDebts, addDebt, addPayment, deleteDebt } = useDebtStore();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "borrow" as "borrow" | "lend",
    person: "",
    dueDate: "",
    note: "",
  });

  // Завантаження боргів
  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.person || !form.dueDate) {
      error(t("debts.required"));
      return;
    }

    try {
      await addDebt({
        title: form.title,
        amount: Number(form.amount),
        type: form.type,
        person: form.person,
        dueDate: form.dueDate,
        note: form.note || undefined,
      });

      setForm({ title: "", amount: "", type: "borrow", person: "", dueDate: "", note: "" });
      setIsModalOpen(false);
      success(t("debts.added"));
    } catch (err: any) {
      error(err.message || t("debts.addError"));
    }
  };

    const handlePayment = async (debtId: number) => {
      if (!paymentAmount || Number(paymentAmount) <= 0) {
        error(t("debts.paymentRequired"));
        return;
      }

      try {
        await addPayment(debtId, Number(paymentAmount)); 
        success(t("debts.paymentAdded"));
        setPaymentModal(null);
        setPaymentAmount("");
      } catch (err: any) {
        error(err.message || t("debts.paymentError"));
      }
    };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("debts.title")}</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">{t("debts.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          {t("debts.add")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {debts.map((debt) => {
          const progress = Math.min(
            Math.round((debt.currentAmount / debt.amount) * 100),
            100
          );

          return (
            <div key={debt.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-xl">{debt.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{debt.person}</p>
                </div>
                <button
                  onClick={async () => {
                    await deleteDebt(debt.id);
                    success(t("debts.deleted"));
                  }}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>{t("debts.amount")}</span>
                  <span className="font-medium">{formatCurrency(debt.amount)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{t("debts.paid")}</span>
                  <span>{formatCurrency(debt.currentAmount)} / {formatCurrency(debt.amount)}</span>
                </div>

                <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all ${debt.type === "borrow" ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-between items-center text-sm">
                <p>
                  {t("debts.due")}: <span className="font-medium">{formatDate(debt.dueDate)}</span>
                </p>

                <button
                  onClick={() => setPaymentModal(debt.id)}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <TrendingUp size={18} />
                  {t("debts.pay")}
                </button>
              </div>
            </div>
          );
        })}

        {debts.length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-400 dark:text-slate-500">
            {t("debts.empty")}
          </div>
        )}
      </div>

      {/* Modal додавання боргу */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6">{t("debts.new")}</h2>

            <form onSubmit={handleAddDebt} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">{t("debts.titleField")}</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">{t("common.amount")}</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    className="w-full px-4 py-3 border rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">{t("common.type")}</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "borrow" | "lend" })}
                    className="w-full px-4 py-3 border rounded-2xl"
                  >
                    <option value="borrow">{t("debts.borrow")}</option>
                    <option value="lend">{t("debts.lend")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">{t("debts.person")}</label>
                <input
                  type="text"
                  value={form.person}
                  onChange={(e) => setForm({ ...form, person: e.target.value })}
                  required
                  className="w-full px-4 py-3 border rounded-2xl"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">{t("debts.dueDate")}</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  required
                  className="w-full px-4 py-3 border rounded-2xl"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border rounded-2xl"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-semibold"
                >
                  {t("common.add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal платежу */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-5">{t("debts.addPayment")}</h2>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={t("debts.paymentPlaceholder")}
              className="w-full px-4 py-3 border rounded-2xl mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPaymentModal(null);
                  setPaymentAmount("");
                }}
                className="flex-1 py-3 border rounded-2xl"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => handlePayment(paymentModal)}
                className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-semibold"
              >
                {t("debts.pay")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DebtsPage;