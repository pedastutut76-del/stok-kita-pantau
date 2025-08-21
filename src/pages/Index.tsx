import { useState, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { StockSummary } from "@/components/StockSummary";
import { Package } from "lucide-react";
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
    lastUpdated: "2024-01-15 14:30",
    price: 15000000,
    barcode: "1234567890123"
  },
  {
    id: "PRD002", 
    name: "Mouse Wireless Logitech",
    category: "elektronik",
    currentStock: 3,
    minStock: 10,
    location: "Gudang A-2",
    lastUpdated: "2024-01-15 10:15",
    price: 250000,
    barcode: "2234567890123"
  },
  {
    id: "PRD003",
    name: "Kopi Arabica Premium",
    category: "makanan",
    currentStock: 0,
    minStock: 20,
    location: "Gudang B-1",
    lastUpdated: "2024-01-14 16:45",
    price: 85000,
    barcode: "3234567890123"
  },
  {
    id: "PRD004",
    name: "Kemeja Formal Putih",
    category: "pakaian",
    currentStock: 45,
    minStock: 15,
    location: "Gudang C-1",
    lastUpdated: "2024-01-15 09:20",
    price: 150000,
    barcode: "4234567890123"
  },
  {
    id: "PRD005",
    name: "Pulpen Pilot Hitam",
    category: "alat-tulis",
    currentStock: 8,
    minStock: 50,
    location: "Gudang D-1",
    lastUpdated: "2024-01-15 13:10",
    price: 5000,
    barcode: "5234567890123"
  },
  {
    id: "PRD006",
    name: "Meja Kantor Kayu",
    category: "furniture",
    currentStock: 12,
    minStock: 3,
    location: "Gudang E-1",
    lastUpdated: "2024-01-15 11:30",
    price: 1200000,
    barcode: "6234567890123"
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
      <div className="relative h-80 bg-gradient-hero overflow-hidden">
        <img 
          src={heroImage} 
          alt="Modern warehouse interior" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        {/* Floating particles effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent animate-fade-in-up leading-tight">
              Sistem Cek Stok Barang
            </h1>
            <p className="text-xl md:text-2xl opacity-90 font-medium animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Pantau dan kelola inventori dengan mudah dan efisien
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button className="px-8 py-3 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-strong">
                Mulai Sekarang
              </button>
              <button className="px-8 py-3 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                Pelajari Lebih
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
              Daftar Produk ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-xl font-medium">
                Tidak ada produk yang sesuai dengan pencarian Anda.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
