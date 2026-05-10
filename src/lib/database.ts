// Simple Database Service for Stok Kita Pantau
// Temporary fix to avoid blank page issues

import { googleSheetsAPI, Product, Transaction, UserProfile, User } from './google-sheets-api';

class SimpleDatabaseService {
  async signIn(email: string, password: string) {
    // Simulate sign in - return success
    const user: User = {
      id: 'user_' + Date.now(),
      email: email,
      full_name: email.split('@')[0],
      phone: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { user, error: null };
  }

  async signOut() {
    return { error: null };
  }

  async getCurrentUser(): Promise<User | null> {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (userId && userEmail) {
      return {
        id: userId,
        email: userEmail,
        full_name: userName || userEmail.split('@')[0],
        phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    return null;
  }

  async getProducts(): Promise<Product[]> {
    try {
      // Try to use Google Sheets API
      const products = await googleSheetsAPI.getProducts();
      return products;
    } catch (error) {
      console.error('Google Sheets API error, using fallback:', error);
      
      // Fallback to sample products
      return [
        {
          id: '1',
          name: 'Indomie Goreng',
          category: 'Makanan',
          price: 3500,
          purchase_price: 3000,
          current_stock: 50,
          min_stock: 10,
          location: 'Rak A1',
          barcode: '1234567890123',
          user_id: 'user_1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
  }

  async createProduct(product: any) {
    try {
      // Try to use Google Sheets API
      const result = await googleSheetsAPI.createProduct(product);
      
      const newProduct: Product = {
        ...product,
        id: result.id,
        user_id: localStorage.getItem('userId') || 'user_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return { data: newProduct, error: null };
    } catch (error) {
      console.error('Google Sheets API error, using fallback:', error);
      
      // Fallback to simulate product creation
      const newProduct: Product = {
        ...product,
        id: 'product_' + Date.now(),
        user_id: localStorage.getItem('userId') || 'user_1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return { data: newProduct, error: null };
    }
  }

  async updateProduct(id: string, updates: any) {
    // Simulate product update
    const updatedProduct: Product = {
      id: id,
      name: updates.name || 'Product Name',
      category: updates.category || 'General',
      price: updates.price || 0,
      purchase_price: updates.purchase_price || 0,
      current_stock: updates.current_stock || 0,
      min_stock: updates.min_stock || 5,
      location: updates.location || '',
      barcode: updates.barcode || '',
      user_id: localStorage.getItem('userId') || 'user_1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return { data: updatedProduct, error: null };
  }

  async deleteProduct(id: string) {
    // Simulate product deletion
    return { error: null };
  }

  async getLowStockProducts(): Promise<Product[]> {
    // Return empty array for now
    return [];
  }

  async getTransactions(): Promise<Transaction[]> {
    // Return empty array for now
    return [];
  }

  async createTransaction(transaction: any) {
    // Simulate transaction creation
    const newTransaction: Transaction = {
      ...transaction,
      id: 'transaction_' + Date.now(),
      user_id: localStorage.getItem('userId') || 'user_1',
      created_at: new Date().toISOString()
    };
    
    return { data: newTransaction, error: null };
  }

  async getUserProfile() {
    // Return null for now
    return { data: null, error: null };
  }

  async updateUserProfile(updates: any) {
    // Simulate profile update
    return { data: updates, error: null };
  }

  async getSalesReport(startDate: string, endDate: string) {
    // Return empty report for now
    return {
      totalTransactions: 0,
      totalRevenue: 0,
      transactions: []
    };
  }
}

// Export singleton instance
export const database = new SimpleDatabaseService();
