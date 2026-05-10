// Google Apps Script for Stok Kita Pantau - POS System
// Migrated from Supabase to Google Sheets

// Global variables
const SPREADSHEET_ID = "1XGk4LFII4trgcwFPtosefiqSvQk_Ju5u0Au9gzwotow";
const SHEET_NAMES = {
  PRODUCTS: "Products",
  TRANSACTIONS: "Transactions", 
  USER_PROFILES: "UserProfiles",
  USERS: "Users"
};

// Initialize spreadsheet and sheets
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Create sheets if they don't exist
  Object.values(SHEET_NAMES).forEach(sheetName => {
    if (!ss.getSheetByName(sheetName)) {
      ss.insertSheet(sheetName);
    }
  });
  
  // Setup headers for each sheet
  setupProductsSheet();
  setupTransactionsSheet();
  setupUserProfilesSheet();
  setupUsersSheet();
}

function setupProductsSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  
  const headers = [
    "id",
    "name", 
    "category",
    "price",
    "purchase_price",
    "current_stock",
    "min_stock",
    "location",
    "barcode",
    "user_id",
    "created_at",
    "updated_at"
  ];
  
  sheet.getRange("A1:L1").setValues([headers]).setFontWeight("bold");
  sheet.autoResizeColumn(1, 12);
  sheet.setFrozenRows(1);
}

function setupTransactionsSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  
  const headers = [
    "id",
    "receipt_number",
    "items",
    "total",
    "tax", 
    "grand_total",
    "payment_method",
    "cash_received",
    "change",
    "cashier_name",
    "user_id",
    "created_at"
  ];
  
  sheet.getRange("A1:L1").setValues([headers]).setFontWeight("bold");
  sheet.autoResizeColumn(1, 12);
  sheet.setFrozenRows(1);
}

function setupUserProfilesSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USER_PROFILES);
  
  const headers = [
    "id",
    "user_id",
    "full_name",
    "email",
    "phone",
    "store_name",
    "business_name", 
    "business_type",
    "address",
    "city",
    "province",
    "postal_code",
    "country",
    "tax_number",
    "business_license",
    "description",
    "currency",
    "timezone",
    "language",
    "created_at",
    "updated_at"
  ];
  
  sheet.getRange("A1:U1").setValues([headers]).setFontWeight("bold");
  sheet.autoResizeColumn(1, 21);
  sheet.setFrozenRows(1);
}

function setupUsersSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  
  const headers = [
    "id",
    "email",
    "full_name",
    "phone",
    "created_at",
    "updated_at"
  ];
  
  sheet.getRange("A1:F1").setValues([headers]).setFontWeight("bold");
  sheet.autoResizeColumn(1, 6);
  sheet.setFrozenRows(1);
}

// PRODUCTS CRUD OPERATIONS
function getProducts(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  
  // Skip header row and filter by user_id
  const products = data.slice(1).filter(row => row[9] === userId);
  
  return products.map(row => ({
    id: row[0],
    name: row[1],
    category: row[2], 
    price: row[3],
    purchase_price: row[4],
    current_stock: row[5],
    min_stock: row[6],
    location: row[7],
    barcode: row[8],
    user_id: row[9],
    created_at: row[10],
    updated_at: row[11]
  }));
}

function createProduct(product) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  
  const newProduct = [
    Utilities.getUuid(), // Generate unique ID
    product.name,
    product.category,
    product.price,
    product.purchase_price || 0,
    product.current_stock || 0,
    product.min_stock || 5,
    product.location || "",
    product.barcode || "",
    product.user_id,
    new Date().toISOString(),
    new Date().toISOString()
  ];
  
  sheet.appendRow(newProduct);
  return newProduct[0]; // Return ID
}

function updateProduct(productId, updates) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      // Update fields
      if (updates.name) data[i][1] = updates.name;
      if (updates.category) data[i][2] = updates.category;
      if (updates.price !== undefined) data[i][3] = updates.price;
      if (updates.purchase_price !== undefined) data[i][4] = updates.purchase_price;
      if (updates.current_stock !== undefined) data[i][5] = updates.current_stock;
      if (updates.min_stock !== undefined) data[i][6] = updates.min_stock;
      if (updates.location !== undefined) data[i][7] = updates.location;
      if (updates.barcode !== undefined) data[i][8] = updates.barcode;
      data[i][11] = new Date().toISOString(); // updated_at
      
      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
      return true;
    }
  }
  return false;
}

function deleteProduct(productId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// TRANSACTIONS CRUD OPERATIONS
function getTransactions(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  const data = sheet.getDataRange().getValues();
  
  const transactions = data.slice(1).filter(row => row[10] === userId);
  
  return transactions.map(row => ({
    id: row[0],
    receipt_number: row[1],
    items: JSON.parse(row[2] || "[]"),
    total: row[3],
    tax: row[4],
    grand_total: row[5],
    payment_method: row[6],
    cash_received: row[7],
    change: row[8],
    cashier_name: row[9],
    user_id: row[10],
    created_at: row[11]
  }));
}

function createTransaction(transaction) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSACTIONS);
  
  const newTransaction = [
    Utilities.getUuid(),
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
    new Date().toISOString()
  ];
  
  sheet.appendRow(newTransaction);
  return newTransaction[0];
}

// USER PROFILES CRUD OPERATIONS
function getUserProfile(userId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USER_PROFILES);
  const data = sheet.getDataRange().getValues();
  
  const userProfile = data.slice(1).find(row => row[1] === userId);
  
  if (!userProfile) return null;
  
  return {
    id: userProfile[0],
    user_id: userProfile[1],
    full_name: userProfile[2],
    email: userProfile[3],
    phone: userProfile[4],
    store_name: userProfile[5],
    business_name: userProfile[6],
    business_type: userProfile[7],
    address: userProfile[8],
    city: userProfile[9],
    province: userProfile[10],
    postal_code: userProfile[11],
    country: userProfile[12],
    tax_number: userProfile[13],
    business_license: userProfile[14],
    description: userProfile[15],
    currency: userProfile[16],
    timezone: userProfile[17],
    language: userProfile[18],
    created_at: userProfile[19],
    updated_at: userProfile[20]
  };
}

function createUserProfile(profile) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USER_PROFILES);
  
  const newProfile = [
    Utilities.getUuid(),
    profile.user_id,
    profile.full_name || "",
    profile.email || "",
    profile.phone || "",
    profile.store_name || "",
    profile.business_name || "",
    profile.business_type || "retail",
    profile.address || "",
    profile.city || "",
    profile.province || "",
    profile.postal_code || "",
    profile.country || "Indonesia",
    profile.tax_number || "",
    profile.business_license || "",
    profile.description || "",
    profile.currency || "IDR",
    profile.timezone || "Asia/Jakarta",
    profile.language || "id",
    new Date().toISOString(),
    new Date().toISOString()
  ];
  
  sheet.appendRow(newProfile);
  return newProfile[0];
}

function updateUserProfile(userId, updates) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USER_PROFILES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      // Update fields
      if (updates.full_name) data[i][2] = updates.full_name;
      if (updates.email) data[i][3] = updates.email;
      if (updates.phone) data[i][4] = updates.phone;
      if (updates.store_name) data[i][5] = updates.store_name;
      if (updates.business_name) data[i][6] = updates.business_name;
      if (updates.business_type) data[i][7] = updates.business_type;
      if (updates.address) data[i][8] = updates.address;
      if (updates.city) data[i][9] = updates.city;
      if (updates.province) data[i][10] = updates.province;
      if (updates.postal_code) data[i][11] = updates.postal_code;
      if (updates.country) data[i][12] = updates.country;
      if (updates.tax_number) data[i][13] = updates.tax_number;
      if (updates.business_license) data[i][14] = updates.business_license;
      if (updates.description) data[i][15] = updates.description;
      if (updates.currency) data[i][16] = updates.currency;
      if (updates.timezone) data[i][17] = updates.timezone;
      if (updates.language) data[i][18] = updates.language;
      data[i][20] = new Date().toISOString(); // updated_at
      
      sheet.getRange(i + 1, 1, 1, data[i].length).setValues([data[i]]);
      return true;
    }
  }
  return false;
}

// AUTH USERS OPERATIONS
function createUser(user) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  
  const newUser = [
    Utilities.getUuid(),
    user.email,
    user.full_name || "",
    user.phone || "",
    new Date().toISOString(),
    new Date().toISOString()
  ];
  
  sheet.appendRow(newUser);
  
  // Create user profile automatically
  createUserProfile({
    user_id: newUser[0],
    full_name: user.full_name,
    email: user.email,
    store_name: "Toko " + (user.full_name || user.email.split("@")[0])
  });
  
  return newUser[0];
}

function getUserByEmail(email) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  
  const user = data.slice(1).find(row => row[1] === email);
  
  if (!user) return null;
  
  return {
    id: user[0],
    email: user[1],
    full_name: user[2],
    phone: user[3],
    created_at: user[4],
    updated_at: user[5]
  };
}

// UTILITY FUNCTIONS
function generateReceiptNumber() {
  const date = new Date();
  const dateStr = date.getFullYear().toString() + 
                  (date.getMonth() + 1).toString().padStart(2, '0') + 
                  date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return "INV-" + dateStr + "-" + random;
}

function getLowStockProducts(userId) {
  const products = getProducts(userId);
  return products.filter(product => product.current_stock <= product.min_stock);
}

function getSalesReport(userId, startDate, endDate) {
  const transactions = getTransactions(userId);
  const filtered = transactions.filter(t => {
    const date = new Date(t.created_at);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });
  
  return {
    totalTransactions: filtered.length,
    totalRevenue: filtered.reduce((sum, t) => sum + t.grand_total, 0),
    transactions: filtered
  };
}

// WEB APP API ENDPOINTS
function doGet(e) {
  const action = e.parameter.action;
  const userId = e.parameter.userId;
  
  try {
    let result;
    
    switch(action) {
      case "getProducts":
        result = getProducts(userId);
        break;
      case "getTransactions":
        result = getTransactions(userId);
        break;
      case "getUserProfile":
        result = getUserProfile(userId);
        break;
      case "getLowStockProducts":
        result = getLowStockProducts(userId);
        break;
      case "getSalesReport":
        result = getSalesReport(userId, e.parameter.startDate, e.parameter.endDate);
        break;
      default:
        result = {error: "Invalid action"};
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const action = e.parameter.action;
  const userId = e.parameter.userId;
  const data = JSON.parse(e.postData.contents);
  
  try {
    let result;
    
    switch(action) {
      case "createProduct":
        result = {id: createProduct({...data, user_id: userId})};
        break;
      case "updateProduct":
        result = {success: updateProduct(data.id, data)};
        break;
      case "deleteProduct":
        result = {success: deleteProduct(data.id)};
        break;
      case "createTransaction":
        result = {id: createTransaction({...data, user_id: userId})};
        break;
      case "createUserProfile":
        result = {id: createUserProfile({...data, user_id: userId})};
        break;
      case "updateUserProfile":
        result = {success: updateUserProfile(userId, data)};
        break;
      case "createUser":
        result = {id: createUser(data)};
        break;
      default:
        result = {error: "Invalid action"};
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
