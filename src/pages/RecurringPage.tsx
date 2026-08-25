import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Trash2, Power, X } from 'lucide-react';
import type { RecurringTransaction } from '../types';
import { recurringService } from '../services/recurringService';
import { formatINR, formatDate } from '../utils/formatters';

interface RecurringPageProps {
  onRefresh: () => void;
}

export const RecurringPage: React.FC<RecurringPageProps> = ({ onRefresh }) => {
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMsg, setProcessMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'emi' | 'savings' | 'investment'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryName, setCategoryName] = useState('Subscriptions');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const loadRecurring = async () => {
    const data = await recurringService.getRecurringTransactions();
    setRecurringList(data);
  };

  useEffect(() => {
    loadRecurring();
  }, []);

  const handleOpenAdd = () => {
    setTitle('');
    setType('expense');
    setAmount('');
    setCategoryName('Subscriptions');
    setFrequency('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    await recurringService.toggleActive(id, !currentActive);
    await loadRecurring();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this recurring transaction schedule?')) {
      await recurringService.deleteRecurringTransaction(id);
      await loadRecurring();
    }
  };

  const handleRunAutoGenerate = async () => {
    setIsProcessing(true);
    setProcessMsg('');
    const { generatedCount } = await recurringService.processDueRecurring();
    setIsProcessing(false);
    setProcessMsg(`Auto-processed ${generatedCount} recurring transactions into your database.`);
    onRefresh();
    setTimeout(() => setProcessMsg(''), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    await recurringService.addRecurringTransaction({
      title,
      type,
      amount: numAmount,
      category_name: categoryName,
      frequency,
      start_date: startDate,
      is_active: true,
    });

    setIsModalOpen(false);
    await loadRecurring();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recurring Transactions
          </h1>
          <p className="text-xs text-slate-500">Automate recurring salary deposits, rent payments, EMIs, and monthly subscriptions</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAutoGenerate}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Auto-Generate Due Items</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Recurring Item</span>
          </button>
        </div>
      </div>

      {processMsg && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {processMsg}
        </div>
      )}

      {/* Recurring List */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-3.5">Title & Category</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Frequency</th>
                <th className="px-6 py-3.5">Start Date</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-right">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {recurringList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No recurring transaction schedules set up.
                  </td>
                </tr>
              ) : (
                recurringList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.category_name || 'General'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">{item.frequency}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatDate(item.start_date)}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-white">
                      {formatINR(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(item.id, item.is_active)}
                          className={`rounded-lg p-1.5 transition-colors ${
                            item.is_active
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={item.is_active ? 'Active (Click to Pause)' : 'Paused (Click to Enable)'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Recurring Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Subscription, Apartment Rent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Transaction Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                    <option value="emi">EMI</option>
                    <option value="savings">Savings</option>
                    <option value="investment">Investment</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
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
                  Save Recurring
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
