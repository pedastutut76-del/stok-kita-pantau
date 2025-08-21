import { useState } from "react";
import { CartItem, Transaction } from "@/types/sales";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, DollarSign, Smartphone } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onComplete: (transaction: Transaction) => void;
}

export const CheckoutDialog = ({ isOpen, onClose, items, onComplete }: CheckoutDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;
  const cashAmount = parseFloat(cashReceived) || 0;
  const change = cashAmount - grandTotal;

  const paymentMethods = [
    { value: "cash", label: "Tunai", icon: DollarSign },
    { value: "card", label: "Kartu", icon: CreditCard },
    { value: "digital", label: "E-Wallet", icon: Smartphone },
  ];

  const handleCheckout = async () => {
    if (paymentMethod === "cash" && cashAmount < grandTotal) {
      toast({
        title: "Error",
        description: "Jumlah uang tunai tidak mencukupi",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      items,
      total: subtotal,
      tax,
      grandTotal,
      paymentMethod,
      cashReceived: paymentMethod === "cash" ? cashAmount : undefined,
      change: paymentMethod === "cash" ? change : undefined,
      timestamp: new Date().toISOString(),
      cashierName: "Admin Kasir",
      receiptNumber: `RCP-${String(Date.now()).slice(-8)}`,
    };

    onComplete(transaction);
    setIsProcessing(false);
    onClose();

    // Reset form
    setCashReceived("");
    setCustomerName("");
    setPaymentMethod("cash");

    toast({
      title: "Transaksi Berhasil",
      description: `Pembayaran ${formatCurrency(grandTotal)} telah diproses`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Checkout Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({items.length} item)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pajak (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total Pembayaran</span>
              <span className="text-primary">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customer">Nama Pelanggan (Opsional)</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama pelanggan"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Metode Pembayaran</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={method.value} id={method.value} />
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor={method.value} className="flex-1 cursor-pointer">
                      {method.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Cash Payment */}
          {paymentMethod === "cash" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cash">Jumlah Uang Tunai</Label>
                <Input
                  id="cash"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              {cashAmount > 0 && (
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Uang Diterima</span>
                    <span>{formatCurrency(cashAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium mt-1">
                    <span>Kembalian</span>
                    <span className={change >= 0 ? "text-success" : "text-destructive"}>
                      {formatCurrency(Math.max(0, change))}
                    </span>
                  </div>
                  {change < 0 && (
                    <p className="text-xs text-destructive mt-1">
                      Kurang {formatCurrency(Math.abs(change))}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={isProcessing || (paymentMethod === "cash" && cashAmount < grandTotal)}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {isProcessing ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};