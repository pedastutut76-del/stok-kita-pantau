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
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
            {name}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">ID: {id}</span>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            stockInfo.variant === 'success' ? 'bg-success text-success-foreground' :
            stockInfo.variant === 'warning' ? 'bg-warning text-warning-foreground' :
            'bg-danger text-danger-foreground'
          }`}>
            <StatusIcon className="h-3 w-3" />
            <span>{stockInfo.status}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Stok Saat Ini</span>
            <span className="font-semibold text-lg">{currentStock}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Minimum Stok</span>
            <span className="text-sm">{minStock}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Lokasi</span>
            <span className="text-sm font-medium">{location}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};