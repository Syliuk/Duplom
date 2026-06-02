import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  CreditCard, 
  PiggyBank, 
  BarChart3, 
  Target, 
  User,
  Repeat,        // для регулярних платежів
  Scale,         // для боргів
  Settings,      // для налаштувань
  Menu,
  X 
} from "lucide-react";
import { useTranslation } from "../lib/i18n";

function MainLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { to: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { to: "/transactions", label: t("nav.transactions"), icon: CreditCard },
    { to: "/recurring", label: t("nav.recurring"), icon: Repeat },
    { to: "/budgets", label: t("nav.budgets"), icon: PiggyBank },
    { to: "/debts", label: t("nav.debts"), icon: Scale },
    { to: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
    { to: "/goals", label: t("nav.goals"), icon: Target },
    { to: "/profile", label: t("nav.profile"), icon: User },
    { to: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Mobile Top Bar */}
      <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FinanceFlow</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700
            transform transition-transform duration-300
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
        >
          <div className="p-6 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">FinanceFlow</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{t("app.subtitle")}</p>
          </div>

          <nav className="px-3 mt-6 lg:mt-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 text-[15px] font-medium transition-all
                  ${isActive 
                    ? "bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300" 
                    : "text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
