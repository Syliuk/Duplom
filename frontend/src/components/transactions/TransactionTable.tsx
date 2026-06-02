import { useTranslation } from "../../lib/i18n";
import { formatCurrency, formatDate } from "../../lib/utils";
import { Trash2, Edit2 } from "lucide-react";
import type { Transaction } from "../../types/transaction";

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
  onEdit: (transaction: Transaction) => void;
}

function TransactionTable({ transactions, onDelete, onEdit }: TransactionTableProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50 dark:bg-slate-900 dark:border-slate-700">
            <th className="text-left p-5 font-medium text-gray-600 dark:text-slate-400">{t("common.date")}</th>
            <th className="text-left p-5 font-medium text-gray-600 dark:text-slate-400">{t("common.title")}</th>
            <th className="text-left p-5 font-medium text-gray-600 dark:text-slate-400">{t("common.category")}</th>
            <th className="text-left p-5 font-medium text-gray-600 dark:text-slate-400">{t("common.type")}</th>
            <th className="text-right p-5 font-medium text-gray-600 dark:text-slate-400">{t("common.amount")}</th>
            <th className="w-20 p-5"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-10 text-center text-gray-500">
                {t("transactions.notFound")}
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                <td className="p-5 text-gray-600 dark:text-slate-300">{formatDate(transaction.date)}</td>
                <td className="p-5 font-medium text-gray-900 dark:text-white">{transaction.title}</td>
                <td className="p-5">
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-sm text-gray-700 dark:text-slate-200">
                    {transaction.category}
                  </span>
                </td>
                <td className="p-5">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.type === "income"
                        ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {transaction.type === "income" ? t("common.income") : t("common.expense")}
                  </span>
                </td>
                <td className={`p-5 text-right font-bold text-lg ${
                  transaction.type === "income" ? "text-green-600" : "text-red-600"
                }`}>
                  {transaction.type === "income" ? "+" : ""}
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="p-5">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;