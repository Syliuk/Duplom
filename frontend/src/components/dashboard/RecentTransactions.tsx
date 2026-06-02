import { formatCurrency, formatDate } from "../../lib/utils";
import { useTranslation } from "../../lib/i18n";
import type { Transaction } from "../../types/transaction";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-full">
      <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white">{t("dashboard.recentTransactions")}</h2>

      {transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t("dashboard.noTransactions")}</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{transaction.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>

              <p className={`font-semibold text-lg ${
                transaction.type === "income" ? "text-green-600" : "text-red-600"
              }`}>
                {transaction.type === "income" ? "+" : ""}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentTransactions;
