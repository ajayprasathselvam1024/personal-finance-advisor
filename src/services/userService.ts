import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, PermissionKey } from '../types';

export const ALL_PERMISSIONS: { key: PermissionKey; label: string; module: string }[] = [
  { key: 'view_dashboard', label: 'View Dashboard', module: 'Dashboard' },
  
  { key: 'view_income', label: 'View Income', module: 'Income' },
  { key: 'add_income', label: 'Add Income', module: 'Income' },
  { key: 'edit_income', label: 'Edit Income', module: 'Income' },
  { key: 'delete_income', label: 'Delete Income', module: 'Income' },

  { key: 'view_expenses', label: 'View Expenses', module: 'Expenses' },
  { key: 'add_expenses', label: 'Add Expenses', module: 'Expenses' },
  { key: 'edit_expenses', label: 'Edit Expenses', module: 'Expenses' },
  { key: 'delete_expenses', label: 'Delete Expenses', module: 'Expenses' },

  { key: 'view_loans', label: 'View Loans & EMIs', module: 'Loans' },
  { key: 'manage_loans', label: 'Manage Loans & EMIs', module: 'Loans' },

  { key: 'view_gold_loans', label: 'View Gold Loans', module: 'Gold Loans' },
  { key: 'manage_gold_loans', label: 'Manage Gold Loans', module: 'Gold Loans' },

  { key: 'view_savings', label: 'View Savings', module: 'Savings' },
  { key: 'manage_savings', label: 'Manage Savings', module: 'Savings' },

  { key: 'view_investments', label: 'View Investments', module: 'Investments' },
  { key: 'manage_investments', label: 'Manage Investments', module: 'Investments' },

  { key: 'manage_budgets', label: 'Manage Monthly Budgets', module: 'Budgets' },
  { key: 'manage_goals', label: 'Manage Financial Goals', module: 'Goals' },
  { key: 'view_reports', label: 'View Reports & Analytics', module: 'Reports' },
  { key: 'view_advisor', label: 'View AI Financial Advisor', module: 'Advisor' },
];

export const userService = {
  async getUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && profiles) {
        // Fetch permissions for each profile
        const { data: permissionsData } = await supabase.from('user_permissions').select('*');

        return profiles.map((p) => {
          const userPerms = (permissionsData || [])
            .filter((up: any) => up.user_id === p.id)
            .map((up: any) => up.permission_key as PermissionKey);

          return {
            ...p,
            role: p.role || 'USER',
            is_active: p.is_active !== undefined ? p.is_active : true,
            permissions: userPerms,
          } as UserProfile;
        });
      }
    }

    // Local Storage Mock Storage for Offline / Sandboxed mode
    const raw = localStorage.getItem('fin_users_v1');
    if (raw) {
      return JSON.parse(raw);
    }
    const defaultUsers: UserProfile[] = [
      {
        id: 'admin-1',
        email: 'admin@myfinance.app',
        full_name: 'Admin User',
        role: 'ADMIN',
        is_active: true,
        currency: 'INR',
        monthly_income: 0,
        theme: 'dark',
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem('fin_users_v1', JSON.stringify(defaultUsers));
    return defaultUsers;
  },

  async createUser(payload: {
    fullName: string;
    email: string;
    password?: string;
    role: 'ADMIN' | 'USER';
    permissions: PermissionKey[];
  }): Promise<{ user: UserProfile | null; error: Error | null }> {
    if (isSupabaseConfigured) {
      // 1. Create auth user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password || 'User@12345',
        options: {
          data: { full_name: payload.fullName, role: payload.role },
        },
      });

      if (error || !data.user) {
        return { user: null, error: error as Error | null };
      }

      const userId = data.user.id;

      // 2. Update profile role and status
      await supabase
        .from('profiles')
        .update({
          full_name: payload.fullName,
          role: payload.role,
          is_active: true,
          email: payload.email,
        })
        .eq('id', userId);

      // 3. Insert permissions
      if (payload.permissions && payload.permissions.length > 0) {
        const permsToInsert = payload.permissions.map((pk) => ({
          user_id: userId,
          permission_key: pk,
        }));
        await supabase.from('user_permissions').insert(permsToInsert);
      }

      const newProfile: UserProfile = {
        id: userId,
        email: payload.email,
        full_name: payload.fullName,
        role: payload.role,
        is_active: true,
        permissions: payload.permissions,
        currency: 'INR',
        monthly_income: 0,
        theme: 'system',
        created_at: new Date().toISOString(),
      };

      return { user: newProfile, error: null };
    }

    // Local Storage Mock Creation
    const users = await this.getUsers();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: payload.email,
      full_name: payload.fullName,
      role: payload.role,
      is_active: true,
      permissions: payload.permissions,
      currency: 'INR',
      monthly_income: 0,
      theme: 'system',
      created_at: new Date().toISOString(),
    };

    users.unshift(newUser);
    localStorage.setItem('fin_users_v1', JSON.stringify(users));
    return { user: newUser, error: null };
  },

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('profiles').update(updates).eq('id', userId);
      return;
    }

    const users = await this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    localStorage.setItem('fin_users_v1', JSON.stringify(updated));
  },

  async updateUserPermissions(userId: string, permissions: PermissionKey[]): Promise<void> {
    if (isSupabaseConfigured) {
      // Clear existing and insert new
      await supabase.from('user_permissions').delete().eq('user_id', userId);
      if (permissions.length > 0) {
        const permsToInsert = permissions.map((pk) => ({
          user_id: userId,
          permission_key: pk,
        }));
        await supabase.from('user_permissions').insert(permsToInsert);
      }
      return;
    }

    const users = await this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, permissions } : u));
    localStorage.setItem('fin_users_v1', JSON.stringify(updated));
  },

  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    await this.updateUser(userId, { is_active: isActive });
  },

  async deleteUser(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('profiles').delete().eq('id', userId);
      return;
    }

    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== userId);
    localStorage.setItem('fin_users_v1', JSON.stringify(filtered));
  },
};
