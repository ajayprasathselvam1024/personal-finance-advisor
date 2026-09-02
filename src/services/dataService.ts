import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  IncomeItem,
  ExpenseItem,
  Category,
  UserProfile,
  TransactionType,
} from '../types';

export const DEFAULT_INCOME_CATEGORIES: string[] = [
  'Salary',
  'Freelance',
  'Business',
  'Bonus',
  'Interest',
  'Rental Income',
  'Other',
];

export const DEFAULT_EXPENSE_CATEGORIES: string[] = [
  'Food',
  'Groceries',
  'Transport',
  'Fuel',
  'Shopping',
  'Entertainment',
  'Bills',
  'Electricity',
  'Internet',
  'Mobile',
  'Rent',
  'Medical',
  'Education',
  'Travel',
  'Personal',
  'Family',
  'Subscriptions',
  'Other',
];

interface LocalStore {
  profile: UserProfile;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  categories: Category[];
}

const LOCAL_KEY = 'my_finance_store_v2';

const getLocalStore = (): LocalStore => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading LocalStore:', e);
  }

  const defaultCategories: Category[] = [
    ...DEFAULT_INCOME_CATEGORIES.map((name) => ({
      id: `cat-inc-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      type: 'income' as TransactionType,
      is_custom: false,
    })),
    ...DEFAULT_EXPENSE_CATEGORIES.map((name) => ({
      id: `cat-exp-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      type: 'expense' as TransactionType,
      is_custom: false,
    })),
  ];

  const initialStore: LocalStore = {
    profile: {
      id: 'usr-admin',
      full_name: 'Admin User',
      currency: 'INR',
      role: 'ADMIN',
      is_active: true,
      theme: 'system',
    },
    incomes: [],
    expenses: [],
    categories: defaultCategories,
  };

  localStorage.setItem(LOCAL_KEY, JSON.stringify(initialStore));
  return initialStore;
};

const saveLocalStore = (store: LocalStore) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(store));
};

export const dataService = {
  // --- PROFILE ---
  async getProfile(): Promise<UserProfile | null> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (!error && data) return data as UserProfile;
      }
    }
    return getLocalStore().profile;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update(updates).eq('id', user.id);
        return;
      }
    }
    const store = getLocalStore();
    store.profile = { ...store.profile, ...updates };
    saveLocalStore(store);
  },

  // --- CATEGORIES ---
  async getCategories(type?: TransactionType): Promise<Category[]> {
    if (isSupabaseConfigured) {
      let query = supabase.from('categories').select('*').order('name', { ascending: true });
      if (type) query = query.eq('type', type);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as Category[];
    }

    const cats = getLocalStore().categories;
    if (type) return cats.filter((c) => c.type === type);
    return cats;
  },

  async addCategory(cat: { name: string; type: TransactionType }): Promise<Category> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: cat.name.trim(),
            type: cat.type,
            is_custom: true,
          })
          .select()
          .single();
        if (!error && data) return data as Category;
      }
    }

    const store = getLocalStore();
    const newCat: Category = {
      id: `cat-custom-${Date.now()}`,
      name: cat.name.trim(),
      type: cat.type,
      is_custom: true,
      created_at: new Date().toISOString(),
    };
    store.categories.push(newCat);
    saveLocalStore(store);
    return newCat;
  },

  async updateCategory(id: string, name: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('categories').update({ name: name.trim() }).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.categories = store.categories.map((c) => (c.id === id ? { ...c, name: name.trim() } : c));
    saveLocalStore(store);
  },

  async deleteCategory(id: string, name: string, type: TransactionType): Promise<{ success: boolean; message?: string }> {
    // Check if category is used in existing transactions
    const incomes = await this.getIncomes();
    const expenses = await this.getExpenses();

    const isUsedInIncomes = type === 'income' && incomes.some((i) => i.category_name.toLowerCase() === name.toLowerCase());
    const isUsedInExpenses = type === 'expense' && expenses.some((e) => e.category_name.toLowerCase() === name.toLowerCase());

    if (isUsedInIncomes || isUsedInExpenses) {
      return {
        success: false,
        message: 'This category is being used by existing transactions.',
      };
    }

    if (isSupabaseConfigured) {
      await supabase.from('categories').delete().eq('id', id);
      return { success: true };
    }

    const store = getLocalStore();
    store.categories = store.categories.filter((c) => c.id !== id);
    saveLocalStore(store);
    return { success: true };
  },

  // --- INCOME ---
  async getIncomes(): Promise<IncomeItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('income').select('*').order('date', { ascending: false });
      if (!error && data) return data as IncomeItem[];
    }
    return getLocalStore().incomes || [];
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
    const newItem: IncomeItem = { ...item, id: `inc-${Date.now()}`, created_at: new Date().toISOString() };
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
    store.incomes = store.incomes.map((i) => (i.id === id ? { ...i, ...updates } : i));
    saveLocalStore(store);
  },

  async deleteIncome(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('income').delete().eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.incomes = store.incomes.filter((i) => i.id !== id);
    saveLocalStore(store);
  },

  // --- EXPENSES ---
  async getExpenses(): Promise<ExpenseItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (!error && data) return data as ExpenseItem[];
    }
    return getLocalStore().expenses || [];
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
    const newItem: ExpenseItem = { ...item, id: `exp-${Date.now()}`, created_at: new Date().toISOString() };
    store.expenses.unshift(newItem);
    saveLocalStore(store);
    return newItem;
  },

  async updateExpense(id: string, updates: Partial<ExpenseItem>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('expenses').update(updates).eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.expenses = store.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e));
    saveLocalStore(store);
  },

  async deleteExpense(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('expenses').delete().eq('id', id);
      return;
    }
    const store = getLocalStore();
    store.expenses = store.expenses.filter((e) => e.id !== id);
    saveLocalStore(store);
  },
};
