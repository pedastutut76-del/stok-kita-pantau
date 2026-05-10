import { useState, useEffect } from "react";
import { database } from "@/lib/database";
import { User } from "@/lib/google-sheets-api";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session in localStorage
    const checkExistingSession = async () => {
      try {
        const currentUser = await database.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.log('No existing session');
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // For Google Sheets, we'll create a simple user account
      // In production, you might want to add proper password handling
      const { user: newUser, error } = await database.signIn(email, password);
      
      if (error) throw error;
      
      if (newUser) {
        setUser(newUser);
        toast({
          title: "Berhasil",
          description: "Akun berhasil dibuat dan Anda sudah masuk.",
        });
      }
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal membuat akun",
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
      const { user: loggedInUser, error } = await database.signIn(email, password);
      
      if (error) throw error;
      
      if (loggedInUser) {
        setUser(loggedInUser);
        toast({
          title: "Berhasil",
          description: "Berhasil masuk ke aplikasi",
        });
      }
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = error.message || "Login gagal";
      if (errorMessage.includes("Invalid") || errorMessage.includes("gagal")) {
        errorMessage = "Email atau password salah";
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
      const { error } = await database.signOut();
      if (error) throw error;
      
      setUser(null);
      
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
      
      // Check if profile exists
      const { data: existingProfile } = await database.getUserProfile();
      
      let result;
      if (existingProfile) {
        // Update existing profile
        result = await database.updateUserProfile(profileData);
      } else {
        // Create new profile
        result = await database.createUserProfile(profileData);
      }
      
      if (result.error) throw result.error;
      
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

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};