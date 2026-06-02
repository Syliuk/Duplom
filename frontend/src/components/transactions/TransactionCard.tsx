import { formatCurrency, formatDate } from "../../lib/utils";
import { Trash2, Edit2 } from "lucide-react";
import type { Transaction } from "../../types/transaction";

interface TransactionCardProps extends Transaction {
  onDelete: (id: number) => void;
  onEdit: (transaction: Transaction) => void;
  formattedAmount?: string;
  formattedDate?: string;
}

function TransactionCard({
  id,
  title,
  category,
  date,
  amount,
  type,
  note,
  userId,
  onDelete,
  onEdit,
  formattedAmount,
  formattedDate,
}: TransactionCardProps) {
  return (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow transition">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{category}</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">
          {formattedDate || formatDate(date)}
        </p>
        {note && <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 italic">"{note}"</p>}
      </div>

      <div className="text-right flex flex-col items-end">
        <p className={`font-bold text-xl ${
          type === "income" ? "text-green-600" : "text-red-600"
        }`}>
          {formattedAmount || formatCurrency(amount)}
        </p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit({ id, title, category, date, amount, type, note, userId })}
            className="p-2 text-gray-400 hover:text-blue-600 transition"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-gray-400 hover:text-red-600 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}

export default TransactionCard;
