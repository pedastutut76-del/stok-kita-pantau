import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  purchase_price: number;
  current_stock: number;
  min_stock: number;
  location: string | null;
  barcode: string | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data produk: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [...prev, data]);
      toast({
        title: "Berhasil",
        description: "Produk berhasil ditambahkan",
      });
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menambahkan produk: " + error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Berhasil",
        description: "Produk berhasil diperbarui",
      });
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memperbarui produk: " + error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    return await updateProduct(productId, { current_stock: newStock });
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Berhasil",
        description: "Produk berhasil dihapus",
      });
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus produk: " + error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    addProduct,
    updateProduct,
    updateStock,
    deleteProduct,
  };
};