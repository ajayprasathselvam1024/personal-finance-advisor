import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieChartIcon,
  CreditCard,
  Coins,
  PiggyBank,
  TrendingUp,
  Target,
  Calculator,
  Flame,
  BrainCircuit,
  Activity,
  FileText,
  Settings,
  Scale,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { PermissionKey } from '../../types';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { hasPermission, isAdmin } = useAuth();

  const navItems: {
    id: string;
    label: string;
    icon: any;
    section: string;
    badge?: string;
    perm?: PermissionKey;
    adminOnly?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', perm: 'view_dashboard' },
    { id: 'advisor', label: 'Financial Advisor', icon: BrainCircuit, section: 'Overview', badge: 'AI', perm: 'view_advisor' },
    { id: 'health-score', label: 'Health Score', icon: Activity, section: 'Overview', perm: 'view_dashboard' },

    { id: 'income', label: 'Income Track', icon: ArrowUpRight, section: 'Money Flow', perm: 'view_income' },
    { id: 'expenses', label: 'Expenses', icon: ArrowDownLeft, section: 'Money Flow', perm: 'view_expenses' },
    { id: 'categories', label: 'Category Analysis', icon: PieChartIcon, section: 'Money Flow', perm: 'view_expenses' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, section: 'Money Flow', perm: 'view_expenses' },

    { id: 'loans', label: 'Loans & EMIs', icon: CreditCard, section: 'Debt Management', perm: 'view_loans' },
    { id: 'gold-loans', label: 'Gold Loans', icon: Coins, section: 'Debt Management', perm: 'view_gold_loans' },
    { id: 'debt-payoff', label: 'Debt Payoff Planner', icon: Flame, section: 'Debt Management', perm: 'view_loans' },
    { id: 'what-if', label: 'What-If Planner', icon: Scale, section: 'Debt Management', perm: 'view_dashboard' },

    { id: 'savings', label: 'Savings', icon: PiggyBank, section: 'Wealth & Assets', perm: 'view_savings' },
    { id: 'investments', label: 'Investments', icon: TrendingUp, section: 'Wealth & Assets', perm: 'view_investments' },
    { id: 'budgets', label: 'Monthly Budgets', icon: Calculator, section: 'Planning', perm: 'manage_budgets' },
    { id: 'goals', label: 'Financial Goals', icon: Target, section: 'Planning', perm: 'manage_goals' },
    { id: 'recurring', label: 'Recurring Schedules', icon: RefreshCw, section: 'Planning', perm: 'view_expenses' },

    { id: 'reports', label: 'Reports & Analytics', icon: FileText, section: 'Analytics', perm: 'view_reports' },
    { id: 'users', label: 'User Management', icon: UserPlus, section: 'Administration', adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'Analytics' },
  ];

  // Filter items based on permissions
  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.perm) return hasPermission(item.perm);
    return true;
  });

  const sections = Array.from(new Set(visibleItems.map((item) => item.section)));

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto p-4 select-none">
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section}
            </h3>
            <div className="mt-1.5 space-y-1">
              {visibleItems
                .filter((item) => item.section === section)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
