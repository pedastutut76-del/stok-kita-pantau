#!/usr/bin/env node

// Setup Script for Google Sheets Migration
// This script helps you set up the migration

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Stok Kita Pantau - Google Sheets Migration Setup\n');

async function setup() {
  try {
    // Get required information
    const spreadsheetId = await question('📊 Enter your Google Spreadsheet ID: ');
    const webAppUrl = await question('🔗 Enter your Google Apps Script Web App URL: ');
    const supabaseUrl = await question('🗄️ Enter your Supabase URL (for data migration): ');
    const supabaseKey = await question('🔑 Enter your Supabase Anon Key: ');

    console.log('\n⚙️ Setting up configuration...');

    // Update Google Apps Script
    await updateAppsScript(spreadsheetId);
    
    // Update frontend configuration
    await updateFrontendConfig(webAppUrl, supabaseUrl, supabaseKey);
    
    // Update migration script
    await updateMigrationScript(supabaseUrl, supabaseKey, spreadsheetId);

    console.log('\n✅ Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Open your Google Sheet');
    console.log('2. Go to Extensions > Apps Script');
    console.log('3. Run the initializeSpreadsheet function');
    console.log('4. Deploy the web app (if not already done)');
    console.log('5. Run: npm run migrate (to migrate existing data)');
    console.log('6. Set VITE_USE_GOOGLE_SHEETS=true in your .env file');
    console.log('7. Start your frontend application');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function updateAppsScript(spreadsheetId) {
  const codePath = path.join(__dirname, 'Code.gs');
  let code = fs.readFileSync(codePath, 'utf8');
  
  code = code.replace('YOUR_SPREADSHEET_ID_HERE', spreadsheetId);
  
  fs.writeFileSync(codePath, code);
  console.log('✅ Updated Google Apps Script with Spreadsheet ID');
}

async function updateFrontendConfig(webAppUrl, supabaseUrl, supabaseKey) {
  const apiPath = path.join(__dirname, '../src/lib/google-sheets-api.ts');
  let apiCode = fs.readFileSync(apiPath, 'utf8');
  
  apiCode = apiCode.replace('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL', webAppUrl);
  
  fs.writeFileSync(apiPath, apiCode);
  
  // Update .env file
  const envPath = path.join(__dirname, '../.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Add or update Google Sheets variables
  const lines = envContent.split('\n');
  const newLines = [];
  let hasGoogleSheets = false;
  
  for (const line of lines) {
    if (line.startsWith('VITE_USE_GOOGLE_SHEETS=')) {
      newLines.push('VITE_USE_GOOGLE_SHEETS=false');
      hasGoogleSheets = true;
    } else if (line.startsWith('VITE_GOOGLE_SHEETS_WEB_APP_URL=')) {
      newLines.push(`VITE_GOOGLE_SHEETS_WEB_APP_URL=${webAppUrl}`);
    } else if (line.startsWith('VITE_SUPABASE_URL=')) {
      newLines.push(`VITE_SUPABASE_URL=${supabaseUrl}`);
    } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      newLines.push(`VITE_SUPABASE_ANON_KEY=${supabaseKey}`);
    } else {
      newLines.push(line);
    }
  }
  
  if (!hasGoogleSheets) {
    newLines.push('VITE_USE_GOOGLE_SHEETS=false');
    newLines.push(`VITE_GOOGLE_SHEETS_WEB_APP_URL=${webAppUrl}`);
  }
  
  fs.writeFileSync(envPath, newLines.join('\n'));
  console.log('✅ Updated frontend configuration');
}

async function updateMigrationScript(supabaseUrl, supabaseKey, spreadsheetId) {
  const migrationPath = path.join(__dirname, 'migrate-from-supabase.js');
  let migrationCode = fs.readFileSync(migrationPath, 'utf8');
  
  migrationCode = migrationCode.replace('YOUR_SUPABASE_URL', supabaseUrl);
  migrationCode = migrationCode.replace('YOUR_SUPABASE_ANON_KEY', supabaseKey);
  migrationCode = migrationCode.replace('YOUR_GOOGLE_SPREADSHEET_ID', spreadsheetId);
  
  fs.writeFileSync(migrationPath, migrationCode);
  console.log('✅ Updated migration script');
}

// Run setup
if (require.main === module) {
  setup();
}

module.exports = { setup };
