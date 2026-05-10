// Database Service - Switch between Supabase and Google Sheets
// Set USE_GOOGLE_SHEETS to true to use Google Sheets API

import { createClient } from '@supabase/supabase-js';
import { googleSheetsAPI, Product, Transaction, UserProfile, User } from './google-sheets-api';

const USE_GOOGLE_SHEETS = process.env.VITE_USE_GOOGLE_SHEETS === 'true';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database interface
export interface DatabaseService {
  // Authentication
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
  getCurrentUser: () => User | null;
  
  // Products
  getProducts: () => Promise<Product[]>;
  createProduct: (product: any) => Promise<{ data: Product | null; error: any }>;
  updateProduct: (id: string, updates: any) => Promise<{ data: Product | null; error: any }>;
  deleteProduct: (id: string) => Promise<{ error: any }>;
  getLowStockProducts: () => Promise<Product[]>;
  
  // Transactions
  getTransactions: () => Promise<Transaction[]>;
  createTransaction: (transaction: any) => Promise<{ data: Transaction | null; error: any }>;
  
  // User Profile
  getUserProfile: () => Promise<{ data: UserProfile | null; error: any }>;
  updateUserProfile: (updates: any) => Promise<{ data: UserProfile | null; error: any }>;
  
  // Reports
  getSalesReport: (startDate: string, endDate: string) => Promise<{
    totalTransactions: number;
    totalRevenue: number;
    transactions: Transaction[];
  }>;
}

// Supabase implementation
class SupabaseService implements DatabaseService {
  async signIn(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({ email, password });
    return {
      user: result.data.user ? {
        id: result.data.user.id,
        email: result.data.user.email || '',
        full_name: result.data.user.user_metadata?.full_name || '',
        phone: result.data.user.phone || '',
        created_at: result.data.user.created_at,
        updated_at: result.data.user.updated_at || result.data.user.created_at
      } : null,
      error: result.error
    };
  }

  async signOut() {
    const result = await supabase.auth.signOut();
    return { error: result.error };
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || '',
      phone: user.phone || '',
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    };
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createProduct(product: any) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    return { data, error };
  }

  async updateProduct(id: string, updates: any) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  async getLowStockProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('current_stock', 'min_stock')
      .order('current_stock', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createTransaction(transaction: any) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    
    return { data, error };
  }

  async getUserProfile() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .single();
    
    return { data, error };
  }

  async updateUserProfile(updates: any) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', (await this.getCurrentUser())?.id)
      .select()
      .single();
    
    return { data, error };
  }

  async getSalesReport(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const transactions = data || [];
    return {
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + t.grand_total, 0),
      transactions
    };
  }
}

// Google Sheets implementation
class GoogleSheetsService implements DatabaseService {
  async signIn(email: string, password: string) {
    return googleSheetsAPI.signIn(email, password);
  }

  async signOut() {
    return googleSheetsAPI.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const userId = googleSheetsAPI.getCurrentUser();
    if (!userId) return null;
    
    // This would need to be implemented in Apps Script
    // For now, return a basic user object
    return {
      id: userId,
      email: '',
      full_name: '',
      phone: '',
      created_at: '',
      updated_at: ''
    };
  }

  async getProducts(): Promise<Product[]> {
    return googleSheetsAPI.getProducts();
  }

  async createProduct(product: any) {
    try {
      const result = await googleSheetsAPI.createProduct(product);
      return { data: { ...product, id: result.id } as Product, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateProduct(id: string, updates: any) {
    try {
      const result = await googleSheetsAPI.updateProduct(id, updates);
      return { data: { ...updates, id } as Product, error: result.success ? null : 'Update failed' };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteProduct(id: string) {
    try {
      const result = await googleSheetsAPI.deleteProduct(id);
      return { error: result.success ? null : 'Delete failed' };
    } catch (error) {
      return { error };
    }
  }

  async getLowStockProducts(): Promise<Product[]> {
    return googleSheetsAPI.getLowStockProducts();
  }

  async getTransactions(): Promise<Transaction[]> {
    return googleSheetsAPI.getTransactions();
  }

  async createTransaction(transaction: any) {
    try {
      const result = await googleSheetsAPI.createTransaction(transaction);
      return { data: { ...transaction, id: result.id } as Transaction, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getUserProfile() {
    try {
      const data = await googleSheetsAPI.getUserProfile();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateUserProfile(updates: any) {
    try {
      const result = await googleSheetsAPI.updateUserProfile(updates);
      return { data: { ...updates } as UserProfile, error: result.success ? null : 'Update failed' };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getSalesReport(startDate: string, endDate: string) {
    return googleSheetsAPI.getSalesReport(startDate, endDate);
  }
}

// Export the appropriate service
export const database: DatabaseService = USE_GOOGLE_SHEETS 
  ? new GoogleSheetsService() 
  : new SupabaseService();

// Export the Google Sheets API directly for advanced usage
export { googleSheetsAPI };

// Utility function to switch between services
export function switchToGoogleSheets(webAppUrl: string) {
  (googleSheetsAPI as any).webAppUrl = webAppUrl;
  console.log('Switched to Google Sheets API');
}

export function switchToSupabase() {
  console.log('Using Supabase API');
}
