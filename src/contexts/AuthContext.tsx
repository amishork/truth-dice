import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  gender: 'male' | 'female' | null;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, gender: 'male' | 'female') => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithProvider: (provider: 'google' | 'apple' | 'facebook') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    gender: null,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const gender = (session?.user?.user_metadata?.gender as 'male' | 'female') || null;
      setState({ user: session?.user ?? null, session, loading: false, gender });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const gender = (session?.user?.user_metadata?.gender as 'male' | 'female') || null;
      setState({ user: session?.user ?? null, session, loading: false, gender });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, gender: 'male' | 'female') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { gender } },
    });
    return { error: error as Error | null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signInWithProvider = useCallback(async (provider: 'google' | 'apple' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/quiz` },
    });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      signUp,
      signIn,
      signInWithProvider,
      signOut,
      isAuthenticated: !!state.user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
