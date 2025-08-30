import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, BarChart3, Receipt, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      label: "Cek Stok",
      icon: Package,
    },
    {
      path: "/kasir",
      label: "Kasir POS",
      icon: ShoppingCart,
    },
    {
      path: "/laporan",
      label: "Laporan",
      icon: BarChart3,
    },
    {
      path: "/admin",
      label: "Admin",
      icon: Settings,
    }
  ];

  return (
    <nav className="bg-gradient-card border-b shadow-soft sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Receipt className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StokKitaPantau
            </span>
          </div>

          <div className="flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={`flex items-center space-x-2 transition-all duration-300 ${
                    isActive 
                      ? "bg-gradient-primary text-primary-foreground shadow-soft" 
                      : "hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <Link to={item.path}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};