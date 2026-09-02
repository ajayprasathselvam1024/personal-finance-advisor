import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';

export const userService = {
  async getUsers(): Promise<UserProfile[]> {
    if (isSupabaseConfigured) {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && profiles) {
        return profiles.map((p) => ({
          ...p,
          role: (p.role as UserRole) || 'USER',
          is_active: p.is_active !== undefined ? p.is_active : true,
        })) as UserProfile[];
      }
    }

    const raw = localStorage.getItem('my_finance_users_v2');
    if (raw) return JSON.parse(raw);

    const defaultUsers: UserProfile[] = [
      {
        id: 'usr-admin',
        email: 'admin@myfinance.app',
        full_name: 'Admin User',
        role: 'ADMIN',
        is_active: true,
        currency: 'INR',
        theme: 'dark',
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem('my_finance_users_v2', JSON.stringify(defaultUsers));
    return defaultUsers;
  },

  async createUser(payload: {
    fullName: string;
    email: string;
    password?: string;
    role: UserRole;
  }): Promise<{ user: UserProfile | null; error: Error | null }> {
    if (isSupabaseConfigured) {
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

      await supabase
        .from('profiles')
        .update({
          full_name: payload.fullName,
          role: payload.role,
          is_active: true,
          email: payload.email,
        })
        .eq('id', userId);

      const newProfile: UserProfile = {
        id: userId,
        email: payload.email,
        full_name: payload.fullName,
        role: payload.role,
        is_active: true,
        currency: 'INR',
        theme: 'system',
        created_at: new Date().toISOString(),
      };

      return { user: newProfile, error: null };
    }

    const users = await this.getUsers();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: payload.email,
      full_name: payload.fullName,
      role: payload.role,
      is_active: true,
      currency: 'INR',
      theme: 'system',
      created_at: new Date().toISOString(),
    };

    users.unshift(newUser);
    localStorage.setItem('my_finance_users_v2', JSON.stringify(users));
    return { user: newUser, error: null };
  },

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('profiles').update(updates).eq('id', userId);
      return;
    }

    const users = await this.getUsers();
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    localStorage.setItem('my_finance_users_v2', JSON.stringify(updated));
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
    localStorage.setItem('my_finance_users_v2', JSON.stringify(filtered));
  },
};
