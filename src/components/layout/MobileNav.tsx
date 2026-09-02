import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  FileSpreadsheet,
  FileText,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Tags,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenAddModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activePage,
  onNavigate,
  onOpenAddModal,
}) => {
  const { isAdmin, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'import', label: 'Import Statement', icon: FileSpreadsheet },
    { id: 'income', label: 'Income', icon: ArrowUpRight },
    { id: 'expenses', label: 'Expenses', icon: ArrowDownLeft },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'reports', label: 'Reports', icon: FileText },
    ...(isAdmin ? [{ id: 'users', label: 'User Management', icon: Users }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 lg:hidden flex flex-col justify-between ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-md">
                ₹
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base">My Finance</span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 space-y-1">
            {drawerItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setDrawerOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 min-h-[44px]"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Fixed Mobile Bottom Navigation Bar with Safe-Area Support */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200/90 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-extrabold min-h-[44px] min-w-[50px] ${
            activePage === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('transactions')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-extrabold min-h-[44px] min-w-[50px] ${
            activePage === 'transactions' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Receipt className="h-5 w-5" />
          <span>Ledger</span>
        </button>

        {/* Prominent Central "+ Add" FAB Button */}
        <button
          onClick={onOpenAddModal}
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/40 active:scale-95 transition-transform border-4 border-white dark:border-slate-900"
          title="Add Transaction"
        >
          <Plus className="h-7 w-7 stroke-[2.5]" />
        </button>

        <button
          onClick={() => onNavigate('import')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-extrabold min-h-[44px] min-w-[50px] ${
            activePage === 'import' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileSpreadsheet className="h-5 w-5" />
          <span>Import</span>
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 min-h-[44px] min-w-[50px]"
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
