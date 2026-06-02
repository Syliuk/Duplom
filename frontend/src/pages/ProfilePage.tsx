import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useTransactionStore } from "../store/useTransactionStore";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../lib/i18n";
import { formatCurrency } from "../lib/utils";
import { User, LogOut, Edit2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const { user, logout, updateProfile } = useAuthStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { success, error, loading, dismiss } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Обчислення статистики
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpense;
  const transactionCount = transactions.length;

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Оновлення локальних полів при зміні user
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    const toastId = loading(t("profile.saving"));

    try {
      await updateProfile({ name, email });
      success(t("profile.saved"));
      setIsEditing(false);
    } catch (err: any) {
      error(err.message || t("profile.saveError"));
    } finally {
      dismiss(toastId);
    }
  };

  const handleLogout = () => {
    if (confirm(t("profile.logoutConfirm"))) {
      logout();
      navigate("/login");
      success(t("profile.loggedOut"));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("profile.title")}</h1>
        <p className="text-gray-600 mt-1">{t("profile.subtitle")}</p>
      </div>

      {/* Основна інформація */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Аватар */}
          <div className="flex-shrink-0">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center">
              <User size={56} className="text-white" />
            </div>
          </div>

          {/* Інформація */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
                <p className="text-gray-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400 transition"
              >
                {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                {isEditing ? t("common.cancel") : t("common.edit")}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t("auth.name")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">{t("auth.email")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl font-medium bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    {t("common.saveChanges")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400">{t("profile.transactions")}</p>
                  <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{transactionCount}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400">{t("profile.income")}</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400">{t("profile.expenses")}</p>
                  <p className="text-3xl font-bold mt-1 text-red-600">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Фінансова статистика */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-700">
        <h3 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white">{t("profile.financialOverview")}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500 text-sm">{t("profile.balanceLabel")}</p>
            <p className={`text-4xl font-bold mt-2 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: totalIncome + totalExpense > 0 ? `${(totalIncome / (totalIncome + totalExpense)) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{t("dashboard.income")}</p>
            </div>
            <div className="flex-1">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500" 
                  style={{ width: totalIncome + totalExpense > 0 ? `${(totalExpense / (totalIncome + totalExpense)) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{t("dashboard.expenses")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка виходу */}
      <div className="pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition mx-auto"
        >
          <LogOut size={20} />
          {t("profile.logout")}
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;