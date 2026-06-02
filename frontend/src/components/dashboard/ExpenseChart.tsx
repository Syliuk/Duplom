import { useTransactionStore } from "../../store/useTransactionStore";
import { formatCurrency } from "../../lib/utils";
import { useTranslation } from "../../lib/i18n";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function ExpenseChart() {
  const { transactions } = useTransactionStore();
  const { t } = useTranslation();

  const expenseByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expenseByCategory).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length],
  }));

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-[420px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("dashboard.expenseStructure")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("dashboard.totalSpent")}: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</span>
        </p>
      </div>

      {chartData.length > 0 ? (
        <div className="flex-1 min-h-0">   {/* Важливо! */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={130}
                dataKey="value"
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), t("dashboard.sum")]} 
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <p className="text-6xl mb-4">📊</p>
            <p>{t("dashboard.noExpenses")}</p>
            <p className="text-sm mt-1">{t("dashboard.addTransactionsHint")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseChart;
