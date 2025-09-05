import { useAuth } from "@/hooks/useAuth";
import { useReceiptSettings } from "@/hooks/useReceiptSettings";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface ReceiptPreviewProps {
  receiptNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  customerName: string;
  cashierName: string;
  date: Date;
  onPrint?: () => void;
  onDownload?: () => void;
}

export const ReceiptPreview = ({
  receiptNumber,
  items,
  subtotal,
  tax,
  grandTotal,
  paymentMethod,
  cashReceived,
  change,
  customerName,
  cashierName,
  date,
  onPrint,
  onDownload
}: ReceiptPreviewProps) => {
  const { user } = useAuth();
  const { settings } = useReceiptSettings();

  const getFontSizeClass = () => {
    switch (settings.font_size) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getPaperClass = () => {
    switch (settings.paper_size) {
      case 'thermal_58': return 'w-[58mm] max-w-[58mm]';
      case 'thermal_80': return 'w-[80mm] max-w-[80mm]';
      case 'a4': return 'w-full max-w-[210mm]';
      default: return 'w-[80mm] max-w-[80mm]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end print:hidden">
        {onPrint && (
          <Button onClick={onPrint} size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
        )}
        {onDownload && (
          <Button onClick={onDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        )}
      </div>

      {/* Receipt Content */}
      <div className={`${getPaperClass()} ${getFontSizeClass()} mx-auto bg-white border p-4 font-mono`}>
        {/* Header */}
        {settings.show_logo && settings.logo_url && (
          <div className="text-center mb-2">
            <img src={settings.logo_url} alt="Logo" className="mx-auto max-h-12" />
          </div>
        )}
        
        {settings.header_text && (
          <div className="text-center font-bold mb-2">
            {settings.header_text}
          </div>
        )}

        {/* Store Information */}
        {settings.show_address && user?.user_metadata?.store_address && (
          <div className="text-center text-xs mb-1">
            {user.user_metadata.store_address}
          </div>
        )}
        
        {settings.show_phone && user?.user_metadata?.phone && (
          <div className="text-center text-xs mb-1">
            Tel: {user.user_metadata.phone}
          </div>
        )}
        
        {settings.show_email && user?.email && (
          <div className="text-center text-xs mb-1">
            Email: {user.email}
          </div>
        )}
        
        {settings.show_tax_number && user?.user_metadata?.tax_number && (
          <div className="text-center text-xs mb-2">
            NPWP: {user.user_metadata.tax_number}
          </div>
        )}

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Transaction Info */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>No. Struk:</span>
            <span>{receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{date.toLocaleDateString('id-ID')} {date.toLocaleTimeString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>{cashierName}</span>
          </div>
          <div className="flex justify-between">
            <span>Pelanggan:</span>
            <span>{customerName}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Items */}
        <div className="space-y-1">
          {items.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between">
                <span className="flex-1">{item.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>{item.quantity} x {formatCurrency(item.price)}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {settings.show_tax && tax > 0 && (
            <div className="flex justify-between">
              <span>
                Pajak ({settings.tax_type === 'percentage' ? `${settings.tax_rate}%` : 'Tetap'}):
              </span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold border-t pt-1">
            <span>TOTAL:</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Pembayaran:</span>
            <span className="capitalize">{paymentMethod}</span>
          </div>
          
          {paymentMethod === 'cash' && cashReceived && (
            <>
              <div className="flex justify-between">
                <span>Tunai:</span>
                <span>{formatCurrency(cashReceived)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembalian:</span>
                <span>{formatCurrency(change || 0)}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {settings.footer_text && (
          <>
            <div className="border-t border-dashed border-gray-400 my-2"></div>
            <div className="text-center text-xs">
              {settings.footer_text}
            </div>
          </>
        )}

        {/* QR Code placeholder */}
        {settings.show_qr_code && (
          <div className="text-center mt-2">
            <div className="inline-block w-16 h-16 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-xs">
              QR Code
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
