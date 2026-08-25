import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { signIn, resetPassword, seedDemoData } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Forgot Password Mode
  const [isForgotMode, setIsForgotMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password, rememberMe);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Invalid email or password credentials.');
    } else {
      if (onSuccess) onSuccess();
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your admin email address.');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Failed to send password reset email.');
    } else {
      setSuccessMsg('Password reset instructions sent to your email.');
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    await seedDemoData();
    await signIn('admin@myfinance.app', 'demo1234');
    setLoading(false);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-8 relative overflow-hidden font-sans text-slate-100">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full max-w-7xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-blue-950/30">
          
          {/* App Header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="h-full w-full rounded-2xl bg-slate-950 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">My Finance</h1>
              <p className="text-xs font-medium text-slate-400 mt-1">Your Personal Financial Dashboard</p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-semibold text-emerald-400 border border-slate-700/60">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Private Admin Portal</span>
            </div>
          </div>

          {/* Error / Success Notifications */}
          {errorMsg && (
            <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs font-semibold text-rose-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-300">
              {successMsg}
            </div>
          )}

          {/* Form Switcher */}
          {!isForgotMode ? (
            /* Standard Admin Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="admin@myfinance.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setIsForgotMode(true); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-10 text-xs font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-xs text-slate-400 font-medium">Remember Me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center pb-2">
                <h2 className="text-sm font-bold text-white">Reset Admin Password</h2>
                <p className="text-xs text-slate-400 mt-1">Enter your admin email address to receive reset instructions</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="admin@myfinance.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
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
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Send Reset Email</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setIsForgotMode(false); setErrorMsg(''); setSuccessMsg(''); }}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors pt-2"
              >
                Back to Admin Login
              </button>
            </form>
          )}

          {/* Quick Sandbox Demo Access Trigger */}
          <div className="mt-8 border-t border-slate-800/80 pt-5 text-center">
            <p className="text-[11px] text-slate-500 mb-2.5">Testing or Demoing locally?</p>
            <button
              onClick={handleDemoAccess}
              disabled={loading}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Launch Live Demo Sandbox</span>
            </button>
          </div>

        </div>

        <p className="text-center text-[11px] font-medium text-slate-600 mt-6">
          My Finance • Private Single-Admin Personal Finance
        </p>
      </div>
    </div>
  );
};
