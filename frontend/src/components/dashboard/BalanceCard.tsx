import type { ReactNode } from "react";

interface BalanceCardProps {
  title: string;
  amount: string;
  icon: ReactNode;
  trend?: "positive" | "negative";
}

function BalanceCard({ 
  title, 
  amount, 
  icon, 
  trend 
}: BalanceCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
          <h2 className="text-3xl font-bold mt-3 tracking-tight text-gray-900 dark:text-white">{amount}</h2>
        </div>

        <div className={`p-4 rounded-2xl ${
          trend === "positive" 
            ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400" 
            : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default BalanceCard;