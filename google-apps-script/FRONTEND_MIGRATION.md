# Frontend Migration Guide: Supabase to Google Sheets

This guide helps you update your frontend code to use Google Sheets API instead of Supabase.

## Step 1: Update Environment Variables

Add these variables to your `.env` file:

```env
# Set to true to use Google Sheets instead of Supabase
VITE_USE_GOOGLE_SHEETS=true

# Your Google Apps Script Web App URL
VITE_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec

# Keep Supabase variables as backup
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Update Google Sheets API Configuration

Edit `src/lib/google-sheets-api.ts`:

```typescript
const WEB_APP_URL = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL || "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
```

## Step 3: Replace Supabase Imports

Find all files that import from Supabase and replace them:

### Before:
```typescript
import { supabase } from '@/lib/supabase';
```

### After:
```typescript
import { database } from '@/lib/database';
```

## Step 4: Update API Calls

### Authentication

#### Before:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

#### After:
```typescript
const { user, error } = await database.signIn(email, password);
```

### Products

#### Before:
```typescript
// Get products
const { data, error } = await supabase
  .from('products')
  .select('*');

// Create product
const { data, error } = await supabase
  .from('products')
  .insert([product]);

// Update product
const { data, error } = await supabase
  .from('products')
  .update(updates)
  .eq('id', id);

// Delete product
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', id);
```

#### After:
```typescript
// Get products
const data = await database.getProducts();

// Create product
const { data, error } = await database.createProduct(product);

// Update product
const { data, error } = await database.updateProduct(id, updates);

// Delete product
const { error } = await database.deleteProduct(id);
```

### Transactions

#### Before:
```typescript
// Get transactions
const { data, error } = await supabase
  .from('transactions')
  .select('*');

// Create transaction
const { data, error } = await supabase
  .from('transactions')
  .insert([transaction]);
```

#### After:
```typescript
// Get transactions
const data = await database.getTransactions();

// Create transaction
const { data, error } = await database.createTransaction(transaction);
```

### User Profile

#### Before:
```typescript
// Get user profile
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .single();

// Update user profile
const { data, error } = await supabase
  .from('user_profiles')
  .update(updates)
  .eq('user_id', userId);
```

#### After:
```typescript
// Get user profile
const { data, error } = await database.getUserProfile();

// Update user profile
const { data, error } = await database.updateUserProfile(updates);
```

## Step 5: Update Specific Components

### Auth Component

Update your authentication component to handle the new API:

```typescript
// src/components/auth.tsx
import { database } from '@/lib/database';

export function AuthComponent() {
  const handleSignIn = async (email: string, password: string) => {
    const { user, error } = await database.signIn(email, password);
    
    if (error) {
      console.error('Sign in error:', error);
      // Handle error
    } else {
      console.log('Signed in:', user);
      // Handle success
    }
  };

  const handleSignOut = async () => {
    const { error } = await database.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  // Rest of component
}
```

### Products Component

```typescript
// src/components/products.tsx
import { database } from '@/lib/database';

export function ProductsComponent() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await database.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleCreateProduct = async (productData) => {
    const { data, error } = await database.createProduct(productData);
    if (error) {
      console.error('Error creating product:', error);
    } else {
      await loadProducts(); // Refresh list
    }
  };

  // Rest of component
}
```

## Step 6: Update Real-time Features

Google Sheets doesn't support real-time subscriptions like Supabase. You'll need to implement polling or manual refresh:

### Before (Supabase Real-time):
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('products')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' },
      () => loadProducts()
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### After (Polling):
```typescript
useEffect(() => {
  loadProducts();
  
  const interval = setInterval(loadProducts, 30000); // Refresh every 30 seconds
  
  return () => clearInterval(interval);
}, []);
```

## Step 7: Test the Migration

1. **Set environment variable**: `VITE_USE_GOOGLE_SHEETS=true`
2. **Update Google Sheets URL** in `google-sheets-api.ts`
3. **Test authentication**
4. **Test CRUD operations**
5. **Test all features**

## Step 8: Optional - Switch Back to Supabase

If you need to switch back to Supabase:

1. Set `VITE_USE_GOOGLE_SHEETS=false`
2. No code changes needed - the abstraction layer handles it

## Common Issues and Solutions

### Issue: CORS Errors
**Solution**: Make sure your Google Apps Script web app is deployed with "Anyone" access or configure proper CORS in Apps Script.

### Issue: Authentication Not Working
**Solution**: The current implementation uses a simplified authentication. For production, consider:
- Using Google OAuth
- Implementing JWT tokens
- Using Firebase Authentication

### Issue: Performance Issues
**Solution**: 
- Implement caching
- Reduce API calls
- Use batch operations where possible

### Issue: Data Type Mismatches
**Solution**: Ensure Google Sheets data types match your frontend expectations. Apps Script handles most conversions automatically.

## Files to Update

1. `.env` - Add new environment variables
2. `src/lib/google-sheets-api.ts` - Update web app URL
3. All components using Supabase - Replace imports and API calls
4. Any custom hooks using Supabase - Update to use new database service

## Testing Checklist

- [ ] User authentication works
- [ ] Products CRUD operations work
- [ ] Transactions CRUD operations work
- [ ] User profile operations work
- [ ] Reports and analytics work
- [ ] Error handling works properly
- [ ] Loading states work correctly
- [ ] Data validation works

## Benefits of This Approach

1. **Easy Switching**: Can toggle between Supabase and Google Sheets
2. **Same Interface**: No need to change component logic
3. **Gradual Migration**: Can migrate feature by feature
4. **Fallback Option**: Can switch back if issues arise
