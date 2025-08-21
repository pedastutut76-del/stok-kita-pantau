export interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  location: string;
  lastUpdated: string;
  price: number;
  barcode?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  timestamp: string;
  cashierName: string;
  receiptNumber: string;
}

export interface SalesReport {
  date: string;
  totalTransactions: number;
  totalRevenue: number;
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
}