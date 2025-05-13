import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/utils/authCache';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        // Use the cached user value which is already updated by the listener in authCache.ts
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    );

    // Then check for existing session and user
    const initializeAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Error signing in',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: fullName, // Keep this as username in user metadata for backward compatibility
          },
        },
      });

      if (error) {
        toast({
          title: 'Error signing up',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Account created!',
        description: 'You have successfully signed up.',
      });
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // First check if we have a valid session before attempting to sign out
      const { data } = await supabase.auth.getSession();
      
      // If there's no session, just update the local state
      if (!data.session) {
        setSession(null);
        setUser(null);
        toast({
          title: 'Signed out',
          description: 'You have successfully signed out.',
        });
        return;
      }
      
      // Otherwise proceed with normal sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign out:', error);
        toast({
          title: 'Error signing out',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Explicitly clear the state
      setSession(null);
      setUser(null);
      
      toast({
        title: 'Signed out',
        description: 'You have successfully signed out.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, we should try to reset the local state
      setSession(null);
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
