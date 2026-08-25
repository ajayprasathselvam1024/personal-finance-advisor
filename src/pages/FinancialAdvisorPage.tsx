import React from 'react';
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';
import type { AdvisorRecommendation, FinancialSummary } from '../types';
import { formatINR } from '../utils/formatters';

interface FinancialAdvisorPageProps {
  insights: AdvisorRecommendation[];
  summary: FinancialSummary;
  onNavigate: (page: string) => void;
}

export const FinancialAdvisorPage: React.FC<FinancialAdvisorPageProps> = ({
  insights,
  summary,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Financial Advisor</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-300">
              Personalized data-driven insights computed directly from your database records.
            </p>
          </div>
        </div>

        {/* Dynamic Financial Snapshot Pill */}
        <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md">
            Monthly Surplus: <span className="font-bold text-emerald-400">{formatINR(summary.monthlySurplus)}</span>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md">
            EMI Burden: <span className="font-bold text-indigo-300">{summary.emiBurdenRate}%</span>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md">
            Savings Rate: <span className="font-bold text-blue-300">{summary.savingsRate}%</span>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md">
            Emergency Cover: <span className="font-bold text-amber-300">{summary.emergencyFundMonths} Months</span>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Prioritized Financial Action Items ({insights.length})</span>
        </h2>

        {insights.map((item) => (
          <div
            key={item.id}
            className={`rounded-3xl border p-6 shadow-sm transition-all ${
              item.priority === 'high'
                ? 'border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20'
                : item.priority === 'medium'
                ? 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20'
                : 'border-blue-200 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      item.priority === 'high'
                        ? 'bg-rose-500 text-white'
                        : item.priority === 'medium'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.insight}</p>

                <div className="rounded-2xl bg-white p-4 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    💡 Advisor Recommendation:
                  </p>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.recommendation}
                  </p>
                </div>
              </div>

              {item.actionType && (
                <button
                  onClick={() => onNavigate(item.actionType!)}
                  className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all shrink-0 self-start"
                >
                  <span>Take Action</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Advisor Disclaimer */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 flex items-start gap-2.5">
        <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
        <span>
          Disclaimer: WealthWise Advisor recommendations are calculated using algorithmic financial planning rules based on your provided income, EMI, loan, and expense inputs. This is for decision-support and educational purposes and does not constitute certified professional investment or legal advice.
        </span>
      </div>
    </div>
  );
};
