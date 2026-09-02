import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { FinancialSummary, IncomeItem, ExpenseItem } from '../types';
import { formatINR } from '../utils/formatters';
import { exportTransactionsToExcel } from '../services/excelService';

interface DashboardPageProps {
  summary: FinancialSummary;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  onNavigate: (page: string) => void;
  onOpenAddModal: (type?: 'income' | 'expense') => void;
}

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#6366F1',
  '#14B8A6',
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  incomes,
  expenses,
  onNavigate,
  onOpenAddModal,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Filter incomes and expenses by month if selected
  const filteredIncomes = incomes.filter((item) => {
    if (selectedMonth === 'all') return true;
    return item.date?.startsWith(selectedMonth);
  });

  const filteredExpenses = expenses.filter((item) => {
    if (selectedMonth === 'all') return true;
    return item.date?.startsWith(selectedMonth);
  });

  const filteredTotalIncome = filteredIncomes.reduce((s, i) => s + (i.amount || 0), 0);
  const filteredTotalExpense = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const filteredBalance = filteredTotalIncome - filteredTotalExpense;

  // Expense by Category Pie Data
  const expenseCatMap: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    expenseCatMap[e.category_name] = (expenseCatMap[e.category_name] || 0) + e.amount;
  });
  const expensePieData = Object.entries(expenseCatMap).map(([name, value]) => ({ name, value }));

  // Income by Category Pie Data
  const incomeCatMap: Record<string, number> = {};
  filteredIncomes.forEach((i) => {
    incomeCatMap[i.category_name] = (incomeCatMap[i.category_name] || 0) + i.amount;
  });
  const incomePieData = Object.entries(incomeCatMap).map(([name, value]) => ({ name, value }));

  // Monthly Trend Line Chart Data
  const monthMap: Record<string, { income: number; expense: number }> = {};
  incomes.forEach((i) => {
    if (!i.date) return;
    const m = i.date.substring(0, 7);
    if (!monthMap[m]) monthMap[m] = { income: 0, expense: 0 };
    monthMap[m].income += i.amount;
  });
  expenses.forEach((e) => {
    if (!e.date) return;
    const m = e.date.substring(0, 7);
    if (!monthMap[m]) monthMap[m] = { income: 0, expense: 0 };
    monthMap[m].expense += e.amount;
  });

  const trendData = Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, val]) => ({
      month,
      Income: val.income,
      Expense: val.expense,
      Balance: val.income - val.expense,
    }));

  const handleExportAll = () => {
    const unified = [
      ...incomes.map((i) => ({
        id: i.id,
        type: 'income' as const,
        amount: i.amount,
        date: i.date,
        category_name: i.category_name,
        description: i.description,
        notes: i.notes,
      })),
      ...expenses.map((e) => ({
        id: e.id,
        type: 'expense' as const,
        amount: e.amount,
        date: e.date,
        category_name: e.category_name,
        description: e.description,
        payment_method: e.payment_method,
        notes: e.notes,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    exportTransactionsToExcel(unified, 'Dashboard_Summary');
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header Banner & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track personal cash flow, monthly spending, and net surplus in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month Filter */}
          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
            </select>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm transition-all"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* 6 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Total Income */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Income
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/40">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(filteredTotalIncome)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>This Month: {formatINR(summary.currentMonthIncome)}</span>
            <button
              onClick={() => onOpenAddModal('income')}
              className="font-bold text-blue-600 hover:underline"
            >
              + Add Income
            </button>
          </div>
        </div>

        {/* 2. Total Expense */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Expense
            </span>
            <div className="rounded-xl bg-rose-50 p-2 dark:bg-rose-950/40">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(filteredTotalExpense)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>This Month: {formatINR(summary.currentMonthExpense)}</span>
            <button
              onClick={() => onOpenAddModal('expense')}
              className="font-bold text-rose-600 hover:underline"
            >
              + Add Expense
            </button>
          </div>
        </div>

        {/* 3. Net Balance */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Balance
            </span>
            <div className="rounded-xl bg-blue-50 p-2 dark:bg-blue-950/40">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`mt-2 text-2xl font-extrabold ${
              filteredBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'
            }`}
          >
            {formatINR(filteredBalance)}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Monthly Surplus: {formatINR(summary.currentMonthBalance)}</span>
            <span className="font-semibold text-slate-500">Income - Expense</span>
          </div>
        </div>
      </div>

      {/* Quick Action FAB Callout */}
      {incomes.length === 0 && expenses.length === 0 && (
        <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-6 text-center dark:border-blue-900/40 dark:bg-blue-950/20 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold shadow-md">
            ₹
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Welcome to My Finance</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Start by adding your first monthly income or expense transaction. The dashboard will instantly update.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => onOpenAddModal('income')}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              + Add Income
            </button>
            <button
              onClick={() => onOpenAddModal('expense')}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
            >
              + Add Expense
            </button>
          </div>
        </div>
      )}

      {/* 4 Clean Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Income vs Expense Comparison Bar Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Income vs Expense Comparison</h3>
            <span className="text-[11px] text-slate-400">Total Breakdown</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Income', amount: filteredTotalIncome },
                  { name: 'Expense', amount: filteredTotalExpense },
                  { name: 'Balance', amount: Math.max(0, filteredBalance) },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(val) => formatINR(Number(val))} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Expense by Category Pie Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expense by Category</h3>
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage
            </button>
          </div>

          {expensePieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-400">No expense entries recorded yet.</p>
              <button
                onClick={() => onOpenAddModal('expense')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                + Add Expense
              </button>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expensePieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 3: Income by Category Pie Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Income by Source Category</h3>
            <button
              onClick={() => onNavigate('income')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View Incomes
            </button>
          </div>

          {incomePieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-400">No income entries recorded yet.</p>
              <button
                onClick={() => onOpenAddModal('income')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                + Add Income
              </button>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {incomePieData.map((_, index) => (
                      <Cell key={`cell-inc-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 4: Monthly Trend Line Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Cash Flow Trend</h3>
            <span className="text-[11px] text-slate-400">Last 6 Months</span>
          </div>

          {trendData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-slate-400">
              Monthly trend line will render once transactions are added.
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="Expense" stroke="#EF4444" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
