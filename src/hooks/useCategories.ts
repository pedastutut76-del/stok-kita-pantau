import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Category {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCategories = async () => {
    try {
      if (!user?.id) {
        console.log('No user ID, setting empty categories');
        setCategories([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      console.log('Fetching categories for user:', user.id);
      
      // Since categories table doesn't exist in Supabase types, use localStorage for now
      const storedCategories = localStorage.getItem(`categories_${user.id}`);
      console.log('Stored categories:', storedCategories);
      
      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories);
        console.log('Parsed categories:', parsedCategories);
        setCategories(parsedCategories);
      } else {
        // Set default categories for new users
        console.log('No stored categories, creating defaults');
        const defaultCats = getDefaultCategories();
        console.log('Default categories:', defaultCats);
        setCategories(defaultCats);
        localStorage.setItem(`categories_${user.id}`, JSON.stringify(defaultCats));
      }
    } catch (error: any) {
      console.error('Category fetch error:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kategori: " + error.message,
        variant: "destructive",
      });
      setCategories(getDefaultCategories());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultCategories = (): Category[] => {
    const defaultCats = [
      { name: "Makanan", description: "Produk makanan dan snack" },
      { name: "Minuman", description: "Minuman ringan dan berat" },
      { name: "Kebersihan", description: "Produk kebersihan dan sanitasi" },
      { name: "Elektronik", description: "Perangkat elektronik" },
      { name: "Pakaian", description: "Pakaian dan aksesoris" },
      { name: "Alat Tulis", description: "Alat tulis dan kantor" },
      { name: "Lainnya", description: "Kategori lainnya" }
    ];

    return defaultCats.map((cat, index) => ({
      id: `default-${index}`,
      name: cat.name,
      description: cat.description,
      user_id: user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  };

  const addCategory = async (categoryData: { name: string; description?: string }) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const newCategory: Category = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: categoryData.name,
        description: categoryData.description,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem(`categories_${user.id}`, JSON.stringify(updatedCategories));
      
      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan",
      });
      return { success: true, data: newCategory };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menambahkan kategori: " + error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const updatedCategories = categories.map(c => 
        c.id === id 
          ? { ...c, ...updates, updated_at: new Date().toISOString() }
          : c
      );
      
      setCategories(updatedCategories);
      localStorage.setItem(`categories_${user.id}`, JSON.stringify(updatedCategories));
      
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diperbarui",
      });
      return { success: true, data: updatedCategories.find(c => c.id === id) };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memperbarui kategori: " + error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const categoryToDelete = categories.find(c => c.id === id);
      if (!categoryToDelete) {
        throw new Error('Kategori tidak ditemukan');
      }

      // For now, skip the product check since we don't have access to products here
      // In a real implementation, this would check the database
      
      const updatedCategories = categories.filter(c => c.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem(`categories_${user.id}`, JSON.stringify(updatedCategories));
      
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus",
      });
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus kategori: " + error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCategories();
    }
  }, [user?.id]);

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getDefaultCategories,
  };
};
