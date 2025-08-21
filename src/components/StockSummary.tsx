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
          <Card key={index} className={`${card.className} hover:shadow-md transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};