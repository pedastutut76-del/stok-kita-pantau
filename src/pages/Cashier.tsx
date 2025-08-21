import { useState, useEffect } from "react";
import { Product, CartItem, Transaction } from "@/types/sales";
import { ProductSelector } from "@/components/ProductSelector";
import { Cart } from "@/components/Cart";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { Receipt } from "@/components/Receipt";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Extended sample products with prices
const sampleProducts: Product[] = [
  {
    id: "PRD001",
    name: "Laptop Dell XPS 13",
    category: "elektronik",
    currentStock: 25,
    minStock: 5,
    location: "Gudang A-1",
    lastUpdated: "2024-01-15 14:30",
    price: 15000000,
    barcode: "1234567890123"
  },
  {
    id: "PRD002", 
    name: "Mouse Wireless Logitech",
    category: "elektronik",
    currentStock: 3,
    minStock: 10,
    location: "Gudang A-2",
    lastUpdated: "2024-01-15 10:15",
    price: 250000,
    barcode: "2234567890123"
  },
  {
    id: "PRD003",
    name: "Kopi Arabica Premium",
    category: "makanan",
    currentStock: 0,
    minStock: 20,
    location: "Gudang B-1",
    lastUpdated: "2024-01-14 16:45",
    price: 85000,
    barcode: "3234567890123"
  },
  {
    id: "PRD004",
    name: "Kemeja Formal Putih",
    category: "pakaian",
    currentStock: 45,
    minStock: 15,
    location: "Gudang C-1",
    lastUpdated: "2024-01-15 09:20",
    price: 150000,
    barcode: "4234567890123"
  },
  {
    id: "PRD005",
    name: "Pulpen Pilot Hitam",
    category: "alat-tulis",
    currentStock: 8,
    minStock: 50,
    location: "Gudang D-1",
    lastUpdated: "2024-01-15 13:10",
    price: 5000,
    barcode: "5234567890123"
  },
  {
    id: "PRD006",
    name: "Meja Kantor Kayu",
    category: "furniture",
    currentStock: 12,
    minStock: 3,
    location: "Gudang E-1",
    lastUpdated: "2024-01-15 11:30",
    price: 1200000,
    barcode: "6234567890123"
  }
];

const Cashier = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const { toast } = useToast();

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      // You can use this for transaction history
    }
  }, []);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.currentStock) {
          toast({
            title: "Stok Tidak Mencukupi",
            description: `Stok tersedia: ${product.currentStock}`,
            variant: "destructive",
          });
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * product.price }
            : item
        );
      } else {
        if (quantity > product.currentStock) {
          toast({
            title: "Stok Tidak Mencukupi",
            description: `Stok tersedia: ${product.currentStock}`,
            variant: "destructive",
          });
          return prevCart;
        }
        
        return [...prevCart, {
          product,
          quantity,
          subtotal: quantity * product.price
        }];
      }
    });

    toast({
      title: "Produk Ditambahkan",
      description: `${product.name} ditambahkan ke keranjang`,
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product.id === productId) {
          if (quantity > item.product.currentStock) {
            toast({
              title: "Stok Tidak Mencukupi",
              description: `Stok tersedia: ${item.product.currentStock}`,
              variant: "destructive",
            });
            return item;
          }
          return { ...item, quantity, subtotal: quantity * item.product.price };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    toast({
      title: "Produk Dihapus",
      description: "Produk telah dihapus dari keranjang",
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Tambahkan produk ke keranjang terlebih dahulu",
        variant: "destructive",
      });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleTransactionComplete = (transaction: Transaction) => {
    // Update product stock
    setProducts(prevProducts =>
      prevProducts.map(product => {
        const cartItem = transaction.items.find(item => item.product.id === product.id);
        if (cartItem) {
          return {
            ...product,
            currentStock: product.currentStock - cartItem.quantity
          };
        }
        return product;
      })
    );

    // Save transaction to localStorage
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const updatedTransactions = [...savedTransactions, transaction];
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    // Clear cart and show receipt
    setCart([]);
    setLastTransaction(transaction);
    setIsReceiptOpen(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Kasir Point of Sale
        </h1>
        <p className="text-muted-foreground">Sistem kasir terintegrasi dengan manajemen stok</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
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
            <Receipt transaction={lastTransaction} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cashier;