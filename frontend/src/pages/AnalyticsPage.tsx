import { useMemo, useEffect } from "react";
import { useTransactionStore } from "../store/useTransactionStore";
import { useTranslation } from "../lib/i18n";
import { formatCurrency } from "../lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function AnalyticsPage() {
  const { transactions, fetchTransactions } = useTransactionStore();
  const { t } = useTranslation();

  // Завантажуємо транзакції при вході на сторінку
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Динаміка по місяцях
  const monthlyData = useMemo(() => {
    const grouped = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { 
          month: monthKey.slice(5) + "." + monthKey.slice(0,4), 
          income: 0, 
          expense: 0 
        };
      }
      
      if (t.type === "income") {
        acc[monthKey].income += t.amount;
      } else {
        acc[monthKey].expense += t.amount;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  // Витрати по категоріях
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense");
    const byCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(byCategory)
      .map(([name, value], index) => ({ 
        name, 
        value, 
        color: COLORS[index % COLORS.length] 
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("analytics.title")}</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">{t("analytics.subtitle")}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{t("analytics.totalBalance")}</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Динаміка доходів і витрат */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{t("analytics.monthlyTrend")}</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                formatter={(value) => [
                  formatCurrency(value as number), 
                  ""
                ]} 
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={4} 
                dot={{ r: 5 }}
                name={t("analytics.income")}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={4} 
                dot={{ r: 5 }}
                name={t("analytics.expense")}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[380px] flex items-center justify-center text-gray-400">
            {t("analytics.noChartData")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Кругова діаграма витрат */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{t("analytics.expenseStructure")}</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={130}
                  dataKey="value"
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[340px] flex items-center justify-center text-gray-400">
              {t("analytics.noExpenses")}
            </div>
          )}
        </div>

        {/* Топ категорій */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{t("analytics.topCategories")}</h2>
          <div className="space-y-5">
            {categoryData.length > 0 ? (
              categoryData.slice(0, 6).map((cat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{cat.name}</span>
                      <span className="font-semibold">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${Math.round((cat.value / (totalExpense || 1)) * 100)}%`,
                          backgroundColor: cat.color 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-slate-400 py-8 text-center">{t("analytics.noData")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;