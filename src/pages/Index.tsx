import { useState, useMemo } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { StockSummary } from "@/components/StockSummary";
import { Package, BarChart3, TrendingUp } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import heroImage from "@/assets/warehouse-hero.jpg";

const Index = () => {
  const { products, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.category.toLowerCase() === selectedCategory.toLowerCase();
      
      let matchesStatus = true;
      if (selectedStatus !== "all") {
        const stockStatus = product.current_stock === 0 ? "out" : 
                          product.current_stock <= product.min_stock ? "low" : "available";
        matchesStatus = stockStatus === selectedStatus;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const handleStockFilterChange = (filter: string) => {
    setSelectedStatus(filter);
    // Scroll to products section
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stockSummary = useMemo(() => {
    const total = products.length;
    const available = products.filter(p => p.current_stock > p.min_stock).length;
    const lowStock = products.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock).length;
    const outOfStock = products.filter(p => p.current_stock === 0).length;

    return { total, available, lowStock, outOfStock };
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
          <p className="mt-2 text-muted-foreground">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Hero Section */}
      <div className="relative h-96 bg-gradient-hero overflow-hidden">
        <img 
          src={heroImage} 
          alt="Modern warehouse interior" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />
        
        {/* Enhanced floating particles effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/20 rounded-full animate-float blur-sm" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-float blur-sm" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-white/25 rounded-full animate-float blur-sm" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-white/35 rounded-full animate-float blur-sm" style={{ animationDelay: '1.5s' }} />
        </div>
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
        
        <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
          <div className="text-white max-w-4xl">
            <div className="mb-4 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium animate-fade-in-up">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Sistem Terdepan untuk Manajemen Inventori
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent animate-fade-in-up leading-tight">
              Stok Kita Pantau
            </h1>
            
            <p className="text-xl md:text-2xl opacity-95 font-medium animate-fade-in-up leading-relaxed mb-10 max-w-2xl" style={{ animationDelay: '0.2s' }}>
              Revolusi cara Anda mengelola inventori dengan teknologi modern, interface yang intuitif, dan analitik real-time
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <button 
                onClick={() => window.location.href = '/admin'}
                className="px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:bg-white/95 transition-all duration-300 hover:scale-105 shadow-strong hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  Tampilkan Grafik Stok
                  <BarChart3 className="ml-2 w-5 h-5" />
                </span>
              </button>
              <button 
                onClick={() => window.location.href = '/laporan'}
                className="px-8 py-4 border-2 border-white/40 text-white font-bold rounded-2xl hover:bg-white/15 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <span className="flex items-center justify-center">
                  Tampilkan Grafik Penjualan
                  <TrendingUp className="ml-2 w-5 h-5" />
                </span>
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
          onFilterChange={handleStockFilterChange}
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
        <div id="products-section">
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
                  <ProductCard 
                    id={product.id}
                    name={product.name}
                    category={product.category}
                    currentStock={product.current_stock}
                    minStock={product.min_stock}
                    location={product.location || ""}
                    lastUpdated={new Date(product.updated_at).toLocaleDateString('id-ID')}
                  />
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
