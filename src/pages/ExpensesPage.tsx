import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, ArrowDownLeft, X } from 'lucide-react';
import type { ExpenseItem, PaymentMethod } from '../types';
import { dataService } from '../services/dataService';
import { formatINR, formatDate } from '../utils/formatters';

interface ExpensesPageProps {
  expenses: ExpenseItem[];
  onRefresh: () => void;
  onOpenAddExpense: () => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  expenses,
  onRefresh,
  onOpenAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Edit Modal State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState('');

  const categories = Array.from(new Set(expenses.map((e) => e.category_name)));

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      (e.merchant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category_name === selectedCategory;
    const matchesMethod = selectedMethod === 'All' || e.payment_method === selectedMethod;
    return matchesSearch && matchesCat && matchesMethod;
  });

  const totalExpense = filtered.reduce((sum, curr) => sum + curr.amount, 0);

  const handleEditOpen = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setAmount(exp.amount.toString());
    setCategory(exp.category_name);
    setMerchant(exp.merchant || '');
    setPaymentMethod(exp.payment_method);
    setDate(exp.date);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    await dataService.updateExpense(editingExpense.id, {
      amount: parseFloat(amount),
      category_name: category,
      merchant,
      payment_method: paymentMethod,
      date,
    });

    setEditingExpense(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense entry?')) {
      await dataService.deleteExpense(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Expense Tracker
          </h1>
          <p className="text-xs text-slate-500">Record and categorize all daily personal expenditures</p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Summary Card & Search Filters */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filtered Total Spend</span>
            <div className="rounded-xl bg-rose-50 p-2 dark:bg-rose-950/40">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{formatINR(totalExpense)}</p>
          <p className="mt-1 text-xs text-slate-500">{filtered.length} transactions</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-1/3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="w-full sm:w-1/3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="All">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="All">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-3.5">Category & Merchant</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{exp.category_name}</div>
                      <div className="text-[11px] text-slate-500">{exp.merchant || 'General expense'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatDate(exp.date)}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {exp.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-rose-600 dark:text-rose-400">
                      -{formatINR(exp.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditOpen(exp)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Expense</h3>
              <button onClick={() => setEditingExpense(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Merchant</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
