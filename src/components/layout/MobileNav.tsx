import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  BrainCircuit,
  CreditCard,
  Menu,
  X,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieChartIcon,
  Coins,
  PiggyBank,
  TrendingUp,
  Target,
  Calculator,
  Flame,
  Activity,
  FileText,
  Settings,
  Scale,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { PermissionKey } from '../../types';

interface MobileNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenAddExpense: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activePage,
  onNavigate,
  onOpenAddExpense,
}) => {
  const { hasPermission, isAdmin } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainBottomItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'view_dashboard' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, perm: 'view_expenses' },
    { id: 'loans', label: 'Loans', icon: CreditCard, perm: 'view_loans' },
    { id: 'advisor', label: 'Advisor', icon: BrainCircuit, perm: 'view_advisor' },
  ];

  const allNavItems: {
    id: string;
    label: string;
    icon: any;
    perm?: PermissionKey;
    adminOnly?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'view_dashboard' },
    { id: 'advisor', label: 'Financial Advisor (AI)', icon: BrainCircuit, perm: 'view_advisor' },
    { id: 'health-score', label: 'Health Score', icon: Activity, perm: 'view_dashboard' },
    { id: 'income', label: 'Income Track', icon: ArrowUpRight, perm: 'view_income' },
    { id: 'expenses', label: 'Expense Management', icon: ArrowDownLeft, perm: 'view_expenses' },
    { id: 'categories', label: 'Category Analysis', icon: PieChartIcon, perm: 'view_expenses' },
    { id: 'transactions', label: 'Transaction History', icon: Receipt, perm: 'view_expenses' },
    { id: 'loans', label: 'Loans & EMIs', icon: CreditCard, perm: 'view_loans' },
    { id: 'gold-loans', label: 'Gold Loans', icon: Coins, perm: 'view_gold_loans' },
    { id: 'debt-payoff', label: 'Debt Payoff Planner', icon: Flame, perm: 'view_loans' },
    { id: 'what-if', label: 'What-If Scenario Calculator', icon: Scale, perm: 'view_dashboard' },
    { id: 'savings', label: 'Savings Management', icon: PiggyBank, perm: 'view_savings' },
    { id: 'investments', label: 'Investments', icon: TrendingUp, perm: 'view_investments' },
    { id: 'budgets', label: 'Monthly Budgets', icon: Calculator, perm: 'manage_budgets' },
    { id: 'goals', label: 'Financial Goals', icon: Target, perm: 'manage_goals' },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText, perm: 'view_reports' },
    { id: 'users', label: 'User Management', icon: UserPlus, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const visibleNavItems = allNavItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.perm) return hasPermission(item.perm);
    return true;
  });

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 lg:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
              MF
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">My Finance</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-1 pr-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setDrawerOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/90 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 lg:hidden">
        {mainBottomItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold min-h-[44px] justify-center ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Floating Add Expense Central Button */}
        {hasPermission('add_expenses') && (
          <button
            onClick={onOpenAddExpense}
            className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 active:scale-90"
            title="Add Expense"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        {mainBottomItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold min-h-[44px] justify-center ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Menu Drawer Toggle */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 min-h-[44px] justify-center"
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
