import { Transaction } from "@/types/sales";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ReceiptPreview } from "./ReceiptPreview";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useReceiptSettings } from "@/hooks/useReceiptSettings";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ReceiptProps {
  transaction: Transaction;
  onPrint?: () => void;
  onDownload?: () => void;
}

interface UserProfile {
  store_name?: string;
  business_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_number?: string;
  full_name?: string;
}

export const Receipt = ({ transaction, onPrint, onDownload }: ReceiptProps) => {
  const { user } = useAuth();
  const { settings } = useReceiptSettings();
  const [userProfile, setUserProfile] = useState<UserProfile>({});

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('store_name, business_name, address, phone, email, tax_number, full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setUserProfile({
          store_name: data.store_name || '',
          business_name: data.business_name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || user.email || '',
          tax_number: data.tax_number || '',
          full_name: data.full_name || ''
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const getFontSizeStyle = () => {
    switch (settings.font_size) {
      case 'small': return 'font-size: 10px;';
      case 'large': return 'font-size: 14px;';
      default: return 'font-size: 12px;';
    }
  };

  const getPaperWidth = () => {
    switch (settings.paper_size) {
      case 'thermal_58': return 'max-width: 200px;';
      case 'thermal_80': return 'max-width: 300px;';
      case 'a4': return 'max-width: 600px;';
      default: return 'max-width: 300px;';
    }
  };
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
                body { font-family: monospace; ${getFontSizeStyle()} margin: 20px; }
                .receipt { ${getPaperWidth()} margin: 0 auto; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .border-t { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
                .mb-2 { margin-bottom: 8px; }
                .font-bold { font-weight: bold; }
                .flex { display: flex; justify-content: space-between; }
                .text-xs { font-size: 0.9em; }
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
            {settings.header_text && (
              <div className="font-bold text-sm mb-2">{settings.header_text}</div>
            )}
            <h2 className="font-bold text-lg">
              {userProfile.store_name || userProfile.business_name || 'Nama Toko'}
            </h2>
            {userProfile.business_name && userProfile.store_name && userProfile.business_name !== userProfile.store_name && (
              <p className="text-xs">{userProfile.business_name}</p>
            )}
            {settings.show_address && userProfile.address && (
              <p className="text-xs">{userProfile.address}</p>
            )}
            {settings.show_phone && userProfile.phone && (
              <p className="text-xs">Telp: {userProfile.phone}</p>
            )}
            {settings.show_email && userProfile.email && (
              <p className="text-xs">Email: {userProfile.email}</p>
            )}
            {settings.show_tax_number && userProfile.tax_number && (
              <p className="text-xs">NPWP: {userProfile.tax_number}</p>
            )}
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
              <span>{userProfile.full_name || transaction.cashierName || 'Admin'}</span>
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
            {settings.show_tax && transaction.tax > 0 && (
              <div className="flex justify-between">
                <span>
                  Pajak ({settings.tax_type === 'percentage' ? `${settings.tax_rate}%` : 'Tetap'}):
                </span>
                <span>{formatCurrency(transaction.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t border-solid border-gray-400 pt-2">
              <span>TOTAL:</span>
              <span>{settings.currency_symbol} {formatCurrency(transaction.grandTotal).replace('Rp', '').trim()}</span>
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
            {settings.footer_text && (
              <p>{settings.footer_text}</p>
            )}
            <p className="mt-2">{format(new Date(), "dd/MM/yyyy HH:mm:ss")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};