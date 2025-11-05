import { useState, useEffect } from "react";
import { ProductSelector } from "@/components/ProductSelector";
import { Cart } from "@/components/Cart";  
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { Receipt } from "@/components/Receipt";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProducts, Product } from "@/hooks/useProducts";
import { useTransactions, TransactionItem } from "@/hooks/useTransactions";
import { useReceiptSettings } from "@/hooks/useReceiptSettings";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

const Cashier = () => {
  const { products, updateStock, loading } = useProducts();
  const { addTransaction, generateReceiptNumber } = useTransactions();
  const { settings: receiptSettings } = useReceiptSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [storeName, setStoreName] = useState<string>("");

  useEffect(() => {
    loadStoreName();
  }, [user]);

  const loadStoreName = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('store_name, business_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setStoreName(data.store_name || data.business_name || "Toko");
      }
    } catch (error) {
      console.error('Error loading store name:', error);
      setStoreName("Toko");
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    // Check if product has enough stock
    if (product.current_stock < quantity) {
      toast({
        title: "Stok tidak cukup",
        description: `Stok tersedia: ${product.current_stock}`,
        variant: "destructive",
      });
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.current_stock < newQuantity) {
        toast({
          title: "Stok tidak cukup",
          description: `Maksimal bisa ditambahkan: ${product.current_stock - existingItem.quantity}`,
          variant: "destructive",
        });
        return;
      }
      
      updateQuantity(product.id, newQuantity);
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        subtotal: product.price * quantity
      };
      setCart(prev => [...prev, newItem]);
      
      toast({
        title: "Produk ditambahkan",
        description: `${product.name} ditambahkan ke keranjang`,
      });
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.current_stock < quantity) {
      toast({
        title: "Stok tidak cukup",
        description: `Stok tersedia: ${product.current_stock}`,
        variant: "destructive",
      });
      return;
    }

    setCart(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, quantity, subtotal: item.product.price * quantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    toast({
      title: "Produk dihapus",
      description: "Produk telah dihapus dari keranjang",
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang kosong",
        description: "Tambahkan produk ke keranjang terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleTransactionComplete = async (transactionData: any) => {
    try {
      // Create transaction items for database
      const transactionItems: TransactionItem[] = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.subtotal
      }));

      // Create transaction object
      const transaction = {
        receipt_number: generateReceiptNumber(),
        items: transactionItems,
        total: transactionData.subtotal,
        tax: transactionData.tax,
        grand_total: transactionData.grandTotal,
        payment_method: transactionData.paymentMethod,
        cash_received: transactionData.cashReceived,
        change: transactionData.change,
        cashier_name: storeName || "Toko",
      };

      // Save transaction to database
      const result = await addTransaction(transaction);
      if (!result.success) {
        throw new Error("Gagal menyimpan transaksi");
      }

      // Update stock for each product
      for (const item of cart) {
        const newStock = item.product.current_stock - item.quantity;
        await updateStock(item.product.id, newStock);
      }

      // Set up receipt data
      const receiptData = {
        id: result.data.id,
        items: cart,
        total: transactionData.subtotal,
        tax: transactionData.tax,
        grandTotal: transactionData.grandTotal,
        paymentMethod: transactionData.paymentMethod,
        cashReceived: transactionData.cashReceived,
        change: transactionData.change,
        timestamp: new Date().toISOString(),
        cashierName: storeName || "Toko",
        receiptNumber: transaction.receipt_number,
      };

      setLastTransaction(receiptData);
      setCart([]);
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);

      toast({
        title: "Transaksi berhasil",
        description: `Struk ${transaction.receipt_number} telah dibuat`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memproses transaksi",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
          <p className="mt-2 text-muted-foreground">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Kasir Point of Sale
        </h1>
        <p className="text-muted-foreground">Sistem kasir terintegrasi dengan manajemen stok</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:min-h-[600px]">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <ProductSelector 
            products={products}
            onAddToCart={addToCart}
          />
        </div>

        {/* Shopping Cart */}
        <div className="lg:col-span-1">
          <Cart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onComplete={handleTransactionComplete}
      />

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Struk Pembayaran</DialogTitle>
          </DialogHeader>
          {lastTransaction && (
            <Receipt 
              transaction={lastTransaction}
              onPrint={() => window.print()}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cashier;