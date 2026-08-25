import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Moon,
  Sun,
  Shield,
  User as UserIcon,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { NotificationItem } from '../../types';
import { dataService } from '../../services/dataService';

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
  const { profile, signOut, isDemoMode, seedDemoData } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Sync dark mode class with body
    const storedTheme = localStorage.getItem('fin_theme') || 'light';
    setTheme(storedTheme as 'light' | 'dark');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load Notifications
    dataService.getNotifications().then((res) => setNotifications(res));
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    notifications.forEach((n) => dataService.markNotificationRead(n.id));
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 sm:px-6">
      {/* Left: Mobile Title / Quick Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              Wealth<span className="text-blue-600 dark:text-blue-400">Wise</span>
            </span>
            <span className="hidden text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 sm:inline-block sm:ml-2">
              AI Advisor
            </span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Expense Button */}
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/35 active:scale-95 sm:px-4 sm:text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>

        {/* Demo Seed Banner Button if needed */}
        {isDemoMode && (
          <button
            onClick={() => seedDemoData()}
            title="Load Example Demo Financial Data"
            className="hidden items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 md:flex"
          >
            <span>Reset Demo Data</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Notifications ({unreadCount})
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-3 max-h-64 overflow-y-auto space-y-2.5">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No active alerts</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-xl p-2.5 text-xs transition-colors ${
                        n.is_read
                          ? 'bg-slate-50 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400'
                          : 'bg-blue-50/80 text-blue-950 font-medium dark:bg-blue-950/40 dark:text-blue-200'
                      }`}
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-2.5 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {profile?.full_name || 'User Profile'}
                </p>
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
                  onNavigate('onboarding');
                }}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <Shield className="h-4 w-4 text-slate-400" />
                <span>Onboarding Wizard</span>
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
