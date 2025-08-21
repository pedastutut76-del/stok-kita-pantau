import { useState } from "react";
import { Product } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductSelectorProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductSelector = ({ products, onAddToCart }: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const hasStock = product.currentStock > 0;

    return matchesSearch && matchesCategory && hasStock;
  });

  const categories = ["all", ...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pilih Produk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk atau scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === "all" ? "Semua" : category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-medium transition-all duration-300 bg-gradient-card border-0">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                  </div>
                  <Badge variant="outline" className="text-xs ml-2">
                    {product.category}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(product.price)}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span>Stok: {product.currentStock}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => onAddToCart(product, 1)}
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah ke Keranjang
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Tidak ada produk yang tersedia</p>
        </div>
      )}
    </div>
  );
};