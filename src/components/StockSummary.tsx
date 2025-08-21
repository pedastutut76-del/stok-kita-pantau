import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface StockSummaryProps {
  totalProducts: number;
  availableProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export const StockSummary = ({
  totalProducts,
  availableProducts,
  lowStockProducts,
  outOfStockProducts
}: StockSummaryProps) => {
  const summaryCards = [
    {
      title: "Total Produk",
      value: totalProducts,
      icon: Package,
      className: "border-l-4 border-l-primary"
    },
    {
      title: "Tersedia",
      value: availableProducts,
      icon: CheckCircle,
      className: "border-l-4 border-l-success"
    },
    {
      title: "Stok Rendah",
      value: lowStockProducts,
      icon: AlertTriangle,
      className: "border-l-4 border-l-warning"
    },
    {
      title: "Habis",
      value: outOfStockProducts,
      icon: XCircle,
      className: "border-l-4 border-l-danger"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} 
            className={`${card.className} group relative overflow-hidden bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-all duration-500 hover:scale-105 animate-scale-in cursor-pointer`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                {card.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-110">
                <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 animate-float">
                {card.value}
              </div>
              <div className="mt-2 h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};