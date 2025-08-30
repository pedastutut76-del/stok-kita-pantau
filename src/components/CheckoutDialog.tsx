import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  subtotal: number;
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onComplete: (transaction: any) => void;
}

export const CheckoutDialog = ({ isOpen, onClose, items, onComplete }: CheckoutDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(subtotal * 0.1);
  const grandTotal = subtotal + tax;
  const cashAmount = parseFloat(cashReceived) || 0;
  const change = paymentMethod === "cash" ? Math.max(0, cashAmount - grandTotal) : 0;

  const handleCheckout = async () => {
    if (paymentMethod === "cash" && cashAmount < grandTotal) {
      toast({
        title: "Pembayaran tidak cukup",
        description: "Jumlah uang yang diterima kurang dari total belanja",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const transactionData = {
      subtotal,
      tax,
      grandTotal,
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? cashAmount : undefined,
      change: paymentMethod === "cash" ? change : undefined,
      customerName: customerName || "Pelanggan",
    };

    onComplete(transactionData);
    
    // Reset form
    setPaymentMethod("cash");
    setCashReceived("");
    setCustomerName("");
    setIsProcessing(false);
    
    toast({
      title: "Pembayaran berhasil!",
      description: "Transaksi telah selesai diproses",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Selesaikan pembayaran untuk {items.length} item
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customer">Nama Pelanggan</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama pelanggan (opsional)"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="card">Kartu</SelectItem>
                <SelectItem value="e-wallet">E-Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === "cash" && (
            <div className="space-y-2">
              <Label htmlFor="cash">Uang Diterima</Label>
              <Input
                id="cash"
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="0"
              />
              {cashAmount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Kembalian: {formatCurrency(change)}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Batal
          </Button>
          <Button onClick={handleCheckout} disabled={isProcessing}>
            {isProcessing ? "Memproses..." : `Bayar Sekarang - ${formatCurrency(grandTotal)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};