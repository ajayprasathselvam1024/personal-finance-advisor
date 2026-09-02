import React, { useState, useEffect } from 'react';
import {
  Plus,
  Moon,
  Sun,
  User as UserIcon,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenAddExpense: () => void;
  onNavigate: (page: string) => void;
  activePage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddExpense,
  onNavigate,
  activePage: _activePage,
}) => {
  const { profile, signOut, isAdmin } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('fin_theme') || 'light';
    setTheme(storedTheme as 'light' | 'dark');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('fin_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 sm:px-6 pt-[env(safe-area-inset-top)]">
      {/* Left: App Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-md shadow-blue-500/20">
            ₹
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              My <span className="text-blue-600 dark:text-blue-400">Finance</span>
            </span>
            <span className="hidden text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 sm:inline-block sm:ml-2">
              Income & Expense Manager
            </span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Expense Button */}
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 sm:px-4 sm:text-sm min-h-[40px]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 min-h-[40px]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-xs font-bold text-white">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <span className="hidden text-xs font-semibold md:inline-block max-w-[100px] truncate">
              {profile?.full_name || 'User'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300 uppercase">
                    {isAdmin ? 'ADMIN' : 'USER'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                  Currency: INR (₹)
                </p>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('settings');
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors mt-1"
              >
                <UserIcon className="h-4 w-4 text-slate-400" />
                <span>Account Settings</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  signOut();
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors mt-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
