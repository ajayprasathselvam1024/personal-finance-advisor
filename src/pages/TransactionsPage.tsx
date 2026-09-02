import React, { useState } from 'react';
import {
  Search,
  FileSpreadsheet,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { IncomeItem, ExpenseItem, UnifiedTransaction, Category } from '../types';
import { dataService } from '../services/dataService';
import { exportTransactionsToExcel } from '../services/excelService';
import { formatINR, formatDate } from '../utils/formatters';

interface TransactionsPageProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  categories: Category[];
  onRefresh: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  incomes,
  expenses,
  categories: _categories,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Combine into unified list
  const unifiedTransactions: UnifiedTransaction[] = [
    ...incomes.map((i) => ({
      id: i.id,
      user_id: i.user_id,
      type: 'income' as const,
      amount: i.amount,
      date: i.date,
      category_name: i.category_name,
      description: i.description,
      notes: i.notes,
      created_at: i.created_at,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      type: 'expense' as const,
      amount: e.amount,
      date: e.date,
      category_name: e.category_name,
      description: e.description,
      payment_method: e.payment_method,
      notes: e.notes,
      created_at: e.created_at,
    })),
  ];

  // Filtering & Sorting
  const filtered = unifiedTransactions
    .filter((t) => {
      const matchesType = typeFilter === 'all' || t.type === typeFilter;

      const matchesSearch =
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || t.category_name.toLowerCase() === categoryFilter.toLowerCase();

      const matchesStartDate = !startDate || t.date >= startDate;
      const matchesEndDate = !endDate || t.date <= endDate;

      return matchesType && matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.date.localeCompare(a.date);
      }
      return a.date.localeCompare(b.date);
    });

  // Pagination math
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (t: UnifiedTransaction) => {
    if (confirm(`Are you sure you want to delete this ${t.type} record?`)) {
      if (t.type === 'income') {
        await dataService.deleteIncome(t.id);
      } else {
        await dataService.deleteExpense(t.id);
      }
      onRefresh();
    }
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(filtered, 'Unified_Transactions');
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header & Export Excel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-blue-600" />
            <span>Unified Transactions Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete searchable history of all personal income and expense transactions.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm transition-all min-h-[44px]"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Export Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
          >
            <option value="all">All Types (Income & Expense)</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
          >
            <option value="all">All Categories</option>
            {_categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.type})
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* End Date */}
        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Sort Order */}
        <div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transaction records match criteria.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">{formatDate(item.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        item.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {item.type === 'income' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                        <span>{item.type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{item.category_name}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {item.description || item.type}
                      {item.notes && <p className="text-[11px] text-slate-400 font-normal">{item.notes}</p>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.payment_method || 'N/A'}</td>
                    <td className={`px-6 py-4 font-extrabold text-sm ${
                      item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {item.type === 'income' ? '+' : '-'}{formatINR(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                        title="Delete Transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of {totalPages} ({filtered.length} total)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
