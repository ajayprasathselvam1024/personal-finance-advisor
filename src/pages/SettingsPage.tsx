import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { User, Check, Shield } from 'lucide-react';

interface SettingsPageProps {
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRefresh }) => {
  const { profile, refreshProfile, isAdmin, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [savedMsg, setSavedMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await dataService.updateProfile({
      full_name: fullName,
    });
    await refreshProfile();
    setIsSaving(false);
    setSavedMsg('Profile updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
    onRefresh();
  };

  return (
    <div className="space-y-6 pb-16 font-sans max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage personal profile details and account security.</p>
      </div>

      {savedMsg && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          User Profile Details
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Email Address (Read-only)</label>
            <input
              type="text"
              disabled
              value={user?.email || profile?.email || 'N/A'}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Account Role</label>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300 uppercase">
                {isAdmin ? 'ADMIN (Full Access)' : 'USER (Standard Access)'}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition-all min-h-[44px]"
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Info */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>Security & Authentication</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your session is authenticated via <span className="font-bold text-slate-900 dark:text-white">Supabase PostgreSQL Auth</span>. Sessions automatically persist across page refreshes, hard refreshes, and browser reopenings.
        </p>
      </div>
    </div>
  );
};
