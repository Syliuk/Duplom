import { useState, useEffect, useRef } from "react";
import { useToast } from "../hooks/useToast";
import { useGoalStore } from "../store/useGoalStore";
import { useTranslation } from "../lib/i18n";
import { formatCurrency } from "../lib/utils";
import { MAX_PLANNING_DATE, getTodayDateInputValue, isDateInRange } from "../lib/dateLimits";
import { Plus, Trash2, Target, TrendingUp } from "lucide-react";

function GoalsPage() {
  const { goals, fetchGoals, addGoal, deleteGoal, addContribution } = useGoalStore();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const minGoalDeadline = getTodayDateInputValue();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contributionModal, setContributionModal] = useState<number | null>(null);
  const [contribAmount, setContribAmount] = useState("");
  const [pendingActions, setPendingActions] = useState<Record<string, boolean>>({});
  const pendingActionsRef = useRef<Set<string>>(new Set());

  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    deadline: "",
    category: "Other",
  });

  // Завантажуємо цілі при вході на сторінку
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const startAction = (key: string) => {
    if (pendingActionsRef.current.has(key)) return false;
    pendingActionsRef.current.add(key);
    setPendingActions((actions) => ({ ...actions, [key]: true }));
    return true;
  };

  const finishAction = (key: string) => {
    pendingActionsRef.current.delete(key);
    setPendingActions((actions) => ({ ...actions, [key]: false }));
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      error(t("goals.required"));
      return;
    }

    if (!isDateInRange(newGoal.deadline, minGoalDeadline, MAX_PLANNING_DATE)) {
      error(`Дата завершення цілі має бути в межах від ${minGoalDeadline} до ${MAX_PLANNING_DATE}.`);
      return;
    }

    const actionKey = "add-goal";
    if (!startAction(actionKey)) return;

    try {
      await addGoal({
        title: newGoal.title,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: 0,
        deadline: newGoal.deadline,
        category: newGoal.category,
      });

      setNewGoal({ title: "", targetAmount: "", deadline: "", category: "Other" });
      setIsModalOpen(false);
      success(t("goals.added"));
    } catch (err: any) {
      error(err.message || t("goals.addError"));
    } finally {
      finishAction(actionKey);
    }
  };

  const handleContribution = async (id: number | null) => {
    if (id === null || !contribAmount) {
      error(t("goals.contributionRequired"));
      return;
    }

    const actionKey = `contribution-${id}`;
    if (!startAction(actionKey)) return;

    try {
      await addContribution(id, Number(contribAmount));
      setContribAmount("");
      setContributionModal(null);
      success(t("goals.contributionAdded"));
    } catch (err: any) {
      error(err.message || t("goals.contributionError"));
    } finally {
      finishAction(actionKey);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("goals.title")}</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">{t("goals.subtitle")}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700"
        >
          <Plus size={20} />
          {t("goals.new")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = Math.min(
            Math.round((goal.currentAmount / goal.targetAmount) * 100),
            100
          );
          const remaining = goal.targetAmount - goal.currentAmount;

          return (
            <div key={goal.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <Target className="text-blue-600" size={28} />
                  <div>
                    <h3 className="font-semibold text-xl">{goal.title}</h3>
                    <p className="text-sm text-gray-500">{goal.category}</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const actionKey = `delete-goal-${goal.id}`;
                    if (!startAction(actionKey)) return;

                    try {
                      await deleteGoal(goal.id);
                      success(t("goals.deleted"));
                    } finally {
                      finishAction(actionKey);
                    }
                  }}
                  disabled={pendingActions[`delete-goal-${goal.id}`]}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="mt-6">
                <div className="flex justify-between mb-2 text-sm">
                  <span>{t("goals.collected")}</span>
                  <span className="font-semibold">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </span>
                </div>

                <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs mt-1 text-gray-500">
                  <span>{progress}% {t("goals.completed")}</span>
                  <span>{t("goals.remaining")}: {formatCurrency(remaining)}</span>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-slate-700 text-sm">
                <p className="text-gray-500 dark:text-slate-400">
                  {t("goals.deadline")}: {new Date(goal.deadline).toLocaleDateString('uk-UA')}
                </p>
                
                <button
                  onClick={() => setContributionModal(goal.id)}
                  className="mt-4 w-full bg-gray-900 text-white py-3 rounded-2xl hover:bg-black transition flex items-center justify-center gap-2"
                >
                  <TrendingUp size={18} />
                  {t("goals.addContribution")}
                </button>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-2 text-center py-20 text-gray-400 dark:text-slate-500">
            {t("goals.empty")}
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md border border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t("goals.newGoal")}</h2>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("goals.goalName")}</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                  placeholder={t("goals.placeholder")}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("goals.targetAmount")}</label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-slate-200">{t("goals.deadlineLabel")}</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  min={minGoalDeadline}
                  max={MAX_PLANNING_DATE}
                  className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {t("common.cancel")}
                </button>
                <button 
                  onClick={handleAddGoal} 
                  disabled={pendingActions["add-goal"]}
                  className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {t("goals.createGoal")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {contributionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">{t("goals.addContributionModal")}</h2>
            <input
              type="number"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              placeholder={t("goals.contributionPlaceholder")}
              className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 mb-6"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setContributionModal(null)} 
                className="flex-1 border py-3 rounded-2xl"
              >
                {t("common.cancel")}
              </button>
              <button 
                onClick={() => handleContribution(contributionModal)}
                disabled={pendingActions[`contribution-${contributionModal}`]}
                className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-semibold disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {t("common.add")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoalsPage;
