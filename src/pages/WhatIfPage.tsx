import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import type { FinancialSummary, HealthScoreBreakdown, Loan } from '../types';
import { formatINR } from '../utils/formatters';

interface WhatIfPageProps {
  summary: FinancialSummary;
  healthScore: HealthScoreBreakdown;
  loans?: Loan[];
}

export const WhatIfPage: React.FC<WhatIfPageProps> = ({ summary, healthScore }) => {
  const [extraSavings, setExtraSavings] = useState('5000');
  const [extraLoanPrepay, setExtraLoanPrepay] = useState('10000');
  const [expenseCut, setExpenseCut] = useState('3000');

  const extraSavNum = parseFloat(extraSavings) || 0;
  const extraPrepayNum = parseFloat(extraLoanPrepay) || 0;
  const cutNum = parseFloat(expenseCut) || 0;

  // Projected Monthly Cash Flow Surplus
  const projectedSurplus = summary.monthlySurplus + cutNum - extraSavNum - extraPrepayNum;

  // Projected Health Score Delta
  let scoreDelta = 0;
  if (cutNum > 0) scoreDelta += 4;
  if (extraSavNum > 0) scoreDelta += 5;
  if (extraPrepayNum > 0) scoreDelta += 6;

  const projectedScore = Math.min(100, healthScore.score + scoreDelta);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-500/30">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">What-If Scenario Sandbox</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-300">
              Simulate hypothetical financial decisions in real-time without modifying your database.
            </p>
          </div>
        </div>
      </div>

      {summary.monthlyIncome === 0 && summary.monthlyExpenses === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Scale className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Income & Expenses to simulate scenarios</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Add your monthly income and expenses to run real-time What-If simulations on cash flow, surplus, and health score deltas.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Interactive Controls */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Scenario Controls */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
            Scenario Parameters
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-500">Increase Monthly Savings By (₹)</label>
            <input
              type="number"
              step="1000"
              value={extraSavings}
              onChange={(e) => setExtraSavings(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-900 outline-none focus:border-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Pay Extra Toward Loan Principal (₹/mo)</label>
            <input
              type="number"
              step="1000"
              value={extraLoanPrepay}
              onChange={(e) => setExtraLoanPrepay(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-900 outline-none focus:border-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Reduce Discretionary Spending By (₹/mo)</label>
            <input
              type="number"
              step="500"
              value={expenseCut}
              onChange={(e) => setExpenseCut(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-900 outline-none focus:border-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Real-time Projected Output */}
        <div className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 shadow-sm dark:border-purple-900/40 dark:bg-purple-950/20 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-purple-600 px-3 py-1 text-[10px] font-extrabold uppercase text-white">
              Projected Outcome Simulation
            </span>
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
              Health Score: {healthScore.score} ➔ {projectedScore}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Current Surplus</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{formatINR(summary.monthlySurplus)}</p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Simulated Net Surplus</p>
              <p className={`mt-1 text-xl font-extrabold ${projectedSurplus >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatINR(projectedSurplus)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Simulated Financial Impact Breakdown:</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              • Cutting {formatINR(cutNum)} monthly expenses increases your available cash flow surplus.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              • Prepaying {formatINR(extraPrepayNum)} extra/month on loans reduces your total interest payment significantly over the loan tenure.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              • Your projected Financial Health Score will improve by <span className="font-bold text-emerald-600">+{scoreDelta} pts</span> to {projectedScore}/100.
            </p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
