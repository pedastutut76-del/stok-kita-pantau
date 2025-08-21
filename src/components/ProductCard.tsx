import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  location: string;
  lastUpdated: string;
}

export const ProductCard = ({ 
  id, 
  name, 
  category, 
  currentStock, 
  minStock, 
  location, 
  lastUpdated 
}: ProductCardProps) => {
  const getStockStatus = () => {
    if (currentStock === 0) {
      return { status: 'Habis', variant: 'danger', icon: XCircle };
    } else if (currentStock <= minStock) {
      return { status: 'Stok Rendah', variant: 'warning', icon: AlertTriangle };
    } else {
      return { status: 'Tersedia', variant: 'success', icon: CheckCircle };
    }
  };

  const stockInfo = getStockStatus();
  const StatusIcon = stockInfo.icon;

  return (
    <Card className="group relative overflow-hidden bg-gradient-card border-0 shadow-soft hover:shadow-strong transition-all duration-500 hover:scale-[1.02] animate-fade-in-up">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {name}
          </CardTitle>
          <Badge variant="outline" className="text-xs font-semibold border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 group-hover:scale-105 transition-transform duration-300">
            <div className="p-1.5 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors duration-300">
              <Package className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">ID: {id}</span>
          </div>
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all duration-300 hover:scale-105 ${
            stockInfo.variant === 'success' ? 'bg-gradient-success text-success-foreground shadow-success' :
            stockInfo.variant === 'warning' ? 'bg-gradient-warning text-warning-foreground shadow-warning' :
            'bg-gradient-danger text-danger-foreground shadow-danger'
          }`}>
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{stockInfo.status}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
            <span className="text-sm text-muted-foreground font-medium">Stok Saat Ini</span>
            <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300">{currentStock}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Minimum Stok</span>
            <span className="text-sm font-semibold text-muted-foreground">{minStock}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Lokasi</span>
            <span className="text-sm font-bold text-accent bg-accent/10 px-2 py-1 rounded-md">{location}</span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow"></div>
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};