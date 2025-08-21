import { CartItem } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const Cart = ({ items, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <Card className="h-full flex flex-col bg-gradient-card border-0 shadow-medium">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold">Keranjang Belanja</span>
          <Badge variant="secondary" className="text-sm">
            {items.length} Item
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-3 max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Keranjang masih kosong</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg border border-border/50">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(item.product.price)} x {item.quantity}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.currentStock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0 ml-2"
                    onClick={() => onRemoveItem(item.product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pajak (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            
            <Button 
              onClick={onCheckout}
              className="w-full mt-4 h-12 bg-gradient-primary hover:opacity-90 transition-opacity font-bold text-lg"
            >
              Checkout ({formatCurrency(total)})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};