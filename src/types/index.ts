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

export type TransactionSource =
  | 'IDFC_BANK'
  | 'HDFC_BANK'
  | 'GOOGLE_PAY'
  | 'MANUAL';

export type ImportSource = 'IDFC' | 'HDFC' | 'GOOGLE_PAY';

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
  source?: TransactionSource;
  reference_id?: string;
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
  source?: TransactionSource;
  reference_id?: string;
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
  source?: TransactionSource;
  reference_id?: string;
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

export interface ParsedTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: TransactionType;
  category_name: string;
  payment_method: PaymentMethod;
  source: TransactionSource;
  reference_id?: string;
  notes?: string;
  is_duplicate?: boolean;
  needs_review?: boolean;
  selected: boolean;
}

export interface ImportHistoryItem {
  id: string;
  user_id?: string;
  file_name: string;
  source: ImportSource;
  imported_at: string;
  transaction_count: number;
  status: 'Completed' | 'Failed';
}
