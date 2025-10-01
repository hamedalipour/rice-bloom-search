import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useAuthOperations = () => {
  const { signUp, signIn, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await signUp(email, password, fullName);
      
      if (error) {
        toast({
          title: "ثبت نام ناموفق",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "ثبت نام موفق",
        description: "لطفاً ایمیل خود را برای تایید حساب بررسی کنید.",
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "ثبت نام ناموفق",
        description: error.message || "خطای غیرمنتظره‌ای رخ داد",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "ورود ناموفق",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "ورود موفق",
        description: "خوش آمدید!",
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "ورود ناموفق",
        description: error.message || "خطای غیرمنتظره‌ای رخ داد",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await signOut();
      
      if (error) {
        toast({
          title: "خروج ناموفق",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error };
      }

      toast({
        title: "خروج موفق",
        description: "با موفقیت خارج شدید.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "خروج ناموفق",
        description: error.message || "خطای غیرمنتظره‌ای رخ داد",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSignUp,
    handleSignIn,
    handleSignOut,
    isLoading,
  };
};