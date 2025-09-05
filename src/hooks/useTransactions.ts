import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface TransactionItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  receipt_number: string;
  items: TransactionItem[];
  total: number;
  tax: number;
  grand_total: number;
  payment_method: string;
  cash_received?: number;
  change?: number;
  cashier_name: string;
  user_id: string;
  created_at: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTransactions = async () => {
    try {
      if (!user?.id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(transaction => ({
        ...transaction,
        items: transaction.items as unknown as TransactionItem[],
      }));
      
      setTransactions(transformedData as Transaction[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data transaksi: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
          items: transactionData.items as any, // Cast to any for JSONB
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        items: data.items as unknown as TransactionItem[],
      } as Transaction;

      setTransactions(prev => [transformedData, ...prev]);
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil disimpan",
      });
      return { success: true, data: transformedData };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menyimpan transaksi: " + error.message,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const generateReceiptNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    return `RCP-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${timestamp}`;
  };

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id]);

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    generateReceiptNumber,
  };
};