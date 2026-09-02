import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ImportHistoryItem, ImportSource } from '../types';

const LOCAL_HISTORY_KEY = 'my_finance_import_history';

export const importHistoryService = {
  async getHistory(): Promise<ImportHistoryItem[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('import_history')
        .select('*')
        .order('imported_at', { ascending: false });
      if (!error && data) return data as ImportHistoryItem[];
    }

    try {
      const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading import history:', e);
    }
    return [];
  },

  async addHistory(item: {
    file_name: string;
    source: ImportSource;
    transaction_count: number;
    status: 'Completed' | 'Failed';
  }): Promise<ImportHistoryItem> {
    const newItem: ImportHistoryItem = {
      id: `hist-${Date.now()}`,
      file_name: item.file_name,
      source: item.source,
      imported_at: new Date().toISOString(),
      transaction_count: item.transaction_count,
      status: item.status,
    };

    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('import_history').insert({
          ...newItem,
          user_id: user.id,
        });
      }
    }

    const history = await this.getHistory();
    history.unshift(newItem);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
    return newItem;
  },
};
