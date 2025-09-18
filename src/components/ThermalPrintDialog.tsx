import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Printer, Settings, TestTube } from "lucide-react";
import { Transaction } from "@/types/sales";
import { formatCurrency } from "@/lib/utils";
import { ThermalPrinter } from "@/lib/thermalPrinter";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useReceiptSettings } from "@/hooks/useReceiptSettings";
import { useState as useStateHook, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ThermalPrintDialogProps {
  transaction: Transaction;
  children: React.ReactNode;
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

type PaperSize = 'thermal_58' | 'thermal_80' | 'a4';

export const ThermalPrintDialog = ({ transaction, children }: ThermalPrintDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPaperSize, setSelectedPaperSize] = useState<PaperSize>('thermal_58');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { user } = useAuth();
  const { settings } = useReceiptSettings();
  const [userProfile, setUserProfile] = useStateHook<UserProfile>({});

  useEffect(() => {
    if (open) {
      loadUserProfile();
    }
  }, [open, user]);

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

  const testPrinter = async () => {
    setIsTesting(true);
    
    try {
      const port = await ThermalPrinter.connectToPrinter();
      const paperSizeMap = {
        'thermal_58': '58mm' as const,
        'thermal_80': '80mm' as const,
        'a4': 'a4' as const
      };
      
      const testData = ThermalPrinter.generateTestPage(paperSizeMap[selectedPaperSize]);
      await ThermalPrinter.sendToPrinter(port, testData);
      await ThermalPrinter.closePrinter(port);
      
      alert('Test printer berhasil! Periksa hasil cetakan.');
    } catch (error: any) {
      console.error('Error testing printer:', error);
      alert(`Error test printer: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const generateThermalReceipt = (): string => {
    const lineWidth = selectedPaperSize === 'thermal_58' ? 32 : selectedPaperSize === 'thermal_80' ? 48 : 80;
    const dashLine = ThermalPrinter.getDashLine(selectedPaperSize === 'thermal_58' ? '58mm' : selectedPaperSize === 'thermal_80' ? '80mm' : 'a4');
    
    let receipt = '';
    
    // Initialize printer
    receipt += ThermalPrinter.commands.init;
    
    // Header
    receipt += ThermalPrinter.commands.centerAlign;
    receipt += ThermalPrinter.commands.bold;
    
    if (settings.header_text) {
      receipt += settings.header_text + ThermalPrinter.commands.lineFeed;
    }
    
    const storeName = userProfile.store_name || userProfile.business_name || 'Nama Toko';
    receipt += storeName + ThermalPrinter.commands.lineFeed;
    receipt += ThermalPrinter.commands.boldOff;
    
    if (userProfile.business_name && userProfile.store_name && userProfile.business_name !== userProfile.store_name) {
      receipt += userProfile.business_name + ThermalPrinter.commands.lineFeed;
    }
    
    if (settings.show_address && userProfile.address) {
      receipt += userProfile.address + ThermalPrinter.commands.lineFeed;
    }
    
    if (settings.show_phone && userProfile.phone) {
      receipt += `Telp: ${userProfile.phone}` + ThermalPrinter.commands.lineFeed;
    }
    
    if (settings.show_email && userProfile.email) {
      receipt += `Email: ${userProfile.email}` + ThermalPrinter.commands.lineFeed;
    }
    
    if (settings.show_tax_number && userProfile.tax_number) {
      receipt += `NPWP: ${userProfile.tax_number}` + ThermalPrinter.commands.lineFeed;
    }
    
    receipt += ThermalPrinter.commands.lineFeed;
    receipt += dashLine + ThermalPrinter.commands.lineFeed;
    
    // Transaction details
    receipt += ThermalPrinter.commands.leftAlign;
    receipt += `No. Struk: ${transaction.receiptNumber}` + ThermalPrinter.commands.lineFeed;
    receipt += `Tanggal: ${format(new Date(transaction.timestamp), "dd/MM/yyyy HH:mm", { locale: id })}` + ThermalPrinter.commands.lineFeed;
    receipt += `Kasir: ${userProfile.full_name || transaction.cashierName || 'Admin'}` + ThermalPrinter.commands.lineFeed;
    receipt += dashLine + ThermalPrinter.commands.lineFeed;
    
    // Items
    transaction.items.forEach((item) => {
      receipt += item.product.name + ThermalPrinter.commands.lineFeed;
      const itemLine = `${item.quantity} x ${formatCurrency(item.product.price).replace('Rp', '').trim()}`;
      const subtotalStr = formatCurrency(item.subtotal).replace('Rp', '').trim();
      const spaces = ' '.repeat(Math.max(1, lineWidth - itemLine.length - subtotalStr.length));
      receipt += itemLine + spaces + subtotalStr + ThermalPrinter.commands.lineFeed;
    });
    
    receipt += dashLine + ThermalPrinter.commands.lineFeed;
    
    // Totals
    const subtotal = transaction.total - transaction.tax;
    const subtotalLine = `Subtotal:`;
    const subtotalAmount = formatCurrency(subtotal).replace('Rp', '').trim();
    let spaces = ' '.repeat(Math.max(1, lineWidth - subtotalLine.length - subtotalAmount.length));
    receipt += subtotalLine + spaces + subtotalAmount + ThermalPrinter.commands.lineFeed;
    
    if (settings.show_tax && transaction.tax > 0) {
      const taxLabel = `Pajak (${settings.tax_type === 'percentage' ? `${settings.tax_rate}%` : 'Tetap'}):`;
      const taxAmount = formatCurrency(transaction.tax).replace('Rp', '').trim();
      spaces = ' '.repeat(Math.max(1, lineWidth - taxLabel.length - taxAmount.length));
      receipt += taxLabel + spaces + taxAmount + ThermalPrinter.commands.lineFeed;
    }
    
    receipt += dashLine + ThermalPrinter.commands.lineFeed;
    receipt += ThermalPrinter.commands.bold;
    const totalLine = 'TOTAL:';
    const totalAmount = `${settings.currency_symbol} ${formatCurrency(transaction.grandTotal).replace('Rp', '').trim()}`;
    spaces = ' '.repeat(Math.max(1, lineWidth - totalLine.length - totalAmount.length));
    receipt += totalLine + spaces + totalAmount + ThermalPrinter.commands.lineFeed;
    receipt += ThermalPrinter.commands.boldOff;
    
    receipt += dashLine + ThermalPrinter.commands.lineFeed;
    
    // Payment
    const paymentLine = 'Pembayaran:';
    const paymentMethod = transaction.paymentMethod.toUpperCase();
    spaces = ' '.repeat(Math.max(1, lineWidth - paymentLine.length - paymentMethod.length));
    receipt += paymentLine + spaces + paymentMethod + ThermalPrinter.commands.lineFeed;
    
    if (transaction.cashReceived) {
      const cashLine = 'Uang Tunai:';
      const cashAmount = formatCurrency(transaction.cashReceived).replace('Rp', '').trim();
      spaces = ' '.repeat(Math.max(1, lineWidth - cashLine.length - cashAmount.length));
      receipt += cashLine + spaces + cashAmount + ThermalPrinter.commands.lineFeed;
      
      const changeLine = 'Kembalian:';
      const changeAmount = formatCurrency(transaction.change || 0).replace('Rp', '').trim();
      spaces = ' '.repeat(Math.max(1, lineWidth - changeLine.length - changeAmount.length));
      receipt += changeLine + spaces + changeAmount + ThermalPrinter.commands.lineFeed;
    }
    
    receipt += dashLine + ThermalPrinter.commands.lineFeed;
    
    // Footer
    receipt += ThermalPrinter.commands.centerAlign;
    if (settings.footer_text) {
      receipt += settings.footer_text + ThermalPrinter.commands.lineFeed;
    }
    receipt += format(new Date(), "dd/MM/yyyy HH:mm:ss") + ThermalPrinter.commands.lineFeed;
    receipt += ThermalPrinter.commands.lineFeed;
    receipt += ThermalPrinter.commands.lineFeed;
    receipt += ThermalPrinter.commands.lineFeed;
    
    // Cut paper
    receipt += ThermalPrinter.commands.cut;
    
    return receipt;
  };

  const printToThermalPrinter = async () => {
    setIsConnecting(true);
    
    try {
      const port = await ThermalPrinter.connectToPrinter();
      const receiptData = generateThermalReceipt();
      await ThermalPrinter.sendToPrinter(port, receiptData);
      await ThermalPrinter.closePrinter(port);
      
      setOpen(false);
      alert('Struk berhasil dicetak!');
      
    } catch (error: any) {
      console.error('Error printing:', error);
      alert(`Error saat mencetak: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const printWithBrowser = () => {
    const printContent = generatePrintableHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      setOpen(false);
    }
  };

  const generatePrintableHTML = (): string => {
    const width = selectedPaperSize === 'thermal_58' ? '200px' : 
                  selectedPaperSize === 'thermal_80' ? '300px' : '600px';
    
    const fontSize = selectedPaperSize === 'a4' ? '12px' : '10px';
    
    return `
      <html>
        <head>
          <title>Struk Pembayaran</title>
          <style>
            body { 
              font-family: 'Courier New', monospace; 
              font-size: ${fontSize}; 
              margin: 0; 
              padding: 10px;
              width: ${width};
              margin: 0 auto;
            }
            .receipt { width: 100%; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .border-t { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
            .mb-2 { margin-bottom: 8px; }
            .font-bold { font-weight: bold; }
            .flex { display: flex; justify-content: space-between; }
            .text-xs { font-size: 0.9em; }
            @media print {
              body { margin: 0; padding: 5px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="text-center mb-2">
              ${settings.header_text ? `<div class="font-bold">${settings.header_text}</div>` : ''}
              <h2 class="font-bold">${userProfile.store_name || userProfile.business_name || 'Nama Toko'}</h2>
              ${userProfile.business_name && userProfile.store_name && userProfile.business_name !== userProfile.store_name ? 
                `<p class="text-xs">${userProfile.business_name}</p>` : ''}
              ${settings.show_address && userProfile.address ? `<p class="text-xs">${userProfile.address}</p>` : ''}
              ${settings.show_phone && userProfile.phone ? `<p class="text-xs">Telp: ${userProfile.phone}</p>` : ''}
              ${settings.show_email && userProfile.email ? `<p class="text-xs">Email: ${userProfile.email}</p>` : ''}
              ${settings.show_tax_number && userProfile.tax_number ? `<p class="text-xs">NPWP: ${userProfile.tax_number}</p>` : ''}
            </div>
            
            <div class="border-t">
              <div class="flex mb-2">
                <span>No. Struk:</span>
                <span class="font-bold">${transaction.receiptNumber}</span>
              </div>
              <div class="flex mb-2">
                <span>Tanggal:</span>
                <span>${format(new Date(transaction.timestamp), "dd/MM/yyyy HH:mm", { locale: id })}</span>
              </div>
              <div class="flex mb-2">
                <span>Kasir:</span>
                <span>${userProfile.full_name || transaction.cashierName || 'Admin'}</span>
              </div>
            </div>
            
            <div class="border-t">
              ${transaction.items.map(item => `
                <div class="mb-2">
                  <div class="font-bold">${item.product.name}</div>
                  <div class="flex text-xs">
                    <span>${item.quantity} x ${formatCurrency(item.product.price)}</span>
                    <span class="font-bold">${formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="border-t">
              <div class="flex">
                <span>Subtotal:</span>
                <span>${formatCurrency(transaction.total - transaction.tax)}</span>
              </div>
              ${settings.show_tax && transaction.tax > 0 ? `
                <div class="flex">
                  <span>Pajak (${settings.tax_type === 'percentage' ? `${settings.tax_rate}%` : 'Tetap'}):</span>
                  <span>${formatCurrency(transaction.tax)}</span>
                </div>
              ` : ''}
              <div class="flex font-bold border-t" style="padding-top: 8px; margin-top: 8px;">
                <span>TOTAL:</span>
                <span>${settings.currency_symbol} ${formatCurrency(transaction.grandTotal).replace('Rp', '').trim()}</span>
              </div>
            </div>
            
            <div class="border-t">
              <div class="flex">
                <span>Pembayaran:</span>
                <span>${transaction.paymentMethod.toUpperCase()}</span>
              </div>
              ${transaction.cashReceived ? `
                <div class="flex">
                  <span>Uang Tunai:</span>
                  <span>${formatCurrency(transaction.cashReceived)}</span>
                </div>
                <div class="flex font-bold">
                  <span>Kembalian:</span>
                  <span>${formatCurrency(transaction.change || 0)}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="text-center border-t text-xs" style="margin-top: 16px; padding-top: 16px;">
              ${settings.footer_text ? `<p>${settings.footer_text}</p>` : ''}
              <p>${format(new Date(), "dd/MM/yyyy HH:mm:ss")}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Opsi Cetak Struk
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Pilih Ukuran Kertas</Label>
            <RadioGroup
              value={selectedPaperSize}
              onValueChange={(value) => setSelectedPaperSize(value as PaperSize)}
              className="mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thermal_58" id="thermal_58" />
                <Label htmlFor="thermal_58">Thermal 58mm (Printer Kasir)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thermal_80" id="thermal_80" />
                <Label htmlFor="thermal_80">Thermal 80mm (Printer Kasir)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="a4" id="a4" />
                <Label htmlFor="a4">A4 (Printer Biasa)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Metode Cetak:</p>
              <ul className="text-xs space-y-1">
                <li>• <strong>Cetak Thermal:</strong> Langsung ke printer thermal via USB/Serial</li>
                <li>• <strong>Cetak Browser:</strong> Menggunakan dialog print browser</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={printToThermalPrinter}
                  disabled={isConnecting || isTesting}
                  className="flex-1"
                  variant="default"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {isConnecting ? 'Menghubungkan...' : 'Cetak Thermal'}
                </Button>
                
                <Button
                  onClick={printWithBrowser}
                  disabled={isConnecting || isTesting}
                  variant="outline"
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Cetak Browser
                </Button>
              </div>
              
              <Button
                onClick={testPrinter}
                disabled={isConnecting || isTesting}
                variant="secondary"
                className="w-full"
                size="sm"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test Printer'}
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">Catatan:</p>
            <p>Untuk printer thermal, pastikan printer sudah terhubung via USB dan browser mendukung Web Serial API (Chrome/Edge).</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
