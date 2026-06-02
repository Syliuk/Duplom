import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTransactionStore } from "../store/useTransactionStore";
import { useDebtStore } from "../store/useDebtStore";
import { useRecurringStore } from "../store/useRecurringStore";
import { useMonoStore } from "../store/useMonoStore";
import BalanceCard from "../components/dashboard/BalanceCard";
import StatsCard from "../components/dashboard/StatsCard";
import ExpenseChart from "../components/dashboard/ExpenseChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import { formatCurrency } from "../lib/utils";
import { useTranslation } from "../lib/i18n";
import {
  Wallet,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  AlertTriangle,
  CreditCard
} from "lucide-react";

function DashboardPage() {
  const { t } = useTranslation();
  const { transactions = [], fetchTransactions } = useTransactionStore();
  const { debts = [], fetchDebts } = useDebtStore();
  const { recurring = [], fetchRecurring } = useRecurringStore();
  const { monoToken, accounts, fetchClientInfo } = useMonoStore();

  useEffect(() => {
    fetchTransactions();
    fetchDebts();
    fetchRecurring();
  }, [fetchTransactions, fetchDebts, fetchRecurring]);

  useEffect(() => {
    if (!monoToken) return;
    let cancelled = false;

    fetchClientInfo().catch((err) => {
      if (!cancelled) console.error(err);
    });

    return () => { cancelled = true; };
  }, [monoToken, fetchClientInfo]);

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpenses;

  const totalDebt = debts
    .filter(d => d.type === "borrow")
    .reduce((sum, d) => sum + ((Number(d.amount) || 0) - (Number(d.currentAmount) || 0)), 0);

  const activeRecurring = recurring.filter(r => r.isActive);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t("dashboard.title")}</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-2">{t("dashboard.subtitle")}</p>
      </div>

      {monoToken && accounts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <CreditCard size={22} /> {t("dashboard.monobankCards")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc, index) => {
              let cardNumber = "**** **** **** ****";

              if (acc.maskedPan && acc.maskedPan.length > 0) {
                const pan = acc.maskedPan[0];
                if (typeof pan === "string" && pan.length > 8) {
                  cardNumber = pan.replace(/(.{4})/g, "$1 ").trim();
                } else if (Array.isArray(acc.maskedPan) && acc.maskedPan.length >= 4) {
                  cardNumber = `${acc.maskedPan[0]} **** **** ${acc.maskedPan[acc.maskedPan.length - 1]}`;
                }
              }

              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">MONOBANK</p>
                      <p className="font-mono text-[22px] tracking-widest mt-4 font-medium">
                        {cardNumber}
                      </p>
                    </div>
                    <CreditCard size={32} className="opacity-75" />
                  </div>

                  <div className="mt-10">
                    <p className="text-blue-100 text-sm">{t("dashboard.available")}</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatCurrency(acc.balance)}
                    </p>
                  </div>

                  {acc.creditLimit > 0 && (
                    <p className="text-xs text-blue-200 mt-1">
                      {t("dashboard.creditLimit")}: {formatCurrency(acc.creditLimit)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BalanceCard
          title={t("dashboard.balance")}
          amount={formatCurrency(balance)}
          icon={<Wallet size={32} />}
          trend={balance >= 0 ? "positive" : "negative"}
        />
        <BalanceCard
          title={t("dashboard.income")}
          amount={formatCurrency(totalIncome)}
          icon={<ArrowUp size={32} className="text-green-600" />}
          trend="positive"
        />
        <BalanceCard
          title={t("dashboard.expenses")}
          amount={formatCurrency(totalExpenses)}
          icon={<ArrowDown size={32} className="text-red-600" />}
          trend="negative"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title={t("dashboard.transactionCount")}
          value={transactions.length.toString()}
        />
        <StatsCard
          title={t("dashboard.activeRecurring")}
          value={activeRecurring.length.toString()}
        />
        <StatsCard
          title={t("dashboard.totalDebt")}
          value={formatCurrency(totalDebt)}
        />
      </div>

      {totalDebt > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center gap-4">
          <AlertTriangle className="text-amber-600" size={28} />
          <div>
            <p className="font-medium text-amber-800">{t("dashboard.debtWarningTitle")}</p>
            <p className="text-amber-700 text-sm">
              {t("dashboard.debtWarningText")}: <span className="font-semibold">{formatCurrency(totalDebt)}</span>
            </p>
            <Link to="/debts" className="text-amber-700 hover:text-amber-800 underline text-sm mt-1 inline-block">
              {t("dashboard.goToDebts")} →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4">
          <ExpenseChart />
        </div>
        <div className="lg:col-span-3">
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/recurring"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">{t("dashboard.recurringTitle")}</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{t("dashboard.recurringSubtitle")}</p>
            </div>
            <TrendingUp className="text-blue-600 group-hover:scale-110 transition" size={32} />
          </div>
          <p className="mt-4 text-sm text-blue-600 font-medium">{t("dashboard.goTo")} →</p>
        </Link>

        <Link
          to="/debts"
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">{t("dashboard.debtsTitle")}</p>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{t("dashboard.debtsSubtitle")}</p>
            </div>
            <AlertTriangle className="text-red-600 group-hover:scale-110 transition" size={32} />
          </div>
          <p className="mt-4 text-sm text-red-600 font-medium">{t("dashboard.goTo")} →</p>
        </Link>
      </div>
    </div>
  );
}

export default DashboardPage;
