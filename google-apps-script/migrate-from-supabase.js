// Migration Script: Export data from Supabase and import to Google Sheets
// Run this script to migrate existing data from Supabase to Google Sheets

// Install required packages:
// npm install @supabase/supabase-js googleapis

const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

// Configuration - UPDATE THESE VALUES
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const SPREADSHEET_ID = 'YOUR_GOOGLE_SPREADSHEET_ID';
const SERVICE_ACCOUNT_KEY = require('./service-account-key.json'); // Download from Google Cloud Console

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Sheet names
const SHEETS = {
  PRODUCTS: 'Products',
  TRANSACTIONS: 'Transactions',
  USER_PROFILES: 'UserProfiles',
  USERS: 'Users'
};

async function migrateAllData() {
  console.log('Starting migration from Supabase to Google Sheets...');
  
  try {
    // Clear existing data
    await clearAllSheets();
    
    // Migrate in order of dependencies
    await migrateUsers();
    await migrateUserProfiles();
    await migrateProducts();
    await migrateTransactions();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

async function clearAllSheets() {
  console.log('Clearing existing data...');
  
  for (const sheetName of Object.values(SHEETS)) {
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A2:Z` // Keep headers, clear data
      });
      console.log(`Cleared ${sheetName} sheet`);
    } catch (error) {
      console.log(`Sheet ${sheetName} might not exist or is already empty`);
    }
  }
}

async function migrateUsers() {
  console.log('Migrating users...');
  
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) throw error;
  
  const userData = users.users.map(user => [
    user.id,
    user.email,
    user.user_metadata?.full_name || '',
    user.phone || '',
    user.created_at,
    user.updated_at || user.created_at
  ]);
  
  if (userData.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.USERS}!A2:F`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: userData }
    });
    
    console.log(`Migrated ${userData.length} users`);
  }
}

async function migrateUserProfiles() {
  console.log('Migrating user profiles...');
  
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*');
  
  if (error) throw error;
  
  const profileData = profiles.map(profile => [
    profile.id,
    profile.user_id,
    profile.full_name || '',
    profile.email || '',
    profile.phone || '',
    profile.store_name || '',
    profile.business_name || '',
    profile.business_type || 'retail',
    profile.address || '',
    profile.city || '',
    profile.province || '',
    profile.postal_code || '',
    profile.country || 'Indonesia',
    profile.tax_number || '',
    profile.business_license || '',
    profile.description || '',
    profile.currency || 'IDR',
    profile.timezone || 'Asia/Jakarta',
    profile.language || 'id',
    profile.created_at,
    profile.updated_at
  ]);
  
  if (profileData.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.USER_PROFILES}!A2:U`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: profileData }
    });
    
    console.log(`Migrated ${profileData.length} user profiles`);
  }
}

async function migrateProducts() {
  console.log('Migrating products...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) throw error;
  
  const productData = products.map(product => [
    product.id,
    product.name,
    product.category,
    product.price,
    product.purchase_price || 0,
    product.current_stock,
    product.min_stock,
    product.location || '',
    product.barcode || '',
    product.user_id,
    product.created_at,
    product.updated_at
  ]);
  
  if (productData.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.PRODUCTS}!A2:L`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: productData }
    });
    
    console.log(`Migrated ${productData.length} products`);
  }
}

async function migrateTransactions() {
  console.log('Migrating transactions...');
  
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*');
  
  if (error) throw error;
  
  const transactionData = transactions.map(transaction => [
    transaction.id,
    transaction.receipt_number,
    JSON.stringify(transaction.items),
    transaction.total,
    transaction.tax,
    transaction.grand_total,
    transaction.payment_method,
    transaction.cash_received,
    transaction.change,
    transaction.cashier_name,
    transaction.user_id,
    transaction.created_at
  ]);
  
  if (transactionData.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEETS.TRANSACTIONS}!A2:L`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: transactionData }
    });
    
    console.log(`Migrated ${transactionData.length} transactions`);
  }
}

// Alternative: Export to CSV files for manual import
async function exportToCSV() {
  console.log('Exporting data to CSV files...');
  
  const fs = require('fs');
  
  // Export users
  const { data: users } = await supabase.auth.admin.listUsers();
  const usersCSV = convertToCSV(users.users.map(user => ({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
    phone: user.phone || '',
    created_at: user.created_at,
    updated_at: user.updated_at || user.created_at
  })));
  fs.writeFileSync('users.csv', usersCSV);
  
  // Export user profiles
  const { data: profiles } = await supabase.from('user_profiles').select('*');
  const profilesCSV = convertToCSV(profiles);
  fs.writeFileSync('user_profiles.csv', profilesCSV);
  
  // Export products
  const { data: products } = await supabase.from('products').select('*');
  const productsCSV = convertToCSV(products);
  fs.writeFileSync('products.csv', productsCSV);
  
  // Export transactions
  const { data: transactions } = await supabase.from('transactions').select('*');
  const transactionsCSV = convertToCSV(transactions.map(t => ({
    ...t,
    items: JSON.stringify(t.items)
  })));
  fs.writeFileSync('transactions.csv', transactionsCSV);
  
  console.log('CSV files exported successfully!');
}

function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Run migration
if (require.main === module) {
  migrateAllData().catch(console.error);
}

module.exports = {
  migrateAllData,
  exportToCSV,
  migrateUsers,
  migrateUserProfiles,
  migrateProducts,
  migrateTransactions
};
