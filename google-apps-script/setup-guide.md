# Panduan Lengkap Menjalankan Project Google Sheets

## 🚯 Langkah 1: Dapatkan Spreadsheet ID yang BENAR

1. Buka Google Spreadsheet Anda: https://sheets.google.com
2. Buat spreadsheet baru dengan nama "Stok Kita Pantau Database"
3. Copy ID dari URL (bagian yang ditandai):
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_DISINI/edit
   ```

## 📝 Langkah 2: Update Kode Apps Script

1. Di spreadsheet Anda, buka **Extensions > Apps Script**
2. Hapus semua kode yang ada
3. Copy semua kode dari file `Code.gs`
4. **PENTING**: Ganti `Stok kita pantau` dengan Spreadsheet ID yang benar

## 🔧 Langkah 3: Inisialisasi Database

1. Di Apps Script editor, pilih function `initializeSpreadsheet` dari dropdown
2. Klik tombol **Run**
3. Berikan izin saat diminta:
   - Pilih akun Google Anda
   - Klik "Advanced"
   - Klik "Go to (unsafe)"
   - Klik "Allow"

## 🌐 Langkah 4: Deploy Web App

1. Klik **Deploy > New deployment**
2. Pilih type: **Web app**
3. Configuration:
   - Description: "Stok Kita Pantau API"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Klik **Deploy**
5. Copy Web App URL yang diberikan

## 🧪 Langkah 5: Test API

1. Update Web App URL di file konfigurasi:
   - `src/lib/google-sheets-api.ts`
   - `.env`
   - `test-google-sheets.html`

2. Buka `test-google-sheets.html` di browser untuk testing

## 🔥 Langkah 6: Jalankan Frontend

1. Set di `.env`:
   ```
   VITE_USE_GOOGLE_SHEETS=true
   ```

2. Jalankan project:
   ```bash
   npm run dev
   ```

## ❓ Jika Masih Gagal

### Error "Spreadsheet ID tidak valid"
- Pastikan ID yang dimasukkan benar (huruf dan angka acak)
- Bukan nama spreadsheet

### Error "Permission denied"
- Pastikan spreadsheet sudah di-share ke publik
- Atau share ke email yang sama dengan Apps Script

### Error "Function not found"
- Pastikan semua kode sudah di-copy dengan benar
- Save project sebelum run

## 📞 Bantuan

Jika masih mengalami masalah:
1. Screenshot error yang muncul
2. Berikan Spreadsheet ID yang benar
3. Pastikan semua langkah diikuti dengan urutan yang benar
