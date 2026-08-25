import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import type { SavingsItem, SavingsType } from '../types';
import { dataService } from '../services/dataService';
import { formatINR, formatDate } from '../utils/formatters';

interface SavingsPageProps {
  savings: SavingsItem[];
  onRefresh: () => void;
  monthlyExpenses?: number;
}

const SAVINGS_TYPES: SavingsType[] = [
  'Emergency Fund',
  'Bank Savings',
  'RD',
  'FD',
  'Gold Savings',
  'Mutual Fund',
  'Other',
];

export const SavingsPage: React.FC<SavingsPageProps> = ({
  savings,
  monthlyExpenses = 50000,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavingsItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<SavingsType>('Emergency Fund');
  const [amount, setAmount] = useState('');
  const [expectedReturnRate, setExpectedReturnRate] = useState('6.0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);
  const emergencyFundTotal = savings
    .filter((s) => s.type === 'Emergency Fund')
    .reduce((sum, s) => sum + s.amount, 0);

  const emergencyMonths = monthlyExpenses > 0 ? Math.round((emergencyFundTotal / monthlyExpenses) * 10) / 10 : 0;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setType('Emergency Fund');
    setAmount('');
    setExpectedReturnRate('6.0');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SavingsItem) => {
    setEditingItem(item);
    setName(item.name);
    setType(item.type);
    setAmount(item.amount.toString());
    setExpectedReturnRate(item.expected_return_rate.toString());
    setDate(item.date);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this savings account record?')) {
      await dataService.deleteSavings(id);
      onRefresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 0) return;

    if (editingItem) {
      await dataService.updateSavings(editingItem.id, {
        name,
        type,
        amount: numAmount,
        expected_return_rate: parseFloat(expectedReturnRate) || 0,
        date,
        notes,
      });
    } else {
      await dataService.addSavings({
        name,
        type,
        amount: numAmount,
        expected_return_rate: parseFloat(expectedReturnRate) || 0,
        date,
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
            Savings & Emergency Buffer
          </h1>
          <p className="text-xs text-slate-500">Track liquid cash, emergency reserves, fixed deposits, and RDs</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Savings Account</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Liquid Savings</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{formatINR(totalSavings)}</p>
          <p className="mt-1 text-xs text-blue-600">{savings.length} accounts & deposits</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Reserve</span>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(emergencyFundTotal)}</p>
          <p className="mt-1 text-xs text-slate-500">Dedicated emergency capital</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Expense Cover Buffer</span>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{emergencyMonths} Months</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">
            {emergencyMonths >= 6 ? '🛡️ Fully Protected (6+ Months)' : '⚠️ Target 6 Months Buffer'}
          </p>
        </div>
      </div>

      {/* Savings Account List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {savings.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {item.type}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{item.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatINR(item.amount)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Expected Return: {item.expected_return_rate}%</span>
              <span>Updated: {formatDate(item.date)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Savings' : 'Add Savings Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Account / Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Emergency Fund"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Savings Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SavingsType)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {SAVINGS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Current Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Expected Interest (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={expectedReturnRate}
                    onChange={(e) => setExpectedReturnRate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
