import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginPage } from './components/auth/LoginPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AccessDeniedPage } from './components/auth/AccessDeniedPage';

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
import { UserManagementPage } from './pages/UserManagementPage';

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
  PermissionKey,
} from './types';
import {
  calculateFinancialSummary,
  calculateFinancialHealthScore,
} from './utils/calculations';
import { generateAdvisorInsights } from './services/advisorService';

const MainApp: React.FC = () => {
  const { user, loading, profile, hasPermission, isAdmin } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

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
    } catch (e) {
      console.error('Error fetching financial data:', e);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  if (isResetRoute) {
    return <ResetPasswordPage onSuccess={() => { window.location.href = '/'; }} />;
  }

  if (loading || (user && dataLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Authenticating & Loading My Finance...</p>
        </div>
      </div>
    );
  }

  if (!user && activePage !== 'login') {
    return <LoginPage onSuccess={() => setActivePage('dashboard')} />;
  }

  if (activePage === 'login') {
    return <LoginPage onSuccess={() => setActivePage('dashboard')} />;
  }

  // Live Dynamic Financial Calculations
  const summary = calculateFinancialSummary(
    incomes,
    expenses,
    loans,
    goldLoans,
    savings,
    investments,
    profile?.monthly_income || 0
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

  // Helper for Route Permissions
  const canAccess = (permKey?: PermissionKey, adminOnly: boolean = false): boolean => {
    if (adminOnly) return isAdmin;
    if (permKey) return hasPermission(permKey);
    return true;
  };

  return (
    <AuthGuard>
      <Layout activePage={activePage} onNavigate={setActivePage} onRefreshData={loadAllData}>
        {activePage === 'dashboard' && (
          canAccess('view_dashboard') ? (
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
          ) : <AccessDeniedPage />
        )}

        {activePage === 'income' && (
          canAccess('view_income') ? <IncomePage incomes={incomes} onRefresh={loadAllData} /> : <AccessDeniedPage />
        )}

        {activePage === 'expenses' && (
          canAccess('view_expenses') ? <ExpensesPage expenses={expenses} onRefresh={loadAllData} /> : <AccessDeniedPage />
        )}

        {activePage === 'categories' && (
          canAccess('view_expenses') ? <CategoryAnalysisPage expenses={expenses} /> : <AccessDeniedPage />
        )}

        {activePage === 'transactions' && (
          canAccess('view_expenses') ? <TransactionsPage incomes={incomes} expenses={expenses} /> : <AccessDeniedPage />
        )}

        {activePage === 'loans' && (
          canAccess('view_loans') ? <LoansPage loans={loans} onRefresh={loadAllData} /> : <AccessDeniedPage />
        )}

        {activePage === 'gold-loans' && (
          canAccess('view_gold_loans') ? <GoldLoansPage goldLoans={goldLoans} onRefresh={loadAllData} /> : <AccessDeniedPage />
        )}

        {activePage === 'debt-payoff' && (
          canAccess('view_loans') ? <DebtPayoffPage loans={loans} goldLoans={goldLoans} /> : <AccessDeniedPage />
        )}

        {activePage === 'what-if' && (
          canAccess('view_dashboard') ? <WhatIfPage summary={summary} healthScore={healthScore} /> : <AccessDeniedPage />
        )}

        {activePage === 'savings' && (
          canAccess('view_savings') ? <SavingsPage savings={savings} onRefresh={loadAllData} /> : <AccessDeniedPage />
        )}

        {activePage === 'investments' && (
          canAccess('view_investments') ? <InvestmentsPage investments={investments} onRefresh={loadAllData} /> : <AccessDeniedPage />
        )}

        {activePage === 'budgets' && (
          canAccess('manage_budgets') ? <BudgetsPage budgets={budgets} expenses={expenses} onRefresh={loadAllData} /> : <AccessDeniedPage />
        )}

        {activePage === 'goals' && (
          canAccess('manage_goals') ? <GoalsPage goals={goals} onRefresh={loadAllData} /> : <AccessDeniedPage />
        )}

        {activePage === 'recurring' && (
          canAccess('view_expenses') ? <RecurringPage onRefresh={loadAllData} /> : <AccessDeniedPage />
        )}

        {activePage === 'advisor' && (
          canAccess('view_advisor') ? (
            <FinancialAdvisorPage insights={advisorInsights} summary={summary} onNavigate={setActivePage} />
          ) : <AccessDeniedPage />
        )}

        {activePage === 'health-score' && (
          canAccess('view_dashboard') ? <HealthScorePage healthScore={healthScore} onNavigate={setActivePage} /> : <AccessDeniedPage />
        )}

        {activePage === 'reports' && (
          canAccess('view_reports') ? (
            <ReportsPage incomes={incomes} expenses={expenses} loans={loans} />
          ) : <AccessDeniedPage />
        )}

        {activePage === 'users' && (
          isAdmin ? <UserManagementPage /> : <AccessDeniedPage />
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
