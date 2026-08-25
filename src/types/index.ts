export type IncomeSource = 
  | 'Salary' 
  | 'Freelance' 
  | 'Business' 
  | 'Bonus' 
  | 'Interest' 
  | 'Rental' 
  | 'Other';

export type DefaultExpenseCategory = 
  | 'Housing'
  | 'Food'
  | 'Groceries'
  | 'Transport'
  | 'Fuel'
  | 'Shopping'
  | 'Entertainment'
  | 'Subscriptions'
  | 'Utilities'
  | 'Electricity'
  | 'Internet'
  | 'Mobile'
  | 'Medical'
  | 'Insurance'
  | 'Education'
  | 'Family'
  | 'Travel'
  | 'Personal Care'
  | 'EMI'
  | 'Gold Loan'
  | 'Investment'
  | 'Savings'
  | 'Other';

export type PaymentMethod = 
  | 'Cash'
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Other';

export type LoanType = 
  | 'Personal Loan'
  | 'Home Loan'
  | 'Vehicle Loan'
  | 'Credit Card'
  | 'Consumer Loan'
  | 'Other';

export type SavingsType = 
  | 'Emergency Fund'
  | 'Bank Savings'
  | 'RD'
  | 'FD'
  | 'Gold Savings'
  | 'Mutual Fund'
  | 'Other';

export type InvestmentType = 
  | 'Mutual Funds'
  | 'SIP'
  | 'Stocks'
  | 'FD'
  | 'RD'
  | 'Gold'
  | 'Other';

export interface UserProfile {
  id: string;
  full_name: string | null;
  currency: string;
  monthly_income: number;
  theme: 'light' | 'dark' | 'system';
  notification_preferences: {
    email: boolean;
    inApp: boolean;
    dueReminders: boolean;
    budgetAlerts: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  is_custom?: boolean;
  created_at?: string;
}

export interface IncomeItem {
  id: string;
  user_id?: string;
  source: IncomeSource;
  amount: number;
  date: string;
  description: string;
  is_recurring: boolean;
  recurrence_frequency?: 'monthly' | 'weekly' | 'yearly';
  notes?: string;
  created_at?: string;
}

export interface ExpenseItem {
  id: string;
  user_id?: string;
  category_name: string;
  sub_category?: string;
  amount: number;
  date: string;
  payment_method: PaymentMethod;
  merchant?: string;
  is_recurring: boolean;
  notes?: string;
  created_at?: string;
}

export interface Loan {
  id: string;
  user_id?: string;
  name: string;
  type: LoanType;
  original_amount: number;
  current_outstanding: number;
  emi_amount: number;
  interest_rate: number;
  tenure_months: number;
  remaining_tenure: number;
  start_date: string;
  due_date_day: number;
  lender: string;
  status: 'active' | 'closed' | 'refinanced';
  notes?: string;
  created_at?: string;
}

export interface LoanPayment {
  id: string;
  user_id?: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  principal_component?: number;
  interest_component?: number;
  notes?: string;
  created_at?: string;
}

export interface GoldLoan {
  id: string;
  user_id?: string;
  name: string;
  principal_amount: number;
  current_outstanding: number;
  interest_rate: number;
  interest_type: 'Monthly Simple' | 'Annual Simple' | 'Compounded' | 'Bullet Payment';
  start_date: string;
  due_date: string;
  monthly_payment: number;
  lender: string;
  gold_pledged_description: string;
  status: 'active' | 'closed';
  notes?: string;
  created_at?: string;
}

export interface SavingsItem {
  id: string;
  user_id?: string;
  name: string;
  type: SavingsType;
  amount: number;
  expected_return_rate: number;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface InvestmentItem {
  id: string;
  user_id?: string;
  name: string;
  type: InvestmentType;
  invested_amount: number;
  current_value: number;
  monthly_contribution: number;
  expected_return_rate: number;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface Budget {
  id: string;
  user_id?: string;
  category_name: string;
  monthly_limit: number;
  month: number;
  year: number;
  created_at?: string;
}

export interface FinancialGoal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  monthly_contribution: number;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  created_at?: string;
}

export interface RecurringTransaction {
  id: string;
  user_id?: string;
  title: string;
  type: 'income' | 'expense' | 'emi' | 'savings' | 'investment';
  amount: number;
  category_name?: string;
  frequency: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  end_date?: string;
  last_processed_date?: string;
  is_active: boolean;
  notes?: string;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  is_read: boolean;
  created_at: string;
}

export interface FinancialSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyEmi: number;
  monthlyGoldLoanPayment: number;
  monthlySavings: number;
  monthlyInvestments: number;
  monthlySurplus: number;
  totalOutstandingDebt: number;
  totalSavings: number;
  totalInvestments: number;
  netWorth: number;
  savingsRate: number; // percentage
  emiBurdenRate: number; // percentage
  debtToIncomeRatio: number; // percentage
  emergencyFundMonths: number;
}

export interface AdvisorRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'cashflow' | 'emergency' | 'debt' | 'savings' | 'investment' | 'budget';
  title: string;
  insight: string;
  recommendation: string;
  potentialSavingsOrGain?: string;
  actionType?: string;
}

export interface HealthScoreBreakdown {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' | 'Critical';
  savingsScore: number;
  emergencyFundScore: number;
  emiBurdenScore: number;
  debtLevelScore: number;
  expenseControlScore: number;
  investmentScore: number;
  goalProgressScore: number;
  keyStrengths: string[];
  keyImprovements: string[];
}
