-- Fix unique constraint violation in receipt_settings table
-- Run this in Supabase SQL Editor

-- First, delete any duplicate or problematic records
DELETE FROM public.receipt_settings 
WHERE user_id IN (
  SELECT user_id 
  FROM public.receipt_settings 
  GROUP BY user_id 
  HAVING COUNT(*) > 1
);

-- Drop and recreate the table to ensure clean state
DROP TABLE IF EXISTS public.receipt_settings CASCADE;

-- Recreate the receipt_settings table with proper constraints
CREATE TABLE public.receipt_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  show_logo BOOLEAN DEFAULT false,
  logo_url TEXT,
  header_text TEXT DEFAULT '',
  footer_text TEXT DEFAULT 'Terima kasih atas kunjungan Anda!',
  show_address BOOLEAN DEFAULT true,
  show_phone BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT false,
  show_tax_number BOOLEAN DEFAULT false,
  paper_size TEXT DEFAULT 'thermal_80' CHECK (paper_size IN ('thermal_58', 'thermal_80', 'a4')),
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  show_qr_code BOOLEAN DEFAULT false,
  currency_symbol TEXT DEFAULT 'Rp',
  show_tax BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5,2) DEFAULT 11.0,
  tax_type TEXT DEFAULT 'percentage' CHECK (tax_type IN ('percentage', 'fixed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.receipt_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own receipt settings" 
ON public.receipt_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipt settings" 
ON public.receipt_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipt settings" 
ON public.receipt_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipt settings" 
ON public.receipt_settings FOR DELETE 
USING (auth.uid() = user_id);

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_receipt_settings_updated_at
BEFORE UPDATE ON public.receipt_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.receipt_settings TO authenticated;

-- Insert default settings for current authenticated users using UPSERT
INSERT INTO public.receipt_settings (
  user_id, 
  header_text, 
  footer_text, 
  show_tax, 
  tax_rate, 
  tax_type,
  show_address,
  show_phone
)
SELECT 
  id,
  'TOKO SAYA',
  'Terima kasih atas kunjungan Anda!',
  true,
  11.0,
  'percentage',
  true,
  true
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET
  show_tax = EXCLUDED.show_tax,
  tax_rate = EXCLUDED.tax_rate,
  tax_type = EXCLUDED.tax_type,
  updated_at = now();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
