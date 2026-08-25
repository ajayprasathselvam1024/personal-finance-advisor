import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../types';
import { dataService } from '../services/dataService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  seedDemoData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // In demo mode or when profile role is ADMIN (default), isAdmin is true
  const isAdmin = !isSupabaseConfigured || (profile ? profile.role === 'ADMIN' || !profile.role : true);
  const isDemoMode = !isSupabaseConfigured || !user;

  const loadProfile = async () => {
    try {
      const p = await dataService.getProfile();
      setProfile(p);
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (mounted) {
            setSession(initialSession);
            setUser(initialSession?.user || null);
          }
        } catch (err) {
          console.warn('Supabase getSession error:', err);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (mounted) {
            setSession(newSession);
            setUser(newSession?.user || null);
            await loadProfile();
          }
        });

        await loadProfile();
        if (mounted) setLoading(false);

        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        // Local Sandbox / Demo Mode
        await loadProfile();
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string, _rememberMe: boolean = true) => {
    if (!isSupabaseConfigured) {
      const mockUser = { id: `demo-user`, email } as User;
      setUser(mockUser);
      await loadProfile();
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      setUser(data.user);
      await loadProfile();
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error as Error | null };
  };

  const seedDemoData = async () => {
    await dataService.seedDemoData();
    await loadProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        isDemoMode,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile: loadProfile,
        seedDemoData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
