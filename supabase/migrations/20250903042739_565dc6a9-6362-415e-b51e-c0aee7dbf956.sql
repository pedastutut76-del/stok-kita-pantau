-- Add purchase_price column to products table
ALTER TABLE public.products 
ADD COLUMN purchase_price INTEGER NOT NULL DEFAULT 0;