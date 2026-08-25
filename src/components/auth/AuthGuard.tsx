import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';
import { AccessDeniedPage } from './AccessDeniedPage';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, isAdmin, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Verifying Admin Credentials...</p>
        </div>
      </div>
    );
  }

  // If not authenticated in Supabase and not in local demo mode, enforce Login Page
  if (!user && !isDemoMode) {
    return <LoginPage />;
  }

  // If authenticated but role is NOT Admin, enforce Access Denied Page
  if (user && !isAdmin && !isDemoMode) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};
