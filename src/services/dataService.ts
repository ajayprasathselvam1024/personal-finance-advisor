import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  UserProfile,
  IncomeItem,
  ExpenseItem,
  Loan,
  GoldLoan,
  SavingsItem,
  InvestmentItem,
  FinancialGoal,
  Budget,
  Category,
  RecurringTransaction,
  NotificationItem,
} from '../types';
import { INITIAL_DEMO_DATA } from './seedService';

const STORAGE_KEY = 'fin_advisor_data_v1';

interface LocalStore {
  profile: UserProfile;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  loans: Loan[];
  goldLoans: GoldLoan[];
  savings: SavingsItem[];
  investments: InvestmentItem[];
  goals: FinancialGoal[];
  budgets: Budget[];
  categories: Category[];
  recurring: RecurringTransaction[];
  notifications: NotificationItem[];
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c-1', name: 'Housing', type: 'expense', icon: 'Home', color: '#6366f1' },
  { id: 'c-2', name: 'Food', type: 'expense', icon: 'Utensils', color: '#ef4444' },
  { id: 'c-3', name: 'Groceries', type: 'expense', icon: 'ShoppingCart', color: '#f59e0b' },
  { id: 'c-4', name: 'Transport', type: 'expense', icon: 'Car', color: '#3b82f6' },
  { id: 'c-5', name: 'Fuel', type: 'expense', icon: 'Fuel', color: '#06b6d4' },
  { id: 'c-6', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'c-7', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#8b5cf6' },
  { id: 'c-8', name: 'Subscriptions', type: 'expense', icon: 'Tv', color: '#a855f7' },
  { id: 'c-9', name: 'Utilities', type: 'expense', icon: 'Zap', color: '#eab308' },
  { id: 'c-10', name: 'Electricity', type: 'expense', icon: 'Zap', color: '#facc15' },
  { id: 'c-11', name: 'Internet', type: 'expense', icon: 'Wifi', color: '#0284c7' },
  { id: 'c-12', name: 'Mobile', type: 'expense', icon: 'Smartphone', color: '#38bdf8' },
  { id: 'c-13', name: 'Medical', type: 'expense', icon: 'Activity', color: '#10b981' },
  { id: 'c-14', name: 'Insurance', type: 'expense', icon: 'Shield', color: '#14b8a6' },
  { id: 'c-15', name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#3b82f6' },
  { id: 'c-16', name: 'Family', type: 'expense', icon: 'Users', color: '#f43f5e' },
  { id: 'c-17', name: 'Travel', type: 'expense', icon: 'Plane', color: '#0ea5e9' },
  { id: 'c-18', name: 'Personal Care', type: 'expense', icon: 'Smile', color: '#f472b6' },
  { id: 'c-19', name: 'EMI', type: 'expense', icon: 'CreditCard', color: '#ef4444' },
  { id: 'c-20', name: 'Gold Loan', type: 'expense', icon: 'Coins', color: '#eab308' },
  { id: 'c-21', name: 'Investment', type: 'expense', icon: 'TrendingUp', color: '#22c55e' },
  { id: 'c-22', name: 'Savings', type: 'expense', icon: 'PiggyBank', color: '#10b981' },
  { id: 'c-23', name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: '#64748b' },
];

function getLocalStore(): LocalStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading LocalStore:', e);
  }

  // Initial seed if empty
  const initialStore: LocalStore = {
    profile: {
      id: 'demo-user-1',
      full_name: INITIAL_DEMO_DATA.profile.full_name,
      currency: 'INR',
      monthly_income: INITIAL_DEMO_DATA.profile.monthly_income,
      theme: 'system',
      notification_preferences: { email: true, inApp: true, dueReminders: true, budgetAlerts: true },
    },
    incomes: INITIAL_DEMO_DATA.incomes,
    expenses: INITIAL_DEMO_DATA.expenses,
    loans: INITIAL_DEMO_DATA.loans,
    goldLoans: INITIAL_DEMO_DATA.goldLoans,
    savings: INITIAL_DEMO_DATA.savings,
    investments: INITIAL_DEMO_DATA.investments,
    goals: INITIAL_DEMO_DATA.goals,
    budgets: INITIAL_DEMO_DATA.budgets,
    categories: DEFAULT_CATEGORIES,
    recurring: [],
    notifications: [
      {
        id: 'notif-1',
        title: 'Upcoming EMI Alert',
        message: 'ROAR Personal Loan EMI of ₹4,300 is due on 5th of this month.',
        type: 'warning',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        title: 'Gold Loan Interest Payment',
        message: 'Gold Loan 1 interest of ₹1,312 due soon.',
        type: 'info',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ],
  };

  saveLocalStore(initialStore);
  return initialStore;
}

function saveLocalStore(store: LocalStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Error saving LocalStore:', e);
  }
}

export const dataService = {
  // --- USER PROFILE ---
  async getProfile(): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (!error && data) return data as UserProfile;
      }
    }
    return getLocalStore().profile;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();
        if (!error && data) return data as UserProfile;
      }
    }
    const store = getLocalStore();
    store.profile = { ...store.profile, ...updates };
    saveLocalStore(store);
    return store.profile;
  },

  // --- INCOMES ---
  async getIncomes(): Promise<IncomeItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('income').select('*').order('date', { ascending: false });
      if (!error && data) return data as IncomeItem[];
    }
    return getLocalStore().incomes;
  },

  async addIncome(item: Omit<IncomeItem, 'id'>): Promise<IncomeItem> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('income')
          .insert({ ...item, user_id: user.id })
          .select()
          .single();
        if (!error && data) return data as IncomeItem;
      }
    }
    const store = getLocalStore();
    const newItem: IncomeItem = { ...item, id: `inc-${Date.now()}` };
    store.incomes.unshift(newItem);
    saveLocalStore(store);
    return newItem;
  },

  async updateIncome(id: string, updates: Partial<IncomeItem>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('income').update(updates).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.incomes = store.incomes.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc));
    saveLocalStore(store);
  },

  async deleteIncome(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('income').delete().eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.incomes = store.incomes.filter((inc) => inc.id !== id);
    saveLocalStore(store);
  },

  // --- EXPENSES ---
  async getExpenses(): Promise<ExpenseItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (!error && data) return data as ExpenseItem[];
    }
    return getLocalStore().expenses;
  },

  async addExpense(item: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('expenses')
          .insert({ ...item, user_id: user.id })
          .select()
          .single();
        if (!error && data) return data as ExpenseItem;
      }
    }
    const store = getLocalStore();
    const newItem: ExpenseItem = { ...item, id: `exp-${Date.now()}` };
    store.expenses.unshift(newItem);

    // Auto budget check warning trigger
    const categoryBudget = store.budgets.find(
      (b) => b.category_name.toLowerCase() === item.category_name.toLowerCase()
    );
    if (categoryBudget) {
      const categorySpent = store.expenses
        .filter((e) => e.category_name.toLowerCase() === item.category_name.toLowerCase())
        .reduce((sum, curr) => sum + curr.amount, 0);

      if (categorySpent > categoryBudget.monthly_limit) {
        store.notifications.unshift({
          id: `notif-${Date.now()}`,
          title: `Budget Exceeded: ${item.category_name}`,
          message: `Your ${item.category_name} spending (₹${categorySpent}) has exceeded your set budget limit of ₹${categoryBudget.monthly_limit}.`,
          type: 'warning',
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    saveLocalStore(store);
    return newItem;
  },

  async updateExpense(id: string, updates: Partial<ExpenseItem>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('expenses').update(updates).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.expenses = store.expenses.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp));
    saveLocalStore(store);
  },

  async deleteExpense(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('expenses').delete().eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.expenses = store.expenses.filter((exp) => exp.id !== id);
    saveLocalStore(store);
  },

  // --- LOANS ---
  async getLoans(): Promise<Loan[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('loans').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Loan[];
    }
    return getLocalStore().loans;
  },

  async addLoan(item: Omit<Loan, 'id'>): Promise<Loan> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('loans')
          .insert({ ...item, user_id: user.id })
          .select()
          .single();
        if (!error && data) return data as Loan;
      }
    }
    const store = getLocalStore();
    const newItem: Loan = { ...item, id: `loan-${Date.now()}` };
    store.loans.unshift(newItem);
    saveLocalStore(store);
    return newItem;
  },

  async updateLoan(id: string, updates: Partial<Loan>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('loans').update(updates).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.loans = store.loans.map((l) => (l.id === id ? { ...l, ...updates } : l));
    saveLocalStore(store);
  },

  async deleteLoan(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('loans').delete().eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.loans = store.loans.filter((l) => l.id !== id);
    saveLocalStore(store);
  },

  // --- GOLD LOANS ---
  async getGoldLoans(): Promise<GoldLoan[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('gold_loans').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as GoldLoan[];
    }
    return getLocalStore().goldLoans;
  },

  async addGoldLoan(item: Omit<GoldLoan, 'id'>): Promise<GoldLoan> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('gold_loans')
          .insert({ ...item, user_id: user.id })
          .select()
          .single();
        if (!error && data) return data as GoldLoan;
      }
    }
    const store = getLocalStore();
    const newItem: GoldLoan = { ...item, id: `gl-${Date.now()}` };
    store.goldLoans.unshift(newItem);
    saveLocalStore(store);
    return newItem;
  },

  async updateGoldLoan(id: string, updates: Partial<GoldLoan>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('gold_loans').update(updates).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.goldLoans = store.goldLoans.map((gl) => (gl.id === id ? { ...gl, ...updates } : gl));
    saveLocalStore(store);
  },

  async deleteGoldLoan(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('gold_loans').delete().eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.goldLoans = store.goldLoans.filter((gl) => gl.id !== id);
    saveLocalStore(store);
  },

  // --- SAVINGS ---
  async getSavings(): Promise<SavingsItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('savings').select('*').order('date', { ascending: false });
      if (!error && data) return data as SavingsItem[];
    }
    return getLocalStore().savings;
  },

  async addSavings(item: Omit<SavingsItem, 'id'>): Promise<SavingsItem> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('savings')
          .insert({ ...item, user_id: user.id })
          .select()
          .single();
        if (!error && data) return data as SavingsItem;
      }
    }
    const store = getLocalStore();
    const newItem: SavingsItem = { ...item, id: `sav-${Date.now()}` };
    store.savings.unshift(newItem);
    saveLocalStore(store);
    return newItem;
  },

  async updateSavings(id: string, updates: Partial<SavingsItem>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('savings').update(updates).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.savings = store.savings.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveLocalStore(store);
  },

  async deleteSavings(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('savings').delete().eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.savings = store.savings.filter((s) => s.id !== id);
    saveLocalStore(store);
  },

  // --- INVESTMENTS ---
  async getInvestments(): Promise<InvestmentItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('investments').select('*').order('date', { ascending: false });
      if (!error && data) return data as InvestmentItem[];
    }
    return getLocalStore().investments;
  },

  async addInvestment(item: Omit<InvestmentItem, 'id'>): Promise<InvestmentItem> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('investments')
          .insert({ ...item, user_id: user.id })
          .select()
          .single();
        if (!error && data) return data as InvestmentItem;
      }
    }
    const store = getLocalStore();
    const newItem: InvestmentItem = { ...item, id: `inv-${Date.now()}` };
    store.investments.unshift(newItem);
    saveLocalStore(store);
    return newItem;
  },

  async updateInvestment(id: string, updates: Partial<InvestmentItem>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('investments').update(updates).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.investments = store.investments.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    saveLocalStore(store);
  },

  async deleteInvestment(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('investments').delete().eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.investments = store.investments.filter((inv) => inv.id !== id);
    saveLocalStore(store);
  },

  // --- FINANCIAL GOALS ---
  async getGoals(): Promise<FinancialGoal[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('financial_goals').select('*').order('target_date', { ascending: true });
      if (!error && data) return data as FinancialGoal[];
    }
    return getLocalStore().goals;
  },

  async addGoal(item: Omit<FinancialGoal, 'id'>): Promise<FinancialGoal> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('financial_goals')
          .insert({ ...item, user_id: user.id })
          .select()
          .single();
        if (!error && data) return data as FinancialGoal;
      }
    }
    const store = getLocalStore();
    const newItem: FinancialGoal = { ...item, id: `goal-${Date.now()}` };
    store.goals.push(newItem);
    saveLocalStore(store);
    return newItem;
  },

  async updateGoal(id: string, updates: Partial<FinancialGoal>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('financial_goals').update(updates).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.goals = store.goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    saveLocalStore(store);
  },

  async deleteGoal(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('financial_goals').delete().eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.goals = store.goals.filter((g) => g.id !== id);
    saveLocalStore(store);
  },

  // --- BUDGETS ---
  async getBudgets(): Promise<Budget[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('budgets').select('*');
      if (!error && data) return data as Budget[];
    }
    return getLocalStore().budgets;
  },

  async setBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('budgets')
          .upsert({ ...budget, user_id: user.id }, { onConflict: 'user_id,category_name,month,year' })
          .select()
          .single();
        if (!error && data) return data as Budget;
      }
    }
    const store = getLocalStore();
    const existingIndex = store.budgets.findIndex(
      (b) =>
        b.category_name.toLowerCase() === budget.category_name.toLowerCase() &&
        b.month === budget.month &&
        b.year === budget.year
    );

    let result: Budget;
    if (existingIndex >= 0) {
      store.budgets[existingIndex] = { ...store.budgets[existingIndex], monthly_limit: budget.monthly_limit };
      result = store.budgets[existingIndex];
    } else {
      result = { ...budget, id: `b-${Date.now()}` };
      store.budgets.push(result);
    }
    saveLocalStore(store);
    return result;
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data && data.length > 0) return data as Category[];
    }
    return getLocalStore().categories || DEFAULT_CATEGORIES;
  },

  async addCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('categories')
          .insert({ ...cat, user_id: user.id, is_custom: true })
          .select()
          .single();
        if (!error && data) return data as Category;
      }
    }
    const store = getLocalStore();
    const newCat: Category = { ...cat, id: `cat-${Date.now()}`, is_custom: true };
    store.categories.push(newCat);
    saveLocalStore(store);
    return newCat;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<NotificationItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as NotificationItem[];
    }
    return getLocalStore().notifications || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.notifications = store.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    saveLocalStore(store);
  },

  // --- SEED DEMO DATA & RESET ---
  async seedDemoData(): Promise<void> {
    const store: LocalStore = {
      profile: {
        id: 'demo-user-1',
        full_name: INITIAL_DEMO_DATA.profile.full_name,
        currency: 'INR',
        monthly_income: INITIAL_DEMO_DATA.profile.monthly_income,
        theme: 'system',
        notification_preferences: { email: true, inApp: true, dueReminders: true, budgetAlerts: true },
      },
      incomes: INITIAL_DEMO_DATA.incomes,
      expenses: INITIAL_DEMO_DATA.expenses,
      loans: INITIAL_DEMO_DATA.loans,
      goldLoans: INITIAL_DEMO_DATA.goldLoans,
      savings: INITIAL_DEMO_DATA.savings,
      investments: INITIAL_DEMO_DATA.investments,
      goals: INITIAL_DEMO_DATA.goals,
      budgets: INITIAL_DEMO_DATA.budgets,
      categories: DEFAULT_CATEGORIES,
      recurring: [],
      notifications: [
        {
          id: 'notif-1',
          title: 'Upcoming EMI Alert',
          message: 'ROAR Personal Loan EMI of ₹4,300 is due on 5th of this month.',
          type: 'warning',
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ],
    };
    saveLocalStore(store);
  },

  async clearAllData(): Promise<void> {
    const store: LocalStore = {
      profile: {
        id: 'user-empty',
        full_name: 'User',
        currency: 'INR',
        monthly_income: 0,
        theme: 'system',
        notification_preferences: { email: true, inApp: true, dueReminders: true, budgetAlerts: true },
      },
      incomes: [],
      expenses: [],
      loans: [],
      goldLoans: [],
      savings: [],
      investments: [],
      goals: [],
      budgets: [],
      categories: DEFAULT_CATEGORIES,
      recurring: [],
      notifications: [],
    };
    saveLocalStore(store);
  },
};
