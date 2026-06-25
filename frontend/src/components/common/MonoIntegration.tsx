import { useRef, useState } from "react";
import { useMonoStore } from "../../store/useMonoStore";
import { useToast } from "../../hooks/useToast";
import { useTransactionStore } from "../../store/useTransactionStore";
import { formatTranslation, useTranslation } from "../../lib/i18n";
import { ExternalLink, Copy, Check } from "lucide-react";

export default function MonoIntegration() {
  const { monoToken, setMonoToken, removeMonoToken, fetchClientInfo, fetchStatement } = useMonoStore();
  const { addTransaction, fetchTransactions } = useTransactionStore();
  const { success, error } = useToast();
  const { t } = useTranslation();

  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const [copied, setCopied] = useState(false);

  const goToMono = () => {
    window.open("https://api.monobank.ua/", "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://api.monobank.ua/");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToken = () => {
    if (!tokenInput.trim()) {
      error(t("mono.requiredToken"));
      return;
    }
    setMonoToken(tokenInput.trim());
    success(t("mono.tokenSaved"));
    setTokenInput("");
  };

  const handleImport = async () => {
    if (loadingRef.current) return;
    if (!monoToken) return;

    loadingRef.current = true;
    setLoading(true);
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
          const statements = await fetchStatement(acc.id, 31);

          for (const s of statements) {
            await addTransaction({
              title: s.description || t("transactions.monoOperation"),
              amount: Math.abs(s.amount / 100),
              type: s.amount > 0 ? "income" : "expense",
              category: "Mono Import",
              date: new Date(s.time * 1000).toISOString().split("T")[0],
              note: s.comment || "",
            });
            importedCount++;
          }
        } catch (err: any) {
          console.warn(`Monobank account import failed (${acc.id}):`, err.message);
        }
      }

      await fetchTransactions();
      success(formatTranslation(t("transactions.importSuccess"), { count: importedCount }));
    } catch (err: any) {
      error(err.message || t("transactions.importError"));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{t("mono.title")}</h3>
        {monoToken && <span className="text-green-600 text-sm">✓ {t("mono.connected")}</span>}
      </div>

      {!monoToken ? (
        <div className="space-y-5">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-5">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t("mono.instructions")}
            </p>
          </div>

          <button
            onClick={goToMono}
            className="w-full bg-[#00AEEF] hover:bg-[#0099D1] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition"
          >
            <span>{t("mono.goToSite")}</span>
            <ExternalLink size={20} />
          </button>

          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex-1 border border-gray-300 dark:border-slate-700 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              {t("mono.copyLink")}
            </button>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-500 mb-2">{t("mono.tokenHint")}</p>
            <input
              type="text"
              placeholder={t("mono.tokenPlaceholder")}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveToken}
              className="mt-3 w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700"
            >
              {t("mono.connectToken")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-green-600">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xl">✓</div>
            <div>
              <p className="font-medium">{t("mono.connected")}</p>
              <p className="text-sm text-gray-500">{t("mono.tokenSavedStatus")}</p>
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-semibold hover:bg-green-700 disabled:opacity-70"
          >
            {loading ? t("transactions.importing") : t("transactions.importMono")}
          </button>

          <button
            onClick={removeMonoToken}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-semibold hover:bg-red-700"
          >
            {t("mono.disconnect")}
          </button>
        </div>
      )}
    </div>
  );
}
