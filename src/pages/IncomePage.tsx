import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, ArrowUpRight, X, Filter } from 'lucide-react';
import type { IncomeItem, IncomeSource } from '../types';
import { dataService } from '../services/dataService';
import { formatINR, formatDate } from '../utils/formatters';

interface IncomePageProps {
  incomes: IncomeItem[];
  onRefresh: () => void;
}

const SOURCES: IncomeSource[] = [
  'Salary',
  'Freelance',
  'Business',
  'Bonus',
  'Interest',
  'Rental',
  'Other',
];

export const IncomePage: React.FC<IncomePageProps> = ({ incomes, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IncomeItem | null>(null);

  // Form State
  const [source, setSource] = useState<IncomeSource>('Salary');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [notes, setNotes] = useState('');

  const filteredIncomes = incomes.filter((item) => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = selectedSource === 'All' || item.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const totalIncome = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setSource('Salary');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setIsRecurring(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: IncomeItem) => {
    setEditingItem(item);
    setSource(item.source);
    setAmount(item.amount.toString());
    setDate(item.date);
    setDescription(item.description);
    setIsRecurring(item.is_recurring);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this income entry?')) {
      await dataService.deleteIncome(id);
      onRefresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 0) return;

    if (editingItem) {
      await dataService.updateIncome(editingItem.id, {
        source,
        amount: numAmount,
        date,
        description,
        is_recurring: isRecurring,
        notes,
      });
    } else {
      await dataService.addIncome({
        source,
        amount: numAmount,
        date,
        description: description || `${source} Income`,
        is_recurring: isRecurring,
        notes,
      });
    }

    setIsModalOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Income Tracker
          </h1>
          <p className="text-xs text-slate-500">Track all income streams (Salary, Freelance, Business & Investments)</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Summary Card & Filters */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tracked Income</span>
            <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/40">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{formatINR(totalIncome)}</p>
          <p className="mt-1 text-xs text-slate-500">{filteredIncomes.length} recorded entries</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search description or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-1/2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="All">All Sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Income List Table / Cards */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-3.5">Source & Description</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Recurring</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No income records found.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{inc.source}</div>
                      <div className="text-[11px] text-slate-500">{inc.description}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatDate(inc.date)}</td>
                    <td className="px-6 py-4">
                      {inc.is_recurring ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Monthly Auto
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          One-time
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{formatINR(inc.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inc.id)}
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

      {/* Add / Edit Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Income' : 'Add New Income'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Income Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as IncomeSource)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 91000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Salary, Client Project"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="recurring" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Recurring Income
                </label>
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
                  className="w-1/2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                >
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
