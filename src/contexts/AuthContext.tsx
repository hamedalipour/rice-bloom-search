import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'user_profiles'>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ data: any; error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    console.log('=== Starting fetchUserProfile ===');
    console.log('UserId:', userId);
    console.log('UserEmail:', userEmail);
    
    // For admin user, set profile directly without database calls
    if (userEmail === 'hamedalipour38@gmail.com') {
      console.log('Admin user detected - setting admin profile directly');
      const adminProfile = {
        id: userId,
        email: userEmail,
        role: 'admin' as const,
        first_name: 'Hamed',
        last_name: 'Alipour',
        phone_number: null,
        address_line_1: null,
        address_line_2: null,
        city: null,
        state: null,
        postal_code: null,
        country: 'Iran',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUserProfile(adminProfile);
      setIsAdmin(true);
      console.log('Admin profile set:', adminProfile);
      return;
    }
    
    // For regular users, try to fetch from database
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        console.log('Regular user profile loaded:', data);
        setUserProfile(data);
        setIsAdmin(data.role === 'admin');
      } else {
        console.log('No profile found, creating default customer profile');
        const defaultProfile = {
          id: userId,
          email: userEmail || '',
          role: 'customer' as const,
          first_name: '',
          last_name: '',
          phone_number: null,
          address_line_1: null,
          address_line_2: null,
          city: null,
          state: null,
          postal_code: null,
          country: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUserProfile(defaultProfile);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error fetching profile, using default:', error);
      const defaultProfile = {
        id: userId,
        email: userEmail || '',
        role: 'customer' as const,
        first_name: '',
        last_name: '',
        phone_number: null,
        address_line_1: null,
        address_line_2: null,
        city: null,
        state: null,
        postal_code: null,
        country: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUserProfile(defaultProfile);
      setIsAdmin(false);
    }
    
    console.log('=== fetchUserProfile completed ===');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getSession = async () => {
      try {
        console.log('=== Getting initial session ===');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('Initial session result:', { session, error });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User found, fetching profile...');
          await fetchUserProfile(session.user.id, session.user.email);
        } else {
          console.log('No user session found');
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          console.log('=== Setting loading to false (initial) ===');
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        try {
          console.log('=== Auth state change ===', event);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('User authenticated, fetching profile...');
            await fetchUserProfile(session.user.id, session.user.email);
          } else {
            console.log('User signed out, clearing profile');
            setUserProfile(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          if (mounted) {
            console.log('=== Setting loading to false (auth change) ===');
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const [firstName, ...lastNameParts] = fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('SignIn Error:', error);
    }
    
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('id', user.id)
      .select()
      .single();

    if (data) {
      setUserProfile(data);
      setIsAdmin(data.role === 'admin');
    }

    return { data, error };
  };

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};