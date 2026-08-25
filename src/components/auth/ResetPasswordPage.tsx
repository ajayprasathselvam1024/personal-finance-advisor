import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ResetPasswordPageProps {
  onSuccess: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onSuccess }) => {
  const { updatePassword } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(newPassword);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to update password.');
    } else {
      setSuccessMsg('Password updated successfully! Redirecting...');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-8 font-sans text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl space-y-6">
        
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Set New Admin Password</h1>
          <p className="text-xs text-slate-400">Enter a secure new password for your admin account</p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs font-semibold text-rose-300">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-10 text-xs font-semibold text-white placeholder-slate-600 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
