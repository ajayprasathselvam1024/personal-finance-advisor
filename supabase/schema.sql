-- ====================================================================
-- MY FINANCE - PERSONAL INCOME & EXPENSE MANAGER DATABASE SCHEMA
-- SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- Enable UUID Extension
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

-- 3. CATEGORIES TABLE (Income & Expense Categories)
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
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  source TEXT DEFAULT 'MANUAL' CHECK (source IN ('IDFC_BANK', 'HDFC_BANK', 'GOOGLE_PAY', 'MANUAL')),
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  date DATE NOT NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other')),
  source TEXT DEFAULT 'MANUAL' CHECK (source IN ('IDFC_BANK', 'HDFC_BANK', 'GOOGLE_PAY', 'MANUAL')),
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IMPORT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('IDFC', 'HDFC', 'GOOGLE_PAY')),
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  transaction_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Completed'
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_income_user_date ON public.income(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON public.expenses(user_id, category_name);
CREATE INDEX IF NOT EXISTS idx_income_ref ON public.income(user_id, reference_id);
CREATE INDEX IF NOT EXISTS idx_expenses_ref ON public.expenses(user_id, reference_id);
CREATE INDEX IF NOT EXISTS idx_import_hist_user ON public.import_history(user_id, imported_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Helper function to check Admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Helper
CREATE OR REPLACE FUNCTION create_simple_rls_policy(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS "Access policy for %I" ON public.%I', table_name, table_name);
  EXECUTE format('CREATE POLICY "Access policy for %I" ON public.%I FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin())', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

SELECT create_simple_rls_policy('categories');
SELECT create_simple_rls_policy('income');
SELECT create_simple_rls_policy('expenses');
SELECT create_simple_rls_policy('import_history');

-- Profile RLS
DROP POLICY IF EXISTS "Profile RLS" ON public.profiles;
CREATE POLICY "Profile RLS" ON public.profiles FOR ALL USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

-- User Permissions RLS
DROP POLICY IF EXISTS "Permissions RLS" ON public.user_permissions;
CREATE POLICY "Permissions RLS" ON public.user_permissions FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (public.is_admin());
