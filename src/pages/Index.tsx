import { useState, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { StockSummary } from "@/components/StockSummary";
import heroImage from "@/assets/warehouse-hero.jpg";

// Sample data untuk demonstrasi
const sampleProducts = [
  {
    id: "PRD001",
    name: "Laptop Dell XPS 13",
    category: "elektronik",
    currentStock: 25,
    minStock: 5,
    location: "Gudang A-1",
    lastUpdated: "2024-01-15 14:30"
  },
  {
    id: "PRD002", 
    name: "Mouse Wireless Logitech",
    category: "elektronik",
    currentStock: 3,
    minStock: 10,
    location: "Gudang A-2",
    lastUpdated: "2024-01-15 10:15"
  },
  {
    id: "PRD003",
    name: "Kopi Arabica Premium",
    category: "makanan",
    currentStock: 0,
    minStock: 20,
    location: "Gudang B-1",
    lastUpdated: "2024-01-14 16:45"
  },
  {
    id: "PRD004",
    name: "Kemeja Formal Putih",
    category: "pakaian",
    currentStock: 45,
    minStock: 15,
    location: "Gudang C-1",
    lastUpdated: "2024-01-15 09:20"
  },
  {
    id: "PRD005",
    name: "Pulpen Pilot Hitam",
    category: "alat-tulis",
    currentStock: 8,
    minStock: 50,
    location: "Gudang D-1",
    lastUpdated: "2024-01-15 13:10"
  },
  {
    id: "PRD006",
    name: "Meja Kantor Kayu",
    category: "furniture",
    currentStock: 12,
    minStock: 3,
    location: "Gudang E-1",
    lastUpdated: "2024-01-15 11:30"
  }
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredProducts = useMemo(() => {
    return sampleProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      let matchesStatus = true;
      if (selectedStatus !== "all") {
        const stockStatus = product.currentStock === 0 ? "out" : 
                          product.currentStock <= product.minStock ? "low" : "available";
        matchesStatus = stockStatus === selectedStatus;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const stockSummary = useMemo(() => {
    const total = sampleProducts.length;
    const available = sampleProducts.filter(p => p.currentStock > p.minStock).length;
    const lowStock = sampleProducts.filter(p => p.currentStock > 0 && p.currentStock <= p.minStock).length;
    const outOfStock = sampleProducts.filter(p => p.currentStock === 0).length;

    return { total, available, lowStock, outOfStock };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary/90 to-accent/90 overflow-hidden">
        <img 
          src={heroImage} 
          alt="Modern warehouse interior" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sistem Cek Stok Barang
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Pantau dan kelola inventori dengan mudah dan efisien
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stock Summary */}
        <StockSummary 
          totalProducts={stockSummary.total}
          availableProducts={stockSummary.available}
          lowStockProducts={stockSummary.lowStock}
          outOfStockProducts={stockSummary.outOfStock}
        />

        {/* Search and Filters */}
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* Products Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">
              Daftar Produk ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Tidak ada produk yang sesuai dengan pencarian Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
