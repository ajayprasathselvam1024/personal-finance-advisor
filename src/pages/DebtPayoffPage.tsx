import React, { useState } from 'react';
import { Flame, Info } from 'lucide-react';
import type { Loan, GoldLoan } from '../types';
import { calculateDebtPayoffSchedule } from '../utils/calculations';
import { formatINR } from '../utils/formatters';

interface DebtPayoffPageProps {
  loans: Loan[];
  goldLoans: GoldLoan[];
}

export const DebtPayoffPage: React.FC<DebtPayoffPageProps> = ({ loans, goldLoans }) => {
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [extraPayment, setExtraPayment] = useState<string>('5000');

  const extraNum = parseFloat(extraPayment) || 0;
  const plan = calculateDebtPayoffSchedule(loans, goldLoans, extraNum, strategy);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Debt Payoff Planner</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-300">
              Accelerate debt freedom with mathematical Avalanche & Snowball payoff strategies.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Inputs & Strategy Selector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Controls */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Payoff Strategy
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setStrategy('avalanche')}
                className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                  strategy === 'avalanche'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                🔥 Avalanche
              </button>
              <button
                type="button"
                onClick={() => setStrategy('snowball')}
                className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                  strategy === 'snowball'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                ❄️ Snowball
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              {strategy === 'avalanche'
                ? 'Avalanche targets highest interest rate first (Saves maximum money).'
                : 'Snowball targets smallest balance first (Quick psychological wins).'}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Extra Monthly Payment (₹)
            </label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="500"
                value={extraPayment}
                onChange={(e) => setExtraPayment(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-lg font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Impact Results */}
        <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/20 lg:col-span-2 flex flex-col justify-between">
          <div>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-extrabold uppercase text-white">
              Estimated Payoff Impact
            </span>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              Payoff Freedom in <span className="text-blue-600 dark:text-blue-400">{plan.monthsToPayoff} Months</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Original timeline without extra payments: {plan.originalPayoffMonths} months.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Estimated Time Saved</p>
              <p className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {plan.monthsSaved} Months Faster ({Math.round(plan.monthsSaved / 12 * 10) / 10} Years)
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Estimated Interest Saved</p>
              <p className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatINR(plan.interestSaved)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Debt Payoff Queue */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Target Repayment Sequence ({strategy.toUpperCase()} Order)
        </h3>

        <div className="mt-4 space-y-3">
          {plan.orderedLoans.map((debt, idx) => (
            <div
              key={debt.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs">
                  #{idx + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{debt.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Interest: {debt.interestRate}% p.a. • EMI: {formatINR(debt.emi)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {formatINR(debt.outstanding)}
                </p>
                <p className="text-[10px] font-bold text-blue-600">Payoff Month ~{debt.payoffMonth}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500">
        <Info className="h-3.5 w-3.5" />
        <span>Note: Payoff timelines are mathematical estimations assuming fixed monthly interest compounding.</span>
      </div>
    </div>
  );
};
