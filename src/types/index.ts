export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string | null;
  currency: string;
  role: UserRole;
  is_active: boolean;
  theme: 'light' | 'dark' | 'system';
  created_at?: string;
  updated_at?: string;
}

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  is_custom?: boolean;
  created_at?: string;
}

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Other';

export interface IncomeItem {
  id: string;
  user_id?: string;
  amount: number;
  date: string;
  category_name: string;
  description: string;
  notes?: string;
  created_at?: string;
}

export interface ExpenseItem {
  id: string;
  user_id?: string;
  amount: number;
  date: string;
  category_name: string;
  description: string;
  payment_method: PaymentMethod;
  notes?: string;
  created_at?: string;
}

export interface UnifiedTransaction {
  id: string;
  user_id?: string;
  type: TransactionType;
  amount: number;
  date: string;
  category_name: string;
  description: string;
  payment_method?: PaymentMethod;
  notes?: string;
  created_at?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthBalance: number;
}
