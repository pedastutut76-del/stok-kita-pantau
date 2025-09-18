// Thermal Printer Utility for ESC/POS Commands
export class ThermalPrinter {
  private static readonly ESC = '\x1B';
  private static readonly GS = '\x1D';
  private static readonly LF = '\x0A';
  private static readonly CR = '\x0D';

  // ESC/POS Commands
  static readonly commands = {
    // Printer initialization
    init: ThermalPrinter.ESC + '@',
    
    // Text alignment
    centerAlign: ThermalPrinter.ESC + 'a' + '\x01',
    leftAlign: ThermalPrinter.ESC + 'a' + '\x00',
    rightAlign: ThermalPrinter.ESC + 'a' + '\x02',
    
    // Text formatting
    bold: ThermalPrinter.ESC + 'E' + '\x01',
    boldOff: ThermalPrinter.ESC + 'E' + '\x00',
    underline: ThermalPrinter.ESC + '-' + '\x01',
    underlineOff: ThermalPrinter.ESC + '-' + '\x00',
    
    // Font sizes
    doubleHeight: ThermalPrinter.ESC + '!' + '\x10',
    doubleWidth: ThermalPrinter.ESC + '!' + '\x20',
    doubleSize: ThermalPrinter.ESC + '!' + '\x30',
    normalSize: ThermalPrinter.ESC + '!' + '\x00',
    smallFont: ThermalPrinter.ESC + '!' + '\x01',
    
    // Paper control
    cut: ThermalPrinter.GS + 'V' + '\x41' + '\x03',
    partialCut: ThermalPrinter.GS + 'V' + '\x41' + '\x01',
    feedAndCut: ThermalPrinter.GS + 'V' + '\x42' + '\x03',
    
    // Line feeds
    lineFeed: ThermalPrinter.LF,
    carriageReturn: ThermalPrinter.CR,
    formFeed: '\x0C',
    
    // Drawer control (cash drawer)
    openDrawer: ThermalPrinter.ESC + 'p' + '\x00' + '\x19' + '\xFA',
  };

  // Generate dash lines for different paper widths
  static getDashLine(paperSize: '58mm' | '80mm' | 'a4'): string {
    const widths = {
      '58mm': 32,
      '80mm': 48,
      'a4': 80
    };
    return '-'.repeat(widths[paperSize]);
  }

  // Format text to fit within specified width
  static formatLine(left: string, right: string, width: number): string {
    const maxLeftWidth = width - right.length - 1;
    const truncatedLeft = left.length > maxLeftWidth ? left.substring(0, maxLeftWidth) : left;
    const spaces = ' '.repeat(Math.max(1, width - truncatedLeft.length - right.length));
    return truncatedLeft + spaces + right;
  }

  // Check if Web Serial API is supported
  static isWebSerialSupported(): boolean {
    return 'serial' in navigator;
  }

  // Connect to thermal printer via Web Serial API
  static async connectToPrinter(): Promise<SerialPort> {
    if (!this.isWebSerialSupported()) {
      throw new Error('Web Serial API tidak didukung di browser ini. Gunakan Chrome atau Edge versi terbaru.');
    }

    try {
      // Request serial port from user
      const port = await (navigator as any).serial.requestPort({
        filters: [
          // Common thermal printer USB vendor IDs
          { usbVendorId: 0x04b8 }, // Epson
          { usbVendorId: 0x0519 }, // Star Micronics
          { usbVendorId: 0x154f }, // Wincor Nixdorf
          { usbVendorId: 0x0fe6 }, // ICS Advent
          { usbVendorId: 0x1fc9 }, // NXP Semiconductors
        ]
      });

      // Open the port with standard thermal printer settings
      await port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });
http://localhost:8080/dashboard/#
      return port;
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        throw new Error('Tidak ada printer yang dipilih. Pastikan printer thermal terhubung via USB.');
      } else if (error.name === 'InvalidStateError') {
        throw new Error('Printer sedang digunakan oleh aplikasi lain. Tutup aplikasi lain yang menggunakan printer.');
      } else if (error.name === 'NetworkError') {
        throw new Error('Gagal terhubung ke printer. Periksa koneksi USB dan coba lagi.');
      } else {
        throw new Error(`Gagal terhubung ke printer: ${error.message}`);
      }
    }
  }

  // Send data to printer
  static async sendToPrinter(port: SerialPort, data: string): Promise<void> {
    try {
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(data);
      
      const writer = port.writable.getWriter();
      await writer.write(uint8Array);
      writer.releaseLock();
      
      // Wait a bit for the printer to process
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      throw new Error(`Gagal mengirim data ke printer: ${error.message}`);
    }
  }

  // Close printer connection
  static async closePrinter(port: SerialPort): Promise<void> {
    try {
      await port.close();
    } catch (error: any) {
      console.warn('Warning closing printer:', error.message);
    }
  }

  // Print test page
  static generateTestPage(paperSize: '58mm' | '80mm' | 'a4' = '58mm'): string {
    const width = paperSize === '58mm' ? 32 : paperSize === '80mm' ? 48 : 80;
    const dashLine = this.getDashLine(paperSize);
    
    let receipt = '';
    
    // Initialize
    receipt += this.commands.init;
    
    // Header
    receipt += this.commands.centerAlign;
    receipt += this.commands.bold;
    receipt += 'TEST PRINTER' + this.commands.lineFeed;
    receipt += this.commands.boldOff;
    receipt += this.commands.normalSize;
    receipt += `Paper: ${paperSize.toUpperCase()}` + this.commands.lineFeed;
    receipt += `Width: ${width} chars` + this.commands.lineFeed;
    receipt += dashLine + this.commands.lineFeed;
    
    // Test different fonts
    receipt += this.commands.leftAlign;
    receipt += 'Normal Font Test' + this.commands.lineFeed;
    receipt += this.commands.bold;
    receipt += 'Bold Font Test' + this.commands.lineFeed;
    receipt += this.commands.boldOff;
    receipt += this.commands.smallFont;
    receipt += 'Small Font Test' + this.commands.lineFeed;
    receipt += this.commands.normalSize;
    receipt += this.commands.doubleHeight;
    receipt += 'Double Height' + this.commands.lineFeed;
    receipt += this.commands.normalSize;
    
    receipt += dashLine + this.commands.lineFeed;
    
    // Test alignment
    receipt += this.commands.leftAlign;
    receipt += 'Left Aligned Text' + this.commands.lineFeed;
    receipt += this.commands.centerAlign;
    receipt += 'Center Aligned Text' + this.commands.lineFeed;
    receipt += this.commands.rightAlign;
    receipt += 'Right Aligned Text' + this.commands.lineFeed;
    
    receipt += this.commands.leftAlign;
    receipt += dashLine + this.commands.lineFeed;
    
    // Test line formatting
    receipt += this.formatLine('Item 1', '10,000', width) + this.commands.lineFeed;
    receipt += this.formatLine('Very Long Item Name', '25,000', width) + this.commands.lineFeed;
    receipt += this.formatLine('Short', '5,000', width) + this.commands.lineFeed;
    
    receipt += dashLine + this.commands.lineFeed;
    receipt += this.commands.centerAlign;
    receipt += 'Test Completed' + this.commands.lineFeed;
    receipt += new Date().toLocaleString('id-ID') + this.commands.lineFeed;
    receipt += this.commands.lineFeed;
    receipt += this.commands.lineFeed;
    
    // Cut paper
    receipt += this.commands.cut;
    
    return receipt;
  }
}

// Type definitions for Web Serial API
declare global {
  interface Navigator {
    serial: {
      requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
      getPorts(): Promise<SerialPort[]>;
    };
  }
}

interface SerialPortRequestOptions {
  filters?: SerialPortFilter[];
}

interface SerialPortFilter {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPort {
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream;
  writable: WritableStream;
  getInfo(): SerialPortInfo;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  bufferSize?: number;
  flowControl?: 'none' | 'hardware';
}

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}
