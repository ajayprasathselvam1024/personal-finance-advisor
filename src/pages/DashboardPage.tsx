import React from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Coins,
  PiggyBank,
  Wallet,
  TrendingUp,
  Calendar,
  BrainCircuit,
  ArrowRight,
  Flame,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type {
  IncomeItem,
  ExpenseItem,
  Loan,
  GoldLoan,
  SavingsItem,
  InvestmentItem,
  FinancialGoal,
  FinancialSummary,
  HealthScoreBreakdown,
  AdvisorRecommendation,
} from '../types';
import { formatINR } from '../utils/formatters';

interface DashboardPageProps {
  summary: FinancialSummary;
  healthScore: HealthScoreBreakdown;
  advisorInsights: AdvisorRecommendation[];
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  loans: Loan[];
  goldLoans: GoldLoan[];
  savings: SavingsItem[];
  investments: InvestmentItem[];
  goals: FinancialGoal[];
  onNavigate: (page: string) => void;
  onOpenAddExpense?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  summary,
  healthScore,
  advisorInsights,
  expenses,
  loans,
  goldLoans,
  goals,
  onNavigate,
}) => {
  // Expense Category breakdown for Pie Chart
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category_name] = (categoryMap[e.category_name] || 0) + e.amount;
  });

  const categoryPieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

  // Cash Flow Monthly Mock Trend for Bar/Area chart
  const cashFlowTrend = [
    { month: 'Mar', income: summary.monthlyIncome, expense: summary.monthlyExpenses * 0.9, emi: summary.monthlyEmi },
    { month: 'Apr', income: summary.monthlyIncome, expense: summary.monthlyExpenses * 1.05, emi: summary.monthlyEmi },
    { month: 'May', income: summary.monthlyIncome, expense: summary.monthlyExpenses * 0.95, emi: summary.monthlyEmi },
    { month: 'Jun', income: summary.monthlyIncome, expense: summary.monthlyExpenses * 1.1, emi: summary.monthlyEmi },
    { month: 'Jul', income: summary.monthlyIncome, expense: summary.monthlyExpenses * 0.98, emi: summary.monthlyEmi },
    { month: 'Aug', income: summary.monthlyIncome, expense: summary.monthlyExpenses, emi: summary.monthlyEmi },
  ];

  // Active Loans & Gold Loan Dues
  const activeLoans = loans.filter((l) => l.status === 'active');
  const activeGoldLoans = goldLoans.filter((g) => g.status === 'active');

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & AI Advisor Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-300 border border-blue-400/30">
              <BrainCircuit className="h-4 w-4" />
              <span>AI Financial Advisor Active</span>
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Monthly Cash Flow Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Track your income, EMIs, gold loan payments, and investments in real-time.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div>
              <p className="text-[11px] font-semibold text-slate-300 uppercase">Health Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {summary.monthlyIncome === 0 && summary.monthlyExpenses === 0 ? '0' : healthScore.score}
                </span>
                <span className={`text-xs font-bold ${summary.monthlyIncome === 0 && summary.monthlyExpenses === 0 ? 'text-amber-300' : 'text-emerald-400'}`}>
                  / 100 ({summary.monthlyIncome === 0 && summary.monthlyExpenses === 0 ? 'No Data' : healthScore.rating})
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('health-score')}
              className="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all shadow"
            >
              Analyze
            </button>
          </div>
        </div>
      </div>

      {/* Top 8 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Monthly Income */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Income
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/40">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(summary.monthlyIncome)}
          </p>
          <p className="mt-1 text-[11px] font-medium text-emerald-600">Verified inflow</p>
        </div>

        {/* 2. Monthly Expenses */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Expenses
            </span>
            <div className="rounded-xl bg-rose-50 p-2 dark:bg-rose-950/40">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(summary.monthlyExpenses)}
          </p>
          <p className="mt-1 text-[11px] font-medium text-rose-500">Fixed & variable spend</p>
        </div>

        {/* 3. Total EMI */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total EMI
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 dark:bg-indigo-950/40">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(summary.monthlyEmi)}
          </p>
          <p className="mt-1 text-[11px] font-medium text-indigo-600">{activeLoans.length} active loans</p>
        </div>

        {/* 4. Gold Loan Payment */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gold Loan EMI
            </span>
            <div className="rounded-xl bg-amber-50 p-2 dark:bg-amber-950/40">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(summary.monthlyGoldLoanPayment)}
          </p>
          <p className="mt-1 text-[11px] font-medium text-amber-600">{activeGoldLoans.length} pledged gold loans</p>
        </div>

        {/* 5. Monthly Savings */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Savings & SIP
            </span>
            <div className="rounded-xl bg-blue-50 p-2 dark:bg-blue-950/40">
              <PiggyBank className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(summary.monthlyInvestments + summary.monthlySavings)}
          </p>
          <p className="mt-1 text-[11px] font-medium text-blue-600">Rate: {summary.savingsRate}%</p>
        </div>

        {/* 6. Remaining Surplus */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Surplus
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/40">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`mt-2 text-lg sm:text-xl font-extrabold ${
              summary.monthlySurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatINR(summary.monthlySurplus)}
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">Calculated after outflows</p>
        </div>

        {/* 7. Total Outstanding Debt */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Outstanding Debt
            </span>
            <div className="rounded-xl bg-rose-50 p-2 dark:bg-rose-950/40">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {formatINR(summary.totalOutstandingDebt)}
          </p>
          <p className="mt-1 text-[11px] font-medium text-rose-500">Loans + Gold Loans</p>
        </div>

        {/* 8. Net Worth */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 card-hover">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Worth
            </span>
            <div className="rounded-xl bg-purple-50 p-2 dark:bg-purple-950/40">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p
            className={`mt-2 text-lg sm:text-xl font-extrabold ${
              summary.netWorth >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatINR(summary.netWorth)}
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">Assets minus liabilities</p>
        </div>
      </div>

      {/* Top AI Advisor Priority Recommendation Card */}
      {advisorInsights.length > 0 && (
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50/80 p-5 dark:border-blue-900/50 dark:from-slate-900 dark:to-blue-950/40">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-500/20 mt-0.5">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <span className="rounded-full bg-blue-600/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-blue-700 dark:text-blue-300">
                  Priority Recommendation
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {advisorInsights[0].title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {advisorInsights[0].insight}
                </p>
                <p className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  💡 {advisorInsights[0].recommendation}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('advisor')}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition-all shrink-0"
            >
              <span>View All Insights</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Income vs Expenses Cash-flow Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Cash Flow Trend</h3>
              <p className="text-xs text-slate-500">Income vs Expenses vs Debt Service</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              EMI Burden: {summary.emiBurdenRate}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowTrend}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val / 1000}k`} tickLine={false} />
                <Tooltip formatter={(val) => formatINR(Number(val))} />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
                <Bar dataKey="emi" fill="#6366F1" radius={[4, 4, 0, 0]} name="EMI" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Pie Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expense Categories</h3>
            <button
              onClick={() => onNavigate('categories')}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Analyze
            </button>
          </div>

          {categoryPieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center dark:bg-slate-800 text-slate-400">
                <PieChartIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">No expenses recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Start recording expenses to view category distribution</p>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                + Add First Expense
              </button>
            </div>
          ) : (
            <>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => formatINR(Number(val))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {categoryPieData.slice(0, 5).map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-slate-600 dark:text-slate-300">{cat.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{formatINR(cat.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upcoming EMIs & Gold Loan Dues + Goals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming EMI & Loan Schedule */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming EMI & Gold Loan Dues</h3>
            </div>
            <button
              onClick={() => onNavigate('loans')}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              View All ({activeLoans.length + activeGoldLoans.length})
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {activeLoans.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{loan.name}</p>
                  <p className="text-[11px] text-slate-500">
                    Due on {loan.due_date_day}th of month • {loan.remaining_tenure} EMIs left
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatINR(loan.emi_amount)}
                  </p>
                  <p className="text-[10px] text-slate-400">{loan.lender}</p>
                </div>
              </div>
            ))}

            {activeGoldLoans.map((gl) => (
              <div
                key={gl.id}
                className="flex items-center justify-between rounded-2xl bg-amber-50/60 p-3.5 dark:bg-amber-950/20"
              >
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{gl.name}</p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400">
                    Monthly Interest Payment ({gl.interest_rate}%)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    {formatINR(gl.monthly_payment)}
                  </p>
                  <p className="text-[10px] text-slate-400">{gl.lender}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Goal Progress */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Financial Goal Progress</h3>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Manage Goals
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {goals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{goal.name}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{progress}%</span>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{formatINR(goal.current_amount)} saved</span>
                    <span>Target: {formatINR(goal.target_amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
