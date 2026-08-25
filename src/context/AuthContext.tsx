import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, PermissionKey } from '../types';
import { dataService } from '../services/dataService';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isDeactivated: boolean;
  hasPermission: (permissionKey: PermissionKey) => boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Role Checks
  const isAdmin = !isSupabaseConfigured || (profile ? profile.role === 'ADMIN' : true);
  const isDeactivated = profile ? profile.is_active === false : false;

  const hasPermission = (permissionKey: PermissionKey): boolean => {
    if (!isSupabaseConfigured) return true;
    if (isAdmin) return true;
    if (isDeactivated) return false;
    return profile?.permissions?.includes(permissionKey) ?? false;
  };

  const loadProfile = async (targetUser?: User | null) => {
    try {
      const activeUser = targetUser || user;
      if (!activeUser && isSupabaseConfigured) {
        setProfile(null);
        return;
      }

      const p = await dataService.getProfile();
      if (p) {
        // Load user permissions
        if (isSupabaseConfigured && activeUser) {
          const usersList = await userService.getUsers();
          const found = usersList.find((u) => u.id === activeUser.id);
          if (found) {
            setProfile(found);
            return;
          }
        }
        setProfile(p);
      }
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
            if (initialSession?.user) {
              await loadProfile(initialSession.user);
            }
          }
        } catch (err) {
          console.warn('Supabase getSession error:', err);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (mounted) {
            setSession(newSession);
            setUser(newSession?.user || null);
            if (newSession?.user) {
              await loadProfile(newSession.user);
            } else {
              setProfile(null);
            }
          }
        });

        if (mounted) setLoading(false);

        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        // Local Sandbox Mode
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
      const mockUser = { id: `admin-1`, email } as User;
      setUser(mockUser);
      await loadProfile(mockUser);
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      setUser(data.user);
      await loadProfile(data.user);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        isDeactivated,
        hasPermission,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile: () => loadProfile(user),
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
