import { useState, useEffect } from "react";
import { Transaction } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, TrendingUp, DollarSign, ShoppingCart, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load transactions from localStorage
    const savedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(savedTransactions);
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.timestamp);
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    
    return isWithinInterval(transactionDate, { start, end });
  });

  const reportData = {
    totalTransactions: filteredTransactions.length,
    totalRevenue: filteredTransactions.reduce((sum, t) => sum + t.grandTotal, 0),
    totalItems: filteredTransactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
    averageTransaction: filteredTransactions.length > 0 
      ? filteredTransactions.reduce((sum, t) => sum + t.grandTotal, 0) / filteredTransactions.length 
      : 0
  };

  // Top products analysis
  const productSales = filteredTransactions.reduce((acc, transaction) => {
    transaction.items.forEach(item => {
      const productId = item.product.id;
      if (!acc[productId]) {
        acc[productId] = {
          name: item.product.name,
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
        'No Struk': transaction.receiptNumber,
        'Tanggal': format(new Date(transaction.timestamp), "dd/MM/yyyy HH:mm", { locale: id }),
        'Kasir': transaction.cashierName,
        'Jumlah Item': transaction.items.reduce((sum, item) => sum + item.quantity, 0),
        'Subtotal': transaction.total,
        'Pajak': transaction.tax,
        'Total': transaction.grandTotal,
        'Metode Bayar': transaction.paymentMethod.toUpperCase(),
        'Uang Diterima': transaction.cashReceived || 0,
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

      // Trigger Zapier webhook if provided
      if (webhookUrl) {
        await triggerZapierWebhook();
      }

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

  const triggerZapierWebhook = async () => {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          reportType: "sales",
          period: `${startDate} to ${endDate}`,
          totalTransactions: reportData.totalTransactions,
          totalRevenue: reportData.totalRevenue,
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      toast({
        title: "Webhook Triggered",
        description: "Notifikasi laporan telah dikirim ke Zapier",
      });
    } catch (error) {
      console.error("Webhook error:", error);
      toast({
        title: "Webhook Error",
        description: "Gagal mengirim notifikasi ke Zapier",
        variant: "destructive",
      });
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

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
          Laporan Penjualan
        </h1>
        <p className="text-muted-foreground">Analisis dan laporan lengkap untuk bisnis Anda</p>
      </div>

      {/* Filters and Export */}
      <Card className="bg-gradient-card border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter & Export Laporan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="webhook">Zapier Webhook URL (Optional)</Label>
              <Input
                id="webhook"
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/..."
              />
            </div>
            <div className="space-y-2 flex items-end">
              <Button 
                onClick={exportToExcel}
                disabled={isExporting}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Mengexport..." : "Export Excel"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className={`${card.className} hover:shadow-medium transition-shadow bg-gradient-card border-0`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="bg-gradient-card border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Tidak ada data penjualan untuk periode ini
              </p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {product.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-gradient-card border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Tidak ada transaksi untuk periode ini
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTransactions.slice(0, 10).reverse().map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{transaction.receiptNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.timestamp), "dd/MM HH:mm")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(transaction.grandTotal)}</p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.paymentMethod}
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
  );
};

export default Reports;