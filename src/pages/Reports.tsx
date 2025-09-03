import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, TrendingUp, DollarSign, ShoppingCart, Package, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";

const Reports = () => {
  const { transactions, loading } = useTransactions();
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.created_at);
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    
    return isWithinInterval(transactionDate, { start, end });
  });

  const reportData = {
    totalTransactions: filteredTransactions.length,
    totalRevenue: filteredTransactions.reduce((sum, t) => sum + t.grand_total, 0),
    totalItems: filteredTransactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
    averageTransaction: filteredTransactions.length > 0 
      ? filteredTransactions.reduce((sum, t) => sum + t.grand_total, 0) / filteredTransactions.length 
      : 0
  };

  // Top products analysis
  const productSales = filteredTransactions.reduce((acc, transaction) => {
    transaction.items.forEach(item => {
      const productId = item.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          name: item.product_name,
          quantity: 0,
          revenue: 0
        };
      }
      acc[productId].quantity += item.quantity;
      acc[productId].revenue += item.subtotal;
    });
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const exportToExcel = async () => {
    if (filteredTransactions.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description: "Tidak ada transaksi untuk periode yang dipilih",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Prepare transaction data
      const transactionData = filteredTransactions.map(transaction => ({
        'No Struk': transaction.receipt_number,
        'Tanggal': format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm", { locale: id }),
        'Kasir': transaction.cashier_name,
        'Jumlah Item': transaction.items.reduce((sum, item) => sum + item.quantity, 0),
        'Subtotal': transaction.total,
        'Pajak': transaction.tax,
        'Total': transaction.grand_total,
        'Metode Bayar': transaction.payment_method.toUpperCase(),
        'Uang Diterima': transaction.cash_received || 0,
        'Kembalian': transaction.change || 0
      }));

      // Prepare product sales data
      const productData = topProducts.map((product, index) => ({
        'Ranking': index + 1,
        'Nama Produk': product.name,
        'Qty Terjual': product.quantity,
        'Total Revenue': product.revenue
      }));

      // Prepare summary data
      const summaryData = [
        { 'Metrik': 'Total Transaksi', 'Nilai': reportData.totalTransactions },
        { 'Metrik': 'Total Revenue', 'Nilai': reportData.totalRevenue },
        { 'Metrik': 'Total Item Terjual', 'Nilai': reportData.totalItems },
        { 'Metrik': 'Rata-rata per Transaksi', 'Nilai': Math.round(reportData.averageTransaction) },
        { 'Metrik': 'Periode Laporan', 'Nilai': `${startDate} s/d ${endDate}` }
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Add worksheets
      const wsTransactions = XLSX.utils.json_to_sheet(transactionData);
      const wsProducts = XLSX.utils.json_to_sheet(productData);
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);

      XLSX.utils.book_append_sheet(wb, wsTransactions, "Transaksi");
      XLSX.utils.book_append_sheet(wb, wsProducts, "Produk Terlaris");
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

      // Set column widths
      const wscols = [
        { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
        { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
        { wch: 15 }, { wch: 12 }
      ];
      wsTransactions['!cols'] = wscols;

      // Export file
      const fileName = `Laporan-Penjualan-${startDate}-${endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Export Berhasil",
        description: `Laporan telah disimpan sebagai ${fileName}`,
      });


    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat mengexport laporan",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };


  const summaryCards = [
    {
      title: "Total Transaksi",
      value: reportData.totalTransactions,
      icon: ShoppingCart,
      className: "border-l-4 border-l-primary"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(reportData.totalRevenue),
      icon: DollarSign,
      className: "border-l-4 border-l-success"
    },
    {
      title: "Item Terjual",
      value: reportData.totalItems,
      icon: Package,
      className: "border-l-4 border-l-warning"
    },
    {
      title: "Rata-rata/Transaksi",
      value: formatCurrency(reportData.averageTransaction),
      icon: TrendingUp,
      className: "border-l-4 border-l-accent"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Modern Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Laporan Penjualan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Analisis mendalam performa bisnis Anda dengan visual yang elegan
          </p>
        </div>

        {/* Modern Filter Card */}
        <Card className="backdrop-blur-sm bg-card/95 border-0 shadow-xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-primary/10">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              Filter & Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium">Dari Tanggal</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl border-0 bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-medium">Sampai Tanggal</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl border-0 bg-muted/50 focus:bg-background transition-colors"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={exportToExcel}
                  disabled={isExporting || filteredTransactions.length === 0}
                  className="w-full h-11 rounded-xl bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Mengexport..." : "Download Excel"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index} className="backdrop-blur-sm bg-card/95 border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold tracking-tight">{card.value}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card className="backdrop-blur-sm bg-card/95 border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                Produk Terlaris
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Belum ada data penjualan untuk periode ini
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} terjual</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(product.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="backdrop-blur-sm bg-card/95 border-0 shadow-xl rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-xl bg-primary/10">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                Transaksi Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Belum ada transaksi untuk periode ini
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTransactions.slice(0, 10).reverse().map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-semibold">{transaction.receipt_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), "dd/MM HH:mm")} • {transaction.cashier_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(transaction.grand_total)}</p>
                        <Badge variant="outline" className="text-xs rounded-full">
                          {transaction.payment_method}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;