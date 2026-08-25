import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

interface SettingsPageProps {
  onRefresh: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRefresh }) => {
  const { profile, refreshProfile, seedDemoData } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [income, setIncome] = useState(profile?.monthly_income?.toString() || '91000');
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.updateProfile({
      full_name: fullName,
      monthly_income: parseFloat(income) || 0,
    });
    await refreshProfile();
    setSavedMsg('Profile updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleResetDemo = async () => {
    if (confirm('Reset application state back to default demo dataset?')) {
      await seedDemoData();
      onRefresh();
    }
  };

  const handleClearAll = async () => {
    if (confirm('⚠️ PERMANENT DELETION: Are you sure you want to clear all transactions and records?')) {
      await dataService.clearAllData();
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Settings & Data Management
        </h1>
        <p className="text-xs text-slate-500">Configure personal profile, currency defaults, and database backups</p>
      </div>

      {savedMsg && (
        <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          {savedMsg}
        </div>
      )}

      {/* Profile Form */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-xl">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          User Profile & Default Currency
        </h3>

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Default Monthly Income (₹)</label>
            <input
              type="number"
              required
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500">Display Currency</label>
            <input
              type="text"
              disabled
              value="INR (₹) - Indian Rupee"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
          >
            Save Profile Settings
          </button>
        </form>
      </div>

      {/* Data Operations */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Data Management & Sandbox Reset
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Load Sample Demo Data</p>
            <p className="text-[11px] text-slate-400">Populate account with sample incomes, EMIs, & gold loans</p>
          </div>
          <button
            onClick={handleResetDemo}
            className="rounded-xl bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-600 hover:bg-amber-500/20"
          >
            Reset Demo
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Clear All Financial Data</p>
            <p className="text-[11px] text-slate-400">Permanently delete all transaction records</p>
          </div>
          <button
            onClick={handleClearAll}
            className="rounded-xl bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/20"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
};
