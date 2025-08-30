import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  created_at: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(transaction => ({
        ...transaction,
        items: transaction.items as unknown as TransactionItem[],
      }));
      
      setTransactions(transformedData);
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

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          items: transactionData.items as any, // Cast to any for JSONB
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        items: data.items as unknown as TransactionItem[],
      };

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
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    generateReceiptNumber,
  };
};