import type {
  IncomeItem,
  ExpenseItem,
  Loan,
  GoldLoan,
  SavingsItem,
  InvestmentItem,
  FinancialGoal,
  Budget,
} from '../types';

export const INITIAL_DEMO_DATA = {
  profile: {
    full_name: 'Admin',
    currency: 'INR',
    monthly_income: 0,
    theme: 'system' as const,
  },
  incomes: [] as IncomeItem[],
  expenses: [] as ExpenseItem[],
  loans: [] as Loan[],
  goldLoans: [] as GoldLoan[],
  savings: [] as SavingsItem[],
  investments: [] as InvestmentItem[],
  goals: [] as FinancialGoal[],
  budgets: [] as Budget[],
};
