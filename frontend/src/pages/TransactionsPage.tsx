import { useState, useMemo, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { useTransactionStore } from "../store/useTransactionStore";
import { useMonoStore } from "../store/useMonoStore";
import AddTransactionModal from "../components/transactions/AddTransactionModal";
import AddTransactionButton from "../components/transactions/AddTransactionButton";
import TransactionCard from "../components/transactions/TransactionCard";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionTable from "../components/transactions/TransactionTable";
import { formatCurrency, formatDate } from "../lib/utils";
import { useTranslation, formatTranslation } from "../lib/i18n";
import { Download } from "lucide-react";
import type { Transaction } from "../types/transaction";

function TransactionsPage() {
  const { 
    transactions, 
    fetchTransactions, 
    addTransaction 
  } = useTransactionStore();

  const { monoToken, fetchClientInfo, fetchStatement } = useMonoStore();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [importing, setImporting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Завантаження транзакцій при вході
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Імпорт транзакцій з МоноБанку
  const handleImportFromMono = async () => {
    if (!monoToken) {
      error(t("transactions.connectMonoFirst"));
      return;
    }

    setImporting(true);
    try {
      await fetchClientInfo();
      const { accounts } = useMonoStore.getState();

      if (accounts.length === 0) {
        error(t("transactions.accountsNotFound"));
        return;
      }

      let importedCount = 0;

      for (const acc of accounts) {
        try {
          const statements = await fetchStatement(acc.id, 31); // максимум 31 день

          for (const s of statements) {
            await addTransaction({
              title: s.description || t("transactions.monoOperation"),
              amount: Math.abs(s.amount / 100),
              type: s.amount > 0 ? "income" : "expense",
              category: "Mono Import",
              date: new Date(s.time * 1000).toISOString().split('T')[0],
              note: s.comment || "",
            });
            importedCount++;
          }
        } catch (err: any) {
          console.warn(`Помилка з рахунком ${acc.id}:`, err.message);
          // продовжуємо з іншими рахунками
        }
      }

      await fetchTransactions();
      success(formatTranslation(t("transactions.importSuccess"), { count: importedCount }));
    } catch (err: any) {
      error(err.message || t("transactions.importError"));
    } finally {
      setImporting(false);
    }
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterCategory("all");
    setDateFrom("");
    setDateTo("");
  };

  const filteredTransactions = useMemo(() => {
    const fromTimestamp = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null;
    const toTimestamp = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null;

    return transactions
      .filter((t) => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || t.type === filterType;
        const matchesCategory = filterCategory === "all" || t.category === filterCategory;
        const transactionTime = new Date(t.date).getTime();
        const matchesDateFrom = fromTimestamp === null || transactionTime >= fromTimestamp;
        const matchesDateTo = toTimestamp === null || transactionTime <= toTimestamp;

        return matchesSearch && matchesType && matchesCategory && matchesDateFrom && matchesDateTo;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType, filterCategory, dateFrom, dateTo]);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await useTransactionStore.getState().deleteTransaction(id);
      success(t("transactions.deleted"));
    } catch (err: any) {
      error(err.message || t("transactions.deleteError"));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("transactions.title")}</h1>
          <p className="text-gray-600 mt-1">{t("transactions.subtitle")}</p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          {monoToken && (
            <button
              onClick={handleImportFromMono}
              disabled={importing}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold transition disabled:opacity-70"
            >
              <Download size={18} />
              {importing ? t("transactions.importing") : t("transactions.importMono")}
            </button>
          )}

          <div onClick={() => setIsModalOpen(true)}>
            <AddTransactionButton />
          </div>
        </div>
      </div>

      <TransactionFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        resetFilters={resetAllFilters}
      />

      {/* Mobile Version */}
      <div className="lg:hidden space-y-4 mt-6">
        {filteredTransactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            {...transaction}
            onDelete={handleDeleteTransaction}
            onEdit={handleEdit}
            formattedAmount={formatCurrency(transaction.amount)}
            formattedDate={formatDate(transaction.date)}
          />
        ))}
      </div>

      {/* Desktop Version */}
      <TransactionTable
        transactions={filteredTransactions}
        onDelete={handleDeleteTransaction}
        onEdit={handleEdit}
      />

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}

export default TransactionsPage;
