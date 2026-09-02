import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginPage } from './components/auth/LoginPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AccessDeniedPage } from './components/auth/AccessDeniedPage';

import { DashboardPage } from './pages/DashboardPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ReportsPage } from './pages/ReportsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SettingsPage } from './pages/SettingsPage';

import { dataService } from './services/dataService';
import type { IncomeItem, ExpenseItem, Category } from './types';
import { calculateFinancialSummary } from './utils/calculations';
import { Plus, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  // Data States
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Quick Add Modal State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickType, setQuickType] = useState<'income' | 'expense'>('expense');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDate, setQuickDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickCategory, setQuickCategory] = useState('');
  const [quickDescription, setQuickDescription] = useState('');
  const [quickPaymentMethod, setQuickPaymentMethod] = useState<'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Other'>('UPI');
  const [quickNotes, setQuickNotes] = useState('');

  // Reset Password route detection
  const isResetRoute =
    window.location.pathname.includes('/reset-password') ||
    window.location.hash.includes('type=recovery');

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      const [inc, exp, cats] = await Promise.all([
        dataService.getIncomes(),
        dataService.getExpenses(),
        dataService.getCategories(),
      ]);

      setIncomes(inc);
      setExpenses(exp);
      setCategories(cats);
    } catch (e) {
      console.error('Error fetching financial data:', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const handleOpenQuickAdd = (type?: 'income' | 'expense') => {
    const selectedType = type || 'expense';
    setQuickType(selectedType);
    setQuickAmount('');
    setQuickDate(new Date().toISOString().split('T')[0]);
    const availableCats = categories.filter((c) => c.type === selectedType);
    setQuickCategory(availableCats[0]?.name || (selectedType === 'income' ? 'Salary' : 'Food'));
    setQuickDescription('');
    setQuickNotes('');
    setIsQuickAddOpen(true);
  };

  const handleSaveQuickTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(quickAmount);
    if (isNaN(numAmt) || numAmt <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    if (quickType === 'income') {
      await dataService.addIncome({
        amount: numAmt,
        date: quickDate,
        category_name: quickCategory || 'Salary',
        description: quickDescription || 'Income',
        notes: quickNotes,
      });
    } else {
      await dataService.addExpense({
        amount: numAmt,
        date: quickDate,
        category_name: quickCategory || 'Food',
        description: quickDescription || 'Expense',
        payment_method: quickPaymentMethod,
        notes: quickNotes,
      });
    }

    setIsQuickAddOpen(false);
    loadAllData();
  };

  if (isResetRoute) {
    return <ResetPasswordPage onSuccess={() => { window.location.href = '/'; }} />;
  }

  if (loading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Authenticating My Finance Engine...</p>
        </div>
      </div>
    );
  }

  if (!user && activePage !== 'login') {
    return <LoginPage onSuccess={() => setActivePage('dashboard')} />;
  }

  if (activePage === 'login') {
    return <LoginPage onSuccess={() => setActivePage('dashboard')} />;
  }

  // Live Summary Calculation
  const summary = calculateFinancialSummary(incomes, expenses);

  return (
    <AuthGuard>
      <Layout
        activePage={activePage}
        onNavigate={setActivePage}
        onRefreshData={loadAllData}
        onOpenAddModal={() => handleOpenQuickAdd()}
      >
        {activePage === 'dashboard' && (
          <DashboardPage
            summary={summary}
            incomes={incomes}
            expenses={expenses}
            onNavigate={setActivePage}
            onOpenAddModal={(type) => handleOpenQuickAdd(type)}
          />
        )}

        {activePage === 'transactions' && (
          <TransactionsPage
            incomes={incomes}
            expenses={expenses}
            categories={categories}
            onRefresh={loadAllData}
          />
        )}

        {activePage === 'income' && (
          <IncomePage
            incomes={incomes}
            categories={categories}
            onRefresh={loadAllData}
          />
        )}

        {activePage === 'expenses' && (
          <ExpensesPage
            expenses={expenses}
            categories={categories}
            onRefresh={loadAllData}
          />
        )}

        {activePage === 'categories' && (
          <CategoriesPage
            categories={categories}
            onRefresh={loadAllData}
          />
        )}

        {activePage === 'reports' && (
          <ReportsPage
            incomes={incomes}
            expenses={expenses}
          />
        )}

        {activePage === 'users' && (
          isAdmin ? <UserManagementPage /> : <AccessDeniedPage />
        )}

        {activePage === 'settings' && <SettingsPage onRefresh={loadAllData} />}
      </Layout>

      {/* Unified Quick Add Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Add Transaction</h3>
              </div>
              <button onClick={() => setIsQuickAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Type Selector Toggle */}
            <div className="mt-4 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setQuickType('expense');
                  const expenseCats = categories.filter((c) => c.type === 'expense');
                  setQuickCategory(expenseCats[0]?.name || 'Food');
                }}
                className={`w-1/2 rounded-lg py-2 text-xs font-bold transition-all ${
                  quickType === 'expense'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickType('income');
                  const incomeCats = categories.filter((c) => c.type === 'income');
                  setQuickCategory(incomeCats[0]?.name || 'Salary');
                }}
                className={`w-1/2 rounded-lg py-2 text-xs font-bold transition-all ${
                  quickType === 'income'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Income
              </button>
            </div>

            <form onSubmit={handleSaveQuickTransaction} className="mt-4 space-y-4 font-sans">
              <div>
                <label className="text-xs font-semibold text-slate-500">Amount (₹) *</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    required
                    placeholder="0.00"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Date *</label>
                <input
                  type="date"
                  required
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Category *</label>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                >
                  {categories
                    .filter((c) => c.type === quickType)
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {quickType === 'expense' && (
                <div>
                  <label className="text-xs font-semibold text-slate-500">Payment Method *</label>
                  <select
                    value={quickPaymentMethod}
                    onChange={(e) => setQuickPaymentMethod(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Lunch with team, Freelance income"
                  value={quickDescription}
                  onChange={(e) => setQuickDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional details..."
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-1/2 rounded-xl py-2.5 text-xs font-bold text-white shadow ${
                    quickType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Save {quickType === 'income' ? 'Income' : 'Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
