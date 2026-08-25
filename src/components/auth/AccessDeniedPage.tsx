import React from 'react';
import { ShieldAlert, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AccessDeniedPageProps {
  message?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ message }) => {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-8 font-sans text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-rose-900/50 bg-slate-900 p-8 shadow-2xl text-center space-y-6">
        
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="text-xs text-slate-400 mt-2">
            {message || 'This is a private personal finance portal. You do not have authorization to view this module.'}
          </p>
          {user?.email && (
            <div className="mt-3 inline-block rounded-xl bg-slate-800/80 px-3 py-1.5 text-[11px] font-mono text-slate-300 border border-slate-700">
              Logged in as: <span className="text-rose-300 font-bold">{user.email}</span>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-rose-400">
            <Lock className="h-4 w-4" />
            <span>Unauthorized Account Role</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Your account does not possess <span className="text-white font-bold">ADMIN</span> privileges. Financial data, dashboards, and management routes are protected and hidden.
          </p>
        </div>

        <button
          onClick={() => signOut()}
          className="w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
