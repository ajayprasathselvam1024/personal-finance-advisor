import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RecurringTransaction } from '../types';
import { dataService } from './dataService';

export const recurringService = {
  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('recurring_transactions').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as RecurringTransaction[];
    }
    const storeRaw = localStorage.getItem('fin_advisor_data_v1');
    if (storeRaw) {
      const store = JSON.parse(storeRaw);
      return store.recurring || [];
    }
    return [];
  },

  async addRecurringTransaction(item: Omit<RecurringTransaction, 'id'>): Promise<RecurringTransaction> {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('recurring_transactions')
          .insert({ ...item, user_id: user.id })
          .select()
          .single();
        if (!error && data) return data as RecurringTransaction;
      }
    }
    const storeRaw = localStorage.getItem('fin_advisor_data_v1');
    const store = storeRaw ? JSON.parse(storeRaw) : {};
    const newItem: RecurringTransaction = { ...item, id: `rec-${Date.now()}` };
    store.recurring = store.recurring || [];
    store.recurring.unshift(newItem);
    localStorage.setItem('fin_advisor_data_v1', JSON.stringify(store));
    return newItem;
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('recurring_transactions').update({ is_active: isActive }).eq('id', id);
      return;
    }
    const storeRaw = localStorage.getItem('fin_advisor_data_v1');
    if (storeRaw) {
      const store = JSON.parse(storeRaw);
      store.recurring = (store.recurring || []).map((r: RecurringTransaction) =>
        r.id === id ? { ...r, is_active: isActive } : r
      );
      localStorage.setItem('fin_advisor_data_v1', JSON.stringify(store));
    }
  },

  async deleteRecurringTransaction(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('recurring_transactions').delete().eq('id', id);
      return;
    }
    const storeRaw = localStorage.getItem('fin_advisor_data_v1');
    if (storeRaw) {
      const store = JSON.parse(storeRaw);
      store.recurring = (store.recurring || []).filter((r: RecurringTransaction) => r.id !== id);
      localStorage.setItem('fin_advisor_data_v1', JSON.stringify(store));
    }
  },

  /**
   * Evaluates active recurring transactions and posts due items to database
   */
  async processDueRecurring(): Promise<{ generatedCount: number }> {
    const list = await this.getRecurringTransactions();
    const activeDue = list.filter((r) => r.is_active);
    const today = new Date().toISOString().split('T')[0];

    let generatedCount = 0;
    for (const item of activeDue) {
      if (item.last_processed_date === today) continue;

      if (item.type === 'income') {
        await dataService.addIncome({
          source: 'Salary',
          amount: item.amount,
          date: today,
          description: `Auto-Recurring: ${item.title}`,
          is_recurring: true,
        });
        generatedCount++;
      } else if (item.type === 'expense' || item.type === 'emi') {
        await dataService.addExpense({
          category_name: item.category_name || (item.type === 'emi' ? 'EMI' : 'Subscriptions'),
          amount: item.amount,
          date: today,
          payment_method: 'Bank Transfer',
          merchant: item.title,
          is_recurring: true,
        });
        generatedCount++;
      }

      // Update last processed date
      if (isSupabaseConfigured) {
        await supabase.from('recurring_transactions').update({ last_processed_date: today }).eq('id', item.id);
      }
    }

    return { generatedCount };
  },
};
