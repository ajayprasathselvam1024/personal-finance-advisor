import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Calendar } from 'lucide-react';
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
  Legend,
  CartesianGrid,
} from 'recharts';
import type { IncomeItem, ExpenseItem } from '../types';
import { formatINR } from '../utils/formatters';
import { exportTransactionsToExcel, exportIncomesToExcel, exportExpensesToExcel } from '../services/excelService';

interface ReportsPageProps {
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
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

export const ReportsPage: React.FC<ReportsPageProps> = ({ incomes, expenses }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'current' | 'last3'>('all');

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const filteredIncomes = incomes.filter((i) => {
    if (selectedPeriod === 'current') return i.date?.startsWith(currentMonthStr);
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (selectedPeriod === 'current') return e.date?.startsWith(currentMonthStr);
    return true;
  });

  const totalIncome = filteredIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  // Category Expense Breakdown
  const expenseCatMap: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    expenseCatMap[e.category_name] = (expenseCatMap[e.category_name] || 0) + e.amount;
  });
  const expenseCatData = Object.entries(expenseCatMap).map(([name, value]) => ({ name, value }));

  // Category Income Breakdown
  const incomeCatMap: Record<string, number> = {};
  filteredIncomes.forEach((i) => {
    incomeCatMap[i.category_name] = (incomeCatMap[i.category_name] || 0) + i.amount;
  });
  const incomeCatData = Object.entries(incomeCatMap).map(([name, value]) => ({ name, value }));

  // Monthly Comparison
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

  const monthlyComparisonData = Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, val]) => ({
      month,
      Income: val.income,
      Expense: val.expense,
      NetSavings: val.income - val.expense,
    }));

  const handleExportAll = () => {
    const unified = [
      ...filteredIncomes.map((i) => ({
        id: i.id,
        type: 'income' as const,
        amount: i.amount,
        date: i.date,
        category_name: i.category_name,
        description: i.description,
        notes: i.notes,
      })),
      ...filteredExpenses.map((e) => ({
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

    exportTransactionsToExcel(unified, 'Financial_Report');
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Income & Expense Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Category breakdowns, cash flow comparisons, and Excel export reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Filter */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400 mr-2" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="all">All Time Report</option>
              <option value="current">Current Month</option>
            </select>
          </div>

          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm transition-all min-h-[44px]"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export Report (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Report Income</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(totalIncome)}</p>
          <button onClick={() => exportIncomesToExcel(filteredIncomes)} className="mt-2 text-[11px] font-bold text-blue-600 hover:underline">
            Export Income Excel
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Report Expense</p>
          <p className="mt-1 text-2xl font-extrabold text-rose-600 dark:text-rose-400">{formatINR(totalExpense)}</p>
          <button onClick={() => exportExpensesToExcel(filteredExpenses)} className="mt-2 text-[11px] font-bold text-blue-600 hover:underline">
            Export Expense Excel
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Surplus</p>
          <p className={`mt-1 text-2xl font-extrabold ${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
            {formatINR(balance)}
          </p>
          <span className="mt-2 block text-[11px] text-slate-400">Income minus Expenses</span>
        </div>
      </div>

      {/* Report Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Expense Pie Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-4">Category-wise Expense Report</h3>
          {expenseCatData.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400">No expense records logged.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseCatData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={4} dataKey="value">
                    {expenseCatData.map((_, index) => (
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

        {/* Category Income Pie Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-4">Category-wise Income Report</h3>
          {incomeCatData.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400">No income records logged.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incomeCatData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={4} dataKey="value">
                    {incomeCatData.map((_, index) => (
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

        {/* Monthly Comparison Bar Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-4">Monthly Income vs Expense Comparison</h3>
          {monthlyComparisonData.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400">No monthly transaction data available.</p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(val) => formatINR(Number(val))} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
