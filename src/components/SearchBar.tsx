import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange
}: SearchBarProps) => {
  return (
    <div className="bg-gradient-card rounded-2xl p-8 shadow-medium border-0 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          <Input
            placeholder="Cari nama produk atau ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 text-base border-2 border-border/50 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/80 backdrop-blur-sm hover:shadow-soft"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-52 h-12 border-2 border-border/50 rounded-xl hover:border-primary/50 focus:border-primary transition-all duration-300 bg-background/80 backdrop-blur-sm">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-0 shadow-strong bg-background/95 backdrop-blur-md">
              <SelectItem value="all" className="rounded-lg">Semua Kategori</SelectItem>
              <SelectItem value="elektronik" className="rounded-lg">Elektronik</SelectItem>
              <SelectItem value="makanan" className="rounded-lg">Makanan</SelectItem>
              <SelectItem value="pakaian" className="rounded-lg">Pakaian</SelectItem>
              <SelectItem value="alat-tulis" className="rounded-lg">Alat Tulis</SelectItem>
              <SelectItem value="furniture" className="rounded-lg">Furniture</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-52 h-12 border-2 border-border/50 rounded-xl hover:border-primary/50 focus:border-primary transition-all duration-300 bg-background/80 backdrop-blur-sm">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-0 shadow-strong bg-background/95 backdrop-blur-md">
              <SelectItem value="all" className="rounded-lg">Semua Status</SelectItem>
              <SelectItem value="available" className="rounded-lg">Tersedia</SelectItem>
              <SelectItem value="low" className="rounded-lg">Stok Rendah</SelectItem>
              <SelectItem value="out" className="rounded-lg">Habis</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2 h-12 px-6 border-2 border-primary/20 rounded-xl bg-primary/5 hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-soft hover:scale-105">
            <Filter className="h-4 w-4" />
            <span className="font-semibold">Filter</span>
          </Button>
        </div>
      </div>
    </div>
  );
};