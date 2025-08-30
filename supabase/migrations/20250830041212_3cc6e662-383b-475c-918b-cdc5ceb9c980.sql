-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  location TEXT,
  barcode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  tax INTEGER NOT NULL,
  grand_total INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  cash_received INTEGER,
  change INTEGER,
  cashier_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a POS system)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Products can be updated by everyone" 
ON public.products 
FOR UPDATE 
USING (true);

CREATE POLICY "Products can be inserted by everyone" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Transactions are viewable by everyone" 
ON public.transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Transactions can be inserted by everyone" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, category, price, current_stock, min_stock, location, barcode) VALUES
('Indomie Goreng', 'Makanan', 3500, 50, 10, 'Rak A1', '1234567890123'),
('Aqua 600ml', 'Minuman', 2500, 30, 15, 'Rak B1', '2234567890124'),
('Teh Botol Sosro', 'Minuman', 4000, 25, 10, 'Rak B2', '3234567890125'),
('Roti Tawar Sari', 'Makanan', 8500, 15, 5, 'Rak A2', '4234567890126'),
('Sabun Lifebuoy', 'Kebersihan', 5500, 20, 8, 'Rak C1', '5234567890127');