import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from './LoginPage';
import { AccessDeniedPage } from './AccessDeniedPage';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, isDeactivated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-400">Verifying User Credentials...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, enforce Login Page
  if (!user) {
    return <LoginPage />;
  }

  // If user account is deactivated by admin, enforce Access Denied
  if (isDeactivated) {
    return <AccessDeniedPage message="Your account has been deactivated by the Administrator." />;
  }

  return <>{children}</>;
};
