import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { IncomeItem, ExpenseItem } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

interface TransactionsPageProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ incomes, expenses }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const unifiedList = [
    ...incomes.map((i) => ({
      id: i.id,
      title: i.source,
      subtitle: i.description,
      amount: i.amount,
      type: 'income' as const,
      date: i.date,
      category: i.source,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      title: e.category_name,
      subtitle: e.merchant || e.payment_method,
      amount: e.amount,
      type: 'expense' as const,
      date: e.date,
      category: e.category_name,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = unifiedList.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Unified Transaction History
        </h1>
        <p className="text-xs text-slate-500">Comprehensive master ledger of all income and expense items</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search description, merchant, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-1/2">
          <button
            onClick={() => setFilterType('all')}
            className={`w-1/3 rounded-2xl py-2 text-xs font-bold transition-all ${
              filterType === 'all' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All ({unifiedList.length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`w-1/3 rounded-2xl py-2 text-xs font-bold transition-all ${
              filterType === 'income' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Incomes
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`w-1/3 rounded-2xl py-2 text-xs font-bold transition-all ${
              filterType === 'expense' ? 'bg-rose-600 text-white shadow' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Expenses
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-3.5">Type & Title</th>
                <th className="px-6 py-3.5">Details</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                          t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.type}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{t.subtitle}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 text-right font-extrabold">
                    <span className={t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>
                      {t.type === 'income' ? `+${formatINR(t.amount)}` : `-${formatINR(t.amount)}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
