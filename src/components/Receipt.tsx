import { Transaction } from "@/types/sales";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ReceiptProps {
  transaction: Transaction;
  onPrint?: () => void;
  onDownload?: () => void;
}

export const Receipt = ({ transaction, onPrint, onDownload }: ReceiptProps) => {
  const printReceipt = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Struk Pembayaran</title>
              <style>
                body { font-family: monospace; font-size: 12px; margin: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .border-t { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
                .mb-2 { margin-bottom: 8px; }
                .font-bold { font-weight: bold; }
                .flex { display: flex; justify-content: space-between; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Card className="max-w-sm mx-auto bg-white border-2 shadow-strong">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center space-x-2 mb-4">
          <Button onClick={printReceipt} variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Cetak
          </Button>
          {onDownload && (
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div id="receipt-content" className="font-mono text-sm space-y-2">
          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="font-bold text-lg">STOK KITA PANTAU</h2>
            <p className="text-xs">Sistem Kasir & Inventory</p>
            <p className="text-xs">Jl. Contoh No. 123, Kota</p>
            <p className="text-xs">Telp: (021) 123-4567</p>
          </div>

          <div className="border-t border-dashed border-gray-400 pt-2">
            <div className="flex justify-between mb-2">
              <span>No. Struk:</span>
              <span className="font-bold">{transaction.receiptNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tanggal:</span>
              <span>{format(new Date(transaction.timestamp), "dd/MM/yyyy HH:mm", { locale: id })}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span>Kasir:</span>
              <span>{transaction.cashierName}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-dashed border-gray-400 pt-2">
            {transaction.items.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="font-medium">{item.product.name}</div>
                <div className="flex justify-between text-xs">
                  <span>{item.quantity} x {formatCurrency(item.product.price)}</span>
                  <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(transaction.total - transaction.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak (10%):</span>
              <span>{formatCurrency(transaction.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-solid border-gray-400 pt-2">
              <span>TOTAL:</span>
              <span>{formatCurrency(transaction.grandTotal)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Pembayaran:</span>
              <span className="uppercase">{transaction.paymentMethod}</span>
            </div>
            {transaction.cashReceived && (
              <>
                <div className="flex justify-between">
                  <span>Uang Tunai:</span>
                  <span>{formatCurrency(transaction.cashReceived)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Kembalian:</span>
                  <span>{formatCurrency(transaction.change || 0)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-4 border-t border-dashed border-gray-400 text-xs">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar</p>
            <p className="mt-2">{format(new Date(), "dd/MM/yyyy HH:mm:ss")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};