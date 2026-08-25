import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { signIn, signUp, resetPassword, seedDemoData } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) setErrorMsg(error.message);
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) setErrorMsg(error.message);
        else setSuccessMsg('Account created successfully!');
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) setErrorMsg(error.message);
        else setSuccessMsg('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    await seedDemoData();
    await signIn('demo@example.com', 'password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 backdrop-blur-xl shadow-2xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">WealthWise Advisor</h1>
          <p className="mt-1 text-xs text-slate-400">Production-Ready Personal Finance & AI Advisor</p>
        </div>

        {/* Form Switcher */}
        <div className="mt-6 flex rounded-2xl bg-slate-800/60 p-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`w-1/2 rounded-xl py-2 text-xs font-bold transition-all ${
              mode === 'signin' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`w-1/2 rounded-xl py-2 text-xs font-bold transition-all ${
              mode === 'signup' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-500/10 p-3 border border-rose-500/20 text-xs font-medium text-rose-400">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-xs font-medium text-emerald-400">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-slate-400">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Ajay Prasath"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs font-semibold text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs font-semibold text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs font-semibold text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all mt-2"
          >
            <span>{mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Instant Demo Sandbox Access */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <button
            onClick={handleDemoAccess}
            className="flex items-center justify-center gap-2 mx-auto text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Try Instant Demo Sandbox Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
