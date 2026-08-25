import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { ExpenseItem } from '../types';
import { formatINR, formatDate } from '../utils/formatters';

interface CategoryAnalysisPageProps {
  expenses: ExpenseItem[];
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B', '#a855f7', '#f43f5e'];

export const CategoryAnalysisPage: React.FC<CategoryAnalysisPageProps> = ({ expenses }) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  // Aggregation
  const categoryMap: Record<string, number> = {};
  let totalExpense = 0;

  expenses.forEach((e) => {
    categoryMap[e.category_name] = (categoryMap[e.category_name] || 0) + e.amount;
    totalExpense += e.amount;
  });

  const categoryList = Object.entries(categoryMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const filteredTransactions = selectedCat
    ? expenses.filter((e) => e.category_name === selectedCat)
    : expenses;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Category-wise Expense Analysis
        </h1>
        <p className="text-xs text-slate-500">Visual break-down of spending distribution across all categories</p>
      </div>

      {/* Top Visual Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Distribution */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2">Category Share</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryList}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="amount"
                  onClick={(entry: any) => setSelectedCat(entry?.name || null)}
                >
                  {categoryList.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatINR(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Comparison */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2">Top Categories Ranking</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryList.slice(0, 7)} layout="vertical">
                <XAxis type="number" tickFormatter={(val) => `₹${val / 1000}k`} stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <Tooltip formatter={(val) => formatINR(Number(val))} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category List & Filter */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Cards */}
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCat(null)}
            className={`w-full flex items-center justify-between rounded-2xl p-3.5 text-xs font-semibold transition-all ${
              selectedCat === null
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>All Categories ({categoryList.length})</span>
            <span className="font-bold">{formatINR(totalExpense)}</span>
          </button>

          {categoryList.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCat(cat.name)}
              className={`w-full flex items-center justify-between rounded-2xl p-3.5 text-xs font-semibold transition-all ${
                selectedCat === cat.name
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75">({cat.percentage}%)</span>
              </div>
              <span className="font-bold">{formatINR(cat.amount)}</span>
            </button>
          ))}
        </div>

        {/* Selected Category Transactions Drill-down */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            {selectedCat ? `Transactions in ${selectedCat}` : 'All Expenses Drill-Down'}
          </h3>

          <div className="mt-4 space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {filteredTransactions.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No transactions in this category</p>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 text-xs font-medium dark:bg-slate-800/50"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{tx.merchant || tx.category_name}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(tx.date)} • {tx.payment_method}</p>
                  </div>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">
                    -{formatINR(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
