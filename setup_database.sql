-- Setup Database for Multi-User System
-- Run this script in your Supabase SQL Editor

-- Enable RLS on existing tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Add user_id columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE public.products SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    ALTER TABLE public.products ALTER COLUMN user_id SET NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'transactions' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    UPDATE public.transactions SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
    ALTER TABLE public.transactions ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Products can be updated by everyone" ON public.products;
DROP POLICY IF EXISTS "Products can be inserted by everyone" ON public.products;
DROP POLICY IF EXISTS "Products can be deleted by everyone" ON public.products;
DROP POLICY IF EXISTS "Users can view their own products" ON public.products;
DROP POLICY IF EXISTS "Users can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete their own products" ON public.products;

DROP POLICY IF EXISTS "Transactions are viewable by everyone" ON public.transactions;
DROP POLICY IF EXISTS "Transactions can be inserted by everyone" ON public.transactions;
DROP POLICY IF EXISTS "Transactions can be updated by everyone" ON public.transactions;
DROP POLICY IF EXISTS "Transactions can be deleted by everyone" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

-- Create RLS policies for products
CREATE POLICY "Users can view their own products" 
ON public.products FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products" 
ON public.products FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions FOR DELETE 
USING (auth.uid() = user_id);

-- Create user_profiles table
DROP TABLE IF EXISTS public.user_profiles CASCADE;

CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  store_name TEXT,
  business_name TEXT,
  business_type TEXT DEFAULT 'retail',
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Indonesia',
  tax_number TEXT,
  business_license TEXT,
  description TEXT,
  currency TEXT DEFAULT 'IDR',
  timezone TEXT DEFAULT 'Asia/Jakarta',
  language TEXT DEFAULT 'id',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.user_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Create update function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    full_name, 
    email,
    store_name
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'store_name', 'Toko ' || split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Create users cache table for profile information
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Basic user information
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Profile cache from user_profiles
  store_name TEXT,
  business_name TEXT,
  business_type TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  
  -- User status and settings
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Subscription and plan info
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Usage statistics
  total_products INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  
  -- Preferences
  currency TEXT DEFAULT 'IDR',
  timezone TEXT DEFAULT 'Asia/Jakarta',
  language TEXT DEFAULT 'id',
  theme TEXT DEFAULT 'light',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for users cache table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users cache table
CREATE POLICY "Users can view their own cache record" 
ON public.users FOR SELECT 
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own cache record" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own cache record" 
ON public.users FOR UPDATE 
USING (auth.uid() = auth_user_id);

-- Create trigger for users cache table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to sync user profile cache
CREATE OR REPLACE FUNCTION public.sync_user_profile_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Update users cache table when user_profiles changes
  INSERT INTO public.users (
    auth_user_id,
    email,
    full_name,
    store_name,
    business_name,
    business_type,
    phone,
    address,
    city,
    province
  )
  VALUES (
    NEW.user_id,
    NEW.email,
    NEW.full_name,
    NEW.store_name,
    NEW.business_name,
    NEW.business_type,
    NEW.phone,
    NEW.address,
    NEW.city,
    NEW.province
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    store_name = EXCLUDED.store_name,
    business_name = EXCLUDED.business_name,
    business_type = EXCLUDED.business_type,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    province = EXCLUDED.province,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync profile cache
DROP TRIGGER IF EXISTS sync_user_profile_cache_trigger ON public.user_profiles;
CREATE TRIGGER sync_user_profile_cache_trigger
  AFTER INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_profile_cache();

-- Function to update user statistics
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
  product_count INTEGER;
  transaction_count INTEGER;
  total_rev DECIMAL(15,2);
BEGIN
  -- Get user_id from the affected row
  IF TG_TABLE_NAME = 'products' THEN
    user_uuid := COALESCE(NEW.user_id, OLD.user_id);
  ELSIF TG_TABLE_NAME = 'transactions' THEN
    user_uuid := COALESCE(NEW.user_id, OLD.user_id);
  END IF;
  
  -- Calculate statistics
  SELECT COUNT(*) INTO product_count 
  FROM public.products WHERE user_id = user_uuid;
  
  SELECT COUNT(*), COALESCE(SUM(grand_total), 0) 
  INTO transaction_count, total_rev
  FROM public.transactions WHERE user_id = user_uuid;
  
  -- Update users cache table
  UPDATE public.users 
  SET 
    total_products = product_count,
    total_transactions = transaction_count,
    total_revenue = total_rev,
    updated_at = now()
  WHERE auth_user_id = user_uuid;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for statistics updates
DROP TRIGGER IF EXISTS update_user_stats_products ON public.products;
CREATE TRIGGER update_user_stats_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

DROP TRIGGER IF EXISTS update_user_stats_transactions ON public.transactions;
CREATE TRIGGER update_user_stats_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- Enhanced function to create user cache on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_with_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (
    user_id, 
    full_name, 
    email,
    store_name
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'store_name', 'Toko ' || split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  
  -- Create user cache record
  INSERT INTO public.users (
    auth_user_id,
    email,
    full_name,
    store_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'store_name', 'Toko ' || split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    email = EXCLUDED.email,
    last_login_at = now(),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the user creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_cache();

-- Create indexes for users cache table
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_store_name ON public.users(store_name);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
