import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Akun berhasil dibuat. Silakan cek email untuk verifikasi.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Berhasil masuk ke aplikasi",
      });
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email atau password salah";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Email belum diverifikasi. Silakan cek email Anda.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Berhasil keluar dari aplikasi",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Link reset password telah dikirim ke email Anda.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };


  const updateProfile = async (profileData: { 
    full_name?: string; 
    email?: string; 
    phone?: string; 
    store_name?: string; 
    business_name?: string; 
    business_type?: string; 
    address?: string; 
    city?: string; 
    province?: string; 
    postal_code?: string; 
    country?: string; 
    tax_number?: string; 
    business_license?: string; 
    description?: string; 
  }) => {
    try {
      setLoading(true);
      
      if (!user?.id) throw new Error('User not authenticated');
      
      console.log('Updating profile for user:', user.id);
      console.log('Profile data:', profileData);
      
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('user_profiles')
          .update({
            full_name: profileData.full_name || null,
            email: profileData.email || user.email,
            phone: profileData.phone || null,
            store_name: profileData.store_name || null,
            business_name: profileData.business_name || null,
            business_type: profileData.business_type || 'retail',
            address: profileData.address || null,
            city: profileData.city || null,
            province: profileData.province || null,
            postal_code: profileData.postal_code || null,
            country: profileData.country || 'Indonesia',
            tax_number: profileData.tax_number || null,
            business_license: profileData.business_license || null,
            description: profileData.description || null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Insert new profile
        result = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            full_name: profileData.full_name || null,
            email: profileData.email || user.email,
            phone: profileData.phone || null,
            store_name: profileData.store_name || null,
            business_name: profileData.business_name || null,
            business_type: profileData.business_type || 'retail',
            address: profileData.address || null,
            city: profileData.city || null,
            province: profileData.province || null,
            postal_code: profileData.postal_code || null,
            country: profileData.country || 'Indonesia',
            tax_number: profileData.tax_number || null,
            business_license: profileData.business_license || null,
            description: profileData.description || null
          });
      }

      const { error } = result;
      
      // If table doesn't exist, show info message
      if (error && (error.message.includes('relation') || error.message.includes('does not exist'))) {
        console.log('user_profiles table not found, profile update skipped');
        toast({
          title: "Info",
          description: "Tabel profil belum ada. Jalankan migration database terlebih dahulu.",
        });
        return { success: true };
      }
      
      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Profile berhasil diperbarui.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Password lama tidak benar');
      }

      // If verification successful, update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Password berhasil diubah.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    resetPassword,
  };
};