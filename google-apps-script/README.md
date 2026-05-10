# Google Apps Script Migration for Stok Kita Pantau

This guide helps you migrate from Supabase to Google Sheets with Google Apps Script.

## Setup Instructions

### 1. Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Stok Kita Pantau Database"
3. Copy the spreadsheet ID from the URL (e.g., `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`)
4. Replace `YOUR_SPREADSHEET_ID_HERE` in `Code.gs` with your actual spreadsheet ID

### 2. Setup Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Copy and paste the entire contents of `Code.gs`
4. Save the project (Ctrl+S or Cmd+S)

### 3. Deploy as Web App

1. In Apps Script editor, click **Deploy > New deployment**
2. Select type: **Web app**
3. Configuration:
   - Description: "Stok Kita Pantau API"
   - Execute as: "Me" (your Google account)
   - Who has access: "Anyone" or "Anyone with Google account"
4. Click **Deploy**
5. Authorize the permissions when prompted
6. Copy the Web app URL (you'll need this for the frontend)

### 4. Initialize Database Structure

1. In Apps Script editor, select the `initializeSpreadsheet` function
2. Click **Run**
3. This will create all the necessary sheets with proper headers

### 5. Test the API

Test your web app by visiting the URL with parameters:
```
https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec?action=getProducts&userId=test
```

## API Endpoints

### GET Requests (Read Operations)

- `getProducts` - Get all products for a user
- `getTransactions` - Get all transactions for a user  
- `getUserProfile` - Get user profile
- `getLowStockProducts` - Get products with low stock
- `getSalesReport` - Get sales report for date range

Example:
```
GET https://script.google.com/macros/s/ID/exec?action=getProducts&userId=USER_ID
```

### POST Requests (Write Operations)

- `createProduct` - Create new product
- `updateProduct` - Update existing product
- `deleteProduct` - Delete product
- `createTransaction` - Create new transaction
- `createUserProfile` - Create user profile
- `updateUserProfile` - Update user profile
- `createUser` - Create new user

Example:
```
POST https://script.google.com/macros/s/ID/exec?action=createProduct&userId=USER_ID
Content-Type: application/json

{
  "name": "Indomie Goreng",
  "category": "Makanan",
  "price": 3500,
  "current_stock": 50,
  "min_stock": 10
}
```

## Data Migration

Use the provided migration script to export data from Supabase and import to Google Sheets.

## Security Notes

- The web app URL should be kept private
- Consider using "Anyone with Google account" for better security
- Regular backups of the Google Sheet are recommended
- Google Sheets has row limits (currently 10 million rows per spreadsheet)

## Limitations

- Google Apps Script has execution time limits (6 minutes for consumer accounts)
- Concurrent user limitations compared to Supabase
- No real-time subscriptions like Supabase
- Query capabilities are limited compared to SQL

## Benefits

- Free to use (within Google's limits)
- Easy to view and edit data manually
- No database hosting costs
- Simple backup and export options
