import React, { useState } from 'react';
import { Plus, AlertTriangle, X } from 'lucide-react';
import type { Budget, ExpenseItem } from '../types';
import { dataService } from '../services/dataService';
import { formatINR } from '../utils/formatters';

interface BudgetsPageProps {
  budgets: Budget[];
  expenses: ExpenseItem[];
  onRefresh: () => void;
}

const DEFAULT_CATEGORIES = [
  'Food',
  'Groceries',
  'Transport',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Housing',
  'Subscriptions',
  'Medical',
  'Other',
];

export const BudgetsPage: React.FC<BudgetsPageProps> = ({ budgets, expenses, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('Food');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Aggregate current month expense by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expenseByCategory[e.category_name.toLowerCase()] =
      (expenseByCategory[e.category_name.toLowerCase()] || 0) + e.amount;
  });

  const handleOpenAdd = () => {
    setCategoryName('Food');
    setMonthlyLimit('8000');
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (!limit || limit <= 0) return;

    await dataService.setBudget({
      category_name: categoryName,
      monthly_limit: limit,
      month: currentMonth,
      year: currentYear,
    });

    setIsModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monthly Budget Allocations
          </h1>
          <p className="text-xs text-slate-500">Set spending limits per category and track remaining monthly budget</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Budget Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((b) => {
          const spent = expenseByCategory[b.category_name.toLowerCase()] || 0;
          const remaining = b.monthly_limit - spent;
          const percentUsed = Math.min(100, Math.round((spent / b.monthly_limit) * 100));
          const isExceeded = spent > b.monthly_limit;
          const excess = spent - b.monthly_limit;

          return (
            <div
              key={b.id}
              className={`rounded-3xl border p-5 shadow-sm card-hover flex flex-col justify-between ${
                isExceeded
                  ? 'border-rose-300 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20'
                  : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{b.category_name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                      isExceeded
                        ? 'bg-rose-500 text-white'
                        : percentUsed > 80
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    {percentUsed}% Used
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Spent: {formatINR(spent)}</span>
                    <span className="font-bold text-slate-900 dark:text-white">Budget: {formatINR(b.monthly_limit)}</span>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isExceeded
                          ? 'bg-rose-600'
                          : percentUsed > 80
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                      }`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </div>

                {isExceeded ? (
                  <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-rose-500/10 p-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{b.category_name} budget exceeded by {formatINR(excess)}!</span>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">
                    Remaining: <span className="font-bold text-emerald-600">{formatINR(remaining)}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Set Category Budget</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Category Name</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Monthly Budget Limit (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 8000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
