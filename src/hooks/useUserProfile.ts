import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type UserProfile = Tables<'user_profiles'>;
type UserProfileInsert = TablesInsert<'user_profiles'>;
type UserProfileUpdate = TablesUpdate<'user_profiles'>;

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "خطا در بارگذاری پروفایل",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData?: Partial<UserProfileInsert>) => {
    if (!user) return;

    try {
      const newProfile: UserProfileInsert = {
        id: user.id,
        first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        ...profileData,
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "پروفایل ایجاد شد",
        description: "پروفایل شما با موفقیت ایجاد شد.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast({
        title: "خطا در ایجاد پروفایل",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: UserProfileUpdate) => {
    if (!user) return;

    try {
      setUpdating(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "پروفایل به‌روزرسانی شد",
        description: "اطلاعات پروفایل شما با موفقیت به‌روزرسانی شد.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "خطا در به‌روزرسانی پروفایل",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setUpdating(false);
    }
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    
    const requiredFields = [
      'first_name',
      'last_name', 
      'phone_number',
      'address_line_1',
      'city',
      'state',
      'postal_code'
    ];

    return requiredFields.every(field => 
      profile[field as keyof UserProfile] && 
      String(profile[field as keyof UserProfile]).trim() !== ''
    );
  };

  return {
    profile,
    loading,
    updating,
    fetchProfile,
    createProfile,
    updateProfile,
    isProfileComplete,
  };
};