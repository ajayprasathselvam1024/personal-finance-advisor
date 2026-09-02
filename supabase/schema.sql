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
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_income_user_date ON public.income(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON public.expenses(user_id, category_name);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON public.categories(user_id, type);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

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

-- RLS for Categories, Income, Expenses
CREATE OR REPLACE FUNCTION create_simple_rls_policy(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS "Access policy for %I" ON public.%I', table_name, table_name);
  EXECUTE format('CREATE POLICY "Access policy for %I" ON public.%I FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin())', table_name, table_name);
END;
$$ LANGUAGE plpgsql;

SELECT create_simple_rls_policy('categories');
SELECT create_simple_rls_policy('income');
SELECT create_simple_rls_policy('expenses');

-- Profile RLS
DROP POLICY IF EXISTS "Profile RLS" ON public.profiles;
CREATE POLICY "Profile RLS" ON public.profiles FOR ALL USING (auth.uid() = id OR public.is_admin()) WITH CHECK (auth.uid() = id OR public.is_admin());

-- User Permissions RLS
DROP POLICY IF EXISTS "Permissions RLS" ON public.user_permissions;
CREATE POLICY "Permissions RLS" ON public.user_permissions FOR ALL USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (public.is_admin());

-- ====================================================================
-- AUTOMATIC PROFILE & DEFAULT CATEGORIES TRIGGER ON AUTH SIGNUP
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (id, email, full_name, role, is_active, currency)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'USER'),
    true,
    'INR'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  -- Insert Default Income Categories
  INSERT INTO public.categories (user_id, name, type, is_custom) VALUES
    (new.id, 'Salary', 'income', false),
    (new.id, 'Freelance', 'income', false),
    (new.id, 'Business', 'income', false),
    (new.id, 'Bonus', 'income', false),
    (new.id, 'Interest', 'income', false),
    (new.id, 'Rental Income', 'income', false),
    (new.id, 'Other', 'income', false)
  ON CONFLICT DO NOTHING;

  -- Insert Default Expense Categories
  INSERT INTO public.categories (user_id, name, type, is_custom) VALUES
    (new.id, 'Food', 'expense', false),
    (new.id, 'Groceries', 'expense', false),
    (new.id, 'Transport', 'expense', false),
    (new.id, 'Fuel', 'expense', false),
    (new.id, 'Shopping', 'expense', false),
    (new.id, 'Entertainment', 'expense', false),
    (new.id, 'Bills', 'expense', false),
    (new.id, 'Electricity', 'expense', false),
    (new.id, 'Internet', 'expense', false),
    (new.id, 'Mobile', 'expense', false),
    (new.id, 'Rent', 'expense', false),
    (new.id, 'Medical', 'expense', false),
    (new.id, 'Education', 'expense', false),
    (new.id, 'Travel', 'expense', false),
    (new.id, 'Personal', 'expense', false),
    (new.id, 'Family', 'expense', false),
    (new.id, 'Subscriptions', 'expense', false),
    (new.id, 'Other', 'expense', false)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
