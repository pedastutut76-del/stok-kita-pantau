import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, BarChart3 } from "lucide-react";
import { parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";

const ProfitLoss = () => {
  const { products } = useProducts();
  const { transactions } = useTransactions();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredTransactions = transactions.filter(transaction => {
    if (!startDate || !endDate) return true;
    
    const transactionDate = parseISO(transaction.created_at);
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));
    
    return isWithinInterval(transactionDate, { start, end });
  });

  const profitLossData = useMemo(() => {
    const productSales = new Map();

    // Calculate sales for each product
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const productId = item.product_id;
        const product = products.find(p => p.id === productId);
        
        if (product) {
          const existing = productSales.get(productId) || {
            product,
            quantitySold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
          
          existing.quantitySold += item.quantity;
          existing.revenue += item.subtotal;
          existing.cost += (product.purchase_price || 0) * item.quantity;
          existing.profit = existing.revenue - existing.cost;
          
          productSales.set(productId, existing);
        }
      });
    });

    return Array.from(productSales.values()).sort((a, b) => b.profit - a.profit);
  }, [filteredTransactions, products]);

  const summary = profitLossData.reduce(
    (acc, item) => ({
      totalRevenue: acc.totalRevenue + item.revenue,
      totalCost: acc.totalCost + item.cost,
      totalProfit: acc.totalProfit + item.profit,
      totalQuantity: acc.totalQuantity + item.quantitySold,
    }),
    { totalRevenue: 0, totalCost: 0, totalProfit: 0, totalQuantity: 0 }
  );

  const profitMargin = summary.totalRevenue > 0 ? (summary.totalProfit / summary.totalRevenue) * 100 : 0;
  const averageProfit = profitLossData.length > 0 ? summary.totalProfit / profitLossData.length : 0;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Laporan Laba Rugi
          </h1>
          <p className="text-muted-foreground mt-2">
            Analisis profitabilitas produk dan penjualan
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filter Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start-date">Tanggal Mulai</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Tanggal Selesai</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(summary.totalRevenue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Biaya</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(summary.totalCost)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laba</CardTitle>
            <TrendingUp className={`h-4 w-4 ${summary.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(summary.totalProfit)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Laba</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {profitMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Laba Rugi per Produk</CardTitle>
          <CardDescription>
            Analisis profitabilitas setiap produk dalam periode yang dipilih
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profitLossData.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                Tidak ada data penjualan dalam periode yang dipilih
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Qty Terjual</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Pendapatan</TableHead>
                  <TableHead>Biaya</TableHead>
                  <TableHead>Laba</TableHead>
                  <TableHead>Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profitLossData.map((item) => {
                  const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
                  const avgSellingPrice = item.quantitySold > 0 ? item.revenue / item.quantitySold : 0;
                  
                  return (
                    <TableRow key={item.product.id}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>{item.product.category}</TableCell>
                      <TableCell>{item.quantitySold}</TableCell>
                      <TableCell>{formatCurrency(item.product.purchase_price || 0)}</TableCell>
                      <TableCell>{formatCurrency(avgSellingPrice)}</TableCell>
                      <TableCell className="text-success">{formatCurrency(item.revenue)}</TableCell>
                      <TableCell className="text-destructive">{formatCurrency(item.cost)}</TableCell>
                      <TableCell>
                        <span className={item.profit >= 0 ? 'text-success' : 'text-destructive'}>
                          {formatCurrency(item.profit)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={margin >= 0 ? "default" : "destructive"}>
                          {margin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitLoss;