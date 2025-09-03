import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface StockSummaryProps {
  totalProducts: number;
  availableProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  onFilterChange: (filter: string) => void;
}

export const StockSummary = ({
  totalProducts,
  availableProducts,
  lowStockProducts,
  outOfStockProducts,
  onFilterChange
}: StockSummaryProps) => {
  const summaryCards = [
    {
      title: "Total Produk",
      value: totalProducts,
      icon: Package,
      className: "border-l-4 border-l-primary",
      filter: "all"
    },
    {
      title: "Tersedia",
      value: availableProducts,
      icon: CheckCircle,
      className: "border-l-4 border-l-success",
      filter: "available"
    },
    {
      title: "Stok Rendah",
      value: lowStockProducts,
      icon: AlertTriangle,
      className: "border-l-4 border-l-warning",
      filter: "low"
    },
    {
      title: "Habis",
      value: outOfStockProducts,
      icon: XCircle,
      className: "border-l-4 border-l-danger",
      filter: "out"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} 
            className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-soft hover:shadow-strong transition-all duration-500 hover:scale-[1.02] animate-scale-in cursor-pointer rounded-2xl"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => onFilterChange(card.filter)}
          >
            {/* Modern gradient overlay */}
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
            
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-6 px-6 relative z-10">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors duration-300">
                {card.title}
              </CardTitle>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/60 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110 shadow-soft">
                <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 px-6 pb-6">
              <div className="text-4xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-3">
                {card.value}
              </div>
              <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 ease-out rounded-full" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Klik untuk detail
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};