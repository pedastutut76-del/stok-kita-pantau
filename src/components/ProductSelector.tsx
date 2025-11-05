import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { formatCurrency } from "@/lib/utils";

interface ProductSelectorProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductSelector = ({ products, onAddToCart }: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase();
    const stockAvailable = product.current_stock > 0;
    return matchesSearch && matchesCategory && stockAvailable;
  });

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilih Produk</CardTitle>
        <CardDescription>Pilih produk untuk ditambahkan ke keranjang</CardDescription>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md w-full md:w-56"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Semua Kategori" : cat}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada produk yang tersedia
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="relative">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm">{product.name}</h3>
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">Stok: {product.current_stock}</p>
                    </div>
                    
                    <Button
                      onClick={() => onAddToCart(product, 1)}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};