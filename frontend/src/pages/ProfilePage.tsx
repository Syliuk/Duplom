import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useTransactionStore } from "../store/useTransactionStore";
import { useToast } from "../hooks/useToast";
import { useTranslation } from "../lib/i18n";
import { formatCurrency } from "../lib/utils";
import { Camera, User, LogOut, Edit2, Save, X } from "lucide-react";
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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profilePhoto || null);
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      setProfilePhoto(user.profilePhoto || null);
    }
  }, [user]);

  const handleSave = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);

    const toastId = loading(t("profile.saving"));

    try {
      await updateProfile({ name, email, profilePhoto });
      success(t("profile.saved"));
      setIsEditing(false);
    } catch (err: any) {
      error(err.message || t("profile.saveError"));
    } finally {
      dismiss(toastId);
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setProfilePhoto(user?.profilePhoto || null);
    setIsEditing(false);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Оберіть файл зображення.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      error("Фото має бути не більше 1 МБ.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
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
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={user?.name || t("profile.title")} className="w-full h-full object-cover" />
                ) : (
                  <User size={56} className="text-white" />
                )}
              </div>

              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
                    aria-label="Змінити фото профілю"
                    title="Змінити фото профілю"
                  >
                    <Camera size={18} />
                  </button>
                </>
              )}
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
                onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
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
                    onClick={handleCancelEdit}
                    className="flex-1 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl font-medium bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          <div className="flex flex-col justify-center">
            <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-green-500"
                style={{ width: totalIncome + totalExpense > 0 ? `${(totalIncome / (totalIncome + totalExpense)) * 100}%` : '0%' }}
              />
              <div
                className="h-full bg-red-500"
                style={{ width: totalIncome + totalExpense > 0 ? `${(totalExpense / (totalIncome + totalExpense)) * 100}%` : '0%' }}
              />
            </div>

            <div className="flex justify-between gap-4 text-xs text-gray-500 dark:text-slate-400 mt-2">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {t("dashboard.income")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {t("dashboard.expenses")}
              </span>
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
