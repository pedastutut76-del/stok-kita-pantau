// Google Sheets API Service for Stok Kita Pantau
// Replaces Supabase client with Google Apps Script API

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbww5gzGMxl3JcINSzzxO58Cb-_a9lmJXaO3tMpvr71v3U1KNDO94FFHC7C2tw6utkI/exec";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  purchase_price: number;
  current_stock: number;
  min_stock: number;
  location: string;
  barcode: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  receipt_number: string;
  items: any[];
  total: number;
  tax: number;
  grand_total: number;
  payment_method: string;
  cash_received: number;
  change: number;
  cashier_name: string;
  user_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  store_name: string;
  business_name: string;
  business_type: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  tax_number: string;
  business_license: string;
  description: string;
  currency: string;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

class GoogleSheetsAPI {
  private webAppUrl: string;
  private currentUserId: string | null = null;

  constructor(webAppUrl: string) {
    this.webAppUrl = webAppUrl;
  }

  // Authentication management
  setCurrentUser(userId: string) {
    this.currentUserId = userId;
    localStorage.setItem('userId', userId);
  }

  getCurrentUser(): string | null {
    if (!this.currentUserId) {
      this.currentUserId = localStorage.getItem('userId');
    }
    return this.currentUserId;
  }

  async signIn(email: string, password: string): Promise<{ user: User; error: any }> {
    try {
      // For simplicity, we'll create or get user by email
      // In production, you'd want proper authentication
      const response = await this.post('createUser', {
        email,
        full_name: email.split('@')[0]
      });

      if (response.id) {
        const user = await this.getUserByEmail(email);
        if (user) {
          this.setCurrentUser(user.id);
          return { user, error: null };
        }
      }
      
      return { user: null, error: 'Authentication failed' };
    } catch (error) {
      return { user: null, error };
    }
  }

  async signOut(): Promise<{ error: any }> {
    this.currentUserId = null;
    localStorage.removeItem('userId');
    return { error: null };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      // This would need to be implemented in Apps Script
      // For now, we'll simulate it
      const response = await this.get('getUserByEmail', { email });
      return response;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  // Generic API methods
  private async get(action: string, params: Record<string, string> = {}): Promise<any> {
    const userId = this.getCurrentUser();
    if (!userId && action !== 'getUserByEmail') {
      throw new Error('User not authenticated');
    }

    const url = new URL(this.webAppUrl);
    url.searchParams.append('action', action);
    if (userId) url.searchParams.append('userId', userId);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  }

  private async post(action: string, data: any): Promise<any> {
    const userId = this.getCurrentUser();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const url = new URL(this.webAppUrl);
    url.searchParams.append('action', action);
    url.searchParams.append('userId', userId);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return result;
  }

  // Products CRUD
  async getProducts(): Promise<Product[]> {
    return this.get('getProducts');
  }

  async createProduct(product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ id: string }> {
    return this.post('createProduct', product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean }> {
    return this.post('updateProduct', { id, ...updates });
  }

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return this.post('deleteProduct', { id });
  }

  async getLowStockProducts(): Promise<Product[]> {
    return this.get('getLowStockProducts');
  }

  // Transactions CRUD
  async getTransactions(): Promise<Transaction[]> {
    return this.get('getTransactions');
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<{ id: string }> {
    return this.post('createTransaction', transaction);
  }

  // User Profile CRUD
  async getUserProfile(): Promise<UserProfile | null> {
    return this.get('getUserProfile');
  }

  async createUserProfile(profile: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ id: string }> {
    return this.post('createUserProfile', profile);
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<{ success: boolean }> {
    return this.post('updateUserProfile', updates);
  }

  // Reports
  async getSalesReport(startDate: string, endDate: string): Promise<{
    totalTransactions: number;
    totalRevenue: number;
    transactions: Transaction[];
  }> {
    return this.get('getSalesReport', { startDate, endDate });
  }

  // Utility methods
  generateReceiptNumber(): string {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                    (date.getMonth() + 1).toString().padStart(2, '0') + 
                    date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return "INV-" + dateStr + "-" + random;
  }
}

// Export singleton instance
export const googleSheetsAPI = new GoogleSheetsAPI(WEB_APP_URL);

