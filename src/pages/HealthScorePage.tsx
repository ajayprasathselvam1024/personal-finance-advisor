import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import type { HealthScoreBreakdown } from '../types';

interface HealthScorePageProps {
  healthScore: HealthScoreBreakdown;
  onNavigate: (page: string) => void;
}

export const HealthScorePage: React.FC<HealthScorePageProps> = ({ healthScore, onNavigate }) => {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40';
      case 'Good': return 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40';
      case 'Fair': return 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40';
      default: return 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Financial Health Score
        </h1>
        <p className="text-xs text-slate-500">Comprehensive 0-100 evaluation across savings, emergency fund, EMI burden & debt levels</p>
      </div>

      {/* Main Score Hero Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-blue-600/20 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
            <span className="text-4xl font-extrabold">{healthScore.score}</span>
            <span className="absolute bottom-3 text-[10px] uppercase font-bold text-blue-200">/ 100</span>
          </div>

          <div>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold border ${getRatingColor(healthScore.rating)}`}>
              Rating: {healthScore.rating}
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Financial Health Status</h2>
            <p className="mt-1 text-xs text-slate-500 max-w-md">
              Evaluated across 7 financial pillars: Savings Rate, Emergency Reserve, EMI Ratio, Surplus, Investment Depth, and Goal Progress.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('advisor')}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all shrink-0"
        >
          <span>Get AI Recommendations</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* 6 Sub-Scores Breakdown */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Savings Rate Score */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">Savings Rate</span>
            <span className="text-blue-600 dark:text-blue-400">{healthScore.savingsScore} / 20 pts</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${(healthScore.savingsScore / 20) * 100}%` }} />
          </div>
        </div>

        {/* Emergency Fund Score */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">Emergency Fund Buffer</span>
            <span className="text-emerald-600 dark:text-emerald-400">{healthScore.emergencyFundScore} / 20 pts</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-600" style={{ width: `${(healthScore.emergencyFundScore / 20) * 100}%` }} />
          </div>
        </div>

        {/* EMI & Debt Burden Score */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">EMI & Debt Control</span>
            <span className="text-indigo-600 dark:text-indigo-400">{healthScore.emiBurdenScore} / 25 pts</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${(healthScore.emiBurdenScore / 25) * 100}%` }} />
          </div>
        </div>

        {/* Cash Flow Control */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">Cash Flow Surplus</span>
            <span className="text-emerald-600">{healthScore.expenseControlScore} / 15 pts</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${(healthScore.expenseControlScore / 15) * 100}%` }} />
          </div>
        </div>

        {/* Investment Growth */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">Investment Growth</span>
            <span className="text-purple-600">{healthScore.investmentScore} / 10 pts</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-purple-600" style={{ width: `${(healthScore.investmentScore / 10) * 100}%` }} />
          </div>
        </div>

        {/* Goal Progress */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-500">Goal Velocity</span>
            <span className="text-blue-600">{healthScore.goalProgressScore} / 10 pts</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${(healthScore.goalProgressScore / 10) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Strengths & Key Improvements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Strengths */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Key Financial Strengths</span>
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            {healthScore.keyStrengths.map((str, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-6 dark:border-amber-900/40 dark:bg-amber-950/20">
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Recommended Focus Areas</span>
          </h3>
          <ul className="mt-4 space-y-2.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
            {healthScore.keyImprovements.map((imp, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
