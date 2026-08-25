-- ====================================================================
-- PERSONAL FINANCE ADVISOR & MANAGEMENT DATABASE SCHEMA
-- SUPABASE POSTGRESQL SCHEMA WITH RBAC AND ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  currency TEXT DEFAULT 'INR',
  monthly_income NUMERIC DEFAULT 0 CHECK (monthly_income >= 0),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notification_preferences JSONB DEFAULT '{"email": true, "inApp": true, "dueReminders": true, "budgetAlerts": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission_key)
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT DEFAULT 'Folder',
  color TEXT DEFAULT '#3B82F6',
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, type)
);

-- 4. INCOME TABLE
CREATE TABLE IF NOT EXISTS public.income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('Salary', 'Freelance', 'Business', 'Bonus', 'Interest', 'Rental', 'Other')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency TEXT DEFAULT 'monthly',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_name TEXT NOT NULL,
  sub_category TEXT,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other')),
  merchant TEXT,
  is_recurring BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LOANS & EMI TABLE
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Personal Loan', 'Home Loan', 'Vehicle Loan', 'Credit Card', 'Consumer Loan', 'Other')),
  original_amount NUMERIC NOT NULL CHECK (original_amount > 0),
  current_outstanding NUMERIC NOT NULL CHECK (current_outstanding >= 0),
  emi_amount NUMERIC NOT NULL CHECK (emi_amount >= 0),
  interest_rate NUMERIC NOT NULL CHECK (interest_rate >= 0),
  tenure_months INT NOT NULL CHECK (tenure_months > 0),
  remaining_tenure INT NOT NULL CHECK (remaining_tenure >= 0),
  start_date DATE NOT NULL,
  due_date_day INT NOT NULL CHECK (due_date_day BETWEEN 1 AND 31),
  lender TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'refinanced')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. LOAN PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  principal_component NUMERIC DEFAULT 0,
  interest_component NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. GOLD LOANS TABLE
CREATE TABLE IF NOT EXISTS public.gold_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  principal_amount NUMERIC NOT NULL CHECK (principal_amount > 0),
  current_outstanding NUMERIC NOT NULL CHECK (current_outstanding >= 0),
  interest_rate NUMERIC NOT NULL CHECK (interest_rate >= 0),
  interest_type TEXT NOT NULL CHECK (interest_type IN ('Monthly Simple', 'Annual Simple', 'Compounded', 'Bullet Payment')),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  monthly_payment NUMERIC NOT NULL CHECK (monthly_payment >= 0),
  lender TEXT NOT NULL,
  gold_pledged_description TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SAVINGS TABLE
CREATE TABLE IF NOT EXISTS public.savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Emergency Fund', 'Bank Savings', 'RD', 'FD', 'Gold Savings', 'Mutual Fund', 'Other')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  expected_return_rate NUMERIC DEFAULT 0 CHECK (expected_return_rate >= 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Mutual Funds', 'SIP', 'Stocks', 'FD', 'RD', 'Gold', 'Other')),
  invested_amount NUMERIC NOT NULL CHECK (invested_amount >= 0),
  current_value NUMERIC NOT NULL CHECK (current_value >= 0),
  monthly_contribution NUMERIC DEFAULT 0 CHECK (monthly_contribution >= 0),
  expected_return_rate NUMERIC DEFAULT 0 CHECK (expected_return_rate >= 0),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_name TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL CHECK (monthly_limit > 0),
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_name, month, year)
);

-- 12. FINANCIAL GOALS TABLE
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date DATE NOT NULL,
  monthly_contribution NUMERIC DEFAULT 0 CHECK (monthly_contribution >= 0),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. RECURRING TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'emi', 'savings', 'investment')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category_name TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'weekly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  last_processed_date DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function for Admin & User RLS Policies
CREATE OR REPLACE FUNCTION create_rbac_rls_policy(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS "Access policy for %I" ON public.%I', table_name, table_name);
  EXECUTE format('CREATE POLICY "Access policy for %I" ON public.%I FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin())', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply RLS policies to tables
SELECT create_rbac_rls_policy('categories');
SELECT create_rbac_rls_policy('income');
SELECT create_rbac_rls_policy('expenses');
SELECT create_rbac_rls_policy('loans');
SELECT create_rbac_rls_policy('loan_payments');
SELECT create_rbac_rls_policy('gold_loans');
SELECT create_rbac_rls_policy('savings');
SELECT create_rbac_rls_policy('investments');
SELECT create_rbac_rls_policy('budgets');
SELECT create_rbac_rls_policy('financial_goals');
SELECT create_rbac_rls_policy('recurring_transactions');

-- Profile RLS (Users view own profile, Admin manages all profiles)
DROP POLICY IF EXISTS "Profile RLS" ON public.profiles;
CREATE POLICY "Profile RLS" ON public.profiles FOR ALL USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

-- User Permissions RLS
DROP POLICY IF EXISTS "Permissions RLS" ON public.user_permissions;
CREATE POLICY "Permissions RLS" ON public.user_permissions FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (public.is_admin());

-- ====================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active, currency, monthly_income)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'USER'),
    true,
    'INR',
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
