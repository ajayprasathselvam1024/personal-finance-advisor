import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginPage } from './components/auth/LoginPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

import { DashboardPage } from './pages/DashboardPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { CategoryAnalysisPage } from './pages/CategoryAnalysisPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { LoansPage } from './pages/LoansPage';
import { GoldLoansPage } from './pages/GoldLoansPage';
import { DebtPayoffPage } from './pages/DebtPayoffPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { SavingsPage } from './pages/SavingsPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { GoalsPage } from './pages/GoalsPage';
import { FinancialAdvisorPage } from './pages/FinancialAdvisorPage';
import { HealthScorePage } from './pages/HealthScorePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { RecurringPage } from './pages/RecurringPage';

import { dataService } from './services/dataService';
import type {
  IncomeItem,
  ExpenseItem,
  Loan,
  GoldLoan,
  SavingsItem,
  InvestmentItem,
  FinancialGoal,
  Budget,
} from './types';
import {
  calculateFinancialSummary,
  calculateFinancialHealthScore,
} from './utils/calculations';
import { generateAdvisorInsights } from './services/advisorService';

const MainApp: React.FC = () => {
  const { user, loading, profile } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Data States
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [goldLoans, setGoldLoans] = useState<GoldLoan[]>([]);
  const [savings, setSavings] = useState<SavingsItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Reset Password route detection
  const isResetRoute = window.location.pathname.includes('/reset-password') || window.location.hash.includes('type=recovery');

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      const [inc, exp, lns, gLns, svg, inv, gls, bdg] = await Promise.all([
        dataService.getIncomes(),
        dataService.getExpenses(),
        dataService.getLoans(),
        dataService.getGoldLoans(),
        dataService.getSavings(),
        dataService.getInvestments(),
        dataService.getGoals(),
        dataService.getBudgets(),
      ]);

      setIncomes(inc);
      setExpenses(exp);
      setLoans(lns);
      setGoldLoans(gLns);
      setSavings(svg);
      setInvestments(inv);
      setGoals(gls);
      setBudgets(bdg);

      // Check onboarding criteria
      if (inc.length === 0 && exp.length === 0 && lns.length === 0) {
        const onboardingDone = localStorage.getItem('fin_onboarding_done');
        if (!onboardingDone) {
          setShowOnboarding(true);
        }
      }
    } catch (e) {
      console.error('Error fetching financial data:', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  if (isResetRoute) {
    return <ResetPasswordPage onSuccess={() => { window.location.href = '/'; }} />;
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Loading My Finance Engine...</p>
        </div>
      </div>
    );
  }

  if (activePage === 'login') {
    return <LoginPage onSuccess={() => setActivePage('dashboard')} />;
  }

  if (showOnboarding || activePage === 'onboarding') {
    return <OnboardingWizard onComplete={() => { setShowOnboarding(false); setActivePage('dashboard'); loadAllData(); }} />;
  }

  // Live Dynamic Financial Calculations
  const summary = calculateFinancialSummary(
    incomes,
    expenses,
    loans,
    goldLoans,
    savings,
    investments,
    profile?.monthly_income || 91000
  );

  const healthScore = calculateFinancialHealthScore(summary, loans, savings, goals);
  const advisorInsights = generateAdvisorInsights(
    summary,
    incomes,
    expenses,
    loans,
    goldLoans,
    savings,
    investments,
    goals,
    budgets
  );

  return (
    <AuthGuard>
      <Layout activePage={activePage} onNavigate={setActivePage} onRefreshData={loadAllData}>
        {activePage === 'dashboard' && (
          <DashboardPage
            summary={summary}
            healthScore={healthScore}
            advisorInsights={advisorInsights}
            incomes={incomes}
            expenses={expenses}
            loans={loans}
            goldLoans={goldLoans}
            savings={savings}
            investments={investments}
            goals={goals}
            onNavigate={setActivePage}
          />
        )}
        {activePage === 'income' && <IncomePage incomes={incomes} onRefresh={loadAllData} />}
        {activePage === 'expenses' && <ExpensesPage expenses={expenses} onRefresh={loadAllData} />}
        {activePage === 'categories' && <CategoryAnalysisPage expenses={expenses} />}
        {activePage === 'transactions' && <TransactionsPage incomes={incomes} expenses={expenses} />}
        {activePage === 'loans' && <LoansPage loans={loans} onRefresh={loadAllData} />}
        {activePage === 'gold-loans' && <GoldLoansPage goldLoans={goldLoans} onRefresh={loadAllData} />}
        {activePage === 'debt-payoff' && <DebtPayoffPage loans={loans} goldLoans={goldLoans} />}
        {activePage === 'what-if' && <WhatIfPage summary={summary} healthScore={healthScore} />}
        {activePage === 'savings' && <SavingsPage savings={savings} onRefresh={loadAllData} />}
        {activePage === 'investments' && <InvestmentsPage investments={investments} onRefresh={loadAllData} />}
        {activePage === 'budgets' && <BudgetsPage budgets={budgets} expenses={expenses} onRefresh={loadAllData} />}
        {activePage === 'goals' && <GoalsPage goals={goals} onRefresh={loadAllData} />}
        {activePage === 'recurring' && <RecurringPage onRefresh={loadAllData} />}
        {activePage === 'advisor' && (
          <FinancialAdvisorPage insights={advisorInsights} summary={summary} onNavigate={setActivePage} />
        )}
        {activePage === 'health-score' && <HealthScorePage healthScore={healthScore} onNavigate={setActivePage} />}
        {activePage === 'reports' && (
          <ReportsPage
            incomes={incomes}
            expenses={expenses}
            loans={loans}
          />
        )}
        {activePage === 'settings' && <SettingsPage onRefresh={loadAllData} />}
      </Layout>
    </AuthGuard>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
